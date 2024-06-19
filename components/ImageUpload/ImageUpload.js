import React from 'react'
import imageCompression from 'browser-image-compression'
import styles from './ImageUpload.module.css'

const ImageUpload = ({ setImageFile, imagePreview, setImagePreview }) => {

    const handleFileChange = async (e) => {
        const file = e.target.files[0]

        setImagePreview(URL.createObjectURL(file))

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
            useWebWorker: true
        }

        try {
            const compressedFile = await imageCompression(file, options)
            setImageFile(compressedFile)
        } catch (error) {
            console.error('Error compressing image: ', error)
        }
    }

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />}
        </div>
    )
}

export default ImageUpload


