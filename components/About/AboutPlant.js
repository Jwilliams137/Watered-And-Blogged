import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import ProfileImageUpload from '../ImageUpload/ProfileImageUpload';
import styles from './AboutPlant.module.css'; // Import CSS module

const AboutPlant = ({ plantId }) => {
    const [plantName, setPlantName] = useState('');
    const [plantProfilePictureUrl, setPlantProfilePictureUrl] = useState('');
    const [plantProfilePictureFile, setPlantProfilePictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [croppedImageFile, setCroppedImageFile] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchPlantData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const docRef = doc(db, 'users', user.uid, 'plants', plantId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPlantName(data.name || '');
                    setPlantProfilePictureUrl(data.profilePicture || '/avatar.png'); 
                }
            } catch (error) {
                console.error('Error fetching plant data:', error);
            }
        };

        fetchPlantData();
    }, [plantId]);

    const handleFileChange = (file) => {
        setPlantProfilePictureFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        let imageUrl = plantProfilePictureUrl;
        const fileToUpload = croppedImageFile || plantProfilePictureFile;

        if (fileToUpload) {
            const storageRef = ref(storage, `plantProfilePictures/${plantId}/${fileToUpload.name}`);
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
            const user = auth.currentUser;
            if (!user) return;

            const plantRef = doc(db, 'users', user.uid, 'plants', plantId);
            await setDoc(plantRef, { name: plantName, profilePicture: imageUrl }, { merge: true });
            setPlantProfilePictureUrl(imageUrl);
            setPlantProfilePictureFile(null);
            setImagePreview('');
            setCroppedImageFile(null);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating plant profile:', error);
        }
    };

    return (
        <div className={styles.aboutPlantContainer}>
            {!editMode ? (
                <div className={styles.viewMode}>
                    <div className={styles.profilePictureContainer}>
                        <img
                            src={plantProfilePictureUrl}
                            alt="Plant Profile Picture"
                            className={styles.profilePicture}
                        />
                    </div>
                    <div className={styles.aboutText}>
                        <h2>{plantName}</h2>
                        <button onClick={() => setEditMode(true)} className={styles.editButton}>
                            Edit
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={styles.editMode}>
                    <div className={styles.profilePictureContainer}>
                        <img
                            src={plantProfilePictureUrl}
                            alt="Plant Profile Picture"
                            className={styles.profilePicture}
                        />
                    </div>
                    <ProfileImageUpload
                        setImageFile={handleFileChange}
                        imagePreview={imagePreview}
                        setImagePreview={setImagePreview}
                        setCroppedImageFile={setCroppedImageFile}
                    />
                    <input
                        type="text"
                        value={plantName}
                        onChange={(e) => setPlantName(e.target.value)}
                        placeholder="Enter plant name"
                        className={styles.input}
                    />
                    {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.saveButton}>
                            Save
                        </button>
                        <button type="button" onClick={() => setEditMode(false)} className={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AboutPlant;


