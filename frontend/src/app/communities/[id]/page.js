'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/communities/${params.id}` );
        const data = await response.json();
        setCommunity(data.data);
      } catch (err) {
        setError('Failed to load community');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchCommunity();
    }
  }, [params.id]);

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!community) return <div className="text-white p-8">Community not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] p-4">
      <div className="max-w-md mx-auto bg-[#2B3236] rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {community.attributes?.name || 'Unnamed Community'}
        </h1>
        <p className="text-gray-300 mb-6">
          {community.attributes?.description || 'No description'}
        </p>
        
        <div className="flex justify-between">
          <button
            onClick={() => router.push('/communities')}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Back
          </button>
          
          <button
            onClick={() => router.push(`/create-post?community=${community.id}`)}
            className="px-4 py-2 bg-[#3FDEE1] text-black rounded"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
}
