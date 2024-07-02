import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, where } from 'firebase/firestore';
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
        where('visibility', '==', 'public'),
        where('approved', '==', true),
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

      if (newPosts.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setPosts(prevPosts => {
          const updatedPosts = newPosts.filter(newPost => !prevPosts.some(prevPost => prevPost.id === newPost.id));
          return [...prevPosts, ...updatedPosts];
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

  const handlePostUpdated = (postId, updatedPost) => {
    setPosts(prevPosts => {
      if (updatedPost.visibility === 'private') {
        return prevPosts.filter(post => post.id !== postId);
      } else {
        return prevPosts.map(post => post.id === postId ? updatedPost : post);
      }
    });
  };

  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const loadMore = () => {
    fetchPosts();
  };

  return (
    <div className={styles.timeline}>
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handlePostDeleted}
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























