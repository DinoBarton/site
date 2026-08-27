import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Blog() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load posts')
        return res.json()
      })
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="blog">
      <div className="blog-posts">
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post) => (
          <article key={post._id} className="blog-card">
            <h3>{post.title}</h3>
            <small>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</small>
            <p>{post.content.slice(0, 180)}{post.content.length > 180 ? '...' : ''}</p>
            <a href={`#blog/${post.slug || post._id}`}>read post</a>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog
