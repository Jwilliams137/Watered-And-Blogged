import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Comment.module.css';
import Modal from '../Modal/Modal';
import Link from 'next/link';

const Comment = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [postOwnerId, setPostOwnerId] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [commentAuthors, setCommentAuthors] = useState({});
    const [readMore, setReadMore] = useState({});

    const newCommentRef = useRef(null);
    const editingCommentRef = useRef(null);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const postRef = doc(db, 'posts', postId);
                const postDoc = await getDoc(postRef);

                if (postDoc.exists()) {
                    const postData = postDoc.data();
                    setLikesCount(postData.likes || 0);
                    setLiked(postData.likesBy && postData.likesBy.includes(auth.currentUser?.uid));
                    setPostOwnerId(postData.userId);
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
            }
        };

        const unsubscribePost = onSnapshot(doc(db, 'posts', postId), (doc) => {
            if (doc.exists()) {
                const postData = doc.data();
                setLikesCount(postData.likes || 0);
                setLiked(postData.likesBy && postData.likesBy.includes(auth.currentUser?.uid));
                setPostOwnerId(postData.userId);
            }
        });

        const unsubscribeComments = onSnapshot(collection(db, `posts/${postId}/comments`), (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(commentsData);
            fetchCommentAuthors(commentsData);
        });

        return () => {
            unsubscribePost();
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

    const handleLikePost = async () => {
        if (!auth.currentUser) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();
                const likedByUser = (postData.likesBy && postData.likesBy.includes(auth.currentUser.uid));

                if (!likedByUser) {
                    await updateDoc(postRef, {
                        likes: postData.likes ? postData.likes + 1 : 1,
                        likesBy: [...(postData.likesBy || []), auth.currentUser.uid],
                    });
                } else {
                    await updateDoc(postRef, {
                        likes: postData.likes - 1,
                        likesBy: postData.likesBy.filter(uid => uid !== auth.currentUser.uid),
                    });
                }
            }
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setLoading(false);
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

    const adjustTextareaHeight = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleNewCommentChange = (e) => {
        setNewComment(e.target.value);
        adjustTextareaHeight(newCommentRef.current);
    };

    const handleEditingCommentChange = (e) => {
        setEditingCommentContent(e.target.value);
        adjustTextareaHeight(editingCommentRef.current);
    };

    const toggleReadMore = (commentId) => {
        setReadMore(prevState => ({
            ...prevState,
            [commentId]: !prevState[commentId]
        }));
    };

    return (
        <div className={styles.commentSection}>
            <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />

            <div className={styles.postActions}>
                <button
                    onClick={handleLikePost}
                    disabled={loading}
                    className={styles.likeButton}
                >
                    {liked ? 'Unlike' : 'Like'}
                </button>
                <span className={styles.likesCount}>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            </div>

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
                                    ref={editingCommentRef}
                                    value={editingCommentContent}
                                    onChange={handleEditingCommentChange}
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
                                {readMore[comment.id] ? comment.content : comment.content.slice(0, 100)}
                                {comment.content.length > 100 && (
                                    <button
                                        className={styles.readMoreButton}
                                        onClick={() => toggleReadMore(comment.id)}
                                    >
                                        {readMore[comment.id] ? 'Show less' : 'Read more'}
                                    </button>
                                )}
                            </div>
                        )}
                        {auth.currentUser && (auth.currentUser.uid === postOwnerId || auth.currentUser.uid === comment.userId) && (
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
                    ref={newCommentRef}
                    value={newComment}
                    onChange={handleNewCommentChange}
                    onClick={handleCommentBoxClick}
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

export default Comment;
