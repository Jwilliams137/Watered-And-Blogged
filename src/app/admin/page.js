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

    const loadMore = async () => {
        if (!loading) {
            setLoading(true);
            try {
                // Fetch more user posts
                let userPostsQuery = query(
                    collection(db, 'posts'),
                    where('visibility', '==', 'public'),
                    where('approved', '==', false),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );

                if (lastVisible) {
                    userPostsQuery = query(userPostsQuery, startAfter(lastVisible));
                }

                const userPostsSnapshot = await getDocs(userPostsQuery);
                const newUserPosts = userPostsSnapshot.docs.map(docSnapshot => ({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                }));

                setLastVisible(userPostsSnapshot.docs[userPostsSnapshot.docs.length - 1]);
                
                // Fetch more plant posts
                let plantPostsQuery = query(
                    collectionGroup(db, 'plantPosts'),
                    where('visibility', '==', 'public'),
                    where('approved', '==', false),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );

                if (lastVisiblePlantPost) {
                    plantPostsQuery = query(plantPostsQuery, startAfter(lastVisiblePlantPost));
                }

                const plantPostsSnapshot = await getDocs(plantPostsQuery);
                const newPlantPosts = plantPostsSnapshot.docs.map(docSnapshot => ({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                }));

                setLastVisiblePlantPost(plantPostsSnapshot.docs[plantPostsSnapshot.docs.length - 1]);

                setLoading(false);
            } catch (error) {
                console.error('Error loading more posts:', error);
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            <PendingPosts lastVisible={lastVisible} setLastVisible={setLastVisible} handleApprove={(postId) => handleApprove(postId, 'posts')} />
            <PendingPlantPosts lastVisiblePlantPost={lastVisiblePlantPost} setLastVisiblePlantPost={setLastVisiblePlantPost} handleApprove={(postId) => handleApprove(postId, 'plantPosts')} />
            {(lastVisible || lastVisiblePlantPost) && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;
