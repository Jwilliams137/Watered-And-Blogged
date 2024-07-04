'use client';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../../../../firebase'; // Adjust the path as needed
import { useParams } from 'next/navigation'; // Import useParams
import NewPlantPost from '../../../../../../components/Posts/NewPlantPost'; // Import the NewPost component

const PlantProfilePage = () => {
  const { id: userId, plantId } = useParams();
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // State to track ownership

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
          setIsOwner(auth.currentUser && auth.currentUser.uid === userId); // Check ownership
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
      // Add the new post to the user's plant subprofile
      const newPostRef = await addDoc(collection(db, `users/${userId}/plants/${plantId}/posts`), newPost);
      console.log('New post added with ID: ', newPostRef.id);
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
      
      {/* Render NewPlantPost only if the current user is the owner */}
      {isOwner && <NewPlantPost onPostCreated={handlePostCreated} />}
      
      {/* Add more details about the plant as needed */}
    </div>
  );
};

export default PlantProfilePage;















