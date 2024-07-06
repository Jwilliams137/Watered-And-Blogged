'use client'
import React, { useEffect, useState } from 'react';
import { collection, collectionGroup, query, where, orderBy, limit, startAfter, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = ({ currentUserUid }) => {
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
            const newPosts = snapshot.docs.map(docSnapshot => {
                const postData = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    ...postData,
                };
            });

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
            const newPlantPosts = snapshot.docs.map(docSnapshot => {
                const postData = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    ...postData,
                };
            });

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

    const handleApprove = async (postId, collectionPath) => {
        try {
            const postRef = doc(db, collectionPath, postId);
            await updateDoc(postRef, { approved: true });

            if (collectionPath === 'posts') {
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            } else if (collectionPath.includes('plantPosts')) {
                setPlantPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error(`Error approving ${collectionPath.slice(0, -1)} post:`, error);
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
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        {post.imageUrl && (
                            <img src={post.imageUrl} alt="Post Image" className={styles.postImage} />
                        )}
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
                        <h3>{post.plantName}</h3>
                        <p>{post.content}</p>
                        {post.imageUrl && (
                            <img src={post.imageUrl} alt="Plant Image" className={styles.postImage} />
                        )}
                        {!post.approved && (
                            <button onClick={() => handleApprove(post.id, 'plantPosts')}>Approve</button>
                        )}
                    </li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
            {(lastVisible || lastVisiblePlantPost) && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;
