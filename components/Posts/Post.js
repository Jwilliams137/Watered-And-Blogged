import React, { useState } from 'react';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Post.module.css';

const Post = ({ post, onPostUpdated, onDeletePost }) => {
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(post.title);
  const [newContent, setNewContent] = useState(post.content);
  const [newImageUrl, setNewImageUrl] = useState(post.imageUrl);
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  const handleEdit = async () => {
    setLoading(true);
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        title: newTitle,
        content: newContent,
        imageUrl: newImageUrl,
        updatedAt: new Date(),
      });
      if (onPostUpdated) {
        onPostUpdated(post.id, newTitle, newContent, newImageUrl);
      }
      setEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      if (onDeletePost) {
        onDeletePost(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.post}>
      {editing ? (
        <div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={loading}
          ></textarea>
          {newImageUrl && <img src={newImageUrl} alt="Posted" style={{ maxWidth: '100%' }} />}
          <button onClick={handleEdit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)} disabled={loading}>
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.postHeader}>
            {post.authorProfilePicture ? (
              <img
                src={post.authorProfilePicture}
                alt={`${post.author}'s profile`}
                className={styles.profilePicture}
              />
            ) : (
              <div className={styles.defaultProfilePicture}></div>
            )}
            <div className={styles.authorInfo}>
              <small>{post.author}</small>
            </div>
          </div>
          <h2>{post.title}</h2>
          
          {post.imageUrl && <img src={post.imageUrl} alt="Posted" style={{ maxWidth: '100%' }} />}
          
          {currentUser && post.authorId === currentUser.uid && (
            <div className={styles.edit}>
              <button onClick={() => setEditing(true)} disabled={loading}>
                Edit
              </button>
              <button onClick={handleDelete} disabled={loading}>
                Delete
              </button>
            </div>
          )}
          <p>{post.content}</p>
        </div>
      )}
    </div>
  );
};

export default Post;
