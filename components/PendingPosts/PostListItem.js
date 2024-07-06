// src/components/PostListItem.js
'use client';
import React from 'react';
import styles from './PostListItem.module.css';

const PostListItem = ({ post, collectionPath, handleApprove }) => (
    <li key={post.id}>
        <h3>{post.title || post.plantName}</h3>
        <p>{post.content}</p>
        {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title ? "Post Image" : "Plant Image"} className={styles.postImage} />
        )}
        {!post.approved && (
            <button onClick={() => handleApprove(post.id, collectionPath)}>Approve</button>
        )}
    </li>
);

export default PostListItem;

