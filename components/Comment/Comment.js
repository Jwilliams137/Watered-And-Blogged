import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, `posts/${postId}/comments`), (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [postId]);

  const handleLikePost = async () => {
    setLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      const user = auth.currentUser;
      const postDoc = await doc(postRef).get();

      if (postDoc.exists()) {
        const postData = postDoc.data();
        if (!postData.likesBy || !postData.likesBy.includes(user.uid)) {
          await updateDoc(postRef, {
            likes: postData.likes ? postData.likes + 1 : 1,
            likesBy: [...(postData.likesBy || []), user.uid],
          });
          setLiked(true);
          setLikesCount(postData.likes + 1);
        } else {
          await updateDoc(postRef, {
            likes: postData.likes - 1,
            likesBy: postData.likesBy.filter(uid => uid !== user.uid),
          });
          setLiked(false);
          setLikesCount(postData.likes - 1);
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

  const handleDeleteComment = async (commentId) => {
    setLoading(true);
    try {
      const commentRef = doc(db, `posts/${postId}/comments`, commentId);
      await deleteDoc(commentRef);
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
            {editingCommentId === comment.id ? (
              <>
                <input
                  type="text"
                  value={editingCommentContent}
                  onChange={(e) => setEditingCommentContent(e.target.value)}
                  placeholder="Edit your comment..."
                  className={styles.commentInput}
                />
                <button
                  onClick={() => handleEditComment(comment.id)}
                  disabled={loading || !editingCommentContent}
                  className={styles.commentButton}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className={styles.commentButton}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>{comment.content}</span>
                <button
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditingCommentContent(comment.content);
                  }}
                  className={styles.commentButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className={styles.commentButton}
                >
                  Delete
                </button>
              </>
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
          disabled={loading}
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !newComment}
          className={styles.commentButton}
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>
    </div>
  );
};

export default Comment;






