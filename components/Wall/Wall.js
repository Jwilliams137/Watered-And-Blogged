import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, onSnapshot, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Post from '../Posts/Post';
import NewPost from '../Posts/NewPost';
import styles from './Wall.module.css';

const Wall = () => {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const postData = docSnapshot.data();
        const userDoc = await getDoc(doc(db, 'users', postData.authorId));
        const userProfile = userDoc.data();
        return { id: docSnapshot.id, ...postData, authorProfilePicture: userProfile?.profilePicture };
      }));
      setPosts((prevPosts) => {
        const postIds = new Set(prevPosts.map(post => post.id));
        const filteredPosts = newPosts.filter(post => !postIds.has(post.id));
        return [...filteredPosts, ...prevPosts];
      });
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
      const q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));

      onSnapshot(q, async (snapshot) => {
        const newPosts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const postData = docSnapshot.data();
          const userDoc = await getDoc(doc(db, 'users', postData.authorId));
          const userProfile = userDoc.data();
          return { id: docSnapshot.id, ...postData, authorProfilePicture: userProfile?.profilePicture };
        }));
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setPosts((prevPosts) => {
            const postIds = new Set(prevPosts.map(post => post.id));
            const filteredPosts = newPosts.filter(post => !postIds.has(post.id));
            return [...prevPosts, ...filteredPosts];
          });
        }
        setLoading(false);
      });
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => {
      const postIds = new Set(prevPosts.map(post => post.id));
      if (!postIds.has(newPost.id)) {
        return [newPost, ...prevPosts];
      }
      return prevPosts;
    });
  };

  const handlePostUpdated = (postId, newTitle, newContent) => {
    setPosts((prevPosts) => prevPosts.map(post =>
      post.id === postId ? { ...post, title: newTitle, content: newContent } : post
    ));
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post: ', error);
    }
  };

  return (
    <div className={styles.wall}>
      <NewPost onPostCreated={handlePostCreated} />
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
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

export default Wall;










