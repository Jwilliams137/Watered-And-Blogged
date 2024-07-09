import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import PlantLikes from '../../components/Likes/PlantLikes'; // Ensure the path is correct
import styles from './PlantComment.module.css';
import Modal from '../Modal/Modal';
import Link from 'next/link'; // Import Link from next/link

const PlantComment = ({ postId, userId, plantId, plantPostId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [postOwnerId, setPostOwnerId] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [commentAuthors, setCommentAuthors] = useState({});

    useEffect(() => {
        const fetchPostData = async () => {
            if (!postId) {
                console.error('Invalid postId:', postId);
                return;
            }
            
            try {
                const postRef = doc(db, 'posts', postId);
                const postDoc = await getDoc(postRef);

                if (postDoc.exists()) {
                    const postData = postDoc.data();
                    setPostOwnerId(postData.userId);
                } else {
                    console.error('No post found with the provided postId:', postId);
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
            }
        };

        const unsubscribeComments = onSnapshot(collection(db, `posts/${postId}/comments`), (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(commentsData);
            fetchCommentAuthors(commentsData);
        });

        fetchPostData();

        return () => {
            unsubscribeComments();
        };
    }, [postId]);

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
            const commentsCollectionRef = collection(db, `posts/${postId}/comments`);
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
            const commentRef = doc(db, `posts/${postId}/comments`, commentId);
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
        if (!auth.currentUser) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        try {
            const commentRef = doc(db, `posts/${postId}/comments`, commentId);
            if (auth.currentUser.uid === postOwnerId || auth.currentUser.uid === commentUserId) {
                await deleteDoc(commentRef);
            } else {
                console.error('You are not authorized to delete this comment.');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentBoxClick = () => {
        if (!auth.currentUser) {
            setShowLoginModal(true);
        }
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
    };

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
                        {(auth.currentUser?.uid === comment.userId || auth.currentUser?.uid === postOwnerId) && auth.currentUser ? (
                            <button
                                onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                className={styles.commentButton}
                            >
                                Delete
                            </button>
                        ) : null}
                        {auth.currentUser?.uid === comment.userId && (
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
                    onClick={handleCommentBoxClick}
                    disabled={loading}
                />
                <button
                    onClick={handleAddComment}
                    disabled={loading || !newComment.trim()}
                    className={styles.commentButton}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default PlantComment;
