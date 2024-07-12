import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './PlantComment.module.css';
import Link from 'next/link';
import PlantLikes from '../Likes/PlantLikes';
import Modal from '../Modal/Modal'; // Import Modal component

const PlantComment = ({ plantPostId, userId, plantId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [commentAuthors, setCommentAuthors] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false); // State for showing login modal

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
            setShowLoginModal(true); // Show login modal if user is not logged in
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
        setShowLoginModal(false); // Close login modal on success
    };

    return (
        <div className={styles.commentSection}>
            <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} /> {/* Modal component */}

            <PlantLikes userId={userId} plantId={plantId} plantPostId={plantPostId} />
            <div className={styles.commentList}>
                {comments.map(comment => (
                    <div key={comment.id} className={styles.comment}>
                        {commentAuthors[comment.id] && (
                            <div className={styles.commentHeader}>
                                <Link href={`/profile/${comment.userId}`}>
                                    <img
                                        src={commentAuthors[comment.id].profilePicture || '/avatar.png'} // Use default avatar path directly
                                        alt={`${commentAuthors[comment.id].name || 'Unknown User'}'s profile`}
                                        className={styles.profilePicture}
                                    />
                                </Link>
                                <Link href={`/profile/${comment.userId}`}>
                                    <small className={styles.authorName}>{commentAuthors[comment.id].name || 'Unknown User'}</small>
                                </Link>
                            </div>
                        )}
                        {editingCommentId === comment.id ? (
                            <div>
                                <textarea
                                    value={editingCommentContent}
                                    onChange={(e) => setEditingCommentContent(e.target.value)}
                                    className={styles.textarea}
                                    rows="3"
                                />
                                <button
                                    onClick={() => handleEditComment(comment.id)}
                                    disabled={loading}
                                    className={styles.saveButton}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingCommentContent('');
                                    }}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className={styles.commentContent}>
                                {comment.content}
                            </div>
                        )}
                        {auth.currentUser && (auth.currentUser.uid === comment.userId) && (
                            <div className={styles.commentActions}>
                                <button
                                    onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditingCommentContent(comment.content);
                                    }}
                                    className={styles.editButton}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                    className={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.addComment}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className={styles.textarea}
                    rows="3"
                />
                <button
                    onClick={handleAddComment}
                    disabled={loading}
                    className={styles.addButton}
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
};

export default PlantComment;
