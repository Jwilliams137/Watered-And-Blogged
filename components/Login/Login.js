'use client'
import React from 'react';
import { signInWithGoogle } from '../../firebase';
import { auth, db } from '../../firebase'; // Import Firebase auth and Firestore instance
import styles from './Login.module.css';

const Login = ({ onSuccess }) => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle(); // Wait for sign-in with Google to complete
      onSuccess(); // Call onSuccess prop after successful sign-in

      // After successful sign-in, update username if it doesn't exist
      const userRef = db.doc(`users/${auth.currentUser.uid}`);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        const { displayName, email } = auth.currentUser;
        const username = displayName || email.split('@')[0]; // Assign username based on display name or email

        await userRef.set({
          username,
          // Any other initial user data if needed
        }, { merge: true }); // Merge ensures existing data isn't overwritten
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Handle error as needed
    }
  };

  return (
    <div>
      <button className={styles.googleButton} onClick={handleSignIn}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;




