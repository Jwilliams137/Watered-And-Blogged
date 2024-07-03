'use client';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Ensure this is the correct path to your firebase config
import styles from './page.module.css';
import Login from '../../components/Login/Login';
import useAuth from '../../hooks/useAuth';
import Timeline from '../../components/Timeline/Timeline';
import NewPost from '../../components/Posts/NewPost';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handlePostCreated = useCallback(() => {
    router.push('/profile');
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      // Handle any additional side-effects of user being loaded
    }
  }, [user, loading]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleLoginSuccess = async () => {
    if (user) {
      const userRef = doc(db, `users/${user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email } = user;
        const username = displayName || email.split('@')[0]; // Assign username based on display name or email

        await setDoc(userRef, {
          username,
          // Any other initial user data if needed
        }, { merge: true }); // Merge ensures existing data isn't overwritten
      }
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome!</h1>
        <p className={styles.welcomeText}>
          This place is still under construction, so expect changes and updates!
        </p>
      </div>
      {!user && (
        <div className={styles.login}>
          <Login onSuccess={handleLoginSuccess} />
        </div>
      )}
      {user && (
        <div className={styles.userSection}>
          <NewPost onPostCreated={handlePostCreated} />
        </div>
      )}
      <Timeline />
    </main>
  );
}
