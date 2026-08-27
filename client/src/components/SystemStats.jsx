import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatMemory(bytes) {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function UsageRing({ label, value, color }) {
  return (
    <div className="usage-ring-wrap">
      <div
        className="usage-ring"
        style={{ '--usage': `${value}%`, '--ring-color': color }}
        aria-label={`${label} usage ${value}%`}
      >
        <span>{value}%</span>
      </div>
      <strong>{label}</strong>
    </div>
  )
}

function SystemStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/system-stats`)
        if (!response.ok) throw new Error('System stats request failed')
        const data = await response.json()
        if (isMounted) setStats(data)
      } catch (error) {
        console.error(error)
      }
    }

    loadStats()
    const timer = setInterval(loadStats, 5000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  return (
    <fieldset className="side-box box system-stats">
      <legend>system monitor</legend>
      {stats ? (
        <>
          <div className="usage-rings">
            <UsageRing label="CPU" value={stats.cpu} color="#a020f0" />
            <UsageRing label="RAM" value={stats.ram} color="#d59b28" />
          </div>
          <p>{formatMemory(stats.usedMemory)} / {formatMemory(stats.totalMemory)}</p>
        </>
      ) : (
        <p>reading system...</p>
      )}
    </fieldset>
  )
}

export default SystemStats
