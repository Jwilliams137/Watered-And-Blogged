'use client'
import styles from "./page.module.css";
import Login from "../../components/Login/Login";
import useAuth from "../../hooks/useAuth";
import Timeline from "../../components/Timeline/Timeline";
import NewPost from "../../components/Posts/NewPost";

export default function Home() {
  const { user = { displayName: '' }, loading } = useAuth();

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <main className={styles.main}>
      {!user && (
        <div className={styles.login}>
          <Login />
        </div>
      )}
      {user && (
        <div className={styles.userSection}>
          <NewPost onPostCreated={undefined} />
        </div>
      )}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome!</h1>
        <p className={styles.welcomeText}>
          This place is still under construction, so expect changes and updates!
        </p>
      </div>
      <Timeline />
    </main>
  );
}

