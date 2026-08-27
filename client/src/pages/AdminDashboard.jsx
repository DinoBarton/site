import BlogManager from '../components/BlogManager'
import GuestbookManager from '../components/GuestbookManager'

function AdminDashboard({ isAdmin }) {
  if (!isAdmin) {
    return (
      <>
        <h2>admin dashboard</h2>
        <p>Sign in through the admin panel to manage the site.</p>
      </>
    )
  }

  return (
    <>
      <h2>admin dashboard</h2>
      <p>Manage posts and moderate visitor messages.</p>
      <div className="admin-dashboard">
        <BlogManager />
        <GuestbookManager />
      </div>
    </>
  )
}

export default AdminDashboard
