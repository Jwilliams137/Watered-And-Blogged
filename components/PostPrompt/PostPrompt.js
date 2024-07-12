import React from 'react';
import styles from './PostPrompt.module.css'; // Adjust the path as necessary

const PostPrompt = ({ onClick }) => {
  return (
    <div className={styles.postPrompt} onClick={onClick}>
      <p>Click here to create a new post...</p>
    </div>
  );
};

export default PostPrompt;
