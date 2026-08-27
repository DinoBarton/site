import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Blog() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (tag) params.set('tag', tag)
    if (category) params.set('category', category)
    fetch(`${API_URL}/api/blog${params.toString() ? `?${params}` : ''}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load posts')
        return res.json()
      })
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [search, tag, category])

  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))]
  const tags = [...new Set(posts.flatMap((post) => post.tags || []))].sort()

  return (
    <div className="blog">
      <div className="blog-filters">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="search posts"
          aria-label="Search posts"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          <option value="">all categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={tag} onChange={(event) => setTag(event.target.value)} aria-label="Filter by tag">
          <option value="">all tags</option>
          {tags.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="blog-posts">
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post) => (
          <article key={post._id} className="blog-card">
            {post.featuredImage?.url && (
              <img src={post.featuredImage.url} alt={post.featuredImage.alt || ''} loading="lazy" />
            )}
            <h3>{post.title}</h3>
            <small>
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              {' · '}{post.readingTimeMinutes} min read
              {' · '}{post.viewCount || 0} views
            </small>
            {post.category && <span className="blog-category">{post.category}</span>}
            <p>{post.content.slice(0, 180)}{post.content.length > 180 ? '...' : ''}</p>
            <div className="blog-tags">{(post.tags || []).map((item) => <span key={item}>#{item}</span>)}</div>
            <a href={`#blog/${post.slug || post._id}`}>read post</a>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog
