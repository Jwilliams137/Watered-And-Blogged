'use client'
import styles from './nav.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '../../utils/auth'
import useAuth from '../../hooks/useAuth'
import { useState } from 'react'

function Nav() {
    const { user } = useAuth()
    const router = useRouter()
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.push('/')
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <div className={styles.nav}>
            <div className={styles.leftNav}>
                <Link href="/" className={styles.title}>Watered & blogged</Link>
                <div>A blog for the love of plants</div>
            </div>

            {user && (
                <>
                    <div className={`${styles.rightNav} ${isMenuOpen ? styles.open : ''}`}>
                        <Link href="/" className={styles.link}>Home</Link>
                        <Link href="/profile" className={styles.link}>Profile</Link>
                        {user.email === adminEmail && <Link href="/admin" className={styles.link}>Admin</Link>}
                        <p onClick={handleLogout} className={styles.link}>Logout</p>
                    </div>

                    <div className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </>
            )}
        </div>
    )
}

export default Nav



