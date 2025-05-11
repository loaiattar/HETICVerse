'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function PostCard({ postId }) {
  const [activeButton, setActiveButton] = useState(null)
  const [voteCount, setVoteCount] = useState(0)
  const [postData, setPostData] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:1337/api/posts/${postId}?populate=*`)
        if (response.status === 200) {
          setPostData(response.data.data)
          setVoteCount(response.data.data.attributes.upvotes || 0)
        }
      } catch (error) {
        console.error('Error fetching post:', error)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const handleClick = async (button) => {
    try {
      if (button === 'blue') {
        const newVoteCount = activeButton === button ? voteCount - 1 : voteCount + 1
        const response = await axios.put(`http://localhost:1337/api/posts/${postId}`, {
          data: {
            upvotes: newVoteCount
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (response.status === 200) {
          setActiveButton(prev => (prev === button ? null : button))
          setVoteCount(newVoteCount)
        }
      }
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const getShadowClass = () => {
    if (activeButton === 'blue' || activeButton === 'blueForce') return 'shadow-[0_1px_7px_0px_rgba(63,222,225,0.4)] shadow-[#3FDEE1]'
    if (activeButton === 'red') return 'shadow-[0_1px_7px_0px_rgba(63,222,225,0.4)] shadow-[#F13636]'
    return ''
  }

  if (!postData) {
    return <div>Loading...</div>
  }

  return(
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="rounded-md overflow-hidden hover:bg-[#181C1F]">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-400">{postData.attributes.sub_hetic_verse?.data?.attributes?.name || 'R/RandomCommunity'}</span>
            <span className="mx-1 text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">34 min. ago</span>
            
            <div className="flex item-center ml-auto">
              <button className="px-3 py-1 bg-[#105BCA] rounded-full text-sm font-medium hover:bg-[#1B489D]">
                Join
              </button>
            </div>
          </div>
          
          <h2 className="text-xl font-medium mb-2">{postData.attributes.title}</h2>
          <p className="text-sm text-gray-300 mb-4">
            {postData.attributes.content}
          </p>
          
          {/* Image Placeholder */}
          {postData.attributes.image?.data && (
            <div className="bg-gray-400 w-full h-120 rounded-2xl">
              <img 
                src={`http://localhost:1337${postData.attributes.image.data.attributes.url}`} 
                alt={postData.attributes.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          )}
          
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`flex flex-row items-center justify-center gap-3 w-min h-8 rounded-full bg-[#2B3236] px-2 py-5 transition-all ${getShadowClass()}`}>
                <div className="flex flex-row items-center justify-center gap-1 w-min h-8 rounded-full bg-[#2B3236] px-2 py-5">
                  <button className="rounded-full hover:bg-[#333D42]" onClick={() => handleClick('blueForce')}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" transform="rotate(180)" viewBox="0 -960 960 960" width="24px" fill={activeButton === 'blueForce' ? '#3FDEE1' : '#FFFFFF'}>
                      <path d="M480-83 240-323l56-56 184 183 184-183 56 56L480-83Zm0-238L240-561l56-56 184 183 184-183 56 56-240 240Zm0-238L240-799l56-56 184 183 184-183 56 56-240 240Z"/>
                    </svg>
                  </button>

                  <button className="rounded-full hover:bg-[#333D42]" onClick={() => handleClick('blue')}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={activeButton === 'blue' ? '#3FDEE1' : '#FFFFFF'}>
                      <path d="M320-120v-320H120l360-440 360 440H640v320H320Zm80-80h160v-320h111L480-754 289-520h111v320Zm80-320Z"/>
                    </svg>
                  </button>

                  <span className="text-sm font-medium">{voteCount}</span>
                </div>

                <button className="rounded-full hover:bg-[#333D42]" onClick={() => handleClick('red')}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" transform="rotate(180)" viewBox="0 -960 960 960" width="24px" fill={activeButton === 'red' ? '#F13636' : '#FFFFFF'}><path d="M320-120v-320H120l360-440 360 440H640v320H320Zm80-80h160v-320h111L480-754 289-520h111v320Zm80-320Z"/></svg>
                </button>
              </div>
            </div>
            
            <button className="flex items-center jusstify-center space-x-1 text-white bg-[#2B3236] hover:bg-[#333D42] w-min h-8 px-3 py-5 gap-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/></svg>
              <span className="text-sm font-medium">2.1K</span>
            </button>
            
            <button className="flex items-center jusstify-center space-x-1 text-white bg-[#2B3236] hover:bg-[#333D42] w-min h-8 px-3 py-5 gap-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"/></svg>
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}