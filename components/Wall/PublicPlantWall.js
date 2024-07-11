import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import PlantPost from '../Posts/PlantPost';
import styles from './PublicPlantWall.module.css';

const PublicPlantWall = ({ userId, plantId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPublicPosts = (uid, pid) => {
        console.log('Fetching public posts for user:', uid, 'and plant:', pid);
        const q = query(
            collection(db, `users/${uid}/plants/${pid}/plantPosts`),
            where('approved', '==', true),
            where('visibility', '==', 'public'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        return q;
    };

    useEffect(() => {
        setLoading(true);
        const q = fetchPublicPosts(userId, plantId);

        console.log('Executing query:', q);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            console.log('Fetched posts:', newPosts);
            setPosts(newPosts);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching posts:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, plantId]);

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
        </div>
    );
};

export default PublicPlantWall;
