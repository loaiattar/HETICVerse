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
        <div>
            <form>
                <ul>
                    <div>
                        <input
                            type="text"
                            id="title"
                            placeholder="Title"
                            className="mt-1 mb-6 block w-full border border-[#C7C7C7] rounded-xl py-4 px-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

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
                    </div>

                    <div className="flex justify-end w-full mt-5">
                        <button
                            type="submit"
                            className="bg-[#105BCA] hover:bg-[#1B489D] text-white font-semibold px-4 py-2 rounded-full cursor-pointer"
                        >
                            Post
                        </button>
                    </div>
                </ul>
            </form>
        </div>
    )
}