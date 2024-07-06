'use client';
import styles from './PendingPlantPosts.module.css'

import React, { useEffect, useState } from 'react';
import { collectionGroup, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PostListItem from './PostListItem';

const PendingPlantPosts = ({ lastVisiblePlantPost, setLastVisiblePlantPost, handleApprove }) => {
    const [plantPosts, setPlantPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPlantPosts();
    }, []);

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
            const newPlantPosts = snapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data(),
            }));

            setPlantPosts(prevPosts => (lastVisiblePlantPost ? [...prevPosts, ...newPlantPosts] : newPlantPosts));

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
            <ul>
                {plantPosts.map(post => (
                    <PostListItem key={post.id} post={post} collectionPath="plantPosts" handleApprove={handleApprove} />
                ))}
            </ul>
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default PendingPlantPosts;
