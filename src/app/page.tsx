'use client'
import { useEffect } from "react"
import Head from "next/head"
import styles from "./page.module.css"
import Login from "../../components/Login/Login"
import useAuth from "../../hooks/useAuth"
import Timeline from "../../components/Timeline/Timeline"

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <main className={styles.main}>
      <Head>
        <title>Watered & blogged</title>
        <meta name="description" content="A blog for the love of plants" />
      </Head>
      <div>
        {user ? (
          <div>
            <h1>Welcome, {user.displayName}</h1>
          </div>
        ) : (
          <div>
            <Login />
          </div>
        )}
        <Timeline />
      </div>
    </main>
  )
}
