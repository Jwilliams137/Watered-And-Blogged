'use client'
import React, { useEffect } from 'react';
import Wall from '../../../components/Wall/Wall';
import About from '../../../components/About/About'
import useAuth from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import AddPlant from '../../../components/Plant/AddPlant'
import PlantList from '../../../components/Plant/PlantList'

const ProfilePage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            console.log("User in ProfilePage: ", user);
        }
    }, [user]);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.profilePage}>
            {user ? (
                <div>
                    <About />
                    <PlantList />
                    <AddPlant />
                    <Wall />
                </div>
            ) : (
                <div className={styles.loading}>Loading user data...</div>
            )}
        </div>
    );
};

export default ProfilePage;

