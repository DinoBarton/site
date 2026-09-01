import { useEffect, useState } from 'react'
import './styles/base.css'
import './styles/layout.css'
import './styles/themes.css'
import './styles/widgets.css'
import './styles/ticker.css'
import './styles/responsive.css'
import { useTypewriterTitle } from './hooks/useTypewriterTitle'
import AppLayout from './components/AppLayout'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import Contact from './pages/Contact'
import GuestbookPage from './pages/GuestbookPage'
import Home from './pages/Home'
import Links from './pages/Links'
import Projects from './pages/Projects'

const TAB_TITLES = ['Dinos website', 'welcome!']

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const pageComponents = {
  home: Home,
  about: About,
  blog: BlogPage,
  projects: Projects,
  links: Links,
  contact: Contact,
  guestbook: GuestbookPage,
  admin: AdminDashboard,
}

function getPageFromLocation() {
  const page = window.location.hash.slice(1).split('/')[0]
  return pageComponents[page] ? page : 'home'
}

function getPostIdentifier() {
  return window.location.hash.slice(1).split('/')[1] || ''
}

function getPreviewToken() {
  const [page, type, token] = window.location.hash.slice(1).split('/')
  return page === 'blog' && type === 'preview' ? token || '' : ''
}

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromLocation)
  const [visitCounts, setVisitCounts] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [postIdentifier, setPostIdentifier] = useState(getPostIdentifier)
  const [previewToken, setPreviewToken] = useState(getPreviewToken)
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('dinolibre-theme') === 'light'
  })
  const [isCatMode, setIsCatMode] = useState(() => {
    return localStorage.getItem('dinolibre-cat-mode') === 'neko'
  })

  useTypewriterTitle(TAB_TITLES, { typeSpeed: 150, pauseTime: 3000 })

  useEffect(() => {
    document.documentElement.dataset.theme = isLightMode ? 'light' : 'dark'
    localStorage.setItem('dinolibre-theme', isLightMode ? 'light' : 'dark')
  }, [isLightMode])

  useEffect(() => {
    localStorage.setItem('dinolibre-cat-mode', isCatMode ? 'neko' : 'corner')

    if (!isCatMode) {
      window.neko?.destroy()
      window.neko = null
      return undefined
    }

    const startNeko = () => {
      if (!window.neko && window.createNeko) window.neko = window.createNeko()
    }
    const existingScript = document.querySelector('script[data-neko-js]')

    if (window.createNeko) {
      startNeko()
    } else if (existingScript) {
      existingScript.addEventListener('load', startNeko, { once: true })
    } else {
      const script = document.createElement('script')
      script.src = 'https://louisabraham.github.io/nekojs/neko.js'
      script.dataset.nekoJs = 'true'
      script.onload = startNeko
      document.body.appendChild(script)
    }

    return () => {
      window.neko?.destroy()
      window.neko = null
    }
  }, [isCatMode])

  useEffect(() => {
    fetch(`${API_URL}/api/admin/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.isAdmin)))
      .catch((error) => console.error(error))
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/visits/hit`, { method: 'POST', credentials: 'include' })
      .then((res) => res.json())
      .then(setVisitCounts)
      .catch((error) => console.error(error))
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromLocation())
      setPostIdentifier(getPostIdentifier())
      setPreviewToken(getPreviewToken())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigation = (event, page) => {
    event.preventDefault()
    window.location.assign(`#${page}`)
  }

  const Page = currentPage === 'blog' && (postIdentifier || previewToken)
    ? BlogPostPage
    : pageComponents[currentPage]

  return (
    <AppLayout
      currentPage={currentPage}
      handleNavigation={handleNavigation}
      isAdmin={isAdmin}
      onLoginChange={setIsAdmin}
      isLightMode={isLightMode}
      onThemeChange={setIsLightMode}
      isCatMode={isCatMode}
      onCatModeChange={setIsCatMode}
      visitCounts={visitCounts}
    >
      <Page isAdmin={isAdmin} identifier={previewToken ? 'preview' : postIdentifier} previewToken={previewToken} />
    </AppLayout>
  )
}

export default App
