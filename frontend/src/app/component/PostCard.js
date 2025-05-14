'use client'

import React, { useState, useEffect } from 'react'
import { postsApi } from '../../utils/api'

export default function PostCard({ post }) {
  const [activeButton, setActiveButton] = useState(null)
  const [voteCount, setVoteCount] = useState(0)

  useEffect(() => {
    if (post) {
      console.log('Post data:', post) // Debug post data
      setVoteCount(post.attributes.vote || 0)
    }
  }, [post])

  const handleVote = async (button) => {
    try {
      if (button === 'blue') {
        const newVoteCount = activeButton === button ? voteCount - 1 : voteCount + 1
        
        const response = await postsApi.updatePost(post.id, {
          vote: newVoteCount
        })

        console.log('Vote response:', response) // Debug vote response

        if (response.data) {
          setActiveButton(prev => (prev === button ? null : button))
          setVoteCount(newVoteCount)
        }
      }
    } catch (error) {
      console.error('Vote error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }) // Detailed error logging
    }
  }

  if (!post) {
    return <div className="text-gray-400">Loading...</div>
  }

  const { attributes } = post
  console.log('Post attributes:', attributes) // Debug attributes

  const communityName = attributes.community?.data?.attributes?.name || 'R/RandomCommunity'
  const username = attributes.user?.data?.attributes?.username || 'Anonymous'
  const createdAt = new Date(attributes.createdAt).toLocaleDateString()
  const imageUrl = attributes.image?.data?.[0]?.attributes?.url
  const content = attributes.content?.[0]?.children?.[0]?.text || attributes.content || ''

  return (
    <div className="bg-[#2B3236] rounded-lg shadow-lg overflow-hidden mb-4">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
          <span className="text-sm text-gray-400">{communityName}</span>
          <span className="mx-1 text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">Posted by {username}</span>
          <span className="mx-1 text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{createdAt}</span>
        </div>

        {/* Content */}
        <h2 className="text-xl font-medium mb-2 text-white">{attributes.title}</h2>
        <div className="text-sm text-gray-300 mb-4">
          {content}
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="mb-4">
            <img 
              src={`http://localhost:1337${imageUrl}`} 
              alt={attributes.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Vote buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleVote('blue')}
              className={`p-1 rounded ${activeButton === 'blue' ? 'text-[#3FDEE1]' : ''}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L3 15H21L12 4Z" fill="currentColor"/>
              </svg>
            </button>
            <span className="text-white">{voteCount}</span>
            <button 
              onClick={() => handleVote('red')}
              className={`p-1 rounded ${activeButton === 'red' ? 'text-red-500' : ''}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20L3 9H21L12 20Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Comments */}
          <button className="flex items-center space-x-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Comments</span>
          </button>

          {/* Share */}
          <button className="flex items-center space-x-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}