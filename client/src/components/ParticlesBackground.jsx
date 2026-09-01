import { useEffect } from 'react'

const PARTICLES_CONFIG = {
  particles: {
    number: { value: 128, density: { enable: true, value_area: 800 } },
    color: { value: '#524C42' },
    shape: { type: 'circle' },
    opacity: { value: 0.4, random: true },
    size: { value: 3, random: true },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#aaaaaa',
      opacity: 0.3,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
    },
  },
  interactivity: {
    detect_on: 'window',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' },
      resize: true,
    },
    modes: {
      grab: { distance: 200, line_linked: { opacity: 0.8 } },
      push: { particles_nb: 3 },
    },
  },
  retina_detect: true,
}

function ParticlesBackground() {
  useEffect(() => {
    let cancelled = false

    // particles.js relies on arguments.callee, so it must run as a classic
    // (non-module, non-strict) script rather than being bundled/imported.
    const initParticles = () => {
      if (!cancelled && window.particlesJS) {
        window.particlesJS('particles-js', PARTICLES_CONFIG)
      }
    }

    const existingScript = document.querySelector('script[data-particles-js]')
    if (existingScript) {
      if (window.particlesJS) {
        initParticles()
      } else {
        existingScript.addEventListener('load', initParticles)
      }
    } else {
      const script = document.createElement('script')
      script.src = '/vendor/particles.js'
      script.dataset.particlesJs = 'true'
      script.onload = initParticles
      document.body.appendChild(script)
    }

    return () => {
      cancelled = true
    }
  }, [])

  return <div id="particles-js" className="particles-background" />
}

export default ParticlesBackground
