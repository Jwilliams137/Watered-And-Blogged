import React, { useState, useEffect } from 'react';
import { updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Post.module.css';
import Link from 'next/link';
import Comment from '../Comment/Comment';

const Post = ({ post, onPostUpdated, onDeletePost }) => {
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [newVisibility, setNewVisibility] = useState(post.visibility);
  const [loading, setLoading] = useState(false);
  const [displayedContent, setDisplayedContent] = useState(post.content);
  const [displayedImageUrl, setDisplayedImageUrl] = useState(post.imageUrl);
  const [authorProfilePicture, setAuthorProfilePicture] = useState(null);
  const [showFullContent, setShowFullContent] = useState(false); // New state to toggle full content

  useEffect(() => {
    setDisplayedContent(post.content);
    setDisplayedImageUrl(post.imageUrl);
    fetchAuthorProfilePicture(post.authorId);
  }, [post]);

  const fetchAuthorProfilePicture = async (authorId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', authorId));
      if (userDoc.exists()) {
        setAuthorProfilePicture(userDoc.data().profilePicture);
      } else {
        setAuthorProfilePicture(null);
      }
    } catch (error) {
      console.error('Error fetching author profile picture:', error);
      setAuthorProfilePicture(null);
    }
  };

  const currentUser = auth.currentUser;

  const handleEdit = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        content: newContent,
        visibility: newVisibility,
        updatedAt: new Date(),
      });
      setDisplayedContent(newContent);
      if (onPostUpdated) {
        onPostUpdated(post.id, { ...post, content: newContent, visibility: newVisibility });
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

  const handleCancelEdit = () => {
    setNewContent(post.content);
    setNewVisibility(post.visibility);
    setEditing(false);
  };

  const toggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  const renderContent = () => {
    if (displayedContent.length > 300 && !showFullContent) {
      return (
        <>
          <div className={styles.postContent}>{displayedContent.slice(0, 300)}...</div>
          <button onClick={toggleContent} className={styles.readMoreButton}>
            Read more...
          </button>
        </>
      );
    } else if (displayedContent.length > 300 && showFullContent) {
      return (
        <>
          <div className={styles.postContent}>{displayedContent}</div>
          <button onClick={toggleContent} className={styles.readMoreButton}>
            See less
          </button>
        </>
      );
    } else {
      return <div className={styles.postContent}>{displayedContent}</div>;
    }
  };

  return (
    <div className={styles.post}>
      {editing ? (
        <div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={loading}
            className={styles.textArea}
          />
          {displayedImageUrl && <img src={displayedImageUrl} alt="Posted" className={styles.postImage} />}
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
            {authorProfilePicture ? (
              <Link href={`/profile/${post.authorId}`}>
                <img
                  src={authorProfilePicture}
                  alt={`${post.author}'s profile`}
                  className={styles.profilePicture}
                />
              </Link>
            ) : (
              <img
                src="/avatar.png"
                alt={`${post.author}'s profile`}
                className={styles.profilePicture}
              />
            )}
            <div className={styles.authorInfo}>
              <Link href={`/profile/${post.authorId}`}>
                <small className={styles.authorName}>{post.author}</small>
              </Link>
            </div>
          </div>
          {displayedImageUrl && <img src={displayedImageUrl} alt="Posted" className={styles.postImage} />}
          {currentUser && post.authorId === currentUser.uid && (
            <div className={styles.edit}>
              <button onClick={() => setEditing(true)} disabled={loading} className={styles.button}>
                Edit
              </button>
              <button onClick={handleDelete} disabled={loading} className={styles.button}>
                Delete
              </button>
            </div>
          )}
          {/* Updated post content display */}
          {renderContent()}
          <Comment postId={post.id} />
        </div>
      )}
    </div>
  );
};

export default Post;




















