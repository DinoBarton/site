import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const REFRESH_INTERVAL_MS = 5 * 60 * 1000

function Changelog() {
  const [latestCommit, setLatestCommit] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchLatestCommit = async () => {
      try {
        const response = await fetch(`${API_URL}/api/github/latest`)
        if (!response.ok) throw new Error('Failed to fetch the latest GitHub commit')

        const data = await response.json()
        if (isMounted) setLatestCommit(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchLatestCommit()
    const refreshId = window.setInterval(fetchLatestCommit, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(refreshId)
    }
  }, [])

  if (!latestCommit) return <p>loading updates...</p>

  return (
    <div className="changelog">
      <a href={latestCommit.url} target="_blank" rel="noreferrer">
        {latestCommit.message}
      </a>
      {latestCommit.date && (
        <time dateTime={latestCommit.date}>
          <span className="numeric-value">
            {new Date(latestCommit.date).toLocaleDateString()}
          </span>
        </time>
      )}
    </div>
  )
}

export default Changelog