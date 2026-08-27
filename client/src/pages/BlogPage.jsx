import Blog from '../components/Blog'
import BlogManager from '../components/BlogManager'

function BlogPage({ isAdmin }) {
  return (
    <>
      <h2>blog</h2>
      <hr />
      <Blog />
      {isAdmin && <BlogManager />}
    </>
  )
}

export default BlogPage
