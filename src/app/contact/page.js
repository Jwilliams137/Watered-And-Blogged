'use client'
// ContactPage.js

import { useState } from 'react';
import styles from './page.module.css'; // Update with your CSS module path

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const adminEmail = process.env.NEXT_PUBLIC_EMAIL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message); // Include message in the form data

    try {
      const response = await fetch('https://formsubmit.co/' + adminEmail, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error state or feedback to the user
    }
  };

  if (submitted) {
    return (
      <div className={styles.contactForm}>
        <p>Thank you for your message! We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className={styles.contactForm}>
      <h1>Contact Us</h1>
      <form action={`https://formsubmit.co/${adminEmail}`} method="POST" onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default ContactPage;



