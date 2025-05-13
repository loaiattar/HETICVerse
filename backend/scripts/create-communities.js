const axios = require('axios');

// Configuration de l'API
const API_URL = 'http://127.0.0.1:1337';
const API_TOKEN = '9f77d3184f56c7c61d6306a6f06f278c9d8236940f869cbfb7b2338abe6c3b0837a7e3cf490875febf2b88ae4f449f7f3186373a39b23b31fdb1739442c19a2a5892686904c577e49e50a5a382c2e80f57066062d76518811927013ac497a639df60a7882afcf5faa0d42727417f3da61e70eff788732c5f8dc7234aa37fc58a';

const communities = [
  {
    name: "HETIC-Dev",
    description: "Communauté dédiée au développement web et aux projets étudiants de HETIC",
    category: "academic",
    privacy: "public",
    slug: "hetic-dev",
    creatinDate: new Date().toISOString(),
    memberCount: 0,
    publishedAt: new Date().toISOString(),
    rules: [
      {
        type: "paragraph",
        content: "1. Respectez les autres membres",
        children: [{ type: "text", text: "1. Respectez les autres membres" }]
      },
      {
        type: "paragraph",
        content: "2. Partagez vos projets et vos connaissances",
        children: [{ type: "text", text: "2. Partagez vos projets et vos connaissances" }]
      },
      {
        type: "paragraph",
        content: "3. Utilisez les tags appropriés pour vos posts",
        children: [{ type: "text", text: "3. Utilisez les tags appropriés pour vos posts" }]
      }
    ]
  },
  {
    name: "HETIC-Gaming",
    description: "Espace de discussion pour les gamers de HETIC",
    category: "social",
    privacy: "public",
    slug: "hetic-gaming",
    creatinDate: new Date().toISOString(),
    memberCount: 0,
    publishedAt: new Date().toISOString(),
    rules: [
      {
        type: "paragraph",
        content: "1. Partagez vos moments de jeu",
        children: [{ type: "text", text: "1. Partagez vos moments de jeu" }]
      },
      {
        type: "paragraph",
        content: "2. Organisez des sessions de jeu",
        children: [{ type: "text", text: "2. Organisez des sessions de jeu" }]
      }
    ]
  },
  {
    name: "HETIC-Design",
    description: "Communauté des designers et créatifs de HETIC",
    category: "academic",
    privacy: "public",
    slug: "hetic-design",
    creatinDate: new Date().toISOString(),
    memberCount: 0,
    publishedAt: new Date().toISOString(),
    rules: [
      {
        type: "paragraph",
        content: "1. Partagez vos créations",
        children: [{ type: "text", text: "1. Partagez vos créations" }]
      },
      {
        type: "paragraph",
        content: "2. Donnez des retours constructifs",
        children: [{ type: "text", text: "2. Donnez des retours constructifs" }]
      }
    ]
  },
  {
    name: "HETIC-Entrepreneurs",
    description: "Espace pour les entrepreneurs et porteurs de projets de HETIC",
    category: "clubs",
    privacy: "public",
    slug: "hetic-entrepreneurs",
    creatinDate: new Date().toISOString(),
    memberCount: 0,
    publishedAt: new Date().toISOString(),
    rules: [
      {
        type: "paragraph",
        content: "1. Partagez vos projets entrepreneuriaux",
        children: [{ type: "text", text: "1. Partagez vos projets entrepreneuriaux" }]
      },
      {
        type: "paragraph",
        content: "2. Recherchez des co-fondateurs",
        children: [{ type: "text", text: "2. Recherchez des co-fondateurs" }]
      }
    ]
  },
  {
    name: "HETIC-Events",
    description: "Informations sur les événements et meetups de HETIC",
    category: "social",
    privacy: "public",
    slug: "hetic-events",
    creatinDate: new Date().toISOString(),
    memberCount: 0,
    publishedAt: new Date().toISOString(),
    rules: [
      {
        type: "paragraph",
        content: "1. Partagez les événements à venir",
        children: [{ type: "text", text: "1. Partagez les événements à venir" }]
      },
      {
        type: "paragraph",
        content: "2. Postez des photos des événements passés",
        children: [{ type: "text", text: "2. Postez des photos des événements passés" }]
      }
    ]
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
    console.log('URL:', `${API_URL}/api/communities`);
    console.log('Headers:', headers);

    // Vérifier d'abord si le serveur répond
    try {
      const testResponse = await axios.get(`${API_URL}/api/communities`, { headers });
      console.log('Test de connexion réussi:', testResponse.status);
    } catch (error) {
      console.error('Erreur de connexion au serveur:');
      console.error('Message:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('Le serveur Strapi ne répond pas. Assurez-vous qu\'il est en cours d\'exécution sur le port 1337.');
        return;
      }
    }

    for (const community of communities) {
      console.log(`\nTentative de création de la communauté: ${community.name}`);
      try {
        const response = await axios.post(`${API_URL}/api/communities`, {
          data: {
            ...community,
            publishedAt: new Date().toISOString()
          }
        }, { headers });

        console.log(`✅ Communauté créée avec succès: ${community.name}`);
        console.log('Réponse:', response.data);
      } catch (error) {
        console.error(`❌ Erreur pour la communauté ${community.name}:`);
        console.error('Message:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        } else if (error.request) {
          console.error('Pas de réponse du serveur');
        }
        console.error('Erreur complète:', error);
      }
    }
  } catch (error) {
    console.error('Erreur générale:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

createCommunities(); 