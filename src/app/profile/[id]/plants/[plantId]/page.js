'use client'
// PlantProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../../../../firebase';
import { useParams } from 'next/navigation';
import NewPlantPost from '../../../../../../components/Posts/NewPlantPost';
import PlantWall from '../../../../../../components/Wall/PlantWall';

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
                const plantRef = doc(db, `users/${userId}/plants/${plantId}`);
                const plantSnap = await getDoc(plantRef);

                if (plantSnap.exists()) {
                    setPlantData(plantSnap.data());
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
            // Add the new post only if it doesn't exist already
            if (!plantData.posts.some(post => post.id === newPost.id)) {
                const plantPostsRef = collection(db, `users/${userId}/plants/${plantId}/plantPosts`);
                await addDoc(plantPostsRef, newPost);
                console.log('New post added with ID: ', newPost.id);
            }
        } catch (error) {
            console.error('Error adding post: ', error);
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
        <div>
            <h1>{name}</h1>
            <img src={imageUrl} alt={name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
            {isOwner && <NewPlantPost onPostCreated={handlePostCreated} plantId={plantId} />}
            <PlantWall plantId={plantId} />
        </div>
    );
};

export default PlantProfilePage;


