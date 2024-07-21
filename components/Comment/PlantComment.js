import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './PlantComment.module.css';
import Link from 'next/link';
import PlantLikes from '../Likes/PlantLikes';
import Modal from '../Modal/Modal';

const PlantComment = ({ plantPostId, userId, plantId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [commentAuthors, setCommentAuthors] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);
    const commentInputRef = useRef(null);

    useEffect(() => {
        const unsubscribeComments = onSnapshot(collection(db, `users/${userId}/plants/${plantId}/plantPosts/${plantPostId}/comments`), (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(commentsData);
            fetchCommentAuthors(commentsData);
        });

        return () => {
            unsubscribeComments();
        };
    }, [plantPostId, userId, plantId]);

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
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        try {
            const commentsCollectionRef = collection(db, `users/${userId}/plants/${plantId}/plantPosts/${plantPostId}/comments`);
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
            const commentRef = doc(db, `users/${userId}/plants/${plantId}/plantPosts/${plantPostId}/comments`, commentId);
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
            const commentRef = doc(db, `users/${userId}/plants/${plantId}/plantPosts/${plantPostId}/comments`, commentId);
            await deleteDoc(commentRef);
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
    };

    const autoResizeTextarea = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useEffect(() => {
        if (commentInputRef.current) {
            autoResizeTextarea(commentInputRef.current);
        }
    }, [newComment]);

    return (
        <div className={styles.commentSection}>
            <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />

            <PlantLikes userId={userId} plantId={plantId} plantPostId={plantPostId} />
            <div className={styles.commentList}>
                {comments.map(comment => (
                    <div key={comment.id} className={styles.comment}>
                        {commentAuthors[comment.id] && (
                            <div className={styles.commentHeader}>
                                <Link href={`/profile/${comment.userId}`}>
                                    <img src={commentAuthors[comment.id].profilePicture} alt={commentAuthors[comment.id].name} className={styles.profilePicture} />
                                </Link>
                                <Link href={`/profile/${comment.userId}`}>
                                    <small className={styles.authorName}>{commentAuthors[comment.id].name || 'Unknown User'}</small>
                                </Link>
                            </div>
                        )}
                        {editingCommentId === comment.id ? (
                            <textarea
                                className={styles.textarea}
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                ref={commentInputRef}
                            />
                        ) : (
                            <div className={styles.commentContent}>{comment.content}</div>
                        )}
                        {auth.currentUser && auth.currentUser.uid === comment.userId && (
                            <div className={styles.commentActions}>
                                {editingCommentId === comment.id ? (
                                    <>
                                        <button
                                            className={styles.saveButton}
                                            onClick={() => handleEditComment(comment.id)}
                                            disabled={loading}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditingCommentContent('');
                                            }}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => {
                                                setEditingCommentId(comment.id);
                                                setEditingCommentContent(comment.content);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.addComment}>
                <textarea
                    className={styles.commentInput}
                    value={newComment}
                    onChange={(e) => {
                        setNewComment(e.target.value);
                        autoResizeTextarea(e.target);
                    }}
                    ref={commentInputRef}
                    rows="2"
                    placeholder="Add a comment..."
                />
                <button
                    className={styles.addButton}
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                >
                    Comment
                </button>
            </div>
        </div>
    );
};

export default PlantComment;