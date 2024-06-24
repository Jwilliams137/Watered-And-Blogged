import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg'; // Utility function to get cropped image
import styles from './ProfileImageUpload.module.css';

const ProfileImageUpload = ({ setImageFile, imagePreview, setImagePreview }) => {
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null); // State to hold the cropped image blob
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (file) {
            setLoading(true);
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setImageFile(file);
            setLoading(false);
            setCroppedImage(null); // Reset cropped image state when new image is selected
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imagePreview, croppedAreaPixels);
            setCroppedImage(croppedImageBlob);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    }, [croppedAreaPixels, imagePreview]);

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
            {imagePreview && (
                <>
                    <button type="button" onClick={showCroppedImage} className={styles.cropButton}>
                        Crop Image
                    </button>
                    {croppedImage && (
                        <div className={styles.croppedPreview}>
                            <h3>Cropped Image Preview</h3>
                            <img src={URL.createObjectURL(croppedImage)} alt="Cropped Preview" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileImageUpload;


