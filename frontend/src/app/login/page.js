'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogInPage( ) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        } ),
      });
            const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      setSuccess('Connexion réussie !');
      localStorage.setItem('jwt', data.jwt);
      
      // Redirection vers la page home après 1 seconde
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] flex flex-col items-center justify-center px-4">
      <header className="absolute top-4 left-4 text-xl font-bold text-[#3FDEE1]">
        HETIC<span className="text-white">V.</span>
      </header>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#2B3236] shadow-[0_-0px_50px_-5px_rgba(63,222,225,0.4)] shadow-[#3FDEE1]/100">
        <h1 className="text-2xl font-semibold text-white text-center mb-2">
          Bienvenue sur <span className="text-[#3FDEE1]">HETIC</span>Verse
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          En continuant, tu acceptes notre Contrat d&apos;utilisation et reconnais que tu comprends notre Politique de confidentialité.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Identifiant (Email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 text-white rounded-md border border-[#3FDEE1] hover:bg-[#3FDEE1]/10 transition duration-300"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-4 text-center">{success}</p>}

        <p className="text-sm text-center text-white mt-6">
          Pas encore de compte ?{" "}
          <a href="/" className="text-[#3FDEE1] hover:underline">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
