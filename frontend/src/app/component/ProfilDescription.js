export default function ProfilDescription() {
    return (
      <div className="w-80 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-3">Cherif Kamel</h2>
        <div className="flex space-x-4 mb-4">
          <button className="flex items-center justify-center bg-blue-600 text-white rounded-full px-4 py-2">
            <span className="mr-2">+</span> Follow
          </button>
          <button className="flex items-center justify-center bg-gray-700 text-white rounded-full px-4 py-2">
            <span className="mr-2">💬</span> Start Chat
          </button>
        </div>
        <p className="text-gray-400 mt-2">
          A Data Analyst of I don't know what. Terrible sense of humor, terrible opinions.
        </p>
        <div className="flex justify-between mt-4">
            <span className="text-gray-400">1.2K posts</span>
            <span className="text-gray-400">1.6K Online</span>
        </div>
      </div>
    );
  };