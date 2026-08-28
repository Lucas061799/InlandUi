import { useEffect, useMemo, useRef, useState } from 'react'
import { useClickAway } from './useClickAway'
import { CARRIERS, CLASSES, searchClasses } from '../../data/inland'

/* The one class picker in the app. Page zero asks it first; step 1 opens the
   same control in place when an agent realises the class is wrong, so
   changing it never costs them the answers they have already given.

   Pass `value` (a class object) to run it as a combobox: the chosen class
   sits in the field the way a select's answer does, rather than replacing the
   field with a card. Without `value` it stays a plain search box.

   Either way the list opens on click and holds every class, so an agent who
   does not know the trade's wording can scroll for it; typing narrows the
   same list. Clicking away keeps whatever was already chosen. */
export default function ClassSearch({ label, value = null, onChoose, onCancel, error = false, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)

  /* Leaving the field is not an answer — drop the half-typed search and put
     the class that is actually chosen back on screen. */
  const reset = () => { setOpen(false); setEditing(false); setQuery('') }
  useClickAway(ref, reset)

  /* An empty box is the whole catalogue rather than nothing — that is what
     makes the control scrollable as well as searchable. */
  const results = useMemo(() => (query.trim() ? searchClasses(query) : CLASSES), [query])
  const filled = !!value && !editing

  /* Open on the class they already picked rather than at A, so the list
     starts where they left off. */
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const currentRef = useRef(null)
  useEffect(() => {
    if (!open || !currentRef.current) return
    currentRef.current.scrollIntoView({ block: 'center' })
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-end justify-between gap-4 mb-1.5">
        {label && (
          <label className="block text-[13px] font-semibold text-gray-600 tracking-wide">
            {label}<span className="text-red-400 ml-0.5">*</span>
          </label>
        )}
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[12px] font-semibold text-gray-400 hover:text-gray-600 transition">
            Cancel
          </button>
        )}
      </div>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          value={filled ? value.name : query}
          /* Opening clears the box rather than seeding it with the current
             name: a seeded name filters the list down to the one class they
             already have, which is the opposite of browsing. */
          onFocus={() => { setEditing(true); setOpen(true) }}
          onMouseDown={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setEditing(true); setOpen(true) }}
          onKeyDown={(e) => { if (e.key === 'Escape') { reset(); e.currentTarget.blur() } }}
          placeholder="Start typing a trade, for example: plumbing"
          className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
            filled ? 'text-gray-900' : 'text-gray-800'
          } ${
            error
              ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 bg-white focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300'
          }`}
        />
        {/* The chevron is the promise that there is a list behind the box,
            not just a search that needs the right word first. */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Hide classes' : 'Show all classes'}
          onClick={() => (open ? reset() : inputRef.current?.focus())}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded"
        >
          <svg className="w-4 h-4 transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: open ? '#7C3AED' : '#9CA3AF' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {open && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-40 bop-select-dropdown"
            style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
          >
            <div ref={listRef} className="overflow-y-auto overscroll-contain" style={{ maxHeight: '260px' }}>
              {results.length === 0 && (
                <p className="px-3.5 py-3 text-sm text-gray-400">
                  No class matches “{query}”. Try the trade rather than the job title.
                </p>
              )}
              {results.map(c => {
                const current = value && c.id === value.id
                return (
                  <button
                    key={c.id}
                    ref={current ? currentRef : undefined}
                    type="button"
                    onClick={() => { onChoose(c.id); reset() }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all"
                    style={{ background: current ? '#F5F3FF' : 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = current ? '#EDE9FE' : '#F9FAFB' }}
                    onMouseLeave={e => { e.currentTarget.style.background = current ? '#F5F3FF' : 'transparent' }}
                  >
                    {/* The tint behind the row marks the current class on its
                        own — bolding the label as well made it shout. */}
                    <span className={`text-sm truncate ${current ? 'text-gray-900' : 'text-gray-700'}`}>{c.name}</span>
                    <span className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[11px] font-mono text-gray-400">{c.id}</span>
                      <span className={`text-[11px] font-semibold ${c.carriers.length > 1 ? 'text-gray-500' : 'text-gray-300'}`}>
                        {c.carriers.length}/{CARRIERS.length}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* The line under the field carries whatever is useful now: what the
          chosen class is worth, or how much there is to search. */}
      <p className="text-[11px] text-gray-400 mt-1">
        {filled
          ? `${value.id} · ${value.carriers.length} of ${CARRIERS.length} carriers write this`
          : `${CLASSES.length} classes available`}
      </p>


    </div>
  )
}
