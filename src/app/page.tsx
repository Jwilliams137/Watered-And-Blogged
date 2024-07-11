'use client'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Login from '../../components/Login/Login'
import useAuth from '../../hooks/useAuth'
import Timeline from '../../components/Timeline/Timeline'
import NewPost from '../../components/Posts/NewPost'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handlePostCreated = useCallback(() => {
    router.push('/profile')
  }, [router])

  useEffect(() => {
    if (!loading && user) {
    }
  }, [user, loading])

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <main className={styles.main}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Make Your Prized Plants Into Internet Stars</h1>
        {/*<h2>Make your prized plants into internet stars!</h2>*/}
        <p className={styles.welcomeText}>
          This place is still under construction and in Beta mode.
          Expect to see dummy data, stuff that doesnt work, temporarily bad css, and constant updates for the time being.
          Please feel free to post but understand if your data gets deleted in the construction process.
        </p>
        <p className={styles.messagePrompt}>If you want to get an email update once everything is running more smoothly please send a message
          <span className={styles.contact}><Link href='/contact'> here </Link></span>with your email address!</p>
      </div>
      {!user && (
        <div className={styles.login}>
          <Login onSuccess={undefined} />
        </div>
      )}
      {user && (
        <div className={styles.userSection}>
          <NewPost onPostCreated={handlePostCreated} />
        </div>
      )}
      <Timeline />
    </main>
  )
}