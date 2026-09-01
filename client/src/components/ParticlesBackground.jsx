import { useEffect, useState } from 'react'

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
  const [fps, setFps] = useState(null)
  const [particlesDisabled, setParticlesDisabled] = useState(false)

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

  useEffect(() => {
    let frameId
    let windowStart = performance.now()
    let frameCount = 0
    let lowFpsWindows = 0
    let stopped = false

    const measure = (timestamp) => {
      frameCount += 1
      const elapsed = timestamp - windowStart

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / elapsed)
        setFps(currentFps)
        lowFpsWindows = currentFps < 40 ? lowFpsWindows + 1 : 0

        if (lowFpsWindows >= 3 && !stopped) {
          const particleInstance = window.pJSDom?.[0]?.pJS
          particleInstance?.fn?.vendors?.destroypJS()
          stopped = true
          setParticlesDisabled(true)
        }

        windowStart = timestamp
        frameCount = 0
      }

      if (!stopped) frameId = requestAnimationFrame(measure)
    }

    frameId = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <>
      <div id="particles-js" className="particles-background" />
      <div className="fps-counter" aria-live="polite">
        {particlesDisabled ? 'particles off' : `fps: ${fps ?? '--'}`}
      </div>
    </>
  )
}

export default ParticlesBackground
