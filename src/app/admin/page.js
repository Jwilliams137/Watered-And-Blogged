'use client'
import React, { useEffect, useState } from 'react';
import { collection, collectionGroup, query, where, orderBy, limit, startAfter, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = () => {
    const [posts, setPosts] = useState([]);
    const [plantPosts, setPlantPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPosts();
        fetchPendingPlantPosts();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            setLoading(true);

            let q = query(collection(db, 'posts'), 
                          where('visibility', '==', 'public'),
                          where('approved', '==', false),
                          orderBy('createdAt', 'desc'),
                          limit(10));

            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const snapshot = await getDocs(q);
            const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();
                const authorId = postData.authorId;

                // Fetch user data to get profilePicture
                const authorDoc = await getDoc(doc(db, 'users', authorId));
                const authorData = authorDoc.data();

                return {
                    id: docSnapshot.id,
                    ...postData,
                    author: postData.author, // Assuming 'author' field in posts collection contains author name
                    profilePicture: authorData.profilePicture, // Assuming 'profilePicture' field in users collection
                };
            }));

            setPosts(prevPosts => {
                return lastVisible ? [...prevPosts, ...newPosts] : newPosts;
            });

            if (snapshot.docs.length > 0) {
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            } else {
                setLastVisible(null);
            }
        } catch (error) {
            console.error('Error fetching pending posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingPlantPosts = async () => {
        try {
            setLoading(true);

            let q = query(collectionGroup(db, 'plantPosts'),
                          where('visibility', '==', 'public'),
                          where('approved', '==', false),
                          orderBy('createdAt', 'desc'),
                          limit(10));

            if (lastVisiblePlantPost) {
                q = query(q, startAfter(lastVisiblePlantPost));
            }

            const snapshot = await getDocs(q);
            const newPlantPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();
                const plantId = postData.plantId;
                const plantDoc = await getDoc(doc(db, `users/${postData.authorId}/plants/${plantId}`));
                const plantData = plantDoc.data();

                return {
                    id: docSnapshot.id,
                    ...postData,
                    plantName: plantData.name, // Assuming 'name' field in plants collection
                    plantProfilePicture: plantData.profilePicture, // Assuming 'profilePicture' field in plants collection
                };
            }));

            setPlantPosts(prevPosts => {
                return lastVisiblePlantPost ? [...prevPosts, ...newPlantPosts] : newPlantPosts;
            });

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

    const handleApprove = async (postId, collectionName) => {
        try {
            const postRef = doc(db, collectionName, postId);
            await updateDoc(postRef, { approved: true });
            if (collectionName === 'posts') {
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            } else {
                setPlantPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error(`Error approving ${collectionName.slice(0, -1)} post:`, error);
        }
    };

    const loadMore = () => {
        if (!loading) {
            fetchPendingPosts();
            fetchPendingPlantPosts();
        }
    };

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            <h2>Pending User Posts</h2>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <div className={styles.postHeader}>
                            <h2>{post.title}</h2>
                            {post.profilePicture && (
                                <img src={post.profilePicture} alt="Author's profile" className={styles.profilePicture} />
                            )}
                            <p>{post.author}</p> {/* Displaying author from posts collection */}
                        </div>
                        <p>{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post image" className={styles.image} />}
                        {!post.approved && (
                            <button onClick={() => handleApprove(post.id, 'posts')}>Approve</button>
                        )}
                    </li>
                ))}
            </ul>
            <h2>Pending Plant Posts</h2>
            <ul>
                {plantPosts.map(post => (
                    <li key={post.id}>
                        <div className={styles.postHeader}>
                            <h2>{post.plantName}</h2>
                            {post.plantProfilePicture && (
                                <img src={post.plantProfilePicture} alt="Plant Profile" className={styles.profilePicture} />
                            )}
                            <p>{post.author}</p> {/* Assuming 'author' field in posts collection */}
                        </div>
                        <p>{post.content}</p>
                        {!post.approved && (
                            <button onClick={() => handleApprove(post.id, `users/${post.authorId}/plants/${post.plantId}/plantPosts`)}>Approve</button>
                        )}
                    </li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
            {lastVisible || lastVisiblePlantPost ? (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            ) : null}
        </div>
    );
};

export default AdminPage;























