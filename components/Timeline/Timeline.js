import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, collectionGroup } from 'firebase/firestore'; // Corrected imports
import { db } from '../../firebase';
import Post from '../Posts/Post';
import PlantPost from '../Posts/PlantPost';
import styles from './Timeline.module.css';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userPostsQuery = query(
      collection(db, 'posts'),
      where('visibility', '==', 'public'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const plantPostsQuery = query(
      collectionGroup(db, 'plantPosts'),
      where('visibility', '==', 'public'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUserPosts = onSnapshot(
      userPostsQuery,
      (snapshot) => {
        const userPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(prevPosts => [...userPosts, ...prevPosts.filter(post => !userPosts.some(p => p.id === post.id))]);
      },
      (error) => {
        console.error('Error fetching user posts:', error);
        setError('Failed to load user posts.');
      }
    );

    const unsubscribePlantPosts = onSnapshot(
      plantPostsQuery,
      (snapshot) => {
        const plantPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(prevPosts => [...plantPosts, ...prevPosts.filter(post => !plantPosts.some(p => p.id === post.id))]);
      },
      (error) => {
        console.error('Error fetching plant posts:', error);
        setError('Failed to load plant posts.');
      }
    );

    return () => {
      unsubscribeUserPosts();
      unsubscribePlantPosts();
    };
  }, []);

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

  return (
    <div className={styles.timeline}>
      {posts.map(post => post.plantId ? (
        <PlantPost
          key={post.id}
          post={post}
          plantId={post.plantId}
          userId={post.userId}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handlePostDeleted}
        />
      ) : (
        <Post
          key={post.id}
          post={post}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handlePostDeleted}
        />
      ))}
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Timeline;
