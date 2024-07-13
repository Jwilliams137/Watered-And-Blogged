import React from 'react';
import imageCompression from 'browser-image-compression';
import styles from './ImageUpload.module.css';

const ImageUpload = ({ setImageFile, imagePreview, setImagePreview, fileInputRef }) => {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });
                setImageFile(compressedFile);
                const imageUrl = URL.createObjectURL(compressedFile);
                setImagePreview(imageUrl);
            } catch (error) {
                console.error('Error compressing image: ', error);
            }
        }
    };

    return (
        <div className={styles.imageUploadContainer}>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            {imagePreview && (
                <div className={styles.previewContainer}>
                    <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
