'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../../firebase'; // Adjust the path as needed
import { useRouter, useParams } from 'next/navigation'; // Import useParams

const PlantProfilePage = () => {
  const { id: userId, plantId } = useParams(); // Use useParams to get dynamic route parameters
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      {/* Add more details about the plant as needed */}
    </div>
  );
};

export default PlantProfilePage;













