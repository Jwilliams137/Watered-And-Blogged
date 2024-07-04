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

            let q = query(collection(db, 'plantPosts'),
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
                const plantId = postData.plantId;

                // Fetch plant details to get plantName and profilePicture
                const plantDoc = await getDoc(doc(db, 'plants', plantId));
                const plantData = plantDoc.data();

                return {
                    id: docSnapshot.id,
                    ...postData,
                    plantName: plantData.name, // Assuming 'name' field in plants collection
                    plantProfilePicture: plantData.profilePicture, // Assuming 'profilePicture' field in plants collection
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
            console.error('Error fetching pending plant posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (postId) => {
        try {
            const postRef = doc(db, 'plantPosts', postId);
            await updateDoc(postRef, { approved: true });
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error approving plant post:', error);
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
                            <h2>{post.plantName}</h2>
                            {post.plantProfilePicture && (
                                <img src={post.plantProfilePicture} alt="Plant Profile" className={styles.profilePicture} />
                            )}
                            <p>Submitted by: {post.author}</p> {/* Assuming 'author' field in posts collection */}
                        </div>
                        <p>{post.content}</p>
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





















