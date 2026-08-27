import { useEffect, useState } from 'react'
import './App.css'
import { useTypewriterTitle } from './hooks/useTypewriterTitle'
import AdminLogin from './components/AdminLogin'
import ParticlesBackground from './components/ParticlesBackground'
import Ticker from './components/Ticker'
import About from './pages/About'
import BlogPage from './pages/BlogPage'
import Contact from './pages/Contact'
import GuestbookPage from './pages/GuestbookPage'
import Home from './pages/Home'
import Links from './pages/Links'
import Projects from './pages/Projects'

const TAB_TITLES = ['Dinos website', 'welcome!']

function formatLondonTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date())
}

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
  const page = window.location.hash.slice(1)
  return pageComponents[page] ? page : 'home'
}

function App() {
  const [londonTime, setLondonTime] = useState(formatLondonTime)
  const [weatherTheme, setWeatherTheme] = useState('weather-default')
  const [currentPage, setCurrentPage] = useState(getPageFromLocation)
  const [visitCounts, setVisitCounts] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
    const timer = setInterval(() => {
      setLondonTime(formatLondonTime())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const weatherMap = {
      clear: { theme: 'weather-clear' },
      partlyCloudy: { theme: 'weather-cloudy' },
      cloudy: { theme: 'weather-cloudy' },
      fog: { theme: 'weather-fog' },
      rain: { theme: 'weather-rain' },
      snow: { theme: 'weather-snow' },
      thunder: { theme: 'weather-thunder' },
      unknown: { theme: 'weather-default' },
    }

    const getWeatherFromCode = (code) => {
      if (code === 0) return weatherMap.clear
      if ([1, 2].includes(code)) return weatherMap.partlyCloudy
      if (code === 3) return weatherMap.cloudy
      if ([45, 48].includes(code)) return weatherMap.fog
      if (
        [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
      ) {
        return weatherMap.rain
      }
      if ([71, 73, 75, 77, 85, 86].includes(code)) return weatherMap.snow
      if ([95, 96, 99].includes(code)) return weatherMap.thunder
      return weatherMap.unknown
    }

    const loadWeather = async () => {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current=weather_code&timezone=Europe%2FLondon',
      )

      if (!response.ok) {
        throw new Error(`Weather request failed: ${response.status}`)
      }

      const data = await response.json()
      const weatherCode = data?.current?.weather_code

      if (typeof weatherCode !== 'number') {
        throw new Error('Weather response missing weather code')
      }

      const weather = getWeatherFromCode(weatherCode)
      setWeatherTheme(weather.theme)
    }

    loadWeather().catch((error) => {
      setWeatherTheme('weather-default')
      console.error(error)
    })

    const weatherTimer = setInterval(() => {
      loadWeather().catch((error) => {
        setWeatherTheme('weather-default')
        console.error(error)
      })
    }, 60 * 1000)

    return () => clearInterval(weatherTimer)
  }, [])

  const navItems = [
    { id: 'home', label: 'home' },
    { id: 'about', label: 'about me' },
    { id: 'blog', label: 'blog' },
    { id: 'projects', label: 'projects' },
    { id: 'links', label: 'links' },
    { id: 'contact', label: 'contact' },
    { id: 'guestbook', label: 'guestbook' },
  ]

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromLocation())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigation = (event, page) => {
    event.preventDefault()
    window.location.hash = page
  }

  const Page = pageComponents[currentPage]

  return (
    <>
      <ParticlesBackground />
      <div className="site-shell">
        <div className="topnav">
          <a href="#home" className="logo">
            <h1>{'>> DINO\'S WEBSITE'}</h1>
          </a>
      </div>

      <Ticker />

      {/*<header id="header-component">
        <div className="header box">
          <h1>Welcome to my Website</h1>
        </div>
      </header>*/} 

      <div className="content">
        <aside id="left-sidebar-component">
          <div className="leftbar">
            <fieldset className="side-box box">
              <legend>navigation</legend>
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => handleNavigation(event, item.id)}
                      aria-current={currentPage === item.id ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </fieldset>

            <fieldset className="side-box box">
              <legend>status</legend>
              <p>working on layout tests</p>
            </fieldset>

            <fieldset className="side-box box">
              <legend>changelog</legend>
              <p>updates</p>
            </fieldset>
          </div>
        </aside>

        <main id="home" className="main box">
          <div className="welcome-post">
            <Page isAdmin={isAdmin} />
          </div>
        </main>

        <aside id="right-sidebar-component">
          <div className="rightbar">
            <fieldset className="side-box box">
              <legend>style</legend>
              <label className="theme-toggle">
                <span>light mode</span>
                <input
                  type="checkbox"
                  checked={isLightMode}
                  onChange={(event) => setIsLightMode(event.target.checked)}
                />
                <span className="theme-switch" aria-hidden="true" />
              </label>
            </fieldset>
            <fieldset className="side-box box">
              <legend>buttons area</legend>
              <p>widget placeholders</p>
            </fieldset>
            <fieldset className={`side-box box my-time ${weatherTheme}`}>
              <p>{londonTime}</p>
            </fieldset>

            <fieldset className="side-box box admin-box">
              <legend>admin</legend>
              <AdminLogin isAdmin={isAdmin} onLoginChange={setIsAdmin} />
            </fieldset>
          </div>
        </aside>
      </div>

      <div className="bottom">
        <div className="visitcount box">
          {visitCounts ? (
            <>
              <span>total visits: {visitCounts.totalVisits}</span>
              <span>unique visitors: {visitCounts.uniqueVisitors}</span>
            </>
          ) : (
            'loading visitor count...'
          )}
        </div>
        <footer className="footer box">© Dino</footer>
      </div>
    </div>
    </>
  )
}

export default App
