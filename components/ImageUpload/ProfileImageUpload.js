import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/getCroppedImg';
import styles from './ProfileImageUpload.module.css';

const ProfileImageUpload = ({ setImageFile, imagePreview, setImagePreview, setCroppedImageFile }) => {
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (file) {
            setLoading(true);
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setImageFile(file);
            setLoading(false);
            setCroppedImage(null);
            setCroppedImageFile(null); // Reset the cropped image file state
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imagePreview, croppedAreaPixels);
            setCroppedImage(croppedImageBlob);
            setCroppedImageFile(croppedImageBlob); // Pass the cropped image blob to the parent component
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    }, [croppedAreaPixels, imagePreview, setCroppedImageFile]);

    const calculatePreviewSize = () => {
        const previewSize = Math.min(200, Math.max(croppedAreaPixels.width, croppedAreaPixels.height));
        return {
            width: previewSize,
            height: previewSize,
        };
    };

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
                <div className={styles.controlsContainer}>
                    <button type="button" onClick={showCroppedImage} className={styles.cropButton}>
                        Crop Image
                    </button>
                </div>
            )}
            {croppedImage && (
                <div className={styles.croppedPreview}>
                    <h3>Cropped Image Preview</h3>
                    <img
                        src={URL.createObjectURL(croppedImage)}
                        alt="Cropped Preview"
                        style={{
                            width: calculatePreviewSize().width,
                            height: calculatePreviewSize().height,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ProfileImageUpload;




