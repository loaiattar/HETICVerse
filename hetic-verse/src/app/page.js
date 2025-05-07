async function getPosts() {
  const res = await fetch('http://localhost:1337/api/posts?populate=subreddit,author', {
    cache: 'no-store', 
  });
  const data = await res.json();
  return data.data;
}
export default async function LogInPage() {
  let posts = [];


  return (

    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] flex flex-col items-center justify-center px-4">
      <header className="absolute top-4 left-4 text-xl font-bold text-[#3FDEE1]">
        HETIC<span className="text-white">V.</span>
      </header>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#2B3236] shadow-xl shadow-[#3FDEE1]/30">
        <h1 className="text-2xl font-semibold text-white text-center mb-2">
          Bienvenue sur <span className="text-[#3FDEE1]">HETIC</span>Verse
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          En continuant, tu acceptes notre Contrat d'utilisation et reconnais que tu comprends notre Politique de confidentialité.
        </p>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Identifiant (Email)"
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />
          <input
            type="text"
            placeholder="Pseudonyme"
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />
          <input
            type="password"
            placeholder="Confirmer votre mot de passe"
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />

          <button
            type="submit"
            className="w-full flex justify-center py-2 text-white rounded-md border border-[#3FDEE1] hover:bg-[#3FDEE1]/10 transition duration-300"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-sm text-center text-white mt-6">
          Vous avez déjà un compte ? {" "}
          <a href="#" className="text-[#3FDEE1] hover:underline">
            Se connecter !
          </a>
        </p>
      </div>
    </div>
  );
}