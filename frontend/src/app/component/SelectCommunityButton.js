import { useState } from 'react';

export default function SelectCommunityButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const communities = [
    { name: 'u/nm_mp4', members: 'Your profile' },
    { name: 'r/667', members: '8,207 members' },
    { name: 'r/announcements', members: '304,513,033 members' },
    { name: 'r/Basketball', members: '1,655,169 members' },
    { name: 'r/fantasybball', members: '961,832 members' },
    { name: 'r/frenchrap', members: '78,078 members' },
    { name: 'r/Futurology', members: '21,577,325 members' },
    { name: 'r/MangaCollectors', members: '1,906,489 members' },
    { name: 'r/mangadeals', members: '1,011,499 members' },
    { name: 'r/nba', members: '16,359,100 members' },
  ];

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 relative">
      <button 
        className="flex justify-between w-xs bg-[#2B3236] text-white px-4 py-2 rounded-full flex items-center hover:bg-[#333D42] transition"
        onClick={() => setIsOpen(!isOpen)}
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
        <div className="absolute z-10 bg-[#2B3236] rounded-md shadow-lg mt-2 w-full">
          {communities.map((community, index) => (
            <div 
              key={index} 
              className="flex flex-col px-4 py-2 text-white text-sm hover:bg-[#333D42] cursor-pointer"
              onClick={() => handleCommunitySelect(community)}
            >
              <span>{community.name}</span>
              <span className="text-gray-400 text-sm">{community.members}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}