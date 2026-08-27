import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function GuestbookManager() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [entryToDelete, setEntryToDelete] = useState(null)

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/guestbook/admin`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to load guestbook entries')
      setEntries(await response.json())
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const deleteEntry = async (id) => {
    const response = await fetch(`${API_URL}/api/guestbook/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message || 'Failed to delete entry')
      return
    }
    setEntryToDelete(null)
    loadEntries()
  }

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <h3>guestbook moderation</h3>
        <span>{entries.length} entries</span>
      </div>
      {error && <p className="admin-login-error">{error}</p>}
      {isLoading && <p>loading entries...</p>}
      {!isLoading && entries.length === 0 && <p>No guestbook entries.</p>}
      <div className="admin-entry-list">
        {entries.map((entry) => (
          <div className="admin-entry-row" key={entry._id}>
            <div>
              <strong>{entry.name}</strong>
              <small>{new Date(entry.createdAt).toLocaleString()}</small>
              <p>{entry.message}</p>
            </div>
            <button type="button" onClick={() => setEntryToDelete(entry)}>delete</button>
          </div>
        ))}
      </div>
      {entryToDelete && (
        <div className="confirm-dialog-backdrop" role="presentation">
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-entry-title">
            <h4 id="delete-entry-title">delete entry?</h4>
            <p>This will permanently remove the message from {entryToDelete.name}.</p>
            <div className="blog-form-actions">
              <button type="button" onClick={() => deleteEntry(entryToDelete._id)}>delete</button>
              <button type="button" onClick={() => setEntryToDelete(null)}>cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default GuestbookManager
