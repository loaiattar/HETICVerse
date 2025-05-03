

async function getPost(id) {
    const res = await fetch(`http://localhost:1337/api/posts/${id}?populate[author]=*&populate[subreddit]=*&populate[comments]=*`, {
        cache: 'no-store',
      });
    if (!res.ok) {
      console.error('Failed to fetch post:', res.status);
      return null;
    }
  
    const data = await res.json();
    return data.data;
  }
  
  export default async function PostPage({ params }) {
    const post = await getPost(params.id);

    if (!params?.id) {
        console.error("Missing post ID in URL");
        return (
          <main className="p-6">
            <h1 className="text-xl font-bold text-red-600">Missing post ID</h1>
          </main>
        );
      }
      
  
    if (!post) {
      return (
        <main className="p-6">
          <h1 className="text-xl font-bold text-red-600">Post not found</h1>
        </main>
      );
    }
  
    const { title, content, subreddit, comments } = post.attributes;
  
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mb-2">
          in <strong>{subreddit?.data?.attributes?.name || 'Unknown'}</strong>
        </p>
  
        <div
          className="prose prose-lg my-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
  
        <hr className="my-6" />
  
        <h2 className="text-xl font-semibold mb-4">💬 Comments</h2>
        {comments?.data?.length > 0 ? (
          <ul className="space-y-3">
            {comments.data.map((comment) => (
              <li key={comment.id} className="border rounded p-3 bg-gray-50">
                {comment.attributes.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </main>
    );
  }
  