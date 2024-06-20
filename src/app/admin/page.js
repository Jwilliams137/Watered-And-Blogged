'use client'
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import styles from './page.module.css'

const AdminPage = () => {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        fetchPendingPosts()
    }, [])

    const fetchPendingPosts = async () => {
        try {
            const q = query(collection(db, 'posts'), where('approved', '==', false))
            const snapshot = await getDocs(q)
            const pendingPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setPosts(pendingPosts)
        } catch (error) {
            console.error('Error fetching pending posts:', error)
        }
    }

    const handleApprove = async (postId) => {
        try {
            const postRef = doc(db, 'posts', postId)
            await updateDoc(postRef, { approved: true })

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
        } catch (error) {
            console.error('Error approving post:', error)
        }
    }

    return (
        <div className={styles.admin_page}>
            <h1>Admin Page</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <p>Status: Pending</p>
                        <button onClick={() => handleApprove(post.id)}>Approve</button>
                        {post.imageUrl && (
                            <img src={post.imageUrl} alt="Post image" className={styles.image} />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AdminPage








