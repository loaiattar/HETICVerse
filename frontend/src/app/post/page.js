'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Communities from '../component/FollowedCommunities'
import RecentCommunities from '../component/RecentCommunities'
import PostCard from '../component/PostCard'
import PostComment from '../component/PostComment'
import UserMenu from '../component/UserMenu'
import { postsApi, communitiesApi } from '../../utils/api'

export default function Post() {
  const router = useRouter()
  const [selectedButton, setSelectedButton] = useState('home')
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false)

  const toggleUserPanel = () => {
    setIsUserPanelOpen(!isUserPanelOpen)
  }

  const handleButtonClick = (button) => {
    setSelectedButton(button)
  }

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Sidebar */}
      <div className="w-64 p-4">
        <nav className="space-y-2">
          <div className="space-y-1">
            <Link 
              href="/home" 
              className={`flex items-center gap-3 p-3 rounded-md ${selectedButton === 'home' ? 'bg-[#2B3236]' : 'hover:bg-[#181C1F]'}`} 
              onClick={() => handleButtonClick('home')}
            >
              {selectedButton === 'home' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 21V9L12 3L20 9V21H14V14H10V21H4Z" fill="white"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 21V9L12 3L20 9V21H14V14H10V21H4Z" fill="#C7C7C7"/>
                </svg>
              )}
              <span className="font-bold">Home</span>
            </Link>

            <Link 
              href="/home?view=tendancy" 
              className={`flex items-center gap-3 p-3 mt-1 rounded-md ${selectedButton === 'tendancy' ? 'bg-[#2B3236]' : 'hover:bg-[#181C1F]'}`} 
              onClick={() => handleButtonClick('tendancy')}
            >
              {selectedButton === 'tendancy' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15.3L10.575 16.7C10.3917 16.8833 10.25 17.0917 10.15 17.325C10.05 17.5583 10 17.8 10 18.05C10 18.5833 10.1958 19.0417 10.5875 19.425C10.9792 19.8083 11.45 20 12 20C12.55 20 13.0208 19.8083 13.4125 19.425C13.8042 19.0417 14 18.5833 14 18.05C14 17.7833 13.95 17.5375 13.85 17.3125C13.75 17.0875 13.6083 16.8833 13.425 16.7L12 15.3ZM12 3V6.3C12 6.86667 12.1958 7.34167 12.5875 7.725C12.9792 8.10833 13.4583 8.3 14.025 8.3C14.325 8.3 14.6042 8.2375 14.8625 8.1125C15.1208 7.9875 15.35 7.8 15.55 7.55L16 7C17.2333 7.7 18.2083 8.675 18.925 9.925C19.6417 11.175 20 12.5333 20 14C20 16.2333 19.225 18.125 17.675 19.675C16.125 21.225 14.2333 22 12 22C9.76667 22 7.875 21.225 6.325 19.675C4.775 18.125 4 16.2333 4 14C4 11.85 4.72083 9.80833 6.1625 7.875C7.60417 5.94167 9.55 4.31667 12 3Z" fill="white"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15.3L10.575 16.7C10.3917 16.8833 10.25 17.0917 10.15 17.325C10.05 17.5583 10 17.8 10 18.05C10 18.5833 10.1958 19.0417 10.5875 19.425C10.9792 19.8083 11.45 20 12 20C12.55 20 13.0208 19.8083 13.4125 19.425C13.8042 19.0417 14 18.5833 14 18.05C14 17.7833 13.95 17.5375 13.85 17.3125C13.75 17.0875 13.6083 16.8833 13.425 16.7L12 15.3ZM12 3V6.3C12 6.86667 12.1958 7.34167 12.5875 7.725C12.9792 8.10833 13.4583 8.3 14.025 8.3C14.325 8.3 14.6042 8.2375 14.8625 8.1125C15.1208 7.9875 15.35 7.8 15.55 7.55L16 7C17.2333 7.7 18.2083 8.675 18.925 9.925C19.6417 11.175 20 12.5333 20 14C20 16.2333 19.225 18.125 17.675 19.675C16.125 21.225 14.2333 22 12 22C9.76667 22 7.875 21.225 6.325 19.675C4.775 18.125 4 16.2333 4 14C4 11.85 4.72083 9.80833 6.1625 7.875C7.60417 5.94167 9.55 4.31667 12 3Z" fill="#C7C7C7"/>
                </svg>
              )}
              <span className="font-bold">Trending</span>
            </Link>

            <Link 
              href="/home?view=all" 
              className={`flex items-center gap-3 p-3 mt-1 rounded-md ${selectedButton === 'all' ? 'bg-[#2B3236]' : 'hover:bg-[#181C1F]'}`} 
              onClick={() => handleButtonClick('all')}
            >
              {selectedButton === 'all' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" fill="white"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" fill="#C7C7C7"/>
                </svg>
              )}
              <span className="font-bold">All</span>
            </Link>
          </div>
        </nav>

        <div className='h-px bg-[#333D42] mx-4 my-3'></div>
        
        <RecentCommunities/>

        <div className='h-px bg-[#333D42] mx-4 my-3'></div>

        <Communities/>

      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between py-3 px-4 border-b border-gray-700">
          <div className="w-full max-w-xl">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search HETICVerse" 
                className="w-full py-2 pl-10 pr-4 bg-[#2B3236] rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={togglePanel} className="flex flex-row justify-center items-center gap-1 px-2 py-2 rounded-full text-sm font-medium hover:bg-[#333D42]">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
                Create
              </button>
              {isPanelOpen && (
                <div className="flex flex-col gap-3 absolute top-15 bg-[#2B3236] p-6 rounded-xl text-center">
                  <a href="create-post" className="block text-white hover:bg-[#333D42] rounded-xl">Create post</a>
                  <div className='w-full h-px bg-[#C7C7C7]'></div>
                  <a href="create-community" className="block text-white hover:bg-[#333D42] rounded-xl">Create Community</a>
                </div>
              )}
              <button className="p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-[#2B3236] ">
                <button onClick={toggleUserPanel} className="w-8 h-8 bg-gray-200 rounded-full"></button>
                {isUserPanelOpen && (
                  <div className="flex w-max flex-col gap-3 absolute top-15 -translate-x-10 bg-[#2B3236] p-5 rounded-xl text-center">
                    <a href="/login" className="block text-white hover:bg-[#333D42] rounded-xl">Log out</a>
                  </div>
                )}
              </div>
          </div>
        </header>

        <PostCard/>

          <form>
              <input
              type="text"
              placeholder="Join the conversation"
              className="w-2xl px-13 py-4 rounded-3xl text-white border border-[#C7C7C7] placeholder-[#C7C7C7] placeholder- focus:outline-none focus:ring-2 focus:ring-[#3FDEE1]"
              />
          </form>

          <PostComment/>

        </div>
      </div>
    </div>
  );
}