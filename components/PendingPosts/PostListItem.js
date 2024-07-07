// src/components/PostListItem.js
import React from 'react';
import styles from './PostListItem.module.css';

const PostListItem = ({ post, handleApprove }) => (
    <li key={post.id}>
        {post.plantData ? (
            <div className={styles.plantInfo}>
                <img src={post.plantData.imageUrl} alt={post.plantData.name} className={styles.plantImage} />
                <h3>{post.plantData.name}</h3>
            </div>
        ) : (
            <div className={styles.plantInfo}>
                <h3>Unknown Plant</h3>
            </div>
        )}
        <h3>{post.title}</h3>
        <p>{post.content}</p>
        {post.imageUrl && (
            <img src={post.imageUrl} alt="Post Image" className={styles.postImage} />
        )}
        {!post.approved && (
            <button onClick={() => handleApprove(post.id)}>Approve</button>
        )}
    </li>
);

export default PostListItem;
