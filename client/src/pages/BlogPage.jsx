import Blog from '../components/Blog'

function BlogPage({ isAdmin }) {
  return (
    <>
      <h2>blog</h2>
      <hr />
      <Blog isAdmin={isAdmin} />
    </>
  )
}

export default BlogPage
