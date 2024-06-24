import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import styles from './ImageUpload.module.css';

const ImageUpload = ({ setImageFile, imagePreview, setImagePreview }) => {
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (file) {
            setLoading(true);

            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);

            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            try {
                const compressedFile = await imageCompression(file, options);
                setImageFile(compressedFile);
            } catch (error) {
                console.error('Error compressing image: ', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.imageUploadContainer}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && (
                <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                </div>
            )}
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default ImageUpload;






