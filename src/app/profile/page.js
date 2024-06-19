'use client'
import React, { useEffect } from 'react'
import NewPost from '../../../components/Posts/NewPost'
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
            <h1>My Profile</h1>
            {user ? (
                <div>
                    <h1>Welcome, {user.displayName}</h1>
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <div>
                    <div>Loading user data...</div>
                </div>
            )}
            <NewPost />
            <Wall />
        </div>
    )
}

export default ProfilePage
