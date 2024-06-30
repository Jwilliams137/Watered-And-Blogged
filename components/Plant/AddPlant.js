import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import ProfileImageUpload from '../ImageUpload/ProfileImageUpload';
import { storage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddPlant = () => {
    const [plantName, setPlantName] = useState('');
    const [plantType, setPlantType] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [croppedImageFile, setCroppedImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const userId = auth.currentUser.uid;

            // Upload cropped image and get URL
            if (croppedImageFile) {
                const imageUrl = await uploadImageAndGetURL(croppedImageFile);
                setImageUrl(imageUrl); // Set the imageUrl state with the URL obtained from upload
            }

            const plantData = {
                name: plantName,
                type: plantType,
                ownerId: userId,
                createdAt: new Date(),
                imageUrl: imageUrl, // Include the imageUrl in plantData
            };

            // Add plantData to Firestore
            const docRef = await addDoc(collection(db, `users/${userId}/plants`), plantData);
            console.log('Plant added with ID: ', docRef.id);

            // Clear form fields and states after successful addition
            setPlantName('');
            setPlantType('');
            setImageFile(null);
            setCroppedImageFile(null);
            setImageUrl(''); // Reset imageUrl state
        } catch (error) {
            console.error('Error adding plant: ', error);
        }
    };

    // Function to upload image and get download URL
    const uploadImageAndGetURL = async (imageFile) => {
        try {
            const storageRef = ref(storage, `images/${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            return ''; // Handle error case
        }
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
                setImageFile={setImageFile}
                imagePreview={imageFile ? URL.createObjectURL(imageFile) : ''}
                setImagePreview={() => {}}
                setCroppedImageFile={setCroppedImageFile}
            />
            <button type="submit">Add Plant</button>
        </form>
    );
};

export default AddPlant;





