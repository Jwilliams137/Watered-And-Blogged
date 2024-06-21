'use client'
import styles from './nav.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Ensure correct import path
import { logout } from '../../utils/auth';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

function Nav() {
    const { user } = useAuth();
    const router = useRouter();
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Toggle body class to control overflow
        if (isMenuOpen) {
            document.body.classList.add('open-menu');
        } else {
            document.body.classList.remove('open-menu');
        }

        // Clean up effect
        return () => {
            document.body.classList.remove('open-menu');
        };
    }, [isMenuOpen]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <div className={styles.hamburger + (isMenuOpen ? ` ${styles.open}` : '')} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={styles.nav}>
                <div className={styles.leftNav}>
                    <Link href="/" className={styles.title}>
                        Watered & Blogged
                    </Link>
                    <div>A blog for the love of plants</div>
                </div>

                {user && (
                    <div className={`${styles.rightNav} ${isMenuOpen ? styles.open : ''}`}>
                        <Link href="/" className={styles.link}>
                            Home
                        </Link>
                        <Link href="/profile" className={styles.link}>
                            Profile
                        </Link>
                        {user.email === adminEmail && (
                            <Link href="/admin" className={styles.link}>
                                Admin
                            </Link>
                        )}
                        <p onClick={handleLogout} className={styles.link}>
                            Logout
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Nav;




