import React from 'react';
import styles from './PostListItem.module.css';

const PostListItem = ({ post, handleApprove }) => {
    const { id, title, content, authorData, imageUrl } = post;

    const approvePost = () => {
        handleApprove(id);
    };

    return (
        <li className={styles.postListItem}>
            <h3>{title}</h3>
            <p>{content}</p>
            {imageUrl && <img src={imageUrl} alt="Post Image" className={styles.postImage} />}
            <p>Author: {authorData.username}</p>
            <p>Profile Picture: <img src={authorData.profilePicture} alt="Author Avatar" className={styles.authorAvatar} /></p>
            <button onClick={approvePost}>Approve</button>
        </li>
    );
};

export default PostListItem;


