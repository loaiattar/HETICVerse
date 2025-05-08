import PostCard from '../component/post_card'

export default function Home() {
  return (

    <div className="flex min-h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#333D42] flex-shrink-0">
        <div className="p-4">
          <h1 className="text-2xl font-bold"><span className="text-[#3FDEE1]">HETIC</span>V.</h1>
        </div>
        <nav className="mt-5">
          <div className="px-4 py-2">
            <a href="#" className="flex items-center p-3 rounded-md bg-gray-800 hover:bg-gray-700">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Home</span>
            </a>
          </div>
          <div className="px-4 py-2">
            <a href="#" className="flex items-center p-3 rounded-md hover:bg-gray-700">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium">Tendancy</span>
            </a>
          </div>
          <div className="px-4 py-2">
            <a href="#" className="flex items-center p-3 rounded-md hover:bg-gray-700">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span className="font-medium">All</span>
            </a>
          </div>
          
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs tracking-wider text-gray-400 uppercase font-medium">RECENT</h3>
              <button className="text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs tracking-wider text-gray-400 uppercase font-medium">COMMUNITIES</h3>
              <button className="text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
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
            <button className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium hover:bg-blue-700">
              Create
            </button>
            <button className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </header>

        <PostCard/>
        
      </div>
    </div>
  );
}