// PrivacyPolicyPage.js

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

function PrivacyPolicyPage() {
  return (
    <div className={styles.privacyPolicy}>
      <h1>Privacy Policy</h1>
      <p>
        Effective Date: 6/29/2024
      </p>
      <p>
        Thank you for using Watered & Blogged! This Privacy Policy explains how we collect, use, and disclose information about you when you access our platform. By using Watered & Blogged, you agree to the terms outlined in this policy.
      </p>
      
      <h2>Information We Collect</h2>
      <p>
        <strong>Personal Information:</strong> When you create an account or use our platform, we collect information such as your name, email address, and any other information you choose to provide, such as profile pictures and posts.
      </p>
      <p>
        <strong>Usage Information:</strong> We collect information about how you interact with our platform, such as the pages you visit and actions you take.
      </p>
      <p>
        <strong>Device and Log Information:</strong> We may collect device information (e.g., IP address, browser type) and log information (e.g., access times, pages viewed) to ensure the security and functionality of our platform.
      </p>
      
      <h2>How We Use Your Information</h2>
      <p>
        <strong>To Provide and Improve Services:</strong> We use your information to operate, maintain, and improve our platform, including personalizing your experience and developing new features.
      </p>
      <p>
        <strong>To Communicate with You:</strong> We may use your email address to send you updates, newsletters, and other communications related to our platform.
      </p>
      <p>
        <strong>To Protect Our Platform:</strong> We may use your information to detect, prevent, and address technical issues, fraud, or security concerns.
      </p>
      
      <h2>Sharing of Information</h2>
      <p>
        <strong>Public Posts:</strong> Any information or content you voluntarily disclose for posting becomes publicly available and may be viewed by other users.
      </p>
      <p>
        <strong>With Service Providers:</strong> We may share your information with third-party service providers who assist us in operating our platform, such as hosting providers and analytics services.
      </p>
      <p>
        <strong>Legal Compliance:</strong> We may disclose your information if required by law or in response to legal requests or government investigations.
      </p>
      
      <h2>Data Security</h2>
      <p>
        We implement reasonable security measures to protect the confidentiality and integrity of your information. However, no method of transmission over the internet or electronic storage is completely secure.
      </p>
      
      <h2>Your Rights and Choices</h2>
      <p>
        <strong>Access and Update:</strong> You can access and update your account information through your profile settings.
      </p>
      <p>
        <strong>Data Deletion:</strong> You may request deletion of your account and associated data. Please note that some information may remain in our records after deletion for legal or administrative purposes.
      </p>
      <p>
        <strong>Cookies and Tracking Technologies:</strong> Our platform may use cookies or similar technologies to enhance user experience and track usage patterns. You can manage cookie preferences through your browser settings.
      </p>
      
      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically to reflect changes in our practices and services. We will notify you of any significant changes by posting the updated policy on our platform or by other means.
      </p>
      
      <h2>Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy or our data practices, please{' '}
        <span className={styles.contactLink}><Link href="/contact">contact us</Link></span>
        .
      </p>
      
      <h2>Terms of Service (TOS)</h2>
      <ul>
        <li>User Responsibilities: Define user responsibilities, such as accurate account information and compliance with community guidelines.</li>
        <li>Intellectual Property: Outline ownership rights of content posted on your platform.</li>
        <li>Prohibited Activities: List prohibited activities, such as spamming, unauthorized access, or content that violates intellectual property rights.</li>
        <li>Limitation of Liability: Limit your liability in cases of service interruptions, data loss, or damages arising from the use of your platform.</li>
        <li>Governing Law: Specify the governing law and jurisdiction for any disputes related to the use of your platform.</li>
      </ul>
    </div>
  );
}

export default PrivacyPolicyPage;


