const axios = require('axios');

// Configuration de l'API
const API_URL = 'http://127.0.0.1:1337';
const API_TOKEN = '23cbe71ddb71c9fc8e0ef66701d70bce500268e1c8d82bf05e699aff7d3e51937bac4640fe514b441f36c1d01280ed3e7f0f3666557d8836bb5bf158cfd716445b42bce858471f0ec47eea225f6f0aacc404471109b3f13e3949ca7697cdc78d0a816cdcc8a1a1104321e239420be16678166fe4477a1ef2a32d40fc6be5b76a';

const communities = [
  {
    name: "HETIC Social Club",
    description: "Communauté sociale pour les étudiants HETIC",
    privacy: "public",
    category: "social",
    slug: "hetic-social-club",
    creatinDate: "2024-03-20"
  },
  {
    name: "HETIC Tech Hub",
    description: "Communauté dédiée aux passionnés de technologie",
    privacy: "public",
    category: "academic",
    slug: "hetic-tech-hub",
    creatinDate: "2024-03-20"
  },
  {
    name: "HETIC Gaming",
    description: "Communauté gaming pour les étudiants HETIC",
    privacy: "public",
    category: "clubs",
    slug: "hetic-gaming",
    creatinDate: "2024-03-20"
  }
];

async function createCommunities() {
  try {
    // Configuration des headers avec le token
    const headers = {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    console.log('Début de la création des communautés...');

    for (const community of communities) {
      console.log(`\nTentative de création de la communauté: ${community.name}`);
      try {
        const response = await axios.post(`${API_URL}/api/communities`, {
          data: community
        }, { headers });

        console.log(`✅ Communauté créée avec succès: ${community.name}`);
        console.log('Réponse:', response.data);
      } catch (error) {
        console.error(`❌ Erreur pour la communauté ${community.name}:`);
        console.error('Message:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        }
      }
    }
    console.log('\nProcessus de création des communautés terminé!');
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

createCommunities(); 