import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase';
import ProfileImageUpload from '../ImageUpload/ProfileImageUpload';
import styles from './AddPlant.module.css';

const AddPlant = () => {
    const [showForm, setShowForm] = useState(false);
    const [plantName, setPlantName] = useState('');
    const [plantType, setPlantType] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const userId = auth.currentUser.uid;
            let imageUrl = '';

            if (imageFile) {
                imageUrl = await uploadImageAndGetURL(imageFile);
            }

            const plantData = {
                name: plantName,
                type: plantType,
                imageUrl: imageUrl,
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, `users/${userId}/plants`), plantData);
            console.log('Plant added with ID:', docRef.id);

            setPlantName('');
            setPlantType('');
            setImageFile(null);
            setImagePreview('');
            setShowForm(false);

        } catch (error) {
            console.error('Error adding plant:', error);
        }
    };

    const uploadImageAndGetURL = async (imageFile) => {
        try {
            const storageRef = ref(storage, `plantImages/${auth.currentUser.uid}/${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleImageChange = (file) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    return (
        <div className={styles.addPlantContainer}>
            {!showForm ? (
                <div className={styles.initialView}>
                    <h2 className={styles.editButton} onClick={toggleForm}>Make Your Prized Plants Into Internet Stars!</h2>
                </div>
            ) : (
                <form className={styles.plantForm} onSubmit={handleSubmit}>
                    <input
                        className={styles.inputField}
                        type="text"
                        value={plantName}
                        onChange={(e) => setPlantName(e.target.value)}
                        placeholder="Plant Name"
                    />
                    <input
                        className={styles.inputField}
                        type="text"
                        value={plantType}
                        onChange={(e) => setPlantType(e.target.value)}
                        placeholder="Plant Type"
                    />
                    <ProfileImageUpload
                        setImageFile={handleImageChange}
                        imagePreview={imagePreview}
                        setImagePreview={setImagePreview}
                        setCroppedImageFile={() => {}} 
                    />
                    {uploadProgress > 0 && (
                        <p className={styles.uploadProgress}>Upload Progress: {uploadProgress.toFixed(2)}%</p>
                    )}
                    <div className={styles.buttonContainer}>
                        <button className={styles.submitButton} type="submit">Add Plant</button>
                        <button className={styles.cancelButton} type="button" onClick={toggleForm}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddPlant;




















