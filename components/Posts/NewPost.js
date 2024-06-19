import React, { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '../../firebase'
import ImageUpload from '../ImageUpload/ImageUpload'
import styles from './NewPost.module.css'

const NewPost = () => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [imagePreview, setImagePreview] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        let imageUrl = ''

        if (imageFile) {
            const storageRef = ref(storage, `images/${imageFile.name}`)
            const uploadTask = uploadBytesResumable(storageRef, imageFile)

            await new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        setUploadProgress(progress)
                    },
                    (error) => {
                        console.error('Error uploading image: ', error)
                        reject(error)
                    },
                    async () => {
                        imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
                        resolve()
                    }
                )
            })
        }

        if (auth.currentUser) {
            await addDoc(collection(db, 'posts'), {
                title,
                content,
                imageUrl,
                author: auth.currentUser.displayName,
                authorId: auth.currentUser.uid,
                createdAt: new Date(),
                visibility: 'private', 
                approved: false 
            })
            setTitle('')
            setContent('')
            setImageFile(null)
            setUploadProgress(0)
            setImagePreview('')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create a New Post</h2>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <ImageUpload setImageFile={setImageFile} imagePreview={imagePreview} setImagePreview={setImagePreview} />
            {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
            <button type="submit">Post</button>
        </form>
    )
}

export default NewPost


