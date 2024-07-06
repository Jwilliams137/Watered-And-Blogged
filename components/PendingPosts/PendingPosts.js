// src/components/PendingPosts.js
'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PostListItem from './PostListItem';

const PendingPosts = ({ lastVisible, setLastVisible, handleApprove }) => {
    const [posts, setPosts] = useState([]);
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
            const newPosts = snapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data(),
            }));

            setPosts(prevPosts => (lastVisible ? [...prevPosts, ...newPosts] : newPosts));

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

    return (
        <div>
            <h2>Pending User Posts</h2>
            <ul>
                {posts.map(post => (
                    <PostListItem key={post.id} post={post} collectionPath="posts" handleApprove={handleApprove} />
                ))}
            </ul>
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default PendingPosts;
