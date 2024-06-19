import React, { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase'
import styles from './Admin.module.css'

const AdminApprovePosts = () => {
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
    };

    const approvePost = async (postId) => {
        try {
            const postRef = doc(db, 'posts', postId)
            await updateDoc(postRef, { approved: true })
            setPosts(posts.filter(post => post.id !== postId))
        } catch (error) {
            console.error('Error approving post:', error)
        }
    }

    return (
        <div>
            <h1>Approve Posts</h1>
            {posts.map(post => (
                <div key={post.id}>
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                    {post.imageUrl && <img src={post.imageUrl} alt="Post image" style={{ width: '100px', height: '100px' }} />}
                    <button onClick={() => approvePost(post.id)}>Approve</button>
                </div>
            ))}
        </div>
    )
}

export default AdminApprovePosts


