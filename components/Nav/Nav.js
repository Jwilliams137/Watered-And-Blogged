'use client'
import { useState } from 'react';
import styles from './Nav.module.css';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Logo</div>
      <div className={isOpen ? `${styles.menu} ${styles.active}` : styles.menu}>
        <ul className={styles.links}>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      <div className={`${styles.hamburger} ${isOpen ? styles.active : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Nav;






