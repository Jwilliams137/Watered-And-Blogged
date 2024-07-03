import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import ProfileImageUpload from '../ImageUpload/ProfileImageUpload';
import styles from './About.module.css';

const About = () => {
    const [aboutMe, setAboutMe] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [username, setUsername] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [croppedImageFile, setCroppedImageFile] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const docRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAboutMe(data.aboutMe || '');
                    setProfilePictureUrl(data.profilePicture || '/avatar.png');
                    setUsername(data.username || auth.currentUser.displayName); // Default to Google display name
                }
            }
        };

        fetchUserData();
    }, []);

    const handleFileChange = (file) => {
        setProfilePictureFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        let imageUrl = profilePictureUrl;
        const fileToUpload = croppedImageFile || profilePictureFile;

        if (fileToUpload) {
            const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${fileToUpload.name}`);
            const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

            try {
                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error('Error uploading image:', error);
                            reject(error);
                        },
                        async () => {
                            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            } catch (error) {
                console.error('Error uploading image:', error);
                return;
            }
        }

        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, { aboutMe, profilePicture: imageUrl, username }, { merge: true });
            setProfilePictureUrl(imageUrl);
            setProfilePictureFile(null);
            setImagePreview('');
            setCroppedImageFile(null);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating About Me:', error);
        }
    };

    return (
        <div>
            {!editMode ? (
                <div>
                    {profilePictureUrl ? (
                        <div className={styles.profilePictureContainer}>
                            <img
                                src={profilePictureUrl}
                                alt="Profile Picture"
                                className={styles.profilePicture}
                            />
                        </div>
                    ) : (
                        <div className={styles.profilePictureContainer}>
                            <img
                                src="/avatar.png"
                                alt="Default Avatar"
                                className={styles.profilePicture}
                            />
                        </div>
                    )}
                    <p>{aboutMe || 'Tell us about yourself'}</p>
                    <p>Username: {username}</p>
                    <button onClick={() => setEditMode(true)}>Edit</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={aboutMe}
                        onChange={(e) => setAboutMe(e.target.value)}
                        placeholder="Tell us about yourself"
                    />
                    <ProfileImageUpload
                        setImageFile={handleFileChange}
                        imagePreview={imagePreview}
                        setImagePreview={setImagePreview}
                        setCroppedImageFile={setCroppedImageFile}
                    />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                    />
                    {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default About;









