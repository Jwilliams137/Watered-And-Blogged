'use client'
import styles from "./page.module.css"
import Login from '../../components/Login/Login'
import useAuth from '../../hooks/useAuth'
import Timeline from "../../components/Timeline/Timeline"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <main className={styles.main}>

      <div>
        {user ? (
          <div>
            <h1>Welcome, {user.displayName}</h1>
            <p>Email: {user.email}</p>
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
