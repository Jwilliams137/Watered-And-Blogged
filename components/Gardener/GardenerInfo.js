import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './GardenerInfo.module.css';
import Link from 'next/link';

const GardenerInfo = ({ userId }) => {
    const [gardenerData, setGardenerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGardenerData = async () => {
            try {
                const gardenerRef = doc(db, 'users', userId); // Ensure the collection and document path is correct
                const gardenerSnap = await getDoc(gardenerRef);

                if (gardenerSnap.exists()) {
                    console.log("Gardener Data:", gardenerSnap.data()); // Log the fetched data
                    setGardenerData(gardenerSnap.data());
                } else {
                    setError('Gardener not found');
                }
            } catch (error) {
                console.error('Error fetching gardener data:', error); // Log any errors
                setError('Failed to fetch gardener data');
            } finally {
                setLoading(false);
            }
        };

        fetchGardenerData();
    }, [userId]);

    if (loading) {
        return <p>Loading gardener info...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!gardenerData) {
        return <p>No gardener data available.</p>;
    }

    const { username, profilePicture, aboutMe } = gardenerData;

    return (
        <div className={styles.gardenerInfoContainer}>            
            <h2 className={styles.gardenerTitle}>Gardener Information</h2>
            <Link href={`/profile/${userId}`}><img src={profilePicture || '/default-avatar.png'} alt={username} className={styles.gardenerProfilePic} /></Link>
            <Link href={`/profile/${userId}`}><p className={styles.gardenerName}>Name: {username}</p></Link>            
            <p className={styles.gardenerBio}>About Me: {aboutMe}</p>
        </div>
    );
};

export default GardenerInfo;
