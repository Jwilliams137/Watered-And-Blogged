'use client'
import React, { useEffect } from 'react'
import Wall from '../../../components/Wall/Wall'
import useAuth from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const ProfilePage = () => {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            console.log("User in ProfilePage: ", user)
        }
    }, [user])

    if (loading) {
        return <div>Loading...</div>
    }
    return (
        <div>
            <div className={styles.welcome}>{user ? (
                <div>
                    <h1>Welcome, {user.displayName}</h1>

                </div>
            ) : (
                <div>
                    <div>Loading user data...</div>
                </div>
            )}</div>
            <Wall />
        </div>
    )
}

export default ProfilePage
