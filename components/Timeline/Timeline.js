import React, { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, startAfter, getDocs, where } from 'firebase/firestore'
import { db } from '../../firebase'
import Post from '../Posts/Post'
import styles from './Timeline.module.css'

const Timeline = () => {
  const [posts, setPosts] = useState([])
  const [lastVisible, setLastVisible] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        where('approved', '==', true),
        limit(10)
      )

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setPosts(prevPosts => {
          const filteredPosts = newPosts.filter(newPost => !prevPosts.some(prevPost => prevPost.id === newPost.id))
          return [...prevPosts, ...filteredPosts]
        })
      } else {
        setLastVisible(null)
      }
    } catch (error) {
      console.error('Error fetching posts: ', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    fetchPosts()
  }

  return (
    <div>
      <h1>Timeline</h1>
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
      {loading && <p>Loading...</p>}
      {!loading && lastVisible && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  )
}

export default Timeline










