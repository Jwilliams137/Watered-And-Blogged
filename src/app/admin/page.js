'use client'
// AdminPage.js

import React, { useState } from 'react';
import PendingPlantPosts from '../../../components/PendingPosts/PendingPlantPosts';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = ({ currentUserUid }) => {
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleApprove = async (postId, collectionName, plantId, userId) => {
        console.log('handleApprove called with:');
        console.log('postId:', postId);
        console.log('collectionName:', collectionName);
        console.log('plantId:', plantId);
        console.log('userId:', userId);

        try {
            if (!postId || !collectionName || !plantId || !userId) {
                throw new Error('Missing required parameters');
            }

            let postRef;
            if (collectionName === 'plantPosts') {
                postRef = doc(db, 'users', userId, 'plants', plantId, 'plantPosts', postId);
            } else {
                throw new Error('Unsupported collection name');
            }

            console.log('postRef:', postRef.path);

            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                throw new Error(`Document not found for postId: ${postId}`);
            }

            // Update the document to set approved to true
            await updateDoc(postRef, { approved: true });
            console.log(`Post ${postId} in ${collectionName} approved successfully.`);
        } catch (error) {
            console.error('Error approving post:', error);
        }
    };

    const loadMore = async () => {
        if (!loading) {
            setLoading(true);
            try {
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
                const newPlantPosts = plantPostsSnapshot.docs.map(docSnapshot => {
                    const parentPathSegments = docSnapshot.ref.parent.path.split('/');
                    const userId = parentPathSegments[1];
                    const plantId = parentPathSegments[3]; // Assuming plantId is at index 3, adjust if necessary
                    return {
                        id: docSnapshot.id,
                        userId: userId,
                        plantId: plantId,
                        ...docSnapshot.data(),
                    };
                });

                setLastVisiblePlantPost(plantPostsSnapshot.docs[plantPostsSnapshot.docs.length - 1]);
                setLoading(false);
            } catch (error) {
                console.error('Error loading more plant posts:', error);
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            <PendingPlantPosts
                lastVisiblePlantPost={lastVisiblePlantPost}
                setLastVisiblePlantPost={setLastVisiblePlantPost}
                handleApprove={(postId, plantId, userId) => handleApprove(postId, 'plantPosts', plantId, userId)}
            />
            {lastVisiblePlantPost && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;
