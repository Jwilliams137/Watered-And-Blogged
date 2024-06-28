'use client'
import React from 'react'
import { signInWithGoogle } from '../../firebase'
import styles from './Login.module.css'

const Login = () => {
    return (
        <div>
            <button className={styles.googleButton} onClick={signInWithGoogle}>
                Sign in with Google
            </button>
        </div>
    )
}

export default Login


