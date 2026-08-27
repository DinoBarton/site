import { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function BlogManager() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [featuredImageAlt, setFeaturedImageAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [postToDelete, setPostToDelete] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const imageInputRef = useRef(null)

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
    setFeaturedImageUrl('')
    setFeaturedImageAlt('')
    setIsUploading(false)
    setTags('')
    setCategory('')
    setStatus('draft')
    setEditingId(null)
    setPreviewUrl('')
    setError('')
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const uploadImage = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setError('')
    setIsUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Failed to upload image')
      setFeaturedImageUrl(data.url)
    } catch (uploadError) {
      setError(uploadError.message)
      if (imageInputRef.current) imageInputRef.current.value = ''
    } finally {
      setIsUploading(false)
    }
  }

  const startEditing = (post) => {
    setEditingId(post._id)
    setTitle(post.title)
    setContent(post.content)
    setFeaturedImageUrl(post.featuredImage?.url || '')
    setFeaturedImageAlt(post.featuredImage?.alt || '')
    setTags((post.tags || []).join(', '))
    setCategory(post.category || '')
    setStatus(post.status || 'published')
    setPreviewUrl('')
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
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          status,
          featuredImage: featuredImageUrl.trim()
            ? { url: featuredImageUrl.trim(), alt: featuredImageAlt.trim() }
            : undefined,
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          category: category.trim(),
        }),
      },
    )
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(data.message || 'Failed to save post')
      return
    }

    resetForm()
    if (data.previewToken) setPreviewUrl(`${window.location.origin}/#blog/preview/${data.previewToken}`)
    loadPosts()
  }

  const deletePost = async (id) => {
    const response = await fetch(`${API_URL}/api/blog/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message || 'Failed to delete post')
      return
    }
    setPostToDelete(null)
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
        <label className="blog-upload-field">
          featured image
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={uploadImage}
          />
          {isUploading && <small>uploading image...</small>}
          {featuredImageUrl && !isUploading && <small>image uploaded</small>}
        </label>
        <input
          type="text"
          value={featuredImageAlt}
          onChange={(event) => setFeaturedImageAlt(event.target.value)}
          placeholder="featured image description"
          maxLength={200}
        />
        <input
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="tags, separated by commas"
        />
        <input
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="category"
          maxLength={80}
        />
        <label className="blog-status-field">
          status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <div className="blog-form-actions">
          <button type="submit" disabled={isUploading}>{editingId ? 'update post' : 'save post'}</button>
          {editingId && <button type="button" onClick={resetForm}>cancel</button>}
        </div>
        {error && <p className="admin-login-error">{error}</p>}
        {previewUrl && <p className="blog-preview-link"><a href={previewUrl}>open draft preview</a></p>}
      </form>

      <div className="blog-manager-list">
        <div className="admin-section-heading">
          <h4>all posts</h4>
          <span>{posts.filter((post) => (post.status || 'published') === 'published').length} published / {posts.filter((post) => post.status === 'draft').length} drafts</span>
        </div>
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
              <button type="button" onClick={() => setPostToDelete(post)}>delete</button>
            </div>
          </div>
        ))}
      </div>

      {postToDelete && (
        <div className="confirm-dialog-backdrop" role="presentation">
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
            <h4 id="delete-post-title">delete post?</h4>
            <p>This will permanently remove &quot;{postToDelete.title}&quot;.</p>
            <div className="blog-form-actions">
              <button type="button" onClick={() => deletePost(postToDelete._id)}>delete</button>
              <button type="button" onClick={() => setPostToDelete(null)}>cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BlogManager
