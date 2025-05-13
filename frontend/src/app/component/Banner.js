import { useState } from 'react'

export default function Banner() {
  const [joined, setJoined] = useState(false)

  const handleJoinClick = () => {
    setJoined(prev => !prev)
  }

  return (
    <div className="mb-10">
        <div className="bg-white p-4 mb-5 rounded-lg relative h-40">
            <div className="absolute -bottom-12 left-24 w-30 h-30 bg-gray-100 rounded-full"></div>
        </div>
        <div className="flex justify-end space-x-4">

            <a href='create-post' className="flex items-center justify-center gap-2 border border-[#C7C7C7] hover:border-[#FFFFFF] rounded-full pl-2 pr-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
                Create Post
            </a>

            <button 
                onClick={handleJoinClick} 
                className={`flex items-center justify-center rounded-full px-4 py-2 ${joined ? 'bg-[#105BCA] text-white' : 'border border-[#C7C7C7] hover:border-[#FFFFFF]'}`}
            >
                {joined ? 'Joined' : 'Join'}
            </button>

            <button className="flex items-center justify-center border border-[#C7C7C7] hover:border-[#FFFFFF] rounded-full w-10 h-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </button>
            
        </div>
    </div>
  )
}