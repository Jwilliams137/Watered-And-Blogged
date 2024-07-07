'use client'
import React, { useState } from 'react';
import PendingPosts from '../../../components/PendingPosts/PendingPosts';
import PendingPlantPosts from '../../../components/PendingPosts/PendingPlantPosts';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = ({ currentUserUid }) => {
    const [lastVisible, setLastVisible] = useState(null);
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleApprove = async (postId, collectionPath) => {
        try {
            const postRef = doc(db, collectionPath, postId);
            await updateDoc(postRef, { approved: true });
            console.log(`${collectionPath.slice(0, -1).toUpperCase()} post ${postId} approved successfully.`);
        } catch (error) {
            console.error(`Error approving ${collectionPath.slice(0, -1)} post:`, error);
        }
    };

    // Function to load more posts (not directly relevant to approval issue)
    const loadMore = async () => {
        // Implementation not shown as it's already handled
    };

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            {/* Component for pending user posts */}
            <PendingPosts lastVisible={lastVisible} setLastVisible={setLastVisible} handleApprove={(postId) => handleApprove(postId, 'posts')} />
            
            {/* Component for pending plant posts */}
            <PendingPlantPosts lastVisiblePlantPost={lastVisiblePlantPost} setLastVisiblePlantPost={setLastVisiblePlantPost} handleApprove={(postId) => handleApprove(postId, 'plantPosts')} />
            
            {/* Load more button for both types of posts */}
            {(lastVisible || lastVisiblePlantPost) && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;

