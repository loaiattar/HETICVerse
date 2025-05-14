'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { communitiesApi } from '../../../utils/api';

export default function CommunityPage() {
  const params = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        // Rechercher la communauté par son slug
        const response = await communitiesApi.getAllCommunities({
          filters: {
            slug: params.slug
          },
          populate: '*'
        });

        if (response && response.data && response.data[0]) {
          setCommunity(response.data[0]);
        } else {
          setError('Community not found');
        }
      } catch (err) {
        console.error('Error fetching community:', err);
        setError(err.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCommunity();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p>Community not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-[#2B3236] rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3FDEE1] to-[#3F91E1] flex items-center justify-center text-white text-2xl font-bold">
              {community.attributes.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{community.attributes.name}</h1>
              <p className="text-gray-400">{community.attributes.description}</p>
            </div>
          </div>

          {/* Statistiques de la communauté */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1F2937] p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{community.attributes.memberCount || 0}</p>
              <p className="text-gray-400">Members</p>
            </div>
            <div className="bg-[#1F2937] p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{community.attributes.postCount || 0}</p>
              <p className="text-gray-400">Posts</p>
            </div>
            <div className="bg-[#1F2937] p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{community.attributes.onlineCount || 0}</p>
              <p className="text-gray-400">Online</p>
            </div>
          </div>

          {/* Section des posts */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
            {/* TODO: Ajouter la liste des posts */}
          </div>
        </div>
      </div>
    </div>
  );
} 