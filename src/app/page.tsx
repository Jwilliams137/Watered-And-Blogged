'use client'
import { useEffect, useCallback, useState, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Login from '../../components/Login/Login';
import useAuth from '../../hooks/useAuth';
import Timeline from '../../components/Timeline/Timeline';
import NewPost from '../../components/Posts/NewPost';
import Link from 'next/link';
import PostPrompt from '../../components/PostPrompt/PostPrompt';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showNewPost, setShowNewPost] = useState(false);
  const [initialFile, setInitialFile] = useState(null);

  const handlePostCreated = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const handleCancel = useCallback(() => {
    setShowNewPost(false);
    setInitialFile(null);
  }, []);

  const handleFileChange = (file: SetStateAction<null>) => {
    setInitialFile(file);
    setShowNewPost(true);
  };

  useEffect(() => {
    if (!loading && user) {
      // Any necessary code when user is loaded
    }
  }, [user, loading]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.welcomeTitle}>Make Your Prized Plants Into Internet Stars</h1>
      {!user && (
        <div className={styles.login}>
          <Login onSuccess={undefined} />
        </div>
      )}
      {user && (
        <div className={styles.userSection}>
          {!showNewPost && <PostPrompt onClick={() => setShowNewPost(true)} onFileChange={handleFileChange} />}
          {showNewPost && <NewPost onPostCreated={handlePostCreated} onCancel={handleCancel} initialFile={initialFile} />}
        </div>
      )}
      <Timeline />
    </main>
  );
}
