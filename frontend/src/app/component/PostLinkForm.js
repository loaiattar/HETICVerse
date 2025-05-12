import { useState } from 'react';

export default function PostLinkForm() {
  const [title, setTitle] = useState('');
  const [content1, setContent1] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-2xl">
        <div>
            <input
                type="text"
                id="title"
                placeholder="Title"
                className="mt-1 mb-6 block w-full border border-[#C7C7C7] rounded-xl py-4 px-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>

        <div>
          <input
            id="content"
            value={content1}
            placeholder="Link URL"
            className="mt-1 mb-6 block w-full border border-[#C7C7C7] rounded-xl py-4 px-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end w-full mt-2">
            <button
                type="submit"
                className="bg-[#105BCA] hover:bg-[#1B489D] text-white font-semibold px-4 py-2 rounded-full cursor-pointer"
            >
                Post
            </button>
        </div>
      </form>
    </div>
  );
}