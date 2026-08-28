import { useMemo, useRef, useState } from 'react'
import { useClickAway } from './useClickAway'
import { CARRIERS, CLASSES, searchClasses } from '../../data/inland'

/* The one class picker in the app. Page zero asks it first; step 1 opens the
   same control in place when an agent realises the class is wrong, so
   changing it never costs them the answers they have already given. */
export default function ClassSearch({ label, onChoose, onCancel, error = false, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickAway(ref, () => setOpen(false))

  const results = useMemo(() => searchClasses(query), [query])

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
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Start typing a trade, for example: plumbing"
          className={`w-full border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 bg-white focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300'
          }`}
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{CLASSES.length} classes available</p>

      {open && query.trim() && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-40 bop-select-dropdown"
          style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
            {results.length === 0 && (
              <p className="px-3.5 py-3 text-sm text-gray-400">
                No class matches “{query}”. Try the trade rather than the job title.
              </p>
            )}
            {results.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChoose(c.id); setQuery(''); setOpen(false) }}
                className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all"
                style={{ background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span className="text-sm text-gray-700 truncate">{c.name}</span>
                <span className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] font-mono text-gray-400">{c.id}</span>
                  <span className={`text-[11px] font-semibold ${c.carriers.length > 1 ? 'text-gray-500' : 'text-gray-300'}`}>
                    {c.carriers.length}/{CARRIERS.length}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
