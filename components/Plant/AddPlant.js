import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase';
import ProfileImageUpload from '../ImageUpload/ProfileImageUpload';

const AddPlant = () => {
    const [plantName, setPlantName] = useState('');
    const [plantType, setPlantType] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCroppedImagePreview, setShowCroppedImagePreview] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const userId = auth.currentUser.uid;
            let imageUrl = '';

            // Upload image if imageFile is present
            if (imageFile) {
                imageUrl = await uploadImageAndGetURL(imageFile);
            }

            // Prepare plant data with image URL
            const plantData = {
                name: plantName,
                type: plantType,
                imageUrl: imageUrl,
                createdAt: new Date(),
            };

            // Add plantData to Firestore
            const docRef = await addDoc(collection(db, `users/${userId}/plants`), plantData);
            console.log('Plant added with ID:', docRef.id);

            // Clear form fields and states after successful addition
            setPlantName('');
            setPlantType('');
            setImageFile(null);
            setImagePreview('');
            setShowCroppedImagePreview(false); // Reset to hide cropped image preview after adding plant

        } catch (error) {
            console.error('Error adding plant:', error);
        }
    };

    // Function to upload image and get download URL
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
        setShowCroppedImagePreview(true); // Show cropped image preview when image file is set
    };

    return (
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
            {showCroppedImagePreview && (
                <div className="cropped-image-preview">
                    <img
                        src={imagePreview}
                        alt="Cropped Preview"
                        style={{ width: '100px', height: '100px' }}
                    />
                </div>
            )}
            {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
            <button type="submit">Add Plant</button>
        </form>
    );
};

export default AddPlant;









