import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './PlantComment.module.css';
import Link from 'next/link';

const PlantComment = ({ plantPostId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [commentAuthors, setCommentAuthors] = useState({});

    useEffect(() => {
        const unsubscribeComments = onSnapshot(collection(db, `plantPosts/${plantPostId}/comments`), (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(commentsData);
            fetchCommentAuthors(commentsData);
        });

        return () => {
            unsubscribeComments();
        };
    }, [plantPostId]);

    const fetchCommentAuthors = async (commentsData) => {
        const authorPromises = commentsData.map(async (comment) => {
            try {
                if (!comment.userId) {
                    console.error('comment.userId is undefined for comment:', comment);
                    return { id: comment.id, name: 'Unknown User', profilePicture: '/avatar.png' };
                }

                const userDocRef = doc(db, 'users', comment.userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return { id: comment.id, name: userData.username || 'Unknown User', profilePicture: userData.profilePicture || '/avatar.png' };
                } else {
                    console.error('No user found for userId:', comment.userId);
                    return { id: comment.id, name: 'Unknown User', profilePicture: '/avatar.png' };
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                return { id: comment.id, name: 'Unknown User', profilePicture: '/avatar.png' };
            }
        });

        try {
            const authorsData = await Promise.all(authorPromises);
            const authors = authorsData.reduce((acc, author) => ({ ...acc, [author.id]: author }), {});
            setCommentAuthors(authors);
        } catch (error) {
            console.error('Error fetching comment authors:', error);
        }
    };

    const handleAddComment = async () => {
        if (!auth.currentUser) {
            // Handle case where user is not logged in
            return;
        }

        setLoading(true);
        try {
            const commentsCollectionRef = collection(db, `plantPosts/${plantPostId}/comments`);
            await addDoc(commentsCollectionRef, {
                content: newComment,
                createdAt: new Date(),
                userId: auth.currentUser.uid,
            });
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditComment = async (commentId) => {
        setLoading(true);
        try {
            const commentRef = doc(db, `plantPosts/${plantPostId}/comments`, commentId);
            await updateDoc(commentRef, {
                content: editingCommentContent,
            });
            setEditingCommentId(null);
            setEditingCommentContent('');
        } catch (error) {
            console.error('Error editing comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId, commentUserId) => {
        setLoading(true);
        try {
            const commentRef = doc(db, `plantPosts/${plantPostId}/comments`, commentId);
            await deleteDoc(commentRef);
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.commentSection}>
            <div className={styles.commentList}>
                {comments.map(comment => (
                    <div key={comment.id} className={styles.comment}>
                        {commentAuthors[comment.id] && (
                            <div className={styles.commentHeader}>
                                <Link href={`/profile/${comment.userId}`}>
                                    <img
                                        src={commentAuthors[comment.id].profilePicture || '/avatar.png'}
                                        alt={`${commentAuthors[comment.id].name || 'Unknown User'}'s profile`}
                                        className={styles.profilePicture}
                                    />
                                </Link>
                                <Link href={`/profile/${comment.userId}`}>
                                    <small className={styles.authorName}>{commentAuthors[comment.id].name || 'Unknown User'}</small>
                                </Link>
                            </div>
                        )}
                        {(auth.currentUser?.uid === comment.userId) && (
                            <button
                                onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentContent(comment.content);
                                }}
                                className={styles.commentButton}
                            >
                                Edit
                            </button>
                        )}
                        {(auth.currentUser?.uid === comment.userId) && (
                            <button
                                onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                className={styles.commentButton}
                            >
                                Delete
                            </button>
                        )}
                        {editingCommentId === comment.id ? (
                            <div>
                                <input
                                    type="text"
                                    value={editingCommentContent}
                                    onChange={(e) => setEditingCommentContent(e.target.value)}
                                    placeholder="Edit your comment..."
                                    className={styles.commentInput}
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => handleEditComment(comment.id)}
                                    disabled={loading}
                                    className={styles.commentButton}
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <span>{comment.content}</span>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.addComment}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className={styles.commentInput}
                    disabled={loading || !auth.currentUser}
                />
                <button
                    onClick={handleAddComment}
                    disabled={loading || !newComment.trim() || !auth.currentUser}
                    className={styles.commentButton}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default PlantComment;
