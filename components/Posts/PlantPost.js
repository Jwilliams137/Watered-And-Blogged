import React, { useState, useEffect } from 'react';
import { updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './PlantPost.module.css';
import Link from 'next/link';
import PlantComment from '../Comment/PlantComment';

const PlantPost = ({ post, plantId, userId, onPostUpdated, onDeletePost }) => {
    const [newContent, setNewContent] = useState(post.content);
    const [newVisibility, setNewVisibility] = useState(post.visibility);
    const [loading, setLoading] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const [plantName, setPlantName] = useState('');
    const [plantImageUrl, setPlantImageUrl] = useState('/avatar.png');
    const [editMode, setEditMode] = useState(false);
    const currentUser = auth.currentUser;

    useEffect(() => {
        setNewContent(post.content);
        setNewVisibility(post.visibility);
        fetchPlantData();
    }, [post]);

    const fetchPlantData = async () => {
        try {
            const docRef = doc(db, `users/${userId}/plants/${plantId}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlantName(data.name || '');
                setPlantImageUrl(data.imageUrl || '/avatar.png');
            }
        } catch (error) {
            console.error('Error fetching plant data:', error);
        }
    };

    const handleEdit = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, `users/${userId}/plants/${plantId}/plantPosts/${post.id}`), {
                content: newContent,
                visibility: newVisibility,
                updatedAt: new Date(),
            });
            if (onPostUpdated) {
                onPostUpdated(post.id, { ...post, content: newContent, visibility: newVisibility });
            }
            setEditMode(false); // Exit edit mode after successful update
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
        setEditMode(false); // Exit edit mode
    };

    const toggleContent = () => {
        setShowFullContent(!showFullContent);
    };

    const handleTextareaChange = (e) => {
        setNewContent(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const renderContent = () => {
        if (newContent.length > 300 && !showFullContent) {
            return (
                <>
                    <div className={styles.postContent}>{newContent.slice(0, 300)}...</div>
                    <button onClick={toggleContent} className={styles.readMoreButton}>
                        Read more...
                    </button>
                </>
            );
        } else if (newContent.length > 300 && showFullContent) {
            return (
                <>
                    <div className={styles.postContent}>{newContent}</div>
                    <button onClick={toggleContent} className={styles.readMoreButton}>
                        See less
                    </button>
                </>
            );
        } else {
            return <div className={styles.postContent}>{newContent}</div>;
        }
    };

    return (
        <div className={styles.plantPost}>
            <div className={styles.plantInfo}>
                <Link href={`/profile/${userId}/plants/${plantId}`}>
                    <img src={plantImageUrl} alt={plantName} className={styles.plantImage} />
                    <h2>{plantName}</h2>
                </Link>
            </div>

            {editMode ? (
                <div>
                    <textarea
                        value={newContent}
                        onChange={handleTextareaChange}
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
                    {currentUser && (
                        <div className={styles.edit}>
                            <button onClick={() => setEditMode(true)} disabled={loading} className={styles.button}>
                                Edit
                            </button>
                            <button onClick={handleDelete} disabled={loading} className={styles.button}>
                                Delete
                            </button>
                        </div>
                    )}
                    {renderContent()}
                    <PlantComment plantPostId={post.id} userId={userId} plantId={plantId} />
                </div>
            )}
        </div>
    );
};

export default PlantPost;
