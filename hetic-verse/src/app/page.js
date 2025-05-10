'use client';

import axios from 'axios';
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:1337/api/auth/local/register', {
        username,
        email,
        password,
      });

      setSuccess("Inscription réussie !");
      setError('');
      console.log('User profile:', response.data.user);
      console.log('User token:', response.data.jwt);

      // Optionnel : rediriger ou stocker le token
    } catch (err) {
      setError(err.response?.data?.error?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#171717] flex flex-col items-center justify-center px-4">
      <header className="absolute top-4 left-4 text-xl font-bold  text-[#3FDEE1]" style={{ fontFamily: 'Baloo Da 2' }}>
        HETIC<span className="text-white">V.</span>
      </header>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#2B3236] shadow-[0_-0px_50px_-5px_rgba(63,222,225,0.4)] shadow-[#3FDEE1]/100">
        <h1 className="text-2xl font-semibold text-white text-center mb-2">
          Bienvenue sur <span className="text-[#3FDEE1]">HETIC</span>Verse
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          En continuant, tu acceptes notre Contrat d utilisation et reconnais que tu comprends notre Politique de confidentialité.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Identifiant (Email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />
          <input
            type="text"
            placeholder="Pseudonyme"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />
          <input
            type="password"
            placeholder="Confirmer votre mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#333D42] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
          />

          <button
            type="submit"
            className="w-full flex justify-center py-2 text-white rounded-md border border-[#3FDEE1] hover:bg-[#3FDEE1]/10 transition duration-300"
          >
            S&apos;inscrire
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-4 text-center">{success}</p>}

        <p className="text-sm text-center text-white mt-6">
          Vous avez déjà un compte ?{" "}
          <a href="/login" className="text-[#3FDEE1] hover:underline">
            Se connecter !
          </a>
        </p>
      </div>
    </div>
  );
}
