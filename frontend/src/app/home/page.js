'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Communities from '../component/FollowedCommunities'
import RecentCommunities from '../component/RecentCommunities'
import PostCard from '../component/PostCard'
import PostTextForm from '../component/TextPostForm'
import UserMenu from '../component/UserMenu'
import { postsApi } from '../../utils/api'

export default function Home() {
  const router = useRouter()
  const [selectedButton, setSelectedButton] = useState('home')
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false)
  const [posts, setPosts] = useState([])

  const toggleUserPanel = () => {
    setIsUserPanelOpen(!isUserPanelOpen)
  }

  const handleButtonClick = (button) => {
    setSelectedButton(button)
  }

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAllPosts()
        setPosts(response)
      } catch (error) {
        console.error('Erreur lors de la récupération des publications:', error)
      }
    }

    fetchPosts()
  }, [])
  
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.9756 1.99999C11.8157 2.00545 11.6617 2.06191 11.5361 2.16113L4.42968 7.75976C3.52773 8.47057 3 9.55675 3 10.7051V20.25C3 20.9318 3.5682 21.5 4.25 21.5H9.25C9.93179 21.5 10.5 20.9318 10.5 20.25V15.25C10.5 15.1025 10.6025 15 10.75 15H13.25C13.3975 15 13.5 15.1025 13.5 15.25V20.25C13.5 20.9318 14.0682 21.5 14.75 21.5H19.75C20.4318 21.5 21 20.9318 21 20.25V10.7051C21 9.55675 20.4722 8.47058 19.5703 7.75976L12.4639 2.16113C12.3252 2.05157 12.1522 1.9945 11.9756 1.99999ZM12 3.70507L18.6426 8.93847C19.1846 9.36565 19.5 10.0154 19.5 10.7051V20H15V15.25C15 14.2925 14.2075 13.5 13.25 13.5H10.75C9.79252 13.5 9 14.2925 9 15.25V20H4.5V10.7051C4.5 10.0154 4.81537 9.36565 5.35742 8.93847L12 3.70507Z" fill="white"/>
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
              <span className="font-bold">Tendancy</span>
            </Link>

            <Link 
              href="/home?view=all" 
              className={`flex items-center gap-3 p-3 mt-1 rounded-md ${selectedButton === 'all' ? 'bg-[#2B3236]' : 'hover:bg-[#181C1F]'}`} 
              onClick={() => handleButtonClick('all')}
            >
              {selectedButton === 'all' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 21C3.16667 21 2.45833 20.7083 1.875 20.125C1.29167 19.5417 1 18.8333 1 18C1 17.1667 1.29167 16.4583 1.875 15.875C2.45833 15.2917 3.16667 15 4 15C4.15 15 4.29583 15.0125 4.4375 15.0375C4.57917 15.0625 4.71667 15.0917 4.85 15.125L8.9 9.55C8.61667 9.2 8.39583 8.80833 8.2375 8.375C8.07917 7.94167 8 7.48333 8 7C8 5.9 8.39167 4.95833 9.175 4.175C9.95833 3.39167 10.9 3 12 3C13.1 3 14.0417 3.39167 14.825 4.175C15.6083 4.95833 16 5.9 16 7C16 7.48333 15.9167 7.94167 15.75 8.375C15.5833 8.80833 15.3583 9.2 15.075 9.55L19.15 15.125C19.2833 15.0917 19.4208 15.0625 19.5625 15.0375C19.7042 15.0125 19.85 15 20 15C20.8333 15 21.5417 15.2917 22.125 15.875C22.7083 16.4583 23 17.1667 23 18C23 18.8333 22.7083 19.5417 22.125 20.125C21.5417 20.7083 20.8333 21 20 21C19.1667 21 18.4583 20.7083 17.875 20.125C17.2917 19.5417 17 18.8333 17 18C17 17.6833 17.0458 17.3792 17.1375 17.0875C17.2292 16.7958 17.3583 16.5333 17.525 16.3L13.475 10.725C13.3917 10.7583 13.3125 10.7833 13.2375 10.8C13.1625 10.8167 13.0833 10.8417 13 10.875V15.175C13.5833 15.375 14.0625 15.7333 14.4375 16.25C14.8125 16.7667 15 17.35 15 18C15 18.8333 14.7083 19.5417 14.125 20.125C13.5417 20.7083 12.8333 21 12 21C11.1667 21 10.4583 20.7083 9.875 20.125C9.29167 19.5417 9 18.8333 9 18C9 17.35 9.1875 16.7708 9.5625 16.2625C9.9375 15.7542 10.4167 15.3917 11 15.175V10.875C10.9167 10.8417 10.8375 10.8167 10.7625 10.8C10.6875 10.7833 10.6083 10.7583 10.525 10.725L6.475 16.3C6.64167 16.5333 6.77083 16.7958 6.8625 17.0875C6.95417 17.3792 7 17.6833 7 18C7 18.8333 6.70833 19.5417 6.125 20.125C5.54167 20.7083 4.83333 21 4 21Z" fill="white"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 21C3.16667 21 2.45833 20.7083 1.875 20.125C1.29167 19.5417 1 18.8333 1 18C1 17.1667 1.29167 16.4583 1.875 15.875C2.45833 15.2917 3.16667 15 4 15C4.15 15 4.29583 15.0125 4.4375 15.0375C4.57917 15.0625 4.71667 15.0917 4.85 15.125L8.9 9.55C8.61667 9.2 8.39583 8.80833 8.2375 8.375C8.07917 7.94167 8 7.48333 8 7C8 5.9 8.39167 4.95833 9.175 4.175C9.95833 3.39167 10.9 3 12 3C13.1 3 14.0417 3.39167 14.825 4.175C15.6083 4.95833 16 5.9 16 7C16 7.48333 15.9167 7.94167 15.75 8.375C15.5833 8.80833 15.3583 9.2 15.075 9.55L19.15 15.125C19.2833 15.0917 19.4208 15.0625 19.5625 15.0375C19.7042 15.0125 19.85 15 20 15C20.8333 15 21.5417 15.2917 22.125 15.875C22.7083 16.4583 23 17.1667 23 18C23 18.8333 22.7083 19.5417 22.125 20.125C21.5417 20.7083 20.8333 21 20 21C19.1667 21 18.4583 20.7083 17.875 20.125C17.2917 19.5417 17 18.8333 17 18C17 17.6833 17.0458 17.3792 17.1375 17.0875C17.2292 16.7958 17.3583 16.5333 17.525 16.3L13.475 10.725C13.3917 10.7583 13.3125 10.7833 13.2375 10.8C13.1625 10.8167 13.0833 10.8417 13 10.875V15.175C13.5833 15.375 14.0625 15.7333 14.4375 16.25C14.8125 16.7667 15 17.35 15 18C15 18.8333 14.7083 19.5417 14.125 20.125C13.5417 20.7083 12.8333 21 12 21C11.1667 21 10.4583 20.7083 9.875 20.125C9.29167 19.5417 9 18.8333 9 18C9 17.35 9.1875 16.7708 9.5625 16.2625C9.9375 15.7542 10.4167 15.3917 11 15.175V10.875C10.9167 10.8417 10.8375 10.8167 10.7625 10.8C10.6875 10.7833 10.6083 10.7583 10.525 10.725L6.475 16.3C6.64167 16.5333 6.77083 16.7958 6.8625 17.0875C6.95417 17.3792 7 17.6833 7 18C7 18.8333 6.70833 19.5417 6.125 20.125C5.54167 20.7083 4.83333 21 4 21Z" fill="#C7C7C7"/>
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
                placeholder="Rechercher sur HETICVerse" 
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
        
        <div className="flex flex-column Justify-center items-center px-35 py-5">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}