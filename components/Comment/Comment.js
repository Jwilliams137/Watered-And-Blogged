import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Comment.module.css';

const Comment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [postOwnerId, setPostOwnerId] = useState('');

  useEffect(() => {
    const postRef = doc(db, 'posts', postId);

    const fetchPostOwner = async () => {
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        setLikesCount(postData.likes || 0);
        setLiked(postData.likesBy && postData.likesBy.includes(auth.currentUser?.uid));
        setPostOwnerId(postData.userId);  // Assuming userId is the field for post owner's ID
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
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      commentsUnsubscribe();
    };
  }, [postId]);

  const handleLikePost = async () => {
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
    setLoading(true);
    try {
      const commentsCollection = collection(db, `posts/${postId}/comments`);
      await addDoc(commentsCollection, {
        content: newComment,
        createdAt: new Date(),
        userId: auth.currentUser?.uid || 'anonymous', // Store the ID of the comment creator or use 'anonymous'
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
    setLoading(true);
    try {
      const commentRef = doc(db, `posts/${postId}/comments`, commentId);
      // Check if the current user is either the post owner or the comment owner
      if (auth.currentUser?.uid === postOwnerId || auth.currentUser?.uid === commentUserId) {
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

  return (
    <div className={styles.commentSection}>
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
            <span>{comment.content}</span>
            {(auth.currentUser?.uid === comment.userId || auth.currentUser?.uid === postOwnerId) && (
              <button
                onClick={() => handleDeleteComment(comment.id, comment.userId)}
                className={styles.commentButton}
              >
                Delete
              </button>
            )}
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
          disabled={loading || !auth.currentUser}
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
















