import React, { useState, useEffect } from 'react';
import { updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Post.module.css';

const Post = ({ post, onPostUpdated, onDeletePost }) => {
    const [editing, setEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(post.title);
    const [newContent, setNewContent] = useState(post.content);
    const [newImageUrl, setNewImageUrl] = useState(post.imageUrl);
    const [newVisibility, setNewVisibility] = useState(post.visibility); // Added state for visibility
    const [loading, setLoading] = useState(false);
    const [authorProfilePicture, setAuthorProfilePicture] = useState(null); // State to hold author's profile picture URL

    useEffect(() => {
        // Fetch author's profile picture URL when component mounts
        fetchAuthorProfilePicture(post.authorId);
    }, [post.authorId]);

    const fetchAuthorProfilePicture = async (authorId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', authorId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setAuthorProfilePicture(userData.profilePicture);
            } else {
                console.error(`User with ID ${authorId} not found.`);
                setAuthorProfilePicture(null); // Set to null if user not found (handle accordingly in UI)
            }
        } catch (error) {
            console.error('Error fetching author profile picture:', error);
            setAuthorProfilePicture(null); // Set to null on error (handle accordingly in UI)
        }
    };

    const currentUser = auth.currentUser;

    const handleEdit = async () => {
        setLoading(true);
        try {
            const postRef = doc(db, 'posts', post.id);
            await updateDoc(postRef, {
                title: newTitle,
                content: newContent,
                imageUrl: newImageUrl,
                visibility: newVisibility, // Update visibility
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
                        {authorProfilePicture ? (
                            <img
                                src={authorProfilePicture}
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

