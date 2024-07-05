// PlantPost.jsx
import React, { useState, useEffect } from 'react';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './PlantPost.module.css';

const PlantPost = ({ post, plantName, plantProfilePicture, onPostUpdated, onDeletePost }) => {
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [newVisibility, setNewVisibility] = useState(post.visibility);
  const [loading, setLoading] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    setNewContent(post.content);
    setNewVisibility(post.visibility);
  }, [post]);

  const currentUser = auth.currentUser;

  const handleEdit = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'plantPosts', post.id), {
        content: newContent,
        visibility: newVisibility,
        updatedAt: new Date(),
      });
      if (onPostUpdated) {
        onPostUpdated(post.id, newContent, newVisibility);
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
      await deleteDoc(doc(db, 'plantPosts', post.id));
      if (onDeletePost) {
        onDeletePost(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNewContent(post.content);
    setNewVisibility(post.visibility);
    setEditing(false);
  };

  const toggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  const renderContent = () => {
    if (post.content.length > 300 && !showFullContent) {
      return (
        <>
          <div className={styles.postContent}>{post.content.slice(0, 300)}...</div>
          <button onClick={toggleContent} className={styles.readMoreButton}>
            Read more...
          </button>
        </>
      );
    } else if (post.content.length > 300 && showFullContent) {
      return (
        <>
          <div className={styles.postContent}>{post.content}</div>
          <button onClick={toggleContent} className={styles.readMoreButton}>
            See less
          </button>
        </>
      );
    } else {
      return <div className={styles.postContent}>{post.content}</div>;
    }
  };

  return (
    <div className={styles.plantPost}>
      {editing ? (
        <div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={loading}
            className={styles.textArea}
          />
          <div className={styles.visibility}>
            <label>
              <input
                type="radio"
                value="public"
                checked={newVisibility === 'public'}
                onChange={() => setNewVisibility('public')}
                disabled={loading}
              />
              Public
            </label>
            <label>
              <input
                type="radio"
                value="private"
                checked={newVisibility === 'private'}
                onChange={() => setNewVisibility('private')}
                disabled={loading}
              />
              Private
            </label>
          </div>
          <button onClick={handleEdit} disabled={loading} className={styles.button}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleCancelEdit} disabled={loading} className={styles.button}>
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.postHeader}>
            {plantProfilePicture ? (
              <img
                src={plantProfilePicture}
                alt={`${plantName}'s profile`}
                className={styles.profilePicture}
              />
            ) : (
              <img
                src="/default-plant-profile.jpg"
                alt={`${plantName}'s profile`}
                className={styles.profilePicture}
              />
            )}
            <div className={styles.authorInfo}>
              <small className={styles.authorName}>{plantName}</small>
            </div>
          </div>
          
          {/* Render Image Here */}
          {post.imageUrl && (
            <img src={post.imageUrl} alt="Post Image" className={styles.postImage} />
          )}

          {currentUser && (
            <div className={styles.edit}>
              <button onClick={() => setEditing(true)} disabled={loading} className={styles.button}>
                Edit
              </button>
              <button onClick={handleDelete} disabled={loading} className={styles.button}>
                Delete
              </button>
            </div>
          )}
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default PlantPost;


