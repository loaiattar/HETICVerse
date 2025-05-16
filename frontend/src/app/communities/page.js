'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Get the JWT token
        const token = localStorage.getItem('jwt');
        
        if (!token) {
          setError('You must be logged in to view communities');
          setLoading(false);
          return;
        }
        
        // Fetch communities directly with fetch
        const response = await fetch('http://localhost:1337/api/communities?populate=*', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } );
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to fetch communities');
        }
        
        // Safely extract communities data
        const communitiesData = result.data || [];
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error fetching communities:', error);
        setError('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunities();
  }, []);
  
  const handleCreateCommunity = () => {
    router.push('/create-community');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3FDEE1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Communities</h1>
          <button 
            onClick={handleCreateCommunity}
            className="px-4 py-2 bg-[#3FDEE1] text-black rounded-md hover:bg-[#3FDEE1]/80 transition-colors"
          >
            Create Community
          </button>
        </div>
        
        {error && <p className="text-red-400 mb-4">{error}</p>}
        
        {communities.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-400">
            <p>No communities found.</p>
            <p className="mt-2">Create your first community to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              // Safely access community data with optional chaining
              const attributes = community?.attributes || {};
              const name = attributes.name || 'Unnamed Community';
              const description = attributes.description || 'No description';
              
              return (
                <div 
                  key={community.id} 
                  className="bg-[#2B3236] rounded-lg p-4 shadow-lg hover:shadow-[#3FDEE1]/10 transition-shadow cursor-pointer"
                  onClick={() => router.push(`/communities/${community.id}`)}
                >
                  <h2 className="text-xl font-semibold text-white mb-2">{name}</h2>
                  <p className="text-gray-400 line-clamp-3">{description}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    {attributes.category && (
                      <span className="inline-block bg-gray-700 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mr-2">
                        {attributes.category}
                      </span>
                    )}
                    {attributes.privacy && (
                      <span className="inline-block bg-gray-700 rounded-full px-3 py-1 text-xs font-semibold text-gray-300">
                        {attributes.privacy}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
    