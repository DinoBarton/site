import { useEffect, useState } from 'react'
import AdminLogin from './AdminLogin'
import Changelog from './Changelog'
import ParticlesBackground from './ParticlesBackground'
import StatusWidget from './StatusWidget'
import SystemStats from './SystemStats'
import Ticker from './Ticker'
import WeatherWidget from './WeatherWidget'
import cat1 from '../assets/Cat1.png'
import cat2 from '../assets/Cat2.png'

const navItems = [
  { id: 'home', label: 'home' },
  { id: 'about', label: 'about me' },
  { id: 'blog', label: 'blog' },
  { id: 'projects', label: 'projects' },
  { id: 'links', label: 'links' },
  { id: 'contact', label: 'contact' },
  { id: 'guestbook', label: 'guestbook' },
  { id: 'admin', label: 'admin dashboard' },
]

function AppLayout({
  children,
  currentPage,
  handleNavigation,
  isAdmin,
  onLoginChange,
  isLightMode,
  onThemeChange,
  isCatMode,
  onCatModeChange,
  visitCounts,
}) {
  const [isCatMounted, setIsCatMounted] = useState(isCatMode)
  const [isCatVisible, setIsCatVisible] = useState(isCatMode)

  useEffect(() => {
    if (isCatMode) {
      setIsCatMounted(true)
      requestAnimationFrame(() => setIsCatVisible(true))
    } else {
      setIsCatVisible(false)
    }
  }, [isCatMode])

  const handleCatAnimationEnd = (event) => {
    if (!isCatMode && event.animationName === 'theme-cat-disappear') {
      setIsCatMounted(false)
    }
  }

  return (
    <>
      <ParticlesBackground isLightMode={isLightMode} />
      <div className="site-shell">
        <div className="topnav">
          <a href="#home" className="logo">
            <h1>{'DINOLIBRE.COM'}</h1>
          </a>
        </div>

        <Ticker />

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            item.id !== 'admin' || isAdmin ? (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => handleNavigation(event, item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : null
          ))}
        </nav>

        <div className="content">
          <aside id="left-sidebar-component">
            <div className="leftbar">
              <fieldset className="side-box box">
                <legend>navigation</legend>
                <ul className="nav-list">
                  {navItems.map((item) => (
                    item.id !== 'admin' || isAdmin ? (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(event) => handleNavigation(event, item.id)}
                          aria-current={currentPage === item.id ? 'page' : undefined}
                        >
                          {item.label}
                        </a>
                      </li>
                    ) : null
                  ))}
                </ul>
              </fieldset>

              <fieldset className="side-box box">
                <legend>status</legend>
                <StatusWidget />
              </fieldset>

              <fieldset className="side-box box">
                <legend>changelog</legend>
                <Changelog />
              </fieldset>
            </div>
          </aside>

          <main id="home" className="main box">
            <div className="welcome-post">{children}</div>
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
                    onChange={(event) => onThemeChange(event.target.checked)}
                  />
                  <span className="theme-switch" aria-hidden="true" />
                </label>
                <label className="theme-toggle">
                  <span>cat mode</span>
                  <input
                    type="checkbox"
                    checked={isCatMode}
                    onChange={(event) => onCatModeChange(event.target.checked)}
                  />
                  <span className="theme-switch" aria-hidden="true" />
                </label>
              </fieldset>

              <WeatherWidget />

              <fieldset className="side-box box admin-box">
                <legend>admin</legend>
                <AdminLogin isAdmin={isAdmin} onLoginChange={onLoginChange} />
              </fieldset>

              <SystemStats />
            </div>
          </aside>
        </div>

        <div className="bottom">
          <div className="visitcount box">
            {visitCounts ? (
              <>
                <span>total visits: <span className="numeric-value">{visitCounts.totalVisits}</span></span>
                <span>unique visitors: <span className="numeric-value">{visitCounts.uniqueVisitors}</span></span>
              </>
            ) : (
              'loading visitor count...'
            )}
          </div>
          <footer className="footer box">
            <span>© <span className="numeric-value">{new Date().getFullYear()}</span> - Dino</span>
            <span className="footer-quote">“treat everyday as monday morning, treat every month like a January” - cench</span>
          </footer>
        </div>
      </div>
        {isCatMounted && (
          <div
            className={`theme-cat ${isCatVisible ? 'is-visible' : 'is-hiding'}`}
            onAnimationEnd={handleCatAnimationEnd}
            aria-hidden="true"
          >
            <img className="theme-cat-light" src={cat1} alt="" />
            <img className="theme-cat-dark" src={cat2} alt="" />
          </div>
        )}
    </>
  )
}

export default AppLayout
