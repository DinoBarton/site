import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Guestbook() {
  const [entries, setEntries] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    fetch(`${API_URL}/api/guestbook`)
      .then((res) => res.json())
      .then(setEntries)
      .catch((error) => console.error(error))
  }, [])

  const submitEntry = async (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()
    if (!trimmedName || !trimmedMessage) return

    setStatus('submitting')
    try {
      const response = await fetch(`${API_URL}/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      })
      const entry = await response.json()
      setEntries((prev) => [entry, ...prev])
      setName('')
      setMessage('')
      setStatus('idle')
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  return (
    <div className="guestbook">
      <form className="guestbook-form" onSubmit={submitEntry}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="your name"
          maxLength={40}
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="leave a message..."
          maxLength={500}
          rows={3}
        />
        <button type="submit" disabled={status === 'submitting'}>
          sign guestbook
        </button>
      </form>

      <div className="guestbook-entries">
        {entries.length === 0 && <p>No entries yet, be the first to sign!</p>}
        {entries.map((entry) => (
          <div key={entry._id} className="guestbook-entry">
            <strong>{entry.name}</strong>
            <p>{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Guestbook
