import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Blog({ isAdmin }) {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const loadPosts = () => {
    fetch(`${API_URL}/api/blog`)
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setEditingId(null)
    setError('')
  }

  const submitPost = async (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) return

    const isEditing = Boolean(editingId)
    const url = isEditing ? `${API_URL}/api/blog/${editingId}` : `${API_URL}/api/blog`
    const method = isEditing ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.message || 'Failed to save post')
        return
      }

      resetForm()
      loadPosts()
    } catch (err) {
      setError('Failed to save post')
    }
  }

  const startEditing = (post) => {
    setEditingId(post._id)
    setTitle(post.title)
    setContent(post.content)
  }

  const deletePost = async (id) => {
    try {
      await fetch(`${API_URL}/api/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      loadPosts()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="blog">
      {isAdmin && (
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
            rows={4}
          />
          <div className="blog-form-actions">
            <button type="submit">{editingId ? 'update post' : 'add post'}</button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                cancel
              </button>
            )}
          </div>
          {error && <p className="admin-login-error">{error}</p>}
        </form>
      )}

      <hr />

      <div className="blog-posts">
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post, index) => (
          <article key={post._id} className="blog-post">
            {index > 0 && <hr />}
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            {isAdmin && (
              <div className="blog-post-actions">
                <button type="button" onClick={() => startEditing(post)}>
                  edit
                </button>
                <button type="button" onClick={() => deletePost(post._id)}>
                  delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog
