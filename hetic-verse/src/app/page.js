

async function getPosts() {
  const res = await fetch('http://localhost:1337/api/posts?populate=subreddit,author', {
    cache: 'no-store', 
  });
  const data = await res.json();
  return data.data;
}
export default async function HomePage() {
  let posts = [];

  try {
    posts = await getPosts();
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  if (!posts || posts.length === 0) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔥 HETICVerse — Latest Posts</h1>
        <p className="text-gray-500">No posts found.</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔥 HETICVerse — Latest Posts</h1>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.attributes.title}</h2>
            <p className="text-sm text-gray-500">
              {post.attributes.subreddit?.data?.attributes?.name || 'No Subreddit'}
            </p>
            <p className="mt-2 text-gray-700">{post.attributes.content?.slice(0, 100)}...</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
