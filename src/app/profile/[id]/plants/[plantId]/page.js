'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
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
                    setPlantData({
                        ...plantSnap.data(),
                        posts: plantSnap.data().posts || [], // Initialize posts as an empty array
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
            // Check if the post already exists
            const existingPost = plantData.posts.find(post => post.id === newPost.id);
            if (!existingPost) {
                const updatedPosts = [...plantData.posts, newPost];
                setPlantData(prevData => ({
                    ...prevData,
                    posts: updatedPosts,
                }));

                // Update Firestore
                await db.collection(`users/${userId}/plants/${plantId}/plantPosts`).doc(newPost.id).set(newPost);
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
            <PlantWall plantId={plantId} posts={plantData.posts} currentUserUid={auth.currentUser.uid} />
        </div>
    );
};

export default PlantProfilePage;
