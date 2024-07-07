import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, where, collectionGroup } from 'firebase/firestore'; // Ensure collectionGroup is imported
import { db } from '../../firebase';
import Post from '../Posts/Post';
import PlantPost from '../Posts/PlantPost'; // Import the PlantPost component
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
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('visibility', '==', 'public'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const plantPostsQuery = query(
        collectionGroup(db, 'plantPosts'),
        where('visibility', '==', 'public'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const [userPostsSnapshot, plantPostsSnapshot] = await Promise.all([
        getDocs(userPostsQuery),
        getDocs(plantPostsQuery)
      ]);

      const userPosts = await Promise.all(userPostsSnapshot.docs.map(async docSnapshot => {
        const postData = docSnapshot.data();
        const userDoc = await getDoc(doc(db, 'users', postData.authorId));
        const userProfile = userDoc.data();
        return {
          id: docSnapshot.id,
          ...postData,
          authorProfilePicture: userProfile?.profilePicture
        };
      }));

      const plantPosts = await Promise.all(plantPostsSnapshot.docs.map(async docSnapshot => {
        const postData = docSnapshot.data();
        const userDoc = await getDoc(doc(db, `users/${postData.userId}`));
        const userProfile = userDoc.data();
        return {
          id: docSnapshot.id,
          ...postData,
          authorProfilePicture: userProfile?.profilePicture
        };
      }));

      const allPosts = [...userPosts, ...plantPosts].sort((a, b) => b.createdAt - a.createdAt);

      if (allPosts.length > 0) {
        setLastVisible({
          userPostsLastVisible: userPostsSnapshot.docs[userPostsSnapshot.docs.length - 1],
          plantPostsLastVisible: plantPostsSnapshot.docs[plantPostsSnapshot.docs.length - 1]
        });
        setPosts(prevPosts => {
          const updatedPosts = allPosts.filter(newPost => !prevPosts.some(prevPost => prevPost.id === newPost.id));
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
      {!loading && lastVisible && (
        <button onClick={loadMore} className={styles.loadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Timeline;















