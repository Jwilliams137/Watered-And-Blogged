import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, onSnapshot, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import PlantPost from '../Posts/PlantPost';
import NewPost from '../Posts/NewPost';
import styles from './PlantWall.module.css';

const PlantWall = () => {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const q = query(collection(db, 'plantPosts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const postData = docSnapshot.data();
        // Replace with logic to fetch plant details
        const plantDoc = await getDoc(doc(db, 'plants', postData.plantId));
        const plantData = plantDoc.data();
        return { id: docSnapshot.id, ...postData, plantName: plantData?.name, plantProfilePicture: plantData?.profilePicture };
      }));
      setPosts(newPosts);
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadMore = () => {
    if (!loading && lastVisible) {
      setLoading(true);
      const userId = auth.currentUser.uid;
      const q = query(collection(db, 'plantPosts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));

      onSnapshot(q, async (snapshot) => {
        const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const postData = docSnapshot.data();
          // Replace with logic to fetch plant details
          const plantDoc = await getDoc(doc(db, 'plants', postData.plantId));
          const plantData = plantDoc.data();
          return { id: docSnapshot.id, ...postData, plantName: plantData?.name, plantProfilePicture: plantData?.profilePicture };
        }));
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }
        setLoading(false);
      });
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => {
      const exists = prevPosts.find(post => post.id === newPost.id);
      if (exists) {
        return prevPosts;
      }
      return [newPost, ...prevPosts];
    });
  };

  const handlePostUpdated = async (postId, newContent, newVisibility) => {
    try {
      await updateDoc(doc(db, 'plantPosts', postId), {
        content: newContent,
        visibility: newVisibility,
        updatedAt: new Date(),
      });
      setPosts((prevPosts) =>
        prevPosts.map(post => (post.id === postId ? { ...post, content: newContent, visibility: newVisibility } : post))
      );
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'plantPosts', postId));
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className={styles.plantWall}>
      <NewPost onPostCreated={handlePostCreated} />
      {posts.map(post => (
        <PlantPost
          key={post.id}
          post={post}
          plantName={post.plantName}
          plantProfilePicture={post.plantProfilePicture}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handleDeletePost}
        />
      ))}
      {loading && <p>Loading...</p>}
      {lastVisible && (
        <button onClick={loadMore} disabled={loading}>Load More</button>
      )}
    </div>
  );
};

export default PlantWall;
