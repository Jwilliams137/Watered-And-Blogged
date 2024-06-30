import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as needed
import Post from '../Posts/Post';
import styles from './Wall.module.css';
import { useParams } from 'next/navigation'; // Import useParams

const PublicWall = () => {
  const { id: userId } = useParams(); // Get the dynamic user ID from the URL
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const postData = docSnapshot.data();
          const userDoc = await getDoc(doc(db, 'users', postData.authorId));
          const userProfile = userDoc.data();
          return { id: docSnapshot.id, ...postData, authorProfilePicture: userProfile?.profilePicture };
        }));
        setPosts(newPosts);
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  const loadMore = () => {
    if (!loading && lastVisible && userId) {
      setLoading(true);
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );

      onSnapshot(q, async (snapshot) => {
        const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const postData = docSnapshot.data();
          const userDoc = await getDoc(doc(db, 'users', postData.authorId));
          const userProfile = userDoc.data();
          return { id: docSnapshot.id, ...postData, authorProfilePicture: userProfile?.profilePicture };
        }));
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }
        setLoading(false);
      });
    }
  };

  return (
    <div className={styles.wall}>
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
      {loading && <p>Loading...</p>}
      {lastVisible && (
        <button onClick={loadMore} disabled={loading}>Load More</button>
      )}
    </div>
  );
};

export default PublicWall;
