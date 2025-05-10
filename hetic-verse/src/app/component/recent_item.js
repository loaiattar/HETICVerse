export default function RecentItem({ name }) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 rounded-full bg-white opacity-30" />
        <span className="text-white text-sm">{name}</span>
      </div>
    );
  }