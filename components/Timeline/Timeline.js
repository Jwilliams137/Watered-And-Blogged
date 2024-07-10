import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, collectionGroup, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import Post from '../Posts/Post';
import PlantPost from '../Posts/PlantPost';
import styles from './Timeline.module.css';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [lastUserPost, setLastUserPost] = useState(null);
  const [lastPlantPost, setLastPlantPost] = useState(null);
  const fetchLimit = 10;

  useEffect(() => {
    const fetchPosts = () => {
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('visibility', '==', 'public'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(fetchLimit)
      );

      const plantPostsQuery = query(
        collectionGroup(db, 'plantPosts'),
        where('visibility', '==', 'public'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(fetchLimit)
      );

      const unsubscribeUserPosts = onSnapshot(
        userPostsQuery,
        (snapshot) => {
          const userPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          if (snapshot.docs.length > 0) {
            setLastUserPost(snapshot.docs[snapshot.docs.length - 1]);
          }
          updatePosts(userPosts);
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
          if (snapshot.docs.length > 0) {
            setLastPlantPost(snapshot.docs[snapshot.docs.length - 1]);
          }
          updatePosts(plantPosts);
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
    };

    fetchPosts();
  }, []);

  const updatePosts = (newPosts) => {
    setPosts(prevPosts => {
      // Filter out any posts that already exist based on id
      const filteredNewPosts = newPosts.filter(newPost => 
        !prevPosts.some(prevPost => prevPost.id === newPost.id)
      );

      // Merge and sort posts by createdAt in descending order
      const mergedPosts = [...prevPosts, ...filteredNewPosts];
      mergedPosts.sort((a, b) => b.createdAt - a.createdAt);

      return mergedPosts;
    });
    setLoading(false);
  };

  const loadMorePosts = () => {
    if (!lastUserPost && !lastPlantPost) {
      return;
    }

    const userPostsQuery = query(
      collection(db, 'posts'),
      where('visibility', '==', 'public'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(lastUserPost || new Date()),
      limit(fetchLimit)
    );

    const plantPostsQuery = query(
      collectionGroup(db, 'plantPosts'),
      where('visibility', '==', 'public'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(lastPlantPost || new Date()),
      limit(fetchLimit)
    );

    const unsubscribeUserPosts = onSnapshot(
      userPostsQuery,
      (snapshot) => {
        const userPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (snapshot.docs.length > 0) {
          setLastUserPost(snapshot.docs[snapshot.docs.length - 1]);
        }
        updatePosts(userPosts);
      },
      (error) => {
        console.error('Error fetching more user posts:', error);
        setError('Failed to load more user posts.');
      }
    );

    const unsubscribePlantPosts = onSnapshot(
      plantPostsQuery,
      (snapshot) => {
        const plantPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (snapshot.docs.length > 0) {
          setLastPlantPost(snapshot.docs[snapshot.docs.length - 1]);
        }
        updatePosts(plantPosts);
      },
      (error) => {
        console.error('Error fetching more plant posts:', error);
        setError('Failed to load more plant posts.');
      }
    );
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
        <button onClick={() => {
          setDisplayCount(prevCount => prevCount + 10);
          loadMorePosts();
        }} className={styles.loadMoreButton}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Timeline;
