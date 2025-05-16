'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          setError('You must be logged in');
          return;
        }
        
        const response = await fetch('http://localhost:1337/api/communities' );
        const data = await response.json();
        setCommunities(data.data || []);
      } catch (err) {
        setError('Failed to load communities');
        console.error(err);
      }
    };
    
    fetchCommunities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('jwt');
      
      const response = await fetch('http://localhost:1337/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            title,
            content,
            community: communityId
          }
        } )
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      router.push('/communities');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] p-4">
      <div className="max-w-md mx-auto bg-[#2B3236] rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create a Post</h1>
        
        {error && <p className="text-red-400 mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-[#333D42] text-white rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 bg-[#333D42] text-white rounded h-32"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Community</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full p-2 bg-[#333D42] text-white rounded"
              required
            >
              <option value="">Select a community</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.attributes?.name || 'Unnamed Community'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/communities')}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3FDEE1] text-black rounded"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
