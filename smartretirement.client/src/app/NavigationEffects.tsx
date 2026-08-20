import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Restore scroll and keyboard focus after client-side route navigation. */
export function NavigationEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })

    const frameId = window.requestAnimationFrame(() => {
      const main = document.getElementById('main-content')

      if (main !== null) {
        main.tabIndex = -1
        main.focus({ preventScroll: true })
      }
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [pathname])

  return null
}
