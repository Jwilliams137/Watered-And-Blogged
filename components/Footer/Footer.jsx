import React from 'react'
import Link from 'next/link'
import styles from './footer.module.css'

function Footer() {
    const getCurrentYear = () => {
        return new Date().getFullYear()
    }

    const copyrightStatement = `© ${getCurrentYear()} Watered & Blogged. All rights reserved.`

    return (
        <footer className={styles.footer}>
            <div className={styles.links}>
                <Link href="/privacy-tos" className={styles.link}>Privacy</Link>
                <Link href="/contact" className={styles.link}>Contact</Link>
            </div>
            <div className={styles.separator}></div>
            <span className={styles.copyright}>{copyrightStatement}</span>
        </footer>
    )
}

export default Footer

