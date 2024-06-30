'use client'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Adjust this path if needed

const PlantProfilePage = () => {
  const router = useRouter();
  const { id } = router.query; // Retrieve the ID from router.query
  const [plantData, setPlantData] = useState(null);

  useEffect(() => {
    const fetchPlantData = async () => {
      if (id) {
        try {
          // Assuming 'plants' is your Firestore collection name
          const plantRef = doc(db, 'plants', id);
          const plantSnap = await getDoc(plantRef);
          if (plantSnap.exists()) {
            setPlantData(plantSnap.data());
          } else {
            console.log('Plant not found');
          }
        } catch (error) {
          console.error('Error fetching plant data:', error);
        }
      }
    };

    fetchPlantData();
  }, [id]);

  if (!plantData) {
    return <p>Loading...</p>;
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
