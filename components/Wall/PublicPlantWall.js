import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, where, onSnapshot, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import PlantPost from '../Posts/PlantPost';
import styles from './PublicPlantWall.module.css';

const PublicPlantWall = ({ userId, plantId }) => {
    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPublicPosts = (uid, pid, lastDoc = null) => {
        let q = query(
            collection(db, `users/${uid}/plants/${pid}/plantPosts`),
            where('approved', '==', true),
            where('visibility', '==', 'public'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        return q;
    };

    useEffect(() => {
        setLoading(true);
        const q = fetchPublicPosts(userId, plantId);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts(newPosts);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching posts:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, plantId]);

    const fetchMorePosts = () => {
        if (!lastVisible) return;

        setLoadingMore(true);
        const q = fetchPublicPosts(userId, plantId, lastVisible);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts((prevPosts) => [...prevPosts, ...newPosts]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setLoadingMore(false);
        }, (error) => {
            console.error('Error fetching more posts:', error);
            setLoadingMore(false);
        });

        return () => unsubscribe();
    };

    return (
        <div className={styles.plantWall}>
            {posts.map((post) => (
                <PlantPost
                    key={post.id}
                    post={post}
                    plantId={plantId}
                    userId={userId}
                    plantPostId={post.id}
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

export default PublicPlantWall;
