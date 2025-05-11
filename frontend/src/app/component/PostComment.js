import React, { useState } from 'react'

export default function PostComment() {
    const [selectedVote, setSelectedVote] = useState(null)

    const handleUpvote = () => {
        setSelectedVote(selectedVote === 'upvote' ? null : 'upvote')
    }

    const handleDownvote = () => {
        setSelectedVote(selectedVote === 'downvote' ? null : 'downvote')
    }

    return (
      <div className="flex w-2xl py-4">
  
        {/* Contenu principal */}
        <div className="flex flex-col flex-1 text-white space-y-2">
          
          {/* Section 1: Avatar, Pseudo and date */}
          <div className="flex flex-row gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 shrink-0" />
            <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Random Name</span>
                <span className="text-white/40 font-normal">· 1min ago</span>
            </div>
          </div>
        
          {/* Section 2: Texte du commentaire */}
          <p className="text-white/80 text-base leading-relaxed">
            Good but Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam nam quasi odio eum
            maiores eos exercitationem commodi perferendis unde quas, quia repellat laudantium itaque
            sed nemo nisi natus possimus quam?
          </p>
  
          {/* Section 3: Actions (votes + commentaires) */}
          <div className="flex items-center gap-5 text-white/60 text-sm">
            <div className="flex items-center gap-1">
                {/* Upvote */}
                <div className="flex items-center gap-1 cursor-pointer" onClick={handleUpvote}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13.125V8.125H1.875L7.5 1.25L13.125 8.125H10V13.125H5ZM6.25 11.875H8.75V6.875H10.4844L7.5 3.21875L4.51562 6.875H6.25V11.875Z" fill={selectedVote === 'upvote' ? '#3FDEE1' : '#C7C7C7'}/>
                    </svg>
                    <span>8</span>
                </div>
    
                {/* Downvote */}
                <div className="flex items-center gap-1 cursor-pointer hover:text-white transition" onClick={handleDownvote}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.875L10 6.875L13.125 6.875L7.5 13.75L1.875 6.875L5 6.875L5 1.875L10 1.875ZM8.75 3.125L6.25 3.125L6.25 8.125L4.51563 8.125L7.5 11.7813L10.4844 8.125L8.75 8.125L8.75 3.125Z" fill={selectedVote === 'downvote' ? '#F13636' : '#C7C7C7'}/>
                    </svg>
                </div>
            </div>
  
            {/* Comment icon */}
            <div className="flex items-center gap-1 cursor-pointer hover:text-white transition">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.09992 10.3417H11.8999V9.20832H5.09992V10.3417ZM5.09992 8.64166H11.8999V7.50832H5.09992V8.64166ZM5.09992 6.94166H11.8999V5.80832H5.09992V6.94166ZM14.1666 13.8125L11.8999 12.6083H3.96659C3.65492 12.6083 3.38811 12.4974 3.16617 12.2754C2.94422 12.0535 2.83325 11.7867 2.83325 11.475V4.67499C2.83325 4.36332 2.94422 4.09652 3.16617 3.87457C3.38811 3.65263 3.65492 3.54166 3.96659 3.54166H13.0333C13.3449 3.54166 13.6117 3.65263 13.8337 3.87457C14.0556 4.09652 14.1666 4.36332 14.1666 4.67499V13.8125ZM3.96659 11.475H12.3816L13.0333 12.1125V4.67499H3.96659V11.475Z" fill="#C7C7C7"/>
                </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }