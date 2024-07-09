import React, { useEffect, useState } from 'react';
import { collectionGroup, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './PendingPlantPosts.module.css';

const PendingPlantPosts = ({ handleApprove }) => {
    const [plantPosts, setPlantPosts] = useState([]);
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPlantPosts();
    }, []);

    const fetchPendingPlantPosts = async () => {
        setLoading(true);
        try {
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

            const newPlantPosts = snapshot.docs.map(docSnapshot => {
                const parentPathSegments = docSnapshot.ref.parent.path.split('/');
                const userId = parentPathSegments[1]; // Extract user ID from parent path
                const plantId = parentPathSegments[3]; // Assuming plantId is at index 3, adjust if necessary
                return {
                    id: docSnapshot.id,
                    userId: userId,
                    plantId: plantId,
                    ...docSnapshot.data(),
                };
            });

            setPlantPosts(prevPosts => lastVisiblePlantPost ? [...prevPosts, ...newPlantPosts] : newPlantPosts);

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

    const handlePostApproval = (postId, plantId, userId) => {
        // Update UI to remove the post from display
        setPlantPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        // Call handleApprove to update Firestore data
        handleApprove(postId, plantId, userId);
    };

    const loadMore = async () => {
        if (!loading && lastVisiblePlantPost) {
            setLoading(true);
            try {
                let q = query(
                    collectionGroup(db, 'plantPosts'),
                    where('visibility', '==', 'public'),
                    where('approved', '==', false),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastVisiblePlantPost),
                    limit(10)
                );

                const snapshot = await getDocs(q);

                const morePlantPosts = snapshot.docs.map(docSnapshot => {
                    const parentPathSegments = docSnapshot.ref.parent.path.split('/');
                    const userId = parentPathSegments[1]; // Extract user ID from parent path
                    const plantId = parentPathSegments[3]; // Assuming plantId is at index 3, adjust if necessary
                    return {
                        id: docSnapshot.id,
                        userId: userId,
                        plantId: plantId,
                        ...docSnapshot.data(),
                    };
                });

                setPlantPosts(prevPosts => [...prevPosts, ...morePlantPosts]);

                if (snapshot.docs.length > 0) {
                    setLastVisiblePlantPost(snapshot.docs[snapshot.docs.length - 1]);
                } else {
                    setLastVisiblePlantPost(null);
                }
            } catch (error) {
                console.error('Error loading more pending plant posts:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <h2>Pending Plant Posts</h2>
            <ul className={styles.postList}>
                {plantPosts.map((post) => (
                    <li key={post.id} className={styles.postListItem}>
                        {post.plantProfilePic && (
                            <div className={styles.plantInfo}>
                                <img src={post.plantProfilePic} alt={post.plantName} className={styles.plantImage} />
                                <h3>{post.plantName}</h3>
                            </div>
                        )}
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post Image" className={styles.postImage} />}
                        <p>Author: {post.author}</p>
                        <p>Visibility: {post.visibility}</p>
                        <button onClick={() => handlePostApproval(post.id, post.plantId, post.userId)}>Approve</button>
                    </li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
            {lastVisiblePlantPost && (
                <button onClick={loadMore} disabled={loading}>Load More Plant Posts</button>
            )}
        </div>
    );
};

export default PendingPlantPosts;
