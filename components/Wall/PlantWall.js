import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import PlantPost from '../Posts/PlantPost';
import styles from './PlantWall.module.css';

const PlantWall = ({ plantId, currentUserUid }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        if (!currentUserUid) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, `users/${currentUserUid}/plants/${plantId}/plantPosts`), orderBy('createdAt', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(newPosts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [plantId, currentUserUid]);

    return (
        <div className={styles.plantWall}>
            {posts.map(post => (
                <PlantPost
                    key={post.id}
                    post={post}
                />
            ))}
            {loading && <p>Loading...</p>}
            {!loading && posts.length === 0 && <p>No posts found.</p>}
        </div>
    );
};

export default PlantWall;








