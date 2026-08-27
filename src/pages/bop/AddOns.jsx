import { useState, useMemo } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const PACKAGE_PRICES = {
  base:     { name: 'Base',     premium: 300 },
  silver:   { name: 'Silver',   premium: 300 },
  gold:     { name: 'Gold',     premium: 300 },
  platinum: { name: 'Platinum', premium: 335 },
}

// type: 'always'   = always included, no matter the package
// type: 'package'  = bundled with the currently-selected package
// type: 'optional' = true add-on the user can toggle on (the only kind
//                    that still gets a toggle on this page)
const COVERAGES = [
  { id: 'terrorism',          name: 'Terrorism (TRIA)',                       type: 'always',
    description: 'Terrorism Risk Insurance Act coverage. Included in all Coterie BOP policies.' },
  { id: 'blanket_ai',         name: 'Blanket Additional Insured',             type: 'always',
    description: 'Primary and non-contributory additional insured coverage for contracts. Automatically included.' },
  { id: 'risk_program',       name: 'Manage My Risk Program',                 type: 'package', priceImpact: 33,
    description: "Coterie's risk management program — safety resources, risk assessment tools, and premium savings." },
  { id: 'equipment',          name: 'Equipment Breakdown',                    type: 'package', priceImpact: 12,
    description: 'Covers sudden mechanical or electrical breakdown of business equipment, HVAC, and computers.' },
  { id: 'data_theft',         name: 'Data Theft Protection',                  type: 'package', priceImpact: 18,
    description: 'Covers costs from data breaches including notification, credit monitoring, and legal defense.' },
  { id: 'cyber',              name: 'Cyber Liability',                        type: 'package', priceImpact: 25,
    description: 'Covers cyber attacks, ransomware, data loss, and business interruption from cyber events.' },
  { id: 'hnoa',               name: 'Hired & Non-Owned Auto (HNOA)',          type: 'optional', priceImpact: 15,
    description: 'Covers liability when employees drive personal or rented vehicles for business purposes.' },
  { id: 'damage_premises',    name: 'Increased Damage to Premises Rented',    type: 'optional', priceImpact: 10,
    description: 'Increases the coverage limit for damage to premises you rent — recommended for high-value leased spaces.' },
  { id: 'workplace_violence', name: 'Workplace Violence',                     type: 'optional', priceImpact: 14,
    description: 'Covers costs related to workplace violence incidents including counseling and security.' },
]

const money = (n) => '$' + n.toLocaleString()

function Toggle({ on, onClick, isDark = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-11 h-6 rounded-full relative transition shrink-0"
      style={{
        background: on
          ? BRAND_GRADIENT
          : (isDark ? 'rgba(255,255,255,0.14)' : '#D1D5DB'),
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-all"
        style={{
          left: on ? '22px' : '2px',
          background: on ? 'white' : (isDark ? '#E5E7EB' : 'white'),
        }}
      />
    </button>
  )
}

// Collapsible section card — clicking the header expands or collapses
// the body. We use this for both 'Included in Gold' and 'Optional
// Add-Ons' so the page stays short until the user opens one.
function Collapsible({ title, badge, defaultOpen = false, children, isDark = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-xl overflow-hidden transition"
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
        border: `1px solid ${
          open
            ? 'rgba(124,58,237,0.30)'
            : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')
        }`,
        boxShadow: open ? '0 2px 8px rgba(92,46,212,0.06)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 transition text-left"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{title}</span>
          {badge}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? '#9CA3AF' : '#6B7280'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Optional add-on row — the only items on this page that still toggle.
function OptionalRow({ cov, on, onToggle, last, isDark = false }) {
  return (
    <div
      className="px-4 py-3.5 transition"
      style={{
        background: on
          ? (isDark
              ? 'linear-gradient(135deg, rgba(92,46,212,0.14) 0%, rgba(166,20,195,0.14) 100%)'
              : 'linear-gradient(135deg, rgba(92,46,212,0.04) 0%, rgba(166,20,195,0.04) 100%)')
          : 'transparent',
        borderBottom: last ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-1" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{cov.name}</div>
          <p className="text-xs leading-snug" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>{cov.description}</p>
        </div>
        <div className="shrink-0 pt-0.5">
          <Toggle on={on} onClick={onToggle} isDark={isDark} />
        </div>
      </div>
    </div>
  )
}

export default function AddOns({ formData, updateFormData, onBack, onContinue, isDark = false }) {
  const carrier   = formData.bind?.selectedCarrier || 'Coterie'
  const packageId = formData.bind?.packageId || 'gold'
  const packageName = PACKAGE_PRICES[packageId].name

  const always       = COVERAGES.filter(c => c.type === 'always')
  const packageItems = COVERAGES.filter(c => c.type === 'package')
  const optionals    = COVERAGES.filter(c => c.type === 'optional')

  const stored = formData.bind?.optionalAddons
  const [selected, setSelected] = useState(stored ?? [])
  // Package items the user has opted out of. Opting out forfeits the
  // bundled discount, so each removed item adds its priceImpact back
  // onto the premium.
  const storedRemoved = formData.bind?.removedPackageItems
  const [removed, setRemoved] = useState(storedRemoved ?? [])

  const sumOptionals = (list) =>
    optionals.reduce((s, o) => s + (list.includes(o.id) ? (o.priceImpact || 0) : 0), 0)
  const sumRemoved = (list) =>
    packageItems.reduce((s, p) => s + (list.includes(p.id) ? (p.priceImpact || 0) : 0), 0)

  const addonsTotal = useMemo(
    () => sumOptionals(selected) + sumRemoved(removed),
    [selected, removed]
  )

  const toggleOptional = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    setSelected(next)
    updateFormData('bind', {
      optionalAddons: next,
      addonsPremium: sumOptionals(next) + sumRemoved(removed),
    })
  }

  const togglePackageItem = (id) => {
    const next = removed.includes(id) ? removed.filter(x => x !== id) : [...removed, id]
    setRemoved(next)
    updateFormData('bind', {
      removedPackageItems: next,
      addonsPremium: sumOptionals(selected) + sumRemoved(next),
    })
  }

  const goBack = () => { onBack && onBack() }
  const goContinue = () => {
    updateFormData('bind', {
      addonsConfirmed: true,
      optionalAddons: selected,
      removedPackageItems: removed,
      addonsPremium: addonsTotal,
    })
    if (onContinue) onContinue()
  }

  const selectedCount = selected.length
  const removedCount  = removed.length

  return (
    <div className="w-full space-y-4">
      <p className="text-sm text-gray-500 -mt-2">
        Customize your optional coverages.
      </p>

      {/* Included with the package. 'Always' items (TRIA, Blanket AI)
          are truly mandatory — shown as a green check with no control.
          'Package' items default ON but can be opted out via toggle;
          opting out adds their priceImpact back onto the premium since
          the user is forfeiting the bundled discount. */}
      <Collapsible
        isDark={isDark}
        title={`Included in your ${packageName} package`}
        badge={
          removedCount > 0 ? (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.18)', color: isDark ? '#FCD34D' : '#B45309' }}
            >
              {packageItems.length - removedCount} of {packageItems.length} kept
            </span>
          ) : (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(92,46,212,0.14)', color: isDark ? '#C4B5FD' : '#5C2ED4' }}
            >
              {always.length + packageItems.length} included
            </span>
          )
        }
        defaultOpen={false}
      >
        <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }}>
          {/* Always-included — locked */}
          {always.map(c => (
            <div key={c.id} className="px-4 py-3.5 flex items-start gap-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }}>
              <svg className="w-[18px] h-[18px] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`addonsAlwaysG-${c.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#5C2ED4"/>
                    <stop offset="100%" stopColor="#A614C3"/>
                  </linearGradient>
                </defs>
                <polyline points="20 6 9 17 4 12" stroke={`url(#addonsAlwaysG-${c.id})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{c.name}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
                      color: isDark ? '#D1D5DB' : '#6B7280',
                    }}
                  >
                    Always Included
                  </span>
                </div>
                <p className="text-xs leading-snug mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>{c.description}</p>
              </div>
            </div>
          ))}

          {/* Package-bundled — opt-out-able */}
          {packageItems.map(c => {
            const isRemoved = removed.includes(c.id)
            return (
              <div
                key={c.id}
                className="px-4 py-3.5 flex items-start gap-3 transition"
                style={{
                  background: isRemoved
                    ? (isDark ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.04)')
                    : 'transparent',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: isRemoved
                          ? (isDark ? '#6B7280' : '#9CA3AF')
                          : (isDark ? '#F9FAFB' : '#111827'),
                        textDecoration: isRemoved ? 'line-through' : 'none',
                      }}
                    >
                      {c.name}
                    </span>
                    {!isRemoved ? (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          background: 'rgba(92,46,212,0.14)',
                          color: isDark ? '#C4B5FD' : '#5C2ED4',
                        }}
                      >
                        Included in {packageName}
                      </span>
                    ) : (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          background: 'rgba(245,158,11,0.18)',
                          color: isDark ? '#FCD34D' : '#B45309',
                        }}
                      >
                        Removed · +${c.priceImpact}/yr
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>{c.description}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <Toggle on={!isRemoved} onClick={() => togglePackageItem(c.id)} isDark={isDark} />
                </div>
              </div>
            )
          })}
        </div>
      </Collapsible>

      {/* Optional add-ons — open by default since this is the action
          area. The badge tracks how many they've turned on so they can
          see selection state without expanding. */}
      <Collapsible
        isDark={isDark}
        title="Optional Add-Ons"
        badge={
          selectedCount > 0 ? (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(92,46,212,0.14)', color: isDark ? '#C4B5FD' : '#5C2ED4' }}
            >
              {selectedCount} of {optionals.length} selected
            </span>
          ) : (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
                color: isDark ? '#D1D5DB' : '#6B7280',
              }}
            >
              {optionals.length} available
            </span>
          )
        }
        defaultOpen
      >
        <div>
          {optionals.map((cov, i) => (
            <OptionalRow
              key={cov.id}
              cov={cov}
              on={selected.includes(cov.id)}
              onToggle={() => toggleOptional(cov.id)}
              last={i === optionals.length - 1}
              isDark={isDark}
            />
          ))}
        </div>
      </Collapsible>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
          style={{ color: '#374151', border: '1.5px solid #E5E7EB', background: 'white' }}
        >
          Back to Package
        </button>
        <button
          type="button"
          onClick={goContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: '0 4px 14px rgba(92,46,212,0.25)',
          }}
        >
          Continue to Review &amp; Pay
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
