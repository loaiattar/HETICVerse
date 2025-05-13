export default function CommunityDescription() {
  return (
    <div className="w-2xs bg-[#1E1E1E] p-4 rounded-md">
      <h2 className="text-xl font-bold">Community name</h2>
      <p className="text-gray-300 mt-2">
        description with Lorem ipsum dolor sit amet consectetur adipisicing elit. 
        Placeat eaque pariatur facilis tempore explicabo debitis minus ipsa 
        perferendis magnam sit quisquam, impedit minima distinctio aspernatur 
        porro quam saepe cupiditate alias. ipsum dolor sit amet consectetur 
        adipisicing elit. Placeat eaque pariatur facilis tempore explicabo 
        debitis minus ipsa perferendis magnam sit quisquam, impedit minima 
        distinctio aspernatur porro quam saepe cupiditate alias.
      </p>
      <div className="mt-4">
        <span className="text-gray-400">Created April 08 2005</span>
        <div className="flex justify-evenly mt-2">
          <span className="text-gray-400">8.4K Members</span>
          <span className="text-gray-400">1.6K Online</span>
        </div>
      </div>
      <hr className="my-4 border-gray-600" />
      <h3 className="font-bold">Moderators</h3>
      <div className="mt-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
          <span className="text-gray-300">nom_du_modo1</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
          <span className="text-gray-300">nom_du_modo1</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
          <span className="text-gray-300">nom_du_modo1</span>
        </div>
      </div>
    </div>
  );
};