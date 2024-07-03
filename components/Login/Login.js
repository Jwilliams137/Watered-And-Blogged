'use client'
import React from 'react';
import { signInWithGoogle, auth, db } from '../../firebase'; // Import Firebase auth and Firestore instance
import { doc, getDoc, setDoc } from 'firebase/firestore';
import styles from './Login.module.css';

const Login = ({ onSuccess }) => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle(); // Wait for sign-in with Google to complete
      const currentUser = auth.currentUser;

      // After successful sign-in, update username if it doesn't exist
      if (currentUser) {
        const userRef = doc(db, `users/${currentUser.uid}`);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const { displayName, email } = currentUser;
          const username = displayName || email.split('@')[0]; // Assign username based on display name or email

          await setDoc(userRef, {
            username,
            // Any other initial user data if needed
          }, { merge: true }); // Merge ensures existing data isn't overwritten
        }
      }

      if (typeof onSuccess === 'function') {
        onSuccess(); // Call onSuccess prop after successful sign-in
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








