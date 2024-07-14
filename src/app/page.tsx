'use client'
import { useEffect, useCallback, useState, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Login from '../../components/Login/Login'
import useAuth from '../../hooks/useAuth'
import Timeline from '../../components/Timeline/Timeline'
import NewPost from '../../components/Posts/NewPost'
import AddPlant from '../../components/Plant/AddPlant'
import PostPrompt from '../../components/PostPrompt/PostPrompt'
import Link from 'next/link'
import { logout } from '../../utils/auth'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showNewPost, setShowNewPost] = useState(false)
  const [initialFile, setInitialFile] = useState(null)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handlePostCreated = useCallback(() => {
    router.push('/profile')
  }, [router])

  const handleCancel = useCallback(() => {
    setShowNewPost(false)
    setInitialFile(null)
  }, [])

  const handleFileChange = (file: SetStateAction<null>) => {
    setInitialFile(file)
    setShowNewPost(true)
  }

  useEffect(() => {
    if (!loading && user) {
      // Any necessary code when user is loaded
    }
  }, [user, loading])

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <main className={styles.main}>
      <div className={styles.column}>
        {!user && <h2 className={styles.addPlant}>Make Your Prized Plants Into Internet Stars</h2>}
        {user && <AddPlant />}
        {!user && (
          <div className={styles.login}>
            <Login onSuccess={undefined} />
          </div>
        )}
        <h2>Weather API</h2>
        {user && (
          <div className={styles.sideBar}>
            <Link href='/profile'><p className={styles.link}>Profile</p></Link>
            <Link href='/settings'><p className={styles.link}>Settings</p></Link>
            <Link href='/privacy-tos'><p className={styles.link}>Terms & Privacy</p></Link>
            <Link href='/contact'><p className={styles.link}>Contact</p></Link>
            <p className={styles.link} onClick={handleLogout}>Log Out</p>
            <Link href='/profile'></Link>
          </div>
        )}
      </div>
      <div className={styles.column}>
        {user && (
          <div className={styles.userSection}>
            {!showNewPost && <PostPrompt onClick={() => setShowNewPost(true)} onFileChange={handleFileChange} />}
            {showNewPost && <NewPost onPostCreated={handlePostCreated} onCancel={handleCancel} initialFile={initialFile} />}
          </div>
        )}
        <Timeline />
      </div>
    </main>
  )
}
