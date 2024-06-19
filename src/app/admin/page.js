'use client'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import styles from './page.module.css'

const AdminPage = () => {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'posts'))
                const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setPosts(postsData)
            } catch (error) {
                console.error('Error fetching posts:', error)
            }
        }

        fetchPosts()
    }, [])

    const handleApprove = async (postId) => {
        try {
            const postRef = doc(db, 'posts', postId)
            await updateDoc(postRef, { approved: true })
            setPosts(posts.map(post => post.id === postId ? { ...post, approved: true } : post))
        } catch (error) {
            console.error('Error approving post:', error)
        }
    }

    return (
        <div>
            <h1>Admin Page</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <p>Status: {post.approved ? 'Approved' : 'Pending'}</p>
                        {!post.approved && (
                            <button onClick={() => handleApprove(post.id)}>Approve</button>
                        )}
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





