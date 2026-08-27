import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function BlogPostPage({ identifier }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setPost(null)
    setError('')
    fetch(`${API_URL}/api/blog/${encodeURIComponent(identifier)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Post not found')
        return response.json()
      })
      .then(setPost)
      .catch((loadError) => setError(loadError.message))
  }, [identifier])

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
      <h2>{post.title}</h2>
      <small>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</small>
      {post.content.split(/\n\s*\n/).map((paragraph, index) => (
        <p key={`${post._id}-${index}`}>{paragraph}</p>
      ))}
    </article>
  )
}

export default BlogPostPage
