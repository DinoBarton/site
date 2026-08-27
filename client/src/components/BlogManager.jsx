import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function BlogManager() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/blog/admin`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to load blog manager')
      setPosts(await response.json())
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setStatus('draft')
    setEditingId(null)
    setError('')
  }

  const startEditing = (post) => {
    setEditingId(post._id)
    setTitle(post.title)
    setContent(post.content)
    setStatus(post.status || 'published')
    setError('')
  }

  const submitPost = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required')
      return
    }

    const isEditing = Boolean(editingId)
    const response = await fetch(
      isEditing ? `${API_URL}/api/blog/${editingId}` : `${API_URL}/api/blog`,
      {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent, status }),
      },
    )
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(data.message || 'Failed to save post')
      return
    }

    resetForm()
    loadPosts()
  }

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return

    const response = await fetch(`${API_URL}/api/blog/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message || 'Failed to delete post')
      return
    }
    loadPosts()
  }

  return (
    <section className="blog-manager">
      <h3>manage posts</h3>
      <form className="blog-form" onSubmit={submitPost}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="post title"
          maxLength={200}
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="post content"
          rows={5}
        />
        <label className="blog-status-field">
          status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <div className="blog-form-actions">
          <button type="submit">{editingId ? 'update post' : 'save post'}</button>
          {editingId && <button type="button" onClick={resetForm}>cancel</button>}
        </div>
        {error && <p className="admin-login-error">{error}</p>}
      </form>

      <div className="blog-manager-list">
        <h4>all posts</h4>
        {isLoading && <p>loading posts...</p>}
        {!isLoading && posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post) => (
          <div className="blog-manager-row" key={post._id}>
            <div>
              <strong>{post.title}</strong>
              <span className={`blog-status blog-status-${post.status || 'published'}`}>
                {post.status || 'published'}
              </span>
            </div>
            <div className="blog-post-actions">
              <button type="button" onClick={() => startEditing(post)}>edit</button>
              <button type="button" onClick={() => deletePost(post._id)}>delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BlogManager
