import { useEffect, useState } from 'react'
import './App.css'
import { useTypewriterTitle } from './hooks/useTypewriterTitle'
import Guestbook from './components/Guestbook'
import Blog from './components/Blog'
import AdminLogin from './components/AdminLogin'

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

function App() {
  const [londonTime, setLondonTime] = useState(formatLondonTime)
  const [weatherTheme, setWeatherTheme] = useState('weather-default')
  const [currentPage, setCurrentPage] = useState('home')
  const [visitCounts, setVisitCounts] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useTypewriterTitle(TAB_TITLES, { typeSpeed: 150, pauseTime: 3000 })

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

  const pageContent = {
    home: {
      title: 'welcome to my website',
      lines: [
        'placeholder',
        'placeholder',
      ],
    },
    about: {
      title: 'about me',
      lines: [
        'placeholder',
        'placeholder',
      ],
    },
    blog: {
      title: 'blog',
      lines: [
        'placeholder',
        'placeholder',
      ],
    },
    projects: {
      title: 'projects',
      lines: [
        'placeholder',
        'placeholder',
      ],
    },
    links: {
      title: 'links',
      lines: [
        'placeholder',
        'placeholder',
      ],
    },
    contact: {
      title: 'contact',
      lines: [
        'placeholder',
        'placeholder',
      ],
    },
  }

  return (
    <div className="site-shell">
      <div className="mobile-nav-component">
        <div className="topnav box">
          <a href="#" className="logo">
            Dino's corner
          </a>
        </div>
      </div>

      {/*<header id="header-component">
        <div className="header box">
          <h1>Welcome to my Website</h1>
        </div>
      </header>*/} 

      <div className="content">
        <aside id="left-sidebar-component">
          <div className="leftbar">
            <div className="side-box box">
              <h2>navigation</h2>
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault()
                        setCurrentPage(item.id)
                      }}
                      aria-current={currentPage === item.id ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="side-box box">
              <h2>status</h2>
              <p>working on layout tests</p>
            </div>

            <div className="side-box box">
              <h2>changelog</h2>
              <p>updates</p>
            </div>
          </div>
        </aside>

        <main id="home" className="main box">
          <div className="welcome-post">
            {currentPage === 'guestbook' ? (
              <>
                <h2>guestbook</h2>
                <Guestbook />
              </>
            ) : currentPage === 'blog' ? (
              <>
                <h2>blog</h2>
                <hr />
                <Blog isAdmin={isAdmin} />
              </>
            ) : (
              <>
                <h2>{pageContent[currentPage].title}</h2>
                {pageContent[currentPage].lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </>
            )}
          </div>
        </main>

        <aside id="right-sidebar-component">
          <div className="rightbar">
            <div className="side-box box">
              <h2>style</h2>
              <p>style placeholder</p>
            </div>
            <div className="side-box box">
              <h2>buttons area</h2>
              <p>widget placeholders</p>
            </div>
            <div className={`side-box box my-time ${weatherTheme}`}>
              <h2>my time (London)</h2>
              <p>{londonTime}</p>
            </div>

            <div className="side-box box admin-box">
              <h2>admin</h2>
              <AdminLogin isAdmin={isAdmin} onLoginChange={setIsAdmin} />
            </div>
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
  )
}

export default App
