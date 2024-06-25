// Timeline.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc } from 'firebase/firestore'; // Ensure getDoc is imported
import { db } from '../../firebase';
import Post from '../Posts/Post';
import styles from './Timeline.module.css';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const newPosts = await Promise.all(snapshot.docs.map(async docSnapshot => {
        const postData = docSnapshot.data();
        const userDoc = await getDoc(doc(db, 'users', postData.authorId));
        const userProfile = userDoc.data();
        return {
          id: docSnapshot.id,
          ...postData,
          authorProfilePicture: userProfile?.profilePicture
        };
      }));

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setPosts(prevPosts => {
          const filteredPosts = newPosts.filter(newPost => !prevPosts.some(prevPost => prevPost.id === newPost.id));
          return [...prevPosts, ...filteredPosts];
        });
      } else {
        setLastVisible(null);
      }
    } catch (error) {
      console.error('Error fetching posts: ', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchPosts();
  };

  const handlePostUpdated = (postId, newTitle, newContent, newImageUrl) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, title: newTitle, content: newContent, imageUrl: newImageUrl } : post
      )
    );
  };

  const handleDeletePost = async postId => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post: ', error);
      // Handle error state
    }
  };

  return (
    <div className={styles.timeline}>
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handleDeletePost}
        />
      ))}
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && lastVisible && (
        <button onClick={loadMore} className={styles.loadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Timeline;
















