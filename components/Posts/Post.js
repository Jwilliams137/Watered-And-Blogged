import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './Post.module.css';

const Post = ({ post, onPostUpdated, onDeletePost }) => {
    const [editing, setEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(post.title);
    const [newContent, setNewContent] = useState(post.content);
    const [newImageUrl, setNewImageUrl] = useState(post.imageUrl);
    const [newVisibility, setNewVisibility] = useState(post.visibility);
    const [loading, setLoading] = useState(false);
    const [authorProfilePicture, setAuthorProfilePicture] = useState(null);

    useEffect(() => {
        fetchAuthorProfilePicture(post.authorId);
    }, [post.authorId]);

    const fetchAuthorProfilePicture = async (authorId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', authorId));
            if (userDoc.exists()) {
                setAuthorProfilePicture(userDoc.data().profilePicture);
            } else {
                setAuthorProfilePicture(null);
            }
        } catch (error) {
            setAuthorProfilePicture(null);
        }
    };

    const currentUser = auth.currentUser;

    const handleEdit = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, 'posts', post.id), {
                title: newTitle,
                content: newContent,
                imageUrl: newImageUrl,
                visibility: newVisibility,
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
                        className={styles.inputField}
                    />
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        disabled={loading}
                        className={styles.textArea}
                    />
                    {newImageUrl && <img src={newImageUrl} alt="Posted" className={styles.postImage} />}
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
                    <button onClick={() => setEditing(false)} disabled={loading} className={styles.button}>
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
                            <Link href={`/profile/${post.authorId}`}>
                                <small className={styles.authorName}>{post.author}</small>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.postTitle}>{post.title}</div>
                    {post.imageUrl && <img src={post.imageUrl} alt="Posted" className={styles.postImage} />}
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
                    <div className={styles.postContent}>{post.content}</div>
                </div>
            )}
        </div>
    );
};

export default Post;




