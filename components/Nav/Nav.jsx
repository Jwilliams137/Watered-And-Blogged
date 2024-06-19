'use client'
import styles from './nav.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '../../utils/auth'
import useAuth from '../../hooks/useAuth'

function Nav() {
    const { user } = useAuth()
    const router = useRouter()
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL

    const handleLogout = async () => {
        await logout()
        router.push('/')
    }

    return (
        <div className={styles.nav}>
            <div className={styles.title}>Viriditas Ludus</div>
            <div>For the love of plants</div>
            <Link href="/">Home</Link>
            <Link href="/profile">Profile</Link>
            {user && user.email === adminEmail && <Link href="/admin">Admin</Link>}
            {user && <button onClick={handleLogout}>Logout</button>}
        </div>
    )
}

export default Nav
