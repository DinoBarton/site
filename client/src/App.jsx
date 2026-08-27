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
}

function getPageFromLocation() {
  const page = window.location.hash.slice(1).split('/')[0]
  return pageComponents[page] ? page : 'home'
}

function getPostIdentifier() {
  return window.location.hash.slice(1).split('/')[1] || ''
}

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromLocation)
  const [visitCounts, setVisitCounts] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [postIdentifier, setPostIdentifier] = useState(getPostIdentifier)
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('dinolibre-theme') === 'light'
  })

  useTypewriterTitle(TAB_TITLES, { typeSpeed: 150, pauseTime: 3000 })

  useEffect(() => {
    document.documentElement.dataset.theme = isLightMode ? 'light' : 'dark'
    localStorage.setItem('dinolibre-theme', isLightMode ? 'light' : 'dark')
  }, [isLightMode])

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
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigation = (event, page) => {
    event.preventDefault()
    window.location.assign(`#${page}`)
  }

  const Page = currentPage === 'blog' && postIdentifier
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
      visitCounts={visitCounts}
    >
      <Page isAdmin={isAdmin} identifier={postIdentifier} />
    </AppLayout>
  )
}

export default App
