'use client';

import { useState } from 'react';
import RecentItem from './RecentItem';

export default function Communities() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const communities = Array(6).fill('r/Randomcommunity');

  return (
    <div
      className={`rounded-xl overflow-hidden px-4 py-1 transition-colors ${
        open ? 'bg-[#121212]' : hover ? 'bg-[#181C1F]' : 'bg-[#121212]'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-gray-300 font-medium${
            open ? 'bg-[#121212]' : hover ? 'bg-[#181C1F]' : 'bg-[#121212]'
          }`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
      >
        <span>COMMUNITIES</span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-300 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-3">
          {communities.map((name, index) => (
            <RecentItem key={index} name={name} />
          ))}
        </div>
      )}
    </div>
  );
}
