'use client';
import { useEffect, useCallback } from 'react'; // Added useCallback for handlePostCreated
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Login from '../../components/Login/Login';
import useAuth from '../../hooks/useAuth';
import Timeline from '../../components/Timeline/Timeline';
import NewPost from '../../components/Posts/NewPost';

export default function Home() {
  const { user = { displayName: '' }, loading } = useAuth();
  const router = useRouter();

  // Define handlePostCreated using useCallback to memoize the function
  const handlePostCreated = useCallback(() => {
    router.push('/profile');
  }, [router]);

  useEffect(() => {
    // Ensure this runs only on the client side and after post creation
    if (!loading && user) {
      // Logic for handling post creation, possibly triggering handlePostCreated
    }
  }, [user, loading]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

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
          <Login />
        </div>
      )}
      {user && (
        <div className={styles.userSection}>
          {/* Pass handlePostCreated to NewPost */}
          <NewPost onPostCreated={handlePostCreated} />
        </div>
      )}
      
      <Timeline />
    </main>
  );
}

