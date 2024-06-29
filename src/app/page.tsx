'use client'
import styles from "./page.module.css"
import Login from "../../components/Login/Login"
import useAuth from "../../hooks/useAuth"
import Timeline from "../../components/Timeline/Timeline"

export default function Home() {
  const { user = { displayName: '' }, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <main className={styles.main}>
      {!user && (
        <div className={styles.login}>
          <Login />
        </div>
      )}
      <Timeline />
    </main>
  )
}
