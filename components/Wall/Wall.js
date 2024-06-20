import React, { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, startAfter, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import Post from '../Posts/Post'
import NewPost from '../Posts/NewPost'
import styles from './Wall.module.css'

const Wall = () => {
  const [posts, setPosts] = useState([])
  const [lastVisible, setLastVisible] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userId = auth.currentUser.uid
    const q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), limit(10))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPosts(prevPosts => {
        const postIds = new Set(prevPosts.map(post => post.id))
        const filteredPosts = newPosts.filter(post => !postIds.has(post.id))
        return [...filteredPosts, ...prevPosts]
      })
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
      }
    })

    return () => unsubscribe()
  }, [])

  const loadMore = () => {
    if (!loading && lastVisible) {
      setLoading(true)
      const userId = auth.currentUser.uid
      const q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10))

      onSnapshot(q, (snapshot) => {
        const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1])
          setPosts(prevPosts => {
            const postIds = new Set(prevPosts.map(post => post.id))
            const filteredPosts = newPosts.filter(post => !postIds.has(post.id))
            return [...prevPosts, ...filteredPosts]
          })
        }
        setLoading(false)
      })
    }
  }

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => {
      const postIds = new Set(prevPosts.map(post => post.id))
      if (!postIds.has(newPost.id)) {
        return [newPost, ...prevPosts]
      }
      return prevPosts
    })
  }

  const handlePostUpdated = (postId, newTitle, newContent) => {
    setPosts(prevPosts => prevPosts.map(post =>
      post.id === postId ? { ...post, title: newTitle, content: newContent } : post
    ))
  }

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId))
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting post: ', error)
    }
  }

  return (
    <div className={styles.wall}>
      <NewPost onPostCreated={handlePostCreated} />
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handleDeletePost}
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








