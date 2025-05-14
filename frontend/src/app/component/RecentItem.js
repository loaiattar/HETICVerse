import Link from 'next/link';

export default function RecentItem({ name, description, slug }) {
  return (
    <Link href={`/community/${slug}`} className="block hover:bg-[#181C1F] rounded-lg p-2 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3FDEE1] to-[#3F91E1] flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium">{name}</span>
          {description && (
            <span className="text-gray-400 text-xs line-clamp-1">{description}</span>
          )}
        </div>
      </div>
    </Link>
  );
}