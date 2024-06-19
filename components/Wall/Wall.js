import React, { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, startAfter, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import Post from '../Posts/Post'
import styles from './Wall.module.css'

const Wall = () => {
  const [posts, setPosts] = useState([])
  const [lastVisible, setLastVisible] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)

    try {
      const userId = auth.currentUser.uid
      let q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), limit(10))

      if (lastVisible) {
        q = query(q, startAfter(lastVisible))
      }

      const snapshot = await getDocs(q)
      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setPosts(prevPosts => {
          const newPostIds = newPosts.map(post => post.id)
          const filteredPrevPosts = prevPosts.filter(post => !newPostIds.includes(post.id))
          return [...filteredPrevPosts, ...newPosts]
        })
      } else {
        setLastVisible(null)
      }

    } catch (error) {
      console.error('Error fetching posts: ', error)
    } finally {
      setLoading(false)
    }
  };

  const loadMore = () => {
    if (!loading) {
      fetchPosts()
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId))
      setPosts(posts.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting post: ', error)
    }
  }

  const handleEditPost = async (postId, newTitle, newContent) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        title: newTitle,
        content: newContent,
        updatedAt: new Date()
      })
      fetchPosts();
    } catch (error) {
      console.error('Error updating post: ', error)
    }
  }

  return (
    <div className={styles.wall}>
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
        />
      ))}
      {loading && <p>Loading...</p>}
      {lastVisible && (
        <button onClick={loadMore} disabled={loading}>Load More</button>
      )}
    </div>
  )
}

export default Wall




