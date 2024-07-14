'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '../../utils/auth'
import useAuth from '../../hooks/useAuth'
import Login from '../Login/Login'
import { db } from '../../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import styles from './Nav.module.css'

function Nav() {
    const { user } = useAuth()
    const router = useRouter()
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('open-menu')
        } else {
            document.body.classList.remove('open-menu')
        }

        return () => {
            document.body.classList.remove('open-menu')
        }
    }, [isMenuOpen])

    const handleLogout = async () => {
        await logout()
        router.push('/')
        setIsMenuOpen(false)
    }

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const handleLoginSuccess = async () => {
        if (user) {
            const userRef = doc(db, `users/${user.uid}`)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
                const { displayName, email } = user
                const username = displayName || email.split('@')[0]

                await setDoc(userRef, {
                    username,
                }, { merge: true })
            }
        }
    };

    return (
        <>
            <div className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                <div className={styles.leftNav}>
                    <Link href="/" className={styles.title} onClick={closeMenu}>
                        Watered & Blogged
                    </Link>
                    <div className={styles.description}>A blog for the love of plants</div>
                </div>

                <div className={`${styles.rightNav} ${isMenuOpen ? styles.open : ''}`}>
                    {user ? (
                        <>
                            <Link href="/" className={styles.link} onClick={closeMenu}>
                                Home
                            </Link>
                            <Link href="/profile" className={styles.link} onClick={closeMenu}>
                                Profile
                            </Link>
                            <Link href="/profile" className={styles.link} onClick={closeMenu}>
                                Add Plant
                            </Link>
                            <Link href="/settings" className={styles.link} onClick={closeMenu}>
                                Settings
                            </Link>
                            <Link href='/privacy-tos' onClick={closeMenu}><p className={styles.link}>Terms & Privacy</p></Link>
                            <Link href='/contact'><p className={styles.link} onClick={closeMenu}>Contact</p></Link>
                            {user.email === adminEmail && (
                                <Link href="/admin" className={styles.link} onClick={closeMenu}>
                                    Admin
                                </Link>
                            )}
                            <p onClick={handleLogout} className={styles.link}>
                                Logout
                            </p>
                        </>
                    ) : (
                        <div className={styles.link} onClick={closeMenu}>
                            <Login onSuccess={handleLoginSuccess} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Nav