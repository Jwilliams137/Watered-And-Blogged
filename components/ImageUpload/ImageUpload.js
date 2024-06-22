import React, { useState } from 'react';
import NextImage from 'next/image';
import imageCompression from 'browser-image-compression';
import styles from './ImageUpload.module.css';

const ImageUpload = ({ setImageFile, imagePreview, setImagePreview }) => {
    const [loading, setLoading] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (file) {
            setLoading(true);

            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);

            const img = new window.Image();
            img.src = imageUrl;
            img.onload = () => {
                setDimensions({ width: img.width, height: img.height });
            };

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
            {imagePreview && dimensions.width && dimensions.height && (
                <div className={styles.imagePreview}>
                    <NextImage
                        src={imagePreview}
                        alt="Preview"
                        layout="responsive"
                        width={dimensions.width}
                        height={dimensions.height}
                        className={styles.image}
                    />
                </div>
            )}
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default ImageUpload;



