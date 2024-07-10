import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db } from '../../firebase';
import Post from '../Posts/Post';
import PlantPost from '../Posts/PlantPost';
import styles from './Timeline.module.css';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10); // Initial display count

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
        updatePosts([...userPosts]);
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
        updatePosts([...plantPosts]);
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

  const updatePosts = (newPosts) => {
    setPosts(prevPosts => {
      // Merge and sort posts by createdAt in descending order
      const mergedPosts = [...prevPosts, ...newPosts];
      mergedPosts.sort((a, b) => b.createdAt - a.createdAt);
      return mergedPosts;
    });
    setLoading(false);
  };

  const loadMorePosts = () => {
    setDisplayCount(prevCount => prevCount + 10); // Increase display count by 10
  };

  return (
    <div className={styles.timeline}>
      {posts.slice(0, displayCount).map(post => post.plantId ? (
        <PlantPost
          key={post.id}
          post={post}
          plantId={post.plantId}
          userId={post.userId}
        />
      ) : (
        <Post
          key={post.id}
          post={post}
        />
      ))}
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {posts.length > displayCount && (
        <button onClick={loadMorePosts} className={styles.loadMoreButton}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Timeline;