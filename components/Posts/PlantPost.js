import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Link from 'next/link';
import styles from './PlantPost.module.css';
import PlantComment from '../../components/Comment/PlantComment'; // Adjust the path as per your actual file structure

const PlantPost = ({ post, plantId, userId, onDeletePost }) => {
    const [editing, setEditing] = useState(false);
    const [newContent, setNewContent] = useState(post.content);
    const [newVisibility, setNewVisibility] = useState(post.visibility);
    const [loading, setLoading] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);

    const currentUser = auth.currentUser;

    const handleEdit = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, `users/${userId}/plants/${plantId}/plantPosts/${post.id}`), {
                content: newContent,
                visibility: newVisibility,
                updatedAt: new Date(),
            });

            // Check if visibility is set to private and delete from timeline
            if (newVisibility === 'private') {
                onDeletePost(post.id);
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
            await deleteDoc(doc(db, `users/${userId}/plants/${plantId}/plantPosts/${post.id}`));
            onDeletePost(post.id); // Notify the Timeline component to remove the post
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
            <div className={styles.plantInfo}>
                <Link href={`/profile/${userId}/plants/${plantId}`}>
                    <img src={post.plantProfilePic} alt={post.plantName} className={styles.plantImage} />
                    <h2>{post.plantName}</h2>
                </Link>
            </div>

            {post.imageUrl && (
                <img src={post.imageUrl} alt="Post Image" className={styles.postImage} />
            )}

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
                    {currentUser && currentUser.uid === userId && (
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

                    {/* Include PlantComment component here */}
                    <PlantComment plantPostId={post.id} />
                </div>
            )}
        </div>
    );
};

export default PlantPost;
