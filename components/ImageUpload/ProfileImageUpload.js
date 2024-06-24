import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg'; // Utility function to get cropped image
import styles from './ProfileImageUpload.module.css';

const ProfileImageUpload = ({ setImageFile, imagePreview, setImagePreview }) => {
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (file) {
            setLoading(true);
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setImageFile(file);
            setLoading(false);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
            setImagePreview(URL.createObjectURL(croppedImage));
            setImageFile(croppedImage);
        } catch (e) {
            console.error(e);
        }
    }, [croppedAreaPixels, imagePreview, setImageFile, setImagePreview]);

    return (
        <div className={styles.imageUploadContainer}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && (
                <div className={styles.cropContainer}>
                    <Cropper
                        image={imagePreview}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
            )}
            {loading && <p>Loading...</p>}
            <button onClick={showCroppedImage}>Crop Image</button>
        </div>
    );
};

export default ProfileImageUpload;
