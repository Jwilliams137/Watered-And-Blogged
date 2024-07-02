'use client'
import React from 'react';
import { signInWithGoogle } from '../../firebase';
import styles from './Login.module.css';

const Login = ({ onSuccess }) => {
  const handleSignIn = () => {
    signInWithGoogle().then(() => {
      onSuccess(); // Call onSuccess prop after successful sign-in
    });
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



