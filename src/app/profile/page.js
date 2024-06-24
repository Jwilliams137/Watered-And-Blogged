'use client'
import React, { useEffect } from 'react';
import Wall from '../../../components/Wall/Wall';
import About from '../../../components/About/About'
import useAuth from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

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
                <div className={styles.welcome}>
                    <h1>Welcome, {user.displayName}</h1>
                    <About />
                    <Wall />
                </div>
            ) : (
                <div className={styles.loading}>Loading user data...</div>
            )}
        </div>
    );
};

export default ProfilePage;
