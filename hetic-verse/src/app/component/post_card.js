'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function PostCard({ postId }) {
  const [activeButton, setActiveButton] = useState(null)
  const [voteCount, setVoteCount] = useState(0)
  const [postData, setPostData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Vous devez être connecté pour voir les posts')
          setLoading(false)
          return
        }

        console.log('Fetching post with ID:', postId)
        console.log('Using token:', token)

        const response = await axios.get(`http://localhost:1337/api/posts/${postId}?populate=*`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('Post response:', response.data)

        if (response.status === 200 && response.data && response.data.data) {
          setPostData(response.data.data)
          setVoteCount(response.data.data.attributes.upvotes || 0)
          setError(null)
        } else {
          console.error('Invalid response format:', response.data)
          setError('Format de réponse invalide')
        }
      } catch (err) {
        console.error('Erreur détaillée lors du chargement du post:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        })
        
        if (err.response?.status === 404) {
          setError('Post non trouvé')
        } else if (err.response?.status === 403) {
          setError('Vous n\'avez pas les permissions nécessaires')
        } else {
          setError(`Erreur lors du chargement du post: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      console.log('PostCard mounted with ID:', postId)
      fetchPost()
    } else {
      console.error('PostCard mounted without postId')
      setError('ID du post manquant')
      setLoading(false)
    }
  }, [postId])

  const handleClick = async (button) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vous devez être connecté pour voter')
        return
      }

      if (button === 'blue') {
        const newVoteCount = activeButton === button ? voteCount - 1 : voteCount + 1
        const response = await axios.put(`http://localhost:1337/api/posts/${postId}`, {
          data: {
            upvotes: newVoteCount
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        })

        if (response.status === 200) {
          setActiveButton(prev => (prev === button ? null : button))
          setVoteCount(newVoteCount)
        }
      }
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Erreur lors de la mise à jour du vote')
    }
  }

  const getShadowClass = () => {
    if (activeButton === 'blue' || activeButton === 'blueForce') return 'shadow-[0_1px_7px_0px_rgba(63,222,225,0.4)] shadow-[#3FDEE1]'
    if (activeButton === 'red') return 'shadow-[0_1px_7px_0px_rgba(63,222,225,0.4)] shadow-[#F13636]'
    return ''
  }

  if (loading) {
    return (
      <div className="bg-[#2B3236] rounded-lg shadow p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#2B3236] rounded-lg shadow p-4">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!postData) {
    return (
      <div className="bg-[#2B3236] rounded-lg shadow p-4">
        <p className="text-gray-400">Post non trouvé</p>
      </div>
    )
  }

  return(
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="bg-[#2B3236] rounded-lg shadow">
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
              <button className="ml-2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <h2 className="text-xl font-medium mb-2 text-white">{postData.attributes.title}</h2>
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

                <span className="text-sm font-medium text-white">{voteCount}</span>
              </div>

              <button className="rounded-full hover:bg-[#333D42]" onClick={() => handleClick('red')}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" transform="rotate(180)" viewBox="0 -960 960 960" width="24px" fill={activeButton === 'red' ? '#F13636' : '#FFFFFF'}><path d="M320-120v-320H120l360-440 360 440H640v320H320Zm80-80h160v-320h111L480-754 289-520h111v320Zm80-320Z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}