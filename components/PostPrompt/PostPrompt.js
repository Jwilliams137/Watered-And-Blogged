import React, { useRef } from 'react';
import styles from './PostPrompt.module.css';

const PostPrompt = ({ onClick, onFileChange }) => {
    const fileInputRef = useRef(null);

    const handleImageUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileChange(file);
        }
    };

    return (
        <div className={styles.postPrompt}>
            <div onClick={onClick} className={styles.inputContainer}>
                <input placeholder='Whats happening in your garden?' className={styles.input}></input>
            </div>
            <img 
                src="/imageupload.svg" 
                alt="Upload Image" 
                className={styles.uploadIcon} 
                onClick={handleImageUploadClick} 
            />
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange}
            />
        </div>
    );
};

export default PostPrompt;
