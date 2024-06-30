import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
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

    return (
        <div>
            <h2 onClick={togglePlantList} style={{ cursor: 'pointer' }}>
                My Plants
            </h2>
            {showPlants && (
                <ul>
                    {plants.map((plant) => (
                        <li key={plant.id}>
                            {/* Wrap the plant's name and image with Link */}
                            <Link href={`/profile/${auth.currentUser.uid}/plants/${plant.id}`}>
                                <div>
                                    <img
                                        src={plant.imageUrl}
                                        alt={plant.name}
                                        className={styles.plantImage}
                                    />
                                    <p>{plant.name}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlantList;


