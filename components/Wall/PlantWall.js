// PlantWall.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import PlantPost from '../Posts/PlantPost';
import styles from './PlantWall.module.css';

const PlantWall = ({ plantId }) => {
    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);

            try {
                const q = query(collection(db, `users/${auth.currentUser.uid}/plants/${plantId}/plantPosts`), orderBy('createdAt', 'desc'), limit(10));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPosts(newPosts);
                    if (snapshot.docs.length > 0) {
                        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                    }
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching posts: ', error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, [plantId]);

    const loadMore = () => {
        if (!loading && lastVisible) {
            setLoading(true);

            const q = query(collection(db, `users/${auth.currentUser.uid}/plants/${plantId}/plantPosts`), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));
            onSnapshot(q, (snapshot) => {
                const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (snapshot.docs.length > 0) {
                    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                    setPosts(prevPosts => [...prevPosts, ...newPosts]);
                }
                setLoading(false);
            });
        }
    };

    const handlePostUpdated = async (postId, newContent, newVisibility) => {
        try {
            await db.collection(`users/${auth.currentUser.uid}/plants/${plantId}/plantPosts`).doc(postId).update({
                content: newContent,
                visibility: newVisibility,
                updatedAt: new Date(),
            });
            setPosts(prevPosts =>
                prevPosts.map(post => (post.id === postId ? { ...post, content: newContent, visibility: newVisibility } : post))
            );
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, `users/${auth.currentUser.uid}/plants/${plantId}/plantPosts`, postId));
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className={styles.plantWall}>
            {posts.map(post => (
                <PlantPost
                    key={post.id}
                    post={post}
                    onPostUpdated={handlePostUpdated}
                    onDeletePost={handleDeletePost}
                />
            ))}
            {loading && <p>Loading...</p>}
            {lastVisible && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default PlantWall;





