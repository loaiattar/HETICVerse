import { useState } from 'react';
import { postsApi } from '../../utils/api';
import SelectCommunityButton from './SelectCommunityButton';

export default function PostTextForm({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content1, setContent1] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!selectedCommunity) {
      setError("Please select a community.");
      return;
    }
    setLoading(true);
    try {
      console.log('Selected community:', selectedCommunity);
      
      const postData = {
        title: title.trim(),
        content: content1,
        type: 'text',
        communityId: selectedCommunity.id,
        publishedAt: new Date().toISOString()
      };
      
      console.log('Post data:', JSON.stringify(postData, null, 2));
      
      const response = await postsApi.createPost(postData);
      console.log('Server response:', response);

      setSuccess('Post created successfully!');
      setTitle('');
      setContent1('');
      setSelectedCommunity(null);
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Complete error:', error);
      if (error.response) {
        console.error('Server response:', JSON.stringify(error.response.data, null, 2));
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        if (error.response.data.error) {
          console.error('Error details:', JSON.stringify(error.response.data.error, null, 2));
        }
        setError(error.response.data.error?.message || "Error creating post.");
      } else {
        console.error('Error without response:', error);
        setError("Error creating post.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-2xl">
        <SelectCommunityButton 
          onSelect={(community) => setSelectedCommunity(community)}
          selectedCommunity={selectedCommunity}
        />
        <div>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mt-1 mb-6 block w-full border border-[#C7C7C7] rounded-xl py-4 px-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <textarea
            id="content"
            value={content1}
            placeholder='Body text'
            onChange={(e) => setContent1(e.target.value)}
            maxLength={300}
            className="mt-1 block w-full border border-[#C7C7C7] rounded-xl py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-32"
          />
          <p className="text-right text-sm text-gray-500">
            {content1.length}/300
          </p>
        </div>

        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex justify-end w-full mt-2">
          <button
            type="submit"
            className="bg-[#105BCA] hover:bg-[#1B489D] text-white font-semibold px-4 py-2 rounded-full cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}