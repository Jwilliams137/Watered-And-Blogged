import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, collectionGroup } from 'firebase/firestore'; // Import getDocs from firebase/firestore
import { db } from '../../firebase';
import Post from '../Posts/Post';
import PlantPost from '../Posts/PlantPost';
import styles from './Timeline.module.css';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
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

        const [userPostsSnapshot, plantPostsSnapshot] = await Promise.all([
          getDocs(userPostsQuery),
          getDocs(plantPostsQuery)
        ]);

        const userPosts = userPostsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'user' // Add a type field to distinguish user posts
        }));

        const plantPosts = plantPostsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'plant' // Add a type field to distinguish plant posts
        }));

        // Combine and sort posts
        const combinedPosts = [...userPosts, ...plantPosts].sort((a, b) => b.createdAt - a.createdAt);

        setPosts(combinedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts.');
      }
    };

    fetchPosts();
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
      {posts.map(post => post.type === 'plant' ? (
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
