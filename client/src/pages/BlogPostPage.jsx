import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function BlogPostPage({ identifier, previewToken }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setPost(null)
    setError('')
    const endpoint = previewToken
      ? `${API_URL}/api/blog/preview/${encodeURIComponent(previewToken)}`
      : `${API_URL}/api/blog/${encodeURIComponent(identifier)}`
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error('Post not found')
        return response.json()
      })
      .then(async (data) => {
        setPost(data)
        if (!previewToken) {
          const viewKey = `dinolibre-viewed-${data._id}`
          if (!sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, '1')
            fetch(`${API_URL}/api/blog/${encodeURIComponent(identifier)}/view`, { method: 'POST' }).catch(() => {})
          }
        }
      })
      .catch((loadError) => setError(loadError.message))
  }, [identifier, previewToken])

  if (error) {
    return (
      <>
        <h2>post unavailable</h2>
        <p>{error}</p>
        <a href="#blog">back to blog</a>
      </>
    )
  }

  if (!post) return <p>loading post...</p>

  return (
    <article className="blog-post-page">
      <a href="#blog">&larr; back to blog</a>
      {previewToken && <div className="blog-preview-banner">draft preview</div>}
      <h2>{post.title}</h2>
      {post.featuredImage?.url && <img className="blog-featured-image" src={post.featuredImage.url} alt={post.featuredImage.alt || ''} />}
      <small>
        <time className="blog-date" dateTime={post.publishedAt || post.createdAt}>
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
        </time>
        {' · '}<span className="blog-number">{post.readingTimeMinutes}</span> min read
        {' · '}<span className="blog-number">{post.viewCount || 0}</span> views
        {post.category && ` · ${post.category}`}
      </small>
      <div className="blog-markdown"><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown></div>
      {post.tags?.length > 0 && <div className="blog-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
      {post.relatedPosts?.length > 0 && (
        <section className="related-posts">
          <h3>related posts</h3>
          {post.relatedPosts.map((related) => (
            <a key={related._id} href={`#blog/${related.slug || related._id}`}>
              {related.title} <small><span className="blog-number">{related.readingTimeMinutes}</span> min read</small>
            </a>
          ))}
        </section>
      )}
    </article>
  )
}

export default BlogPostPage
