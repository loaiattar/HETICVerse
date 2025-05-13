import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserMenu() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return;
    axios.get('http://localhost:1337/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
    window.location.reload();
  };

  if (!user) {
    return (
      <a href="/login" className="text-white px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700">
        Se connecter
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-white">{user.username}</span>
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        Se déconnecter
      </button>
    </div>
  );
} 