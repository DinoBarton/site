function Contact() {
  return (
    <>
      <h2>contact</h2>
      <p>I'm open to conversations, ideas, and interesting projects.</p>
      <p>
        Email: <a href="mailto:DinoBarton@protonmail.com">DinoBarton@protonmail.com</a>
      </p>
      <p className="contact-row">
        <a href="https://github.com/DinoBarton" target="_blank" rel="noreferrer" className="contact-link">
          <svg className="contact-icon" aria-hidden="true" focusable="false"><use href="/icons.svg#github-icon" /></svg>
          <span>GitHub: DinoBarton</span>
        </a>
      </p>
      <p className="contact-row contact-link">
        <svg className="contact-icon" aria-hidden="true" focusable="false"><use href="/icons.svg#discord-icon" /></svg>
        <span>Discord: @insurgent_dino</span>
      </p>
    </>
  )
}

export default Contact
