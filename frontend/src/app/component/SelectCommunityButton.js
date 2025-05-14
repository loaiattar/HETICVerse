import { useState, useEffect } from 'react';
import { communitiesApi } from '../../utils/api';

export default function SelectCommunityButton({ onSelect, selectedCommunity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await communitiesApi.getAllCommunities({
          populate: '*'
        });

        if (response && response.data) {
          const formattedCommunities = response.data.map(community => ({
            id: community.id,
            name: community.attributes.name || 'Unnamed',
            members: `${community.attributes.memberCount || 0} members`,
            documentId: community.attributes.documentId
          }));
          setCommunities(formattedCommunities);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied. Please check your login status or permissions.');
        } else if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data.error?.message || 'Error loading communities'}`);
        } else {
          setError('Server connection error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleCommunitySelect = (community) => {
    onSelect(community);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 relative">
      <button 
        className="flex justify-between w-full bg-[#2B3236] text-white px-4 py-2 rounded-full flex items-center hover:bg-[#333D42] transition"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selectedCommunity ? selectedCommunity.name : 'Select a community'}</span>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 bg-[#2B3236] rounded-md shadow-lg mt-2 w-full max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-white text-sm">Loading...</div>
          ) : error ? (
            <div className="px-4 py-2 text-red-400 text-sm">
              {error}
              {error.includes('403') && (
                <div className="mt-2 text-xs">
                  <p>To resolve this issue:</p>
                  <ol className="list-decimal list-inside mt-1">
                    <li>Verify that you are logged in</li>
                    <li>Check permissions in Strapi for the "Authenticated" role</li>
                    <li>If the problem persists, try logging out and back in</li>
                  </ol>
                </div>
              )}
            </div>
          ) : communities.length === 0 ? (
            <div className="px-4 py-2 text-white text-sm">No communities available</div>
          ) : (
            communities.map((community) => (
              <div 
                key={community.id} 
                className="flex flex-col px-4 py-2 text-white text-sm hover:bg-[#333D42] cursor-pointer"
                onClick={() => handleCommunitySelect(community)}
              >
                <span>{community.name}</span>
                <span className="text-gray-400 text-sm">{community.members}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}