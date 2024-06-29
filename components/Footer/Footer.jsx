import React from 'react';
import Link from 'next/link';
import styles from './footer.module.css';

function Footer() {
    // Function to get the current year
    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    // Generate the copyright statement
    const copyrightStatement = `© ${getCurrentYear()} Your Company Name. All rights reserved.`;

    return (
        <div className={styles.footer}>
            <Link href="/privacy-tos">Privacy</Link>
            <Link href="/contact">Contact</Link>
            <span className={styles.copyright}>{copyrightStatement}</span>
        </div>
    );
}

export default Footer;
