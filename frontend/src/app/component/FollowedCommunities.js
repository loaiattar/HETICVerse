'use client';

import { useState, useEffect } from 'react';
import RecentItem from './RecentItem';
import { communitiesApi } from '../../utils/api';

export default function Communities() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await communitiesApi.getAllCommunities({
          populate: '*'
        });
        console.log('API Response:', response);

        if (response && response.data) {
          const formattedCommunities = response.data.map(community => {
            console.log('Processing community:', community);
            return {
              id: community.id,
              attributes: {
                name: community.attributes?.name || 'Unnamed Community',
                description: community.attributes?.description || 'No description available',
                slug: community.attributes?.slug || `community-${community.id}`
              }
            };
          });
          console.log('Formatted communities:', formattedCommunities);
          setCommunities(formattedCommunities);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div
      className={`rounded-xl overflow-hidden px-4 py-1 transition-colors ${
        open ? 'bg-[#121212]' : hover ? 'bg-[#181C1F]' : 'bg-[#121212]'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-gray-300 font-medium${
          open ? 'bg-[#121212]' : hover ? 'bg-[#181C1F]' : 'bg-[#121212]'
        }`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span>COMMUNITIES</span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-300 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-3">
          {loading ? (
            <div className="text-gray-400">Loading communities...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : communities.length === 0 ? (
            <div className="text-gray-400">No communities found</div>
          ) : (
            communities.map((community) => (
              <RecentItem 
                key={community.id} 
                name={community.attributes.name}
                description={community.attributes.description}
                slug={community.attributes.slug}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
