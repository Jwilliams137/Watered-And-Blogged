import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import ImageUpload from '../ImageUpload/ImageUpload';
import styles from './NewPost.module.css';

const NewPost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [visibility, setVisibility] = useState('private'); // Added state for visibility

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
                setVisibility('private'); // Reset visibility to default
            } catch (error) {
                console.error('Error creating post: ', error);
            }
        }
    };

    return (
        <form className={styles.new_post} onSubmit={handleSubmit}>
            <div className={styles.fields}>
                <textarea
                    placeholder="What's happening in your garden?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={styles.contentTextarea}
                ></textarea>
                <div className={styles.contentRow}>
                    <ImageUpload setImageFile={setImageFile} imagePreview={imagePreview} setImagePreview={setImagePreview} />
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
                </div>
                {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
            </div>
        </form>
    );
};

export default NewPost;









