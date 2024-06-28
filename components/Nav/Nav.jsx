'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../../utils/auth';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import Login from '../Login/Login';
import styles from './Nav.module.css'

function Nav() {
    const { user } = useAuth();
    const router = useRouter();
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('open-menu');
        } else {
            document.body.classList.remove('open-menu');
        }

        return () => {
            document.body.classList.remove('open-menu');
        };
    }, [isMenuOpen]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
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
                            <Login />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Nav;





