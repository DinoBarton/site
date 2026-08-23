import { useEffect } from 'react'

/**
 * Cycles the browser tab title through a list of strings, typing and
 * deleting each one like a typewriter.
 */
export function useTypewriterTitle(
  strings,
  { typeSpeed = 90, deleteSpeed = 45, pauseTime = 1500 } = {},
) {
  useEffect(() => {
    if (!strings || strings.length === 0) return undefined

    const originalTitle = document.title
    let stringIndex = 0
    let charIndex = 0
    let deleting = false
    let timeoutId

    const tick = () => {
      const current = strings[stringIndex]
      charIndex += deleting ? -1 : 1
      document.title = current.slice(0, charIndex)

      let delay = deleting ? deleteSpeed : typeSpeed

      if (!deleting && charIndex === current.length) {
        deleting = true
        delay = pauseTime
      } else if (deleting && charIndex === 0) {
        deleting = false
        stringIndex = (stringIndex + 1) % strings.length
        delay = typeSpeed
      }

      timeoutId = setTimeout(tick, delay)
    }

    timeoutId = setTimeout(tick, typeSpeed)

    return () => {
      clearTimeout(timeoutId)
      document.title = originalTitle
    }
  }, [strings, typeSpeed, deleteSpeed, pauseTime])
}
