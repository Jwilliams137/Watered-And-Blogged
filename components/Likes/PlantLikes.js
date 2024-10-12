import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Modal from '../Modal/Modal'; // Import Modal component
import styles from './PlantLikes.module.css'

const PlantLikes = ({ userId, plantId, plantPostId }) => {
    const [likes, setLikes] = useState(0);
    const [likedByUser, setLikedByUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false); // State for showing login modal

    useEffect(() => {
        const fetchPostData = async () => {
            const postRefPath = `users/${userId}/plants/${plantId}/plantPosts/${plantPostId}`;

            try {
                const postRef = doc(db, postRefPath);
                const postSnap = await getDoc(postRef);

                if (postSnap.exists()) {
                    const postData = postSnap.data();
                    setLikes(postData.likes || 0);
                    setLikedByUser(postData.likesBy && postData.likesBy.includes(auth.currentUser.uid));
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
            }
        };

        if (auth.currentUser) {
            fetchPostData();
        } else {
            setLikes(0);
            setLikedByUser(false);
        }
    }, [userId, plantId, plantPostId, auth.currentUser]);

    const handleLikePost = async () => {
        if (!auth.currentUser) {
            setShowLoginModal(true); // Show login modal if user is not logged in
            return;
        }

        setLoading(true);
        const postRefPath = `users/${userId}/plants/${plantId}/plantPosts/${plantPostId}`;

        try {
            const postRef = doc(db, postRefPath);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                const newLikes = likedByUser ? postData.likes - 1 : postData.likes + 1;

                await updateDoc(postRef, {
                    likes: newLikes,
                    likesBy: likedByUser
                        ? postData.likesBy.filter(uid => uid !== auth.currentUser.uid)
                        : [...(postData.likesBy || []), auth.currentUser.uid],
                });

                setLikes(newLikes);
                setLikedByUser(!likedByUser);
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false); // Close login modal on success
    };

    return (
        <div className={styles.likes}>
            <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} /> {/* Modal component */}
            <button onClick={handleLikePost} disabled={loading}>
                {likedByUser ? 'Unlike' : 'Like'}
            </button>
            <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
        </div>
    );
};

export default PlantLikes;
