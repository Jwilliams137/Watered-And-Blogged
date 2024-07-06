'use client';

import React, { useState } from 'react';
import PendingPosts from '../../../components/PendingPosts/PendingPosts';
import PendingPlantPosts from '../../../components/PendingPosts/PendingPlantPosts';
import styles from './page.module.css';

const AdminPage = ({ currentUserUid }) => {
    const [lastVisible, setLastVisible] = useState(null);
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleApprove = async (postId, collectionPath) => {
        try {
            const postRef = doc(db, collectionPath, postId);
            await updateDoc(postRef, { approved: true });

            if (collectionPath === 'posts') {
                setLastVisible(prevPosts => prevPosts.filter(post => post.id !== postId));
            } else if (collectionPath.includes('plantPosts')) {
                setLastVisiblePlantPost(prevPosts => prevPosts.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error(`Error approving ${collectionPath.slice(0, -1)} post:`, error);
        }
    };

    const loadMore = () => {
        if (!loading) {
            // Trigger fetching more posts from both PendingPosts and PendingPlantPosts components
        }
    };

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            <PendingPosts lastVisible={lastVisible} setLastVisible={setLastVisible} handleApprove={handleApprove} />
            <PendingPlantPosts lastVisiblePlantPost={lastVisiblePlantPost} setLastVisiblePlantPost={setLastVisiblePlantPost} handleApprove={handleApprove} />
            {(lastVisible || lastVisiblePlantPost) && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;
