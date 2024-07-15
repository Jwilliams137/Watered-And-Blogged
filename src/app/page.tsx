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
import Modal from '../../components/Modal/Modal';
import { auth } from '../../firebase'


export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const adminEmail = process.env.NEXT_PUBLIC_EMAIL
  const [showNewPost, setShowNewPost] = useState(false)
  const [initialFile, setInitialFile] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleAddPlant = async () => {
    if (!auth.currentUser) {
      setShowLoginModal(true);
      return;
    }
  }

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
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <div className={styles.column}>
        {!user && <h2 className={styles.addPlant} onClick={handleAddPlant}>Make Your Prized Plants Into Internet Stars</h2>}
        {user && <div className={styles.addPlant}><AddPlant /></div>}
        {!user && (
          <div className={styles.login}>
            <Login onSuccess={undefined} />
          </div>
        )}
        <h2>Weather API</h2>
        {user && (
          <div className={styles.sideBar}>
            <p className={styles.link}>Add Plant</p>
            <Link href='/profile'><p className={styles.link}>Profile</p></Link>
            <Link href='/settings'><p className={styles.link}>Settings</p></Link>
            <Link href='/'><p className={styles.link}>Home</p></Link>
            <Link href='/privacy-tos'><p className={styles.link}>Terms & Privacy</p></Link>
            <Link href='/contact'><p className={styles.link}>Contact</p></Link>
            <p className={styles.link} onClick={handleLogout}>Log Out</p>
            {user.email === adminEmail && (
              <Link href="/admin" className={styles.link}>
                Admin
              </Link>
            )}
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
