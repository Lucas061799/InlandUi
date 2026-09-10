/* Prototype mode — a way to walk the flow without filling it in.

   Every step keeps its real completeness rules: `stepCompletion` still runs,
   the inline hints still appear, Continue still knows whether the step is
   actually done. This flag only stops that answer from *blocking* the
   button, so a demo can move at the speed of a click.

   Kept in localStorage rather than React state so it survives a reload —
   losing it on every refresh is exactly the friction it exists to remove —
   and broadcast on a window event so the sidebar toggle and the Continue
   button stay in step without threading a prop through every page. */

import { useCallback, useEffect, useState } from 'react'

const KEY = 'im-prototype-mode'
const EVENT = 'im-prototype-mode-change'

export function isPrototypeMode() {
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    /* Private windows and blocked site data throw on access. */
    return false
  }
}

export function setPrototypeMode(on) {
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    /* Not being able to remember it is survivable; the event still fires,
       so the session itself still switches. */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: !!on }))
}

export function usePrototypeMode() {
  const [on, setOn] = useState(isPrototypeMode)

  useEffect(() => {
    const sync = () => setOn(isPrototypeMode())
    window.addEventListener(EVENT, sync)
    /* `storage` fires in the *other* tabs, so a second window follows too. */
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback(() => setPrototypeMode(!isPrototypeMode()), [])

  return [on, setPrototypeMode, toggle]
}
