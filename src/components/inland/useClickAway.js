import { useEffect } from 'react'

/* Closes a popover when the next click lands outside it. */
export function useClickAway(ref, onAway) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onAway() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onAway])
}
