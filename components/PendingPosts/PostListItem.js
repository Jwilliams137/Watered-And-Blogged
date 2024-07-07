import React from 'react';
import styles from './PostListItem.module.css';

const PostListItem = ({ post, handleApprove }) => {
    const { id, title, content, authorData, imageUrl } = post;

    const approvePost = () => {
        handleApprove(id, authorData.authorId || post.authorId); // Ensuring authorId is passed correctly
    };

    return (
        <li className={styles.postListItem}>
            <h3>{title}</h3>
            <p>{content}</p>
            {imageUrl && <img src={imageUrl} alt="Post Image" className={styles.postImage} />}
            <div className={styles.authorDetails}>
                <p>Author: {authorData.username}</p>
                <img src={authorData.profilePicture} alt="Author Avatar" className={styles.authorAvatar} />
            </div>
            <button className={styles.approveButton} onClick={approvePost}>Approve</button>
        </li>
    );
};

export default PostListItem;
