import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import ImageUpload from '../ImageUpload/ImageUpload';
import styles from './NewPost.module.css';

const NewPost = ({ onPostCreated, onCancel, initialFile }) => {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [visibility, setVisibility] = useState('private');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialFile) {
            const imageUrl = URL.createObjectURL(initialFile);
            setImagePreview(imageUrl);
            setImageFile(initialFile);
        }
    }, [initialFile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = '';

        if (imageFile) {
            const storageRef = ref(storage, `images/${imageFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, imageFile);

            try {
                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error('Error uploading image: ', error);
                            reject(error);
                        },
                        async () => {
                            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            } catch (error) {
                console.error('Error uploading image: ', error);
                return;
            }
        }

        if (auth.currentUser) {
            const newPost = {
                content,
                imageUrl,
                author: auth.currentUser.displayName,
                authorId: auth.currentUser.uid,
                createdAt: new Date(),
                visibility,
                approved: false,
            };

            try {
                const docRef = await addDoc(collection(db, 'posts'), newPost);
                onPostCreated({ id: docRef.id, ...newPost });
                setContent('');
                setImageFile(null);
                setUploadProgress(0);
                setImagePreview('');
                setVisibility('private');
            } catch (error) {
                console.error('Error creating post: ', error);
            }
        }
    };

    const handleTextareaChange = (e) => {
        setContent(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <form className={styles.new_post} onSubmit={handleSubmit}>
            <textarea
                placeholder="What's happening in your garden?"
                value={content}
                onChange={handleTextareaChange}
                className={styles.contentTextarea}
                rows="1"
            ></textarea>
            <ImageUpload
                setImageFile={setImageFile}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                fileInputRef={fileInputRef}
            />

            <div className={styles.optionsRow}>
                <div className={styles.upload}>
                    <img
                        src="/imageupload.svg"
                        alt="Upload Image"
                        className={styles.uploadIcon}
                        onClick={() => fileInputRef.current.click()}
                    />
                </div>
                <div className={styles.optionsRight}>
                    <div className={styles.visibility}>
                        <label>
                            <input
                                type="radio"
                                value="public"
                                checked={visibility === 'public'}
                                onChange={() => setVisibility('public')}
                            />
                            Public
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="private"
                                checked={visibility === 'private'}
                                onChange={() => setVisibility('private')}
                            />
                            Private
                        </label>
                    </div>
                    <button type="submit" className={styles.button}>Post</button>
                    <button type="button" onClick={onCancel} className={styles.button}>Cancel</button>
                </div>
            </div>
            {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
        </form>
    );
};

export default NewPost;
