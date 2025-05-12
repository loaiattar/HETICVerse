import React, { useState } from 'react'

export default function UploadMedia() {
    const [file, setFile] = useState(null)

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        const droppedFile = event.dataTransfer.files[0]
        if (droppedFile) {
            setFile(droppedFile)
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault()
    }

    const handleUpload = () => {
        if (file) {
            // Logique pour envoyer le fichier au serveur
            console.log('Fichier à envoyer:', file)
            // Vous pouvez utiliser axios ou fetch pour envoyer le fichier
        }
    }

    return (
            <div
                className="flex flex-col items-center justify-center w-2xl h-36 p-4 border border-dashed border-[#C7C7C7] rounded-lg"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {file ? (
                    <p className="text-center text-gray-700">{file.name}</p>
                ) : (
                    <p className="text-center text-gray-400">Glissez-déposez un fichier ici ou cliquez pour télécharger</p>
                )}
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*" // Accepter les images et vidéos
                />
            </div>
    )
}