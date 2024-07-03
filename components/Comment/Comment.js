import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Comment.module.css';
import Modal from '../Modal/Modal';

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

  useEffect(() => {
    const postRef = doc(db, 'posts', postId);

    const fetchPostOwner = async () => {
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        setLikesCount(postData.likes || 0);
        setLiked(postData.likesBy && postData.likesBy.includes(auth.currentUser?.uid));
        setPostOwnerId(postData.userId);
      }
    };

    fetchPostOwner();

    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const postData = doc.data();
        setLikesCount(postData.likes || 0);
        setLiked(postData.likesBy && postData.likesBy.includes(auth.currentUser?.uid));
      }
    });

    const commentsRef = collection(db, `posts/${postId}/comments`);
    const commentsUnsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
      fetchCommentAuthors(commentsData);
    });

    return () => {
      unsubscribe();
      commentsUnsubscribe();
    };
  }, [postId]);

  const fetchCommentAuthors = async (comments) => {
    const authorPromises = comments.map(async (comment) => {
      try {
        if (!comment.userId) {
          console.error('comment.userId is undefined for comment:', comment);
          return { [comment.id]: { name: 'Unknown User' } }; // Default to 'Unknown User'
        }

        const userDocRef = doc(db, 'users', comment.userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          return { [comment.id]: userDoc.data() };
        } else {
          console.error('No user found for userId:', comment.userId);
          return { [comment.id]: { name: 'Unknown User' } }; // Default to 'Unknown User'
        }
      } catch (error) {
        console.error('Error fetching userDoc:', error);
        return { [comment.id]: { name: 'Unknown User' } }; // Default to 'Unknown User'
      }
    });

    const authorData = await Promise.all(authorPromises);
    const authors = authorData.reduce((acc, author) => ({ ...acc, ...author }), {});
    setCommentAuthors(authors);
  };

  const handleLikePost = async () => {
    if (!auth.currentUser) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      const user = auth.currentUser;
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const postData = postDoc.data();
        const likedByUser = (postData.likesBy && postData.likesBy.includes(user?.uid));

        if (!likedByUser) {
          await updateDoc(postRef, {
            likes: postData.likes ? postData.likes + 1 : 1,
            likesBy: [...(postData.likesBy || []), user?.uid],
          });
        } else {
          await updateDoc(postRef, {
            likes: postData.likes - 1,
            likesBy: postData.likesBy.filter(uid => uid !== user?.uid),
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
      const commentsCollection = collection(db, `posts/${postId}/comments`);
      await addDoc(commentsCollection, {
        content: newComment,
        createdAt: new Date(),
        userId: auth.currentUser?.uid || 'anonymous',
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
                <img
                  src={commentAuthors[comment.id]?.profilePicture || '/default-profile.png'}
                  alt={`${commentAuthors[comment.id]?.name || 'Unknown User'}'s profile`}
                  className={styles.profilePicture}
                />
                <small className={styles.authorName}>{commentAuthors[comment.id]?.name || 'Unknown User'}</small>
              </div>
            )}
            <span>{comment.content}</span>
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
          disabled={loading || !newComment || !auth.currentUser}
          className={styles.commentButton}
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>
    </div>
  );
};

export default Comment;


















