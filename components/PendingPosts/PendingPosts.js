import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PostListItem from './PostListItem';
import styles from './PendingPosts.module.css';

const PendingPosts = ({ lastVisible, setLastVisible, handleApprove }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPosts();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            setLoading(true);

            let q = query(
                collection(db, 'posts'),
                where('visibility', '==', 'public'),
                where('approved', '==', false),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const snapshot = await getDocs(q);
            const newPosts = await Promise.all(
                snapshot.docs.map(async (docSnapshot) => {
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
            <ul className={styles.postList}>
                {posts.map((post) => (
                    <PostListItem key={post.id} post={post} handleApprove={handleApprove} />
                ))}
            </ul>
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default PendingPosts;
