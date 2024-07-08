'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../../../../firebase';
import { useParams } from 'next/navigation';
import NewPlantPost from '../../../../../../components/Posts/NewPlantPost';
import PlantWall from '../../../../../../components/Wall/PlantWall';
import AboutPlant from '../../../../../../components/About/AboutPlant';
import styles from './page.module.css'; // Import CSS module

const PlantProfilePage = () => {
    const { id: userId, plantId } = useParams();
    const [plantData, setPlantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchPlantData = async () => {
            if (!userId || !plantId) {
                setLoading(false);
                setError('User ID or Plant ID not found in URL');
                return;
            }

            try {
                const plantRef = doc(db, 'users', userId, 'plants', plantId); // Updated path to nested collection
                const plantSnap = await getDoc(plantRef);

                if (plantSnap.exists()) {
                    setPlantData({
                        ...plantSnap.data(),
                        posts: plantSnap.data().posts || [],
                    });
                    setIsOwner(auth.currentUser && auth.currentUser.uid === userId);
                } else {
                    setError('Plant not found');
                }
            } catch (error) {
                setError('Failed to fetch plant data');
            } finally {
                setLoading(false);
            }
        };

        fetchPlantData();
    }, [userId, plantId]);

    const handlePostCreated = async (newPost) => {
        try {
            const existingPost = plantData.posts.find(post => post.id === newPost.id);
            if (!existingPost) {
                const updatedPosts = [...plantData.posts, newPost];
                setPlantData(prevData => ({
                    ...prevData,
                    posts: updatedPosts,
                }));

                const postRef = doc(db, 'users', userId, 'plants', plantId, 'plantPosts', newPost.id); // Updated path to nested collection
                await setDoc(postRef, newPost);
            }
        } catch (error) {
            console.error('Error adding post: ', error);
        }
    };

    const handlePlantProfileUpdate = async (updatedPlantData) => {
        try {
            const plantRef = doc(db, 'users', userId, 'plants', plantId); // Updated path to nested collection
            await setDoc(plantRef, updatedPlantData, { merge: true });
            setPlantData(prevData => ({
                ...prevData,
                ...updatedPlantData,
            }));
        } catch (error) {
            console.error('Error updating plant profile:', error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!plantData) {
        return <p>No plant data available.</p>;
    }

    const { name, imageUrl } = plantData;

    return (
        <div className={styles.plantProfileContainer}>
            <h1 className={styles.plantName}>{name}</h1>
            <img src={imageUrl} alt={name} className={styles.plantImage} />
            {isOwner && <NewPlantPost onPostCreated={handlePostCreated} plantId={plantId} />}
            {isOwner && <AboutPlant
                plantId={plantId}
                name={name}
                imageUrl={imageUrl}
                onUpdatePlant={handlePlantProfileUpdate}
            />}
            <PlantWall plantId={plantId} posts={plantData.posts} currentUserUid={auth.currentUser.uid} />
        </div>
    );
};

export default PlantProfilePage;
