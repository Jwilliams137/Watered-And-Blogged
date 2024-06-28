'use client'
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = () => {
    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPosts();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            setLoading(true);

            let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));

            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const snapshot = await getDocs(q);
            const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();

                // Fetch user profile data
                const userDocRef = doc(db, 'users', postData.authorId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userProfile = userDoc.data();
                    return {
                        id: docSnapshot.id,
                        ...postData,
                        authorProfilePicture: userProfile?.profilePicture || null
                    };
                } else {
                    console.warn(`User document not found for authorId: ${postData.authorId}`);
                    return {
                        id: docSnapshot.id,
                        ...postData,
                        authorProfilePicture: null
                    };
                }
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

    const handleApprove = async (postId) => {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, { approved: true });
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error approving post:', error);
        }
    };

    const loadMore = () => {
        if (!loading && lastVisible) {
            fetchPendingPosts();
        }
    };

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <div className={styles.postHeader}>
                            {post.authorProfilePicture ? (
                                <img
                                    src={post.authorProfilePicture}
                                    alt={`${post.author}'s profile`}
                                    className={styles.profilePicture}
                                />
                            ) : (
                                <div className={styles.defaultProfilePicture}></div>
                            )}
                            <div className={styles.authorInfo}>
                                <small>Posted by: {post.author}</small>
                            </div>
                        </div>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post image" className={styles.image} />}
                        <button onClick={() => handleApprove(post.id)}>Approve</button>
                    </li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
            {lastVisible && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;








