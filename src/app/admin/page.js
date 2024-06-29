'use client'
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
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
                            <h2>{post.title}</h2>
                            {post.profilePicture && (
                                <img src={post.profilePicture} alt="Author's profile" className={styles.profilePicture} />
                            )}
                            <p>{post.author}</p> {/* Displaying author from posts collection */}
                        </div>
                        <p>{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post image" className={styles.image} />}
                        {!post.approved && (
                            <button onClick={() => handleApprove(post.id)}>Approve</button>
                        )}
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




















