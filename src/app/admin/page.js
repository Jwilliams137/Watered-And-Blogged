'use client'
import React, { useState } from 'react';
import PendingPlantPosts from '../../../components/PendingPosts/PendingPlantPosts';
import PendingPosts from '../../../components/PendingPosts/PendingPosts'; // Adjust path as necessary
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import styles from './page.module.css';

const AdminPage = ({ currentUserUid }) => {
    const [lastVisiblePlantPost, setLastVisiblePlantPost] = useState(null);
    const [lastVisibleUserPost, setLastVisibleUserPost] = useState(null); // New state for user posts
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

    const handleUserApproval = async (postId, authorId) => {
        console.log('handleUserApproval called with:');
        console.log('postId:', postId);
        console.log('authorId:', authorId);

        try {
            if (!postId || !authorId) {
                throw new Error('Missing required parameters');
            }

            const postRef = doc(db, 'posts', postId);

            console.log('postRef:', postRef.path);

            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                throw new Error(`Document not found for postId: ${postId}`);
            }

            // Update the document to set approved to true
            await updateDoc(postRef, { approved: true });
            console.log(`Post ${postId} in user posts approved successfully.`);
        } catch (error) {
            console.error('Error approving user post:', error);
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

    const loadMoreUserPosts = async () => {
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

                if (lastVisibleUserPost) {
                    userPostsQuery = query(userPostsQuery, startAfter(lastVisibleUserPost));
                }

                const userPostsSnapshot = await getDocs(userPostsQuery);
                const newUserPosts = await Promise.all(
                    userPostsSnapshot.docs.map(async (docSnapshot) => {
                        const postData = docSnapshot.data();
                        const { authorId } = postData;
                        let authorData = null;

                        try {
                            const authorDoc = await getDoc(doc(db, 'users', authorId));
                            if (authorDoc.exists()) {
                                authorData = authorDoc.data();
                            } else {
                                console.error(`Author data not found for post: ${docSnapshot.id}, authorId: ${authorId}`);
                            }
                        } catch (error) {
                            console.error(`Error fetching author data for post: ${docSnapshot.id}, authorId: ${authorId}`, error);
                        }

                        return {
                            id: docSnapshot.id,
                            ...postData,
                            authorData: authorData || { username: 'Unknown Author', profilePicture: '/avatar.png' }, // Default values if data not found
                        };
                    })
                );

                setLastVisibleUserPost(userPostsSnapshot.docs[userPostsSnapshot.docs.length - 1]);
                setLoading(false);
            } catch (error) {
                console.error('Error loading more user posts:', error);
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
            <PendingPosts
                lastVisible={lastVisibleUserPost}
                setLastVisible={setLastVisibleUserPost}
                handleApprove={(postId, authorId) => handleUserApproval(postId, authorId)}
            />
            {lastVisiblePlantPost && (
                <button onClick={loadMore} disabled={loading}>Load More Plant Posts</button>
            )}
            {lastVisibleUserPost && (
                <button onClick={loadMoreUserPosts} disabled={loading}>Load More User Posts</button>
            )}
        </div>
    );
};

export default AdminPage;
