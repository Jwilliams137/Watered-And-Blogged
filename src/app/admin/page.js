'use client'
import React, { useState } from 'react';
import PendingPosts from '../../../components/PendingPosts/PendingPosts';
import PendingPlantPosts from '../../../components/PendingPosts/PendingPlantPosts';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = ({ currentUserUid }) => {
    const [lastVisible, setLastVisible] = useState(null);
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleApprove = async (postId, collectionName, userId) => {
        console.log('handleApprove called with:');
        console.log('postId:', postId);
        console.log('collectionName:', collectionName);
        console.log('userId:', userId);

        try {
            if (!postId || !collectionName || !userId) {
                throw new Error('Missing required parameters');
            }

            let postRef;
            if (collectionName === 'posts') {
                postRef = doc(db, 'posts', postId);
            } else if (collectionName === 'plantPosts') {
                postRef = doc(db, 'users', userId, 'plants', postId, 'plantPosts', postId);
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
                const newPlantPosts = plantPostsSnapshot.docs.map(docSnapshot => {
                    const parentPathSegments = docSnapshot.ref.parent.path.split('/'); // Extract user ID from parent path
                    const userId = parentPathSegments[1];
                    return {
                        id: docSnapshot.id,
                        userId: userId,
                        ...docSnapshot.data(),
                    };
                });

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
            <PendingPosts lastVisible={lastVisible} setLastVisible={setLastVisible} handleApprove={(postId) => handleApprove(postId, 'posts', currentUserUid)} />
            <PendingPlantPosts lastVisiblePlantPost={lastVisiblePlantPost} setLastVisiblePlantPost={setLastVisiblePlantPost} handleApprove={(postId, userId) => handleApprove(postId, 'plantPosts', userId)} />
            {(lastVisible || lastVisiblePlantPost) && (
                <button onClick={loadMore} disabled={loading}>Load More</button>
            )}
        </div>
    );
};

export default AdminPage;
