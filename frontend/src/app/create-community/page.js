'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    // Get the JWT token
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      setError('You must be logged in to create a community');
      setLoading(false);
      return;
    }
    
    // Generate a slug from the name
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Create the properly formatted request payload with ALL required fields
    const payload = {
      data: {
        name,
        description,
        slug, // Required field
        creatinDate: new Date().toISOString().split('T')[0], // Required field with typo
        privacy: "public", // Using the default value
        category: "other", // Using the default value
        Visibility: true // Using the default value
      }
    };
    // Make the API request
    const response = await fetch('http://localhost:1337/api/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload )
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${data.error?.message || 'Unknown error'}`);
    }
    
    console.log('Community created successfully:', data);
    
    // Redirect to communities page
    router.push('/communities');
  } catch (error) {
    console.error('Error creating community:', error);
    setError(error.message || 'Failed to create community');
  } finally {
    setLoading(false);
  }
};

const payload = {
  data: {
    name,
    description,
    slug: name.toLowerCase().replace(/\s+/g, '-'), // Required field
    creatinDate: new Date().toISOString().split('T')[0], // Required field with typo
    privacy: "public",
    category: "other",
    Visibility: true
  }
};





  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] p-4">
      <div className="max-w-md mx-auto bg-[#2B3236] rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create a New Community</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white h-32"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#3FDEE1] text-black font-medium rounded-md hover:bg-[#3FDEE1]/80 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </form>
        
        {/* Debug information - remove in production */}
        {debug && (
          <div className="mt-6 p-3 bg-gray-800 rounded text-xs text-gray-300 whitespace-pre-wrap">
            <p className="font-bold mb-1">Debug Info:</p>
            {debug}
          </div>
        )}
      </div>
    </div>
  );
}
