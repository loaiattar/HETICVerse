import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SelectCommunityButton({ onSelect, selectedCommunity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem('jwt');

        if (!token) {
          setError('Non authentifié. Veuillez vous connecter.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://127.0.0.1:1337/api/communities?populate=*', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.data && response.data.data) {
          const formattedCommunities = response.data.data.map(community => ({
            id: community.id,
            name: community.name || 'Sans nom',
            members: `${community.memberCount || 0} membres`,
            documentId: community.documentId
          }));
          setCommunities(formattedCommunities);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Accès refusé. Veuillez vous connecter ou vérifier les permissions.');
        } else if (err.response) {
          setError(`Erreur ${err.response.status}: ${err.response.data.error?.message || 'Erreur lors du chargement des communautés'}`);
        } else {
          setError('Erreur de connexion au serveur');
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
            <div className="px-4 py-2 text-white text-sm">Chargement...</div>
          ) : error ? (
            <div className="px-4 py-2 text-red-400 text-sm">
              {error}
              {error.includes('403') && (
                <div className="mt-2 text-xs">
                  <p>Pour résoudre ce problème :</p>
                  <ol className="list-decimal list-inside mt-1">
                    <li>Vérifiez que vous êtes bien connecté</li>
                    <li>Vérifiez les permissions dans Strapi pour le rôle "Authenticated"</li>
                    <li>Si le problème persiste, essayez de vous déconnecter et reconnecter</li>
                  </ol>
                </div>
              )}
            </div>
          ) : communities.length === 0 ? (
            <div className="px-4 py-2 text-white text-sm">Aucune communauté disponible</div>
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