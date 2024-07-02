import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, onSnapshot, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
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

  const handlePostUpdated = async (postId, newTitle, newContent, newImageUrl, newVisibility) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        title: newTitle,
        content: newContent,
        imageUrl: newImageUrl,
        visibility: newVisibility,
        updatedAt: new Date(),
      });
      setPosts((prevPosts) =>
        prevPosts.map(post => (post.id === postId ? { ...post, title: newTitle, content: newContent, imageUrl: newImageUrl, visibility: newVisibility } : post))
      );
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
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













