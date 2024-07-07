'use client';
import React, { useEffect, useState } from 'react';
import { collectionGroup, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './PendingPlantPosts.module.css';

const PendingPlantPosts = ({ lastVisiblePlantPost, setLastVisiblePlantPost, handleApprove }) => {
    const [plantPosts, setPlantPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPlantPosts();
    }, []);

    const fetchPendingPlantPosts = async () => {
        try {
            setLoading(true);

            let q = query(
                collectionGroup(db, 'plantPosts'),
                where('visibility', '==', 'public'),
                where('approved', '==', false),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            if (lastVisiblePlantPost) {
                q = query(q, startAfter(lastVisiblePlantPost));
            }

            const snapshot = await getDocs(q);
            const newPlantPosts = await Promise.all(
                snapshot.docs.map(async (docSnapshot) => {
                    const postData = docSnapshot.data();
                    const { userId, plantId } = postData;
                    let plantData = null;

                    if (userId && plantId) {
                        try {
                            const plantRef = doc(db, `users/${userId}/plants/${plantId}`);
                            const plantSnap = await getDoc(plantRef);

                            if (plantSnap.exists()) {
                                plantData = plantSnap.data();
                            } else {
                                console.error(`Plant not found for post: ${docSnapshot.id}, userId: ${userId}, plantId: ${plantId}`);
                            }
                        } catch (error) {
                            console.error(`Error fetching plant data for post: ${docSnapshot.id}, userId: ${userId}, plantId: ${plantId}`, error);
                        }
                    } else {
                        console.error(`Missing userId or plantId for post: ${docSnapshot.id}`);
                    }

                    return {
                        id: docSnapshot.id,
                        ...postData,
                        plantData,
                    };
                })
            );

            setPlantPosts((prevPosts) => (lastVisiblePlantPost ? [...prevPosts, ...newPlantPosts] : newPlantPosts));

            if (snapshot.docs.length > 0) {
                setLastVisiblePlantPost(snapshot.docs[snapshot.docs.length - 1]);
            } else {
                setLastVisiblePlantPost(null);
            }
        } catch (error) {
            console.error('Error fetching pending plant posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Pending Plant Posts</h2>
            <ul className={styles.postList}>
                {plantPosts.map((post) => (
                    <li key={post.id} className={styles.postListItem}>
                        {post.plantData ? (
                            <div className={styles.plantInfo}>
                                <img src={post.plantData.imageUrl} alt={post.plantData.name} className={styles.plantImage} />
                                <h3>{post.plantData.name}</h3>
                            </div>
                        ) : (
                            <div className={styles.plantInfo}>
                                <h3>Unknown Plant</h3>
                            </div>
                        )}
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post Image" className={styles.postImage} />}
                        <button onClick={() => handleApprove(post.id)}>Approve</button>
                    </li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
            {!loading && lastVisiblePlantPost && <button onClick={fetchPendingPlantPosts}>Load More</button>}
        </div>
    );
};

export default PendingPlantPosts;


