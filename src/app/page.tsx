'use client'
import styles from "./page.module.css"
import Login from "../../components/Login/Login"
import useAuth from "../../hooks/useAuth"
import Timeline from "../../components/Timeline/Timeline"
import NewPost from "../../components/Posts/NewPost"

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
      {user && (
        <div>
          <NewPost onPostCreated={undefined} />
        </div>
      )}
      <div className={styles.welcome}>WELCOME!</div>
      <div className={styles.welcome}>This place is still under construction so you should expect it to change and break and get fixed and stuff for the time being</div>
      <Timeline />
    </main>
  )
}
