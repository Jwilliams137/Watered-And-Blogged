import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import PlantPost from '../Posts/PlantPost';
import styles from './PlantWall.module.css';

const PlantWall = ({ plantId, currentUserUid }) => {
    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchPosts();
    }, [plantId, currentUserUid]);

    const fetchPosts = () => {
        const q = query(
            collection(db, `users/${currentUserUid}/plants/${plantId}/plantPosts`),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts(newPosts);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setLoading(false);
        });

        return unsubscribe;
    };

    const fetchMorePosts = () => {
        if (!lastVisible) return;

        setLoadingMore(true);

        const q = query(
            collection(db, `users/${currentUserUid}/plants/${plantId}/plantPosts`),
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts((prevPosts) => [...prevPosts, ...newPosts]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setLoadingMore(false);
        });

        return unsubscribe;
    };

    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, `users/${currentUserUid}/plants/${plantId}/plantPosts/${postId}`));
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handlePostUpdated = (postId, updatedPost) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) => (post.id === postId ? { ...post, ...updatedPost } : post))
        );
    };

    return (
        <div className={styles.plantWall}>
            {posts.map((post) => (
                <PlantPost
                    key={post.id}
                    post={post}
                    plantId={plantId}
                    userId={currentUserUid}
                    onDeletePost={handleDeletePost}
                    onPostUpdated={handlePostUpdated}
                />
            ))}
            {loading && <p>Loading...</p>}
            {!loading && posts.length === 0 && <p>Sorry, no posts from this plant yet.</p>}
            {!loading && lastVisible && (
                <button onClick={fetchMorePosts} disabled={loadingMore} className={styles.loadMoreButton}>
                    {loadingMore ? 'Loading...' : 'Load More'}
                </button>
            )}
        </div>
    );
};

export default PlantWall;
