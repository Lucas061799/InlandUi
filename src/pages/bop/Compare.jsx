import { useState } from 'react'
import { Select } from '../../components/FormField'
import logoCoterie       from '../../assets/carrier-coterie.png'
import logoHiscox        from '../../assets/carrier-hiscox.png'
import logoCNA           from '../../assets/carrier-cna.png'
import logoGreatAmerican from '../../assets/carrier-greatamerican.png'
import logoUSLI          from '../../assets/carrier-usli.png'

const CARRIER_LOGOS = {
  'Coterie':        logoCoterie,
  'Hiscox':         logoHiscox,
  'CNA':            logoCNA,
  'Great American': logoGreatAmerican,
  'USLI':           logoUSLI,
}

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const GL_OPTIONS = [
  { value: 300000,   label: '$300,000' },
  { value: 500000,   label: '$500,000' },
  { value: 1000000,  label: '$1,000,000' },
  { value: 2000000,  label: '$2,000,000' },
]

// Premium scales roughly linearly with GL limit (base limit = $1M)
function premiumForGl(basePremium, gl) {
  return Math.round(basePremium * (gl / 1000000))
}

const SAMPLE_QUOTES = [
  { carrier: 'Coterie',        premium: 1248, glLimit: 1000000, deductible: 500,   bppLimit: 25000, fees: { service: 75, tax: 38, stamping: 12 }, status: 'Quoted' },
  {
    carrier: 'Hiscox',
    status: 'Declined',
    reason: "Hiscox isn't currently quoting this risk profile.",
    factors: [
      'Class code 423620 is outside their current appetite',
      'Annual revenue above the preferred band for this state',
      'Colorado is not a preferred state for this product mix',
    ],
  },
  { carrier: 'CNA',            premium: 1518, glLimit: 1000000, deductible: 1000,  bppLimit: 25000, fees: { service: 75, tax: 46, stamping: 12 }, status: 'Quoted' },
  { carrier: 'Great American', premium: 0,    status: 'Referred', reason: 'Underwriter review required' },
]

const money = (n) => '$' + Math.round(n).toLocaleString()

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500" style={{ fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="text-gray-800" style={{ fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: '#F9FAFB', border: '1px solid #EAEAEA' }}>
      <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  )
}

function BrandText({ children, className = '' }) {
  return (
    <span
      className={className}
      style={{
        background: BRAND_GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}

function CarrierRow({ q, isBest, expanded, onToggle, isSelected, onSelect, pendingGl, onGlChange, onRequote, requoting, isDark = false }) {
  const isReferred = q.status === 'Referred'
  const isDeclined = q.status === 'Declined'
  const isQuoted   = !isReferred && !isDeclined
  const totalCost  = isQuoted ? q.premium + (q.fees?.service ?? 0) + (q.fees?.tax ?? 0) + (q.fees?.stamping ?? 0) : null
  const glChanged  = isQuoted && pendingGl !== undefined && pendingGl !== q.glLimit

  // Dark-mode-aware tokens. Reused throughout the row + expanded panel.
  const rowBg     = isDark
    ? (isDeclined ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)')
    : (isDeclined ? '#FAFAFB' : 'white')
  const rowBorder = isBest ? '#7C3AED' : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')
  const nameColor = isDeclined
    ? (isDark ? '#9CA3AF' : '#6B7280')
    : (isDark ? '#F9FAFB' : '#1F2937')
  const subText   = isDark ? '#9CA3AF' : '#6B7280'

  return (
    <div
      className="rounded-lg transition overflow-hidden"
      style={{
        background: rowBg,
        border: `1.5px solid ${rowBorder}`,
        boxShadow: isBest ? '0 2px 12px rgba(92,46,212,0.12)' : 'none',
      }}
    >
      <div className="px-4 py-3.5 cursor-pointer" onClick={onToggle}>
        {/* Row 1 — Carrier + pills + chevron */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            {/* Brand-gradient dot — small visual anchor for the row */}
            <span
              className="rounded-full shrink-0"
              style={{
                width: 8,
                height: 8,
                background: BRAND_GRADIENT,
                opacity: isDeclined ? 0.4 : 1,
              }}
            />
            <span
              className="text-sm font-semibold truncate"
              style={{ color: nameColor }}
            >
              {q.carrier}
            </span>
            {isBest && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                style={{ background: BRAND_GRADIENT }}
              >
                Best Value
              </span>
            )}
            {isReferred && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'rgba(92,46,212,0.08)', color: '#5C2ED4', border: '1px solid rgba(92,46,212,0.25)' }}
              >
                UW Review
              </span>
            )}
            {isDeclined && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'rgba(156,163,175,0.18)', color: '#6B7280', border: '1px solid rgba(156,163,175,0.35)' }}
              >
                Not a fit
              </span>
            )}
          </div>
          {(isQuoted || isDeclined) && (
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          )}
        </div>

        {/* Row 2 — Price (or referral / decline note) + action button */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {isReferred && (
            <span className="text-xs flex-1 min-w-0" style={{ color: subText }}>{q.reason}</span>
          )}
          {isDeclined && (
            <span className="text-xs flex-1 min-w-0" style={{ color: subText }}>
              {q.carrier} isn't quoting this risk today.
              <span style={{ color: isDark ? '#C4B5FD' : '#5C2ED4' }} className="font-semibold ml-1">
                {expanded ? 'Hide details' : 'See why →'}
              </span>
            </span>
          )}
          {isQuoted && (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>{money(q.premium)}</span>
                <span className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>/yr</span>
              </div>
              <div className="text-[11px]" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                {money(q.premium / 12)}/mo · Total {money(totalCost)}
              </div>
            </div>
          )}

          {!isDeclined && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="px-4 py-2 rounded-lg text-xs font-bold transition shrink-0"
              style={
                (isSelected || isBest)
                  ? { background: BRAND_GRADIENT, color: '#fff' }
                  : { background: 'white', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }
              }
            >
              {isSelected ? '✓ Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>

      {/* Declined — expandable "Why" panel */}
      {expanded && isDeclined && (
        <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#EAEAEA' }}>
          <div
            className="rounded-xl p-4"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EAEAEA'}`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(124,58,237,0.18)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#C4B5FD' : '#5C2ED4'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
                  Why {q.carrier} didn't quote
                </p>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Knowing this carrier's appetite helps you place future clients faster. Use these signals to pre-screen your next submission.
                </p>
              </div>
            </div>

            {q.reason && (
              <p className="text-[12px] mb-3" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>{q.reason}</p>
            )}

            {Array.isArray(q.factors) && q.factors.length > 0 && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Contributing factors</div>
                <ul className="space-y-1.5">
                  {q.factors.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#9CA3AF' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="border-t mt-4 pt-3 flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
              <span className="text-[11px]" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Have questions about {q.carrier}'s appetite?</span>
              <a
                href="#"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] font-semibold hover:underline"
                style={{ color: isDark ? '#C4B5FD' : '#5C2ED4' }}
              >
                Contact underwriting →
              </a>
            </div>
          </div>
        </div>
      )}

      {expanded && isQuoted && (
        <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Fee breakdown */}
            <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #EAEAEA' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">Fee Breakdown</div>
              <Row label="Premium" value={money(q.premium)} />
              <Row label="Service Fee" value={money(q.fees.service)} />
              <Row label="Tax" value={money(q.fees.tax)} />
              <Row label="Stamping Fee" value={money(q.fees.stamping)} />
              <div className="border-t mt-2 pt-2" style={{ borderColor: '#E5E7EB' }}>
                <Row label="Total Annual Cost" value={money(totalCost)} bold />
              </div>
            </div>

            {/* Customize */}
            <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #EAEAEA' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">Customize Coverage</div>

              <Select
                label="General Liability — Per Occurrence"
                options={GL_OPTIONS}
                value={pendingGl ?? q.glLimit}
                onChange={(v) => onGlChange(Number(v))}
              />
              <div className="flex items-center justify-between mt-2 mb-3 text-[11px]">
                <span className="text-gray-500">Aggregate (auto)</span>
                <span className="font-semibold text-gray-700">{money((pendingGl ?? q.glLimit) * 2)}</span>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRequote(); }}
                disabled={!glChanged || requoting}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed"
                style={{
                  background: (!glChanged || requoting) ? '#D1D5DB' : BRAND_GRADIENT,
                  boxShadow: glChanged && !requoting ? '0 2px 10px rgba(92,46,212,0.25)' : 'none',
                }}
              >
                {requoting ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white/30 animate-spin" style={{ borderTopColor: '#fff' }} />
                    Requoting...
                  </>
                ) : (
                  <>
                    Update Price
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Compare({ formData, updateFormData, quotesReady, onGoToStep, onSelectCarrier, isDark = false }) {
  const [expanded, setExpanded] = useState({})
  const [quotes, setQuotes] = useState(SAMPLE_QUOTES)
  const [pendingGl, setPendingGl] = useState({})
  const [requoting, setRequoting] = useState({})
  const selected = formData.bind?.selectedCarrier

  const setGl = (carrier, gl) => {
    setPendingGl(prev => ({ ...prev, [carrier]: gl }))
  }

  const requote = (carrier) => {
    const newGl = pendingGl[carrier]
    if (!newGl) return
    setRequoting(prev => ({ ...prev, [carrier]: true }))
    setTimeout(() => {
      setQuotes(prev => prev.map(q => {
        if (q.carrier !== carrier || q.status !== 'Quoted') return q
        const basePremium = SAMPLE_QUOTES.find(s => s.carrier === carrier)?.premium ?? q.premium
        const baseGl = SAMPLE_QUOTES.find(s => s.carrier === carrier)?.glLimit ?? 1000000
        return {
          ...q,
          glLimit: newGl,
          premium: Math.round(basePremium * (newGl / baseGl)),
        }
      }))
      setRequoting(prev => ({ ...prev, [carrier]: false }))
      setPendingGl(prev => {
        const { [carrier]: _, ...rest } = prev
        return rest
      })
    }, 1200)
  }

  if (!quotesReady) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{ background: '#FAFAFB', border: '1.5px dashed #E5E7EB' }}
      >
        <div
          className="inline-flex w-12 h-12 items-center justify-center rounded-full mb-3"
          style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5z"/>
            <circle cx="6" cy="9" r="1"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No quotes yet</p>
        <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
          Complete the Underwriting questions above, then click "Get Quotes from 4 Carriers" to see real-time pricing from our markets.
        </p>
        <button
          type="button"
          onClick={() => onGoToStep && onGoToStep(5)}
          className="text-xs font-semibold px-4 py-2 rounded-lg transition"
          style={{ color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)', background: 'white' }}
        >
          Go to Underwriting →
        </button>
      </div>
    )
  }

  const quoted = quotes.filter(q => q.status === 'Quoted')
  // Order: quoted (cheapest first) → declined ("not a fit") → referred (needs UW)
  const rank = (q) => q.status === 'Referred' ? 2 : q.status === 'Declined' ? 1 : 0
  const sorted = [...quotes].sort((a, b) => {
    const r = rank(a) - rank(b)
    if (r !== 0) return r
    return (a.premium || 0) - (b.premium || 0)
  })
  const bestPremium = quoted.length > 0 ? Math.min(...quoted.map(q => q.premium)) : 0

  const toggle = (c) => setExpanded(prev => ({ ...prev, [c]: !prev[c] }))
  const select = (c) => {
    // Remember the carrier's premium too, so the right-rail summary
    // and the Package/Add-Ons pages can reflect the live price without
    // re-deriving it. Also reset every downstream price field so the
    // running total doesn't carry forward stale package / add-on
    // amounts from a previous carrier.
    const q = quotes.find(x => x.carrier === c)
    updateFormData('bind', {
      selectedCarrier: c,
      carrierPremium: q?.premium || 0,
      packageId: undefined,
      packagePremium: 0,
      optionalAddons: [],
      addonsPremium: 0,
      addonsConfirmed: false,
    })
    if (onSelectCarrier) setTimeout(() => onSelectCarrier(), 150)
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-xs text-gray-500 mb-1">
        Sorted by total cost
      </p>
      {sorted.map(q => (
        <CarrierRow
          key={q.carrier}
          q={q}
          isBest={q.status === 'Quoted' && q.premium === bestPremium}
          expanded={!!expanded[q.carrier]}
          onToggle={() => toggle(q.carrier)}
          isSelected={selected === q.carrier}
          onSelect={() => select(q.carrier)}
          pendingGl={pendingGl[q.carrier]}
          onGlChange={(gl) => setGl(q.carrier, gl)}
          onRequote={() => requote(q.carrier)}
          requoting={!!requoting[q.carrier]}
          isDark={isDark}
        />
      ))}
    </div>
  )
}
