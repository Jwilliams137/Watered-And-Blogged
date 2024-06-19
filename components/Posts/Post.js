import React, { useState } from 'react'
import { updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import styles from './Post.module.css'

const Post = ({ post, onPostUpdated, onDeletePost }) => {
  const [editing, setEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(post.title)
  const [newContent, setNewContent] = useState(post.content)

  const currentUser = auth.currentUser

  const handleEdit = async () => {
    try {
      const postRef = doc(db, 'posts', post.id)
      await updateDoc(postRef, {
        title: newTitle,
        content: newContent,
        updatedAt: new Date()
      })
      onPostUpdated()
      setEditing(false)
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'posts', post.id))
      onDeletePost(post.id)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <div className="post">
      {editing ? (
        <div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          ></textarea>
          <button onClick={handleEdit}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {post.imageUrl && <img src={post.imageUrl} alt="Posted" style={{ maxWidth: '100%' }} />}
          <small>Posted by: {post.author}</small>
          {currentUser && post.authorId === currentUser.uid && (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Post





