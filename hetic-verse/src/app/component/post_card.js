export default function PostCard() {
    return(
        <div className="max-w-3xl mx-auto py-15 px-8">
            {/* <div className="flex-column justify-around overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-white"></div>
                    <div className="h2 w-2 rounded-full"></div>
                    <span className="text-sm text-[#C7C7C7]">R/RandomCommunity</span>
                    <div className="h-1 w-1 rounded-full bg-[#C7C7C7]"></div>
                    <span className="text-sm text-[#C7C7C7]">34 min. ago</span>
                </div>
                <div className="">
                    <button className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium hover:bg-blue-700"></button>
                </div>
                <div></div>
            </div> */}


            <div className="bg-gray-800 rounded-md overflow-hidden">
                <div className="p-4">
                    <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-400">R/RandomCommunity</span>
                    <span className="mx-1 text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">34 min. ago</span>
                    
                    <div className="ml-auto">
                    <button className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium hover:bg-blue-700">
                        Join
                    </button>
                <div>
            </div>
        </div>
    )
}