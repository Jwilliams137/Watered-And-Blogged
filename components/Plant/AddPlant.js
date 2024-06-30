import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase';
import ProfileImageUpload from '../ImageUpload/ProfileImageUpload';

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
            setShowForm(false); // Hide form after successful addition

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
        <div>
            {!showForm ? (
                <div>
                    <p>Add your plant profile here</p>
                    <button onClick={toggleForm}>Edit</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={plantName}
                        onChange={(e) => setPlantName(e.target.value)}
                        placeholder="Plant Name"
                    />
                    <input
                        type="text"
                        value={plantType}
                        onChange={(e) => setPlantType(e.target.value)}
                        placeholder="Plant Type"
                    />
                    <ProfileImageUpload
                        setImageFile={handleImageChange}
                        imagePreview={imagePreview}
                        setImagePreview={setImagePreview}
                        setCroppedImageFile={() => {}} // No need to set cropped image file for this form
                    />
                    {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
                    <button type="submit">Add Plant</button>
                    <button type="button" onClick={toggleForm}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default AddPlant;



















