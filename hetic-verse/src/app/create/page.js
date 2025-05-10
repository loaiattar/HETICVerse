'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:1337/api/posts',
        {
          data: {
            title,
            content,
            publishedAt: new Date().toISOString()
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        router.push('/home');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      if (err.response?.status === 403) {
        setError('Vous n\'avez pas les permissions nécessaires pour créer un post');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.error?.message || 'Erreur lors de la création du post. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#3FDEE1]">Créer un nouveau post</h1>
          <p className="text-gray-400 mt-2">Partagez vos idées avec la communauté HETICVerse</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Titre
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2B3236] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
              placeholder="Donnez un titre à votre post"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Contenu
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2B3236] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1] min-h-[200px]"
              placeholder="Écrivez le contenu de votre post ici..."
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="px-6 py-2 text-white rounded-md border border-gray-600 hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#3FDEE1] text-white rounded-md hover:bg-[#3FDEE1]/80 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Publier le post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 