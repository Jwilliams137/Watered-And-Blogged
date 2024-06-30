'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Adjust this path if needed
import { useParams } from 'next/navigation'; // Import useParams

const PlantProfilePage = () => {
  const { id } = useParams(); // Use useParams to get dynamic route parameters
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlantData = async () => {
      if (!id) {
        setLoading(false);
        setError('Plant ID not found in URL');
        return;
      }

      try {
        // Assuming 'userId' is known or passed through some context or prop
        const userId = 'your-user-id-here'; // Replace with the actual user ID
        console.log('Fetching plant data for userId:', userId, 'plantId:', id); // Log the userId and plantId
        const plantRef = doc(db, `users/${userId}/plants`, id);
        const plantSnap = await getDoc(plantRef);

        if (plantSnap.exists()) {
          console.log('Plant data:', plantSnap.data()); // Log the retrieved plant data
          setPlantData(plantSnap.data());
        } else {
          setError('Plant not found');
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
        setError('Failed to fetch plant data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [id]);

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










