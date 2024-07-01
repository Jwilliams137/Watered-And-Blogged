import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Link from 'next/link'; // Import Link from Next.js
import styles from './PlantList.module.css';

const PlantList = () => {
    const [plants, setPlants] = useState([]);
    const [showPlants, setShowPlants] = useState(false);

    useEffect(() => {
        const fetchPlants = async () => {
            if (!auth.currentUser) return;

            const userId = auth.currentUser.uid;
            const plantsRef = collection(db, `users/${userId}/plants`);
            const q = query(plantsRef);

            try {
                const querySnapshot = await getDocs(q);
                const fetchedPlants = [];
                querySnapshot.forEach((doc) => {
                    fetchedPlants.push({ id: doc.id, ...doc.data() });
                });
                setPlants(fetchedPlants);
            } catch (error) {
                console.error('Error fetching plants:', error);
            }
        };

        fetchPlants();
    }, []);

    const togglePlantList = () => {
        setShowPlants(!showPlants);
    };

    const handleDeletePlant = async (plantId) => {
        try {
            const userId = auth.currentUser.uid;
            await deleteDoc(doc(db, `users/${userId}/plants/${plantId}`));
            setPlants(plants.filter(plant => plant.id !== plantId));
            console.log('Plant deleted successfully');
        } catch (error) {
            console.error('Error deleting plant:', error);
        }
    };

    return (
        <div>
            <h2 onClick={togglePlantList} style={{ cursor: 'pointer' }}>
                My Plants
            </h2>
            {showPlants && (
                <ul>
                    {plants.map((plant) => (
                        <li key={plant.id}>
                            <div className={styles.plantContainer}>
                                <Link href={`/profile/${auth.currentUser.uid}/plants/${plant.id}`}>
                                    <img
                                        src={plant.imageUrl}
                                        alt={plant.name}
                                        className={styles.plantImage}
                                    />
                                </Link>
                                <p>{plant.name}</p>
                                <button onClick={() => handleDeletePlant(plant.id)}>Delete Plant</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlantList;



