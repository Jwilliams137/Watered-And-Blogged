import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import styles from './PlantPost.module.css';

const PlantPost = ({ post, plantId, userId }) => { 
    const [editing, setEditing] = useState(false);
    const [newContent, setNewContent] = useState(post.content);
    const [newVisibility, setNewVisibility] = useState(post.visibility);
    const [loading, setLoading] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const [plantData, setPlantData] = useState(null);

    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchPlantData = async () => {
            try {
                const plantRef = doc(db, `users/${userId}/plants/${plantId}`);
                const plantSnap = await getDoc(plantRef);

                if (plantSnap.exists()) {
                    setPlantData(plantSnap.data());
                } else {
                    console.error('Plant not found');
                }
            } catch (error) {
                console.error('Failed to fetch plant data', error);
            }
        };

        fetchPlantData();
    }, [userId, plantId]);

    const handleEdit = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, `users/${userId}/plants/${plantId}/plantPosts/${post.id}`), {
                content: newContent,
                visibility: newVisibility,
                updatedAt: new Date(),
            });
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
            {plantData && (
                <div className={styles.plantInfo}>
                    <img src={plantData.imageUrl} alt={plantData.name} className={styles.plantImage} />
                    <h2>{plantData.name}</h2>
                </div>
            )}

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


