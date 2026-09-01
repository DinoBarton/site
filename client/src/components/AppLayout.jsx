import AdminLogin from './AdminLogin'
import ParticlesBackground from './ParticlesBackground'
import SystemStats from './SystemStats'
import Ticker from './Ticker'
import WeatherWidget from './WeatherWidget'

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
  visitCounts,
}) {
  return (
    <>
      <ParticlesBackground />
      <div className="site-shell">
        <div className="topnav">
          <a href="#home" className="logo">
            <h1>{'DINOLIBRE.COM'}</h1>
          </a>
        </div>

        <Ticker />

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
                <p>working on layout tests</p>
              </fieldset>

              <fieldset className="side-box box">
                <legend>changelog</legend>
                <p>updates</p>
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
              </fieldset>

              <fieldset className="side-box box">
                <legend>buttons area</legend>
                <p>widget placeholders</p>
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
          <footer className="footer box">© Dino</footer>
        </div>
      </div>
    </>
  )
}

export default AppLayout
