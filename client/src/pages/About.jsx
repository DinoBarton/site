function About() {
  return (
    <section className="about-section">
      <div className="about-copy">
        <h2>about me</h2>
        <p>
          Hello! my name is Dino and I am a programmer based in London. I am Spanish-Colombian 🇪🇸 🇨🇴 
        </p>
        <p>
          Currently Im studying A-levels doing Maths, Further Maths, Computer Science and Physics.
        </p>
        <details className="education-section">
          <summary>
            <span className="education-heading">education</span>
            <span className="education-summary">view 11 GCSE grades</span>
          </summary>
          <div className="education-list">
            <div className="education-row">
              <span>GCSE Maths</span>
              <strong>Grade 9</strong>
            </div>
            <div className="education-row">
              <span>GCSE Computer Science</span>
              <strong>Grade 9</strong>
            </div>
            <div className="education-row">
              <span>GCSE Spanish</span>
              <strong>Grade 8</strong>
            </div>
            <div className="education-row">
              <span>GCSE Physics</span>
              <strong>Grade 7</strong>
            </div>
            <div className="education-row">
              <span>GCSE Further Maths</span>
              <strong>Grade 7</strong>
            </div>
            <div className="education-row">
              <span>GCSE Biology</span>
              <strong>Grade 7</strong>
            </div>
            <div className="education-row">
              <span>GCSE Design & Technology</span>
              <strong>Grade 7</strong>
            </div>
            <div className="education-row">
              <span>GCSE Business</span>
              <strong>Grade 7</strong>
            </div>
            <div className="education-row">
              <span>GCSE Chemistry</span>
              <strong>Grade 6</strong>
            </div>
            <div className="education-row">
              <span>GCSE English Language</span>
              <strong>Grade 6</strong>
            </div>
            <div className="education-row">
              <span>GCSE English Literature</span>
              <strong>Grade 6</strong>
            </div>
          </div>
        </details>
      </div>
      <img
        className="about-portrait"
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=360&q=85"
        alt="Temporary stock image of a circuit board"
      />
    </section>
  )
}

export default About
