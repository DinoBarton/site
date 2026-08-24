import { useEffect, useState } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function fetchJson(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

function AdminLogin({ isAdmin, onLoginChange }) {
  const [showForm, setShowForm] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [needsSecurityKey, setNeedsSecurityKey] = useState(false)
  const [hasSecurityKey, setHasSecurityKey] = useState(true)
  const [registerMessage, setRegisterMessage] = useState('')

  useEffect(() => {
    fetchJson('/api/admin/me')
      .then((data) => setHasSecurityKey(Boolean(data.hasSecurityKey)))
      .catch(() => {})
  }, [])

  const submitLogin = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const data = await fetchJson('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })

      setPassword('')

      if (data.requiresSecurityKey) {
        setNeedsSecurityKey(true)
        await completeSecurityKeyLogin()
        return
      }

      setShowForm(false)
      onLoginChange(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const completeSecurityKeyLogin = async () => {
    setError('')
    try {
      const options = await fetchJson('/api/admin/webauthn/login-options', { method: 'POST' })
      const assertion = await startAuthentication({ optionsJSON: options })
      await fetchJson('/api/admin/webauthn/login-verify', {
        method: 'POST',
        body: JSON.stringify(assertion),
      })

      setNeedsSecurityKey(false)
      setShowForm(false)
      onLoginChange(true)
    } catch {
      setError('Security key verification failed')
    }
  }

  const registerSecurityKey = async () => {
    setRegisterMessage('')
    setError('')
    try {
      const options = await fetchJson('/api/admin/webauthn/register-options', { method: 'POST' })
      const attestation = await startRegistration({ optionsJSON: options })
      const result = await fetchJson('/api/admin/webauthn/register-verify', {
        method: 'POST',
        body: JSON.stringify(attestation),
      })

      setRegisterMessage(
        `Add these to server/.env, then restart the server:\n` +
          `ADMIN_WEBAUTHN_CREDENTIAL_ID=${result.credentialId}\n` +
          `ADMIN_WEBAUTHN_PUBLIC_KEY=${result.publicKey}\n` +
          `ADMIN_WEBAUTHN_TRANSPORTS=${result.transports.join(',')}`
      )
    } catch {
      setError('Security key registration failed')
    }
  }

  const logout = async () => {
    await fetch(`${API_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    onLoginChange(false)
  }

  if (isAdmin) {
    return (
      <div className="admin-login-controls">
        <button type="button" onClick={logout}>admin logout</button>
        {!hasSecurityKey && (
          <button type="button" onClick={registerSecurityKey}>register security key</button>
        )}
        {registerMessage && <pre className="admin-register-message">{registerMessage}</pre>}
      </div>
    )
  }

  if (!showForm) {
    return (
      <button type="button" onClick={() => setShowForm(true)}>
        admin login
      </button>
    )
  }

  if (needsSecurityKey) {
    return (
      <div className="admin-login-form">
        <p>Touch your security key to finish logging in.</p>
        <button type="button" onClick={completeSecurityKeyLogin}>retry</button>
        {error && <p className="admin-login-error">{error}</p>}
      </div>
    )
  }

  return (
    <form className="admin-login-form" onSubmit={submitLogin}>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="password"
        autoFocus
      />
      <button type="submit">log in</button>
      {error && <p className="admin-login-error">{error}</p>}
    </form>
  )
}

export default AdminLogin
