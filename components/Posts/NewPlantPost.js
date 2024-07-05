import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import ImageUpload from '../ImageUpload/ImageUpload';
import styles from './NewPlantPost.module.css';

const NewPlantPost = ({ onPostCreated, plantId }) => {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

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
                setIsSubmitting(false);
                return;
            }
        }

        const newPost = {
            content,
            imageUrl,
            authorId: auth.currentUser.uid,
            createdAt: new Date(),
            visibility,
            approved: false,
        };

        try {
            const docRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/plants/${plantId}/plantPosts`), newPost);
            onPostCreated({ id: docRef.id, ...newPost });

            // Reset form state after successful submission
            setContent('');
            setImageFile(null);
            setUploadProgress(0);
            setImagePreview('');
            setVisibility('private');
        } catch (error) {
            console.error('Error creating plant post: ', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTextareaChange = (e) => {
        setContent(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <form className={styles.newPlantPost} onSubmit={handleSubmit}>
            <textarea
                placeholder="What's happening with your plant?"
                value={content}
                onChange={handleTextareaChange}
                className={`${styles.contentTextarea} ${styles.autoExpand}`}
                rows="1"
            ></textarea>
            <div className={styles.upload}>
                <ImageUpload setImageFile={setImageFile} setImagePreview={setImagePreview} />
                {imagePreview && (
                    <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                )}
            </div>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="private">Private</option>
                <option value="public">Public</option>
            </select>
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Post'}
            </button>
            {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
        </form>
    );
};

export default NewPlantPost;


