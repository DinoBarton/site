import Blog from '../components/Blog'
import rssLogo from '../assets/RSS.png'

function BlogPage() {
  return (
    <>
      <div className="blog-page-heading">
        <h2>blog</h2>
        <a className="rss-icon" href="/api/blog/rss.xml" aria-label="Subscribe to the blog RSS feed" title="Subscribe via RSS">
          <img src={rssLogo} alt="" aria-hidden="true" />
        </a>
      </div>
      <hr />
      <Blog />
    </>
  )
}

export default BlogPage
