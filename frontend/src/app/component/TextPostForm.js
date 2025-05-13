import { useState, useEffect } from 'react';
import axios from 'axios';
import SelectCommunityButton from './SelectCommunityButton';

export default function PostTextForm({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content1, setContent1] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!selectedCommunity) {
      setError("Veuillez sélectionner une communauté.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      console.log('Communauté sélectionnée:', selectedCommunity);
      
      const postData = {
        data: {
          title: title.trim(),
          content: content1,
          type: 'text',
          communityId: selectedCommunity.id,
          publishedAt: new Date().toISOString()
        }
      };
      
      console.log('Données envoyées:', JSON.stringify(postData, null, 2));
      
      try {
        const response = await axios.post('http://localhost:1337/api/posts', postData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Réponse du serveur:', response.data);
      } catch (err) {
        console.error('Erreur complète:', err);
        if (err.response) {
          console.error('Réponse du serveur:', JSON.stringify(err.response.data, null, 2));
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
          if (err.response.data.error) {
            console.error('Détails de l\'erreur:', JSON.stringify(err.response.data.error, null, 2));
          }
          setError(err.response.data.error?.message || "Erreur lors de la création du post.");
        } else {
          console.error('Erreur sans réponse:', err);
          setError("Erreur lors de la création du post.");
        }
      }

      setSuccess('Post créé avec succès !');
      setTitle('');
      setContent1('');
      setSelectedCommunity(null);
      if (onPostCreated) onPostCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-2xl">
        <SelectCommunityButton 
          onSelect={(community) => setSelectedCommunity(community)}
          selectedCommunity={selectedCommunity}
        />
        <div>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="mt-1 mb-6 block w-full border border-[#C7C7C7] rounded-xl py-4 px-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>

        <div>
          <textarea
            id="content"
            value={content1}
            placeholder='Body text'
            onChange={(e) => setContent1(e.target.value)}
            maxLength={300}
            className="mt-1 block w-full border border-[#C7C7C7] rounded-xl py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-32"
          />
          <p className="text-right text-sm text-gray-500">
            {content1.length}/300
          </p>
        </div>

        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex justify-end w-full mt-2">
            <button
                type="submit"
                className="bg-[#105BCA] hover:bg-[#1B489D] text-white font-semibold px-4 py-2 rounded-full cursor-pointer"
                disabled={loading}
            >
                {loading ? 'Envoi...' : 'Post'}
            </button>
        </div>
      </form>
    </div>
  );
}