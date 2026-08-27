import { useState, useEffect, useMemo } from 'react'
import logoCoterie       from '../assets/carrier-coterie.png'
import logoHiscox        from '../assets/carrier-hiscox.png'
import logoCNA           from '../assets/carrier-cna.png'
import logoGreatAmerican from '../assets/carrier-greatamerican.png'
import logoUSLI          from '../assets/carrier-usli.png'
import { PreviewModal }  from '../pages/bop/Underwriting'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// BOP completion logic — mirrors Sidebar.jsx so the % always agrees
function getSectionCompletion(formData) {
  const results = {}
  results[1] = !!formData.smartStart?.classId
  const b = formData.business || {}
  results[2] = !!(b.name && b.entityType && b.effectiveDate && b.annualRevenue && b.annualPayroll && b.numberOfEmployees && b.phone && b.email)
  const l = formData.location || {}
  results[3] = !!(l.address && l.city && l.state && l.zip)
  const hasCoverageInput = !!formData.coverage && Object.keys(formData.coverage).length > 0
  const hasUwInput = !!formData.underwriting && Object.keys(formData.underwriting).some(k => formData.underwriting[k] !== undefined && formData.underwriting[k] !== null && formData.underwriting[k] !== '')
  results[4] = hasCoverageInput || hasUwInput
  const uw = formData.underwriting || {}
  const requiredUw = ['prior_losses', 'pending_claims', 'declined_coverage', 'criminal_bankruptcy', 'manufactures_goods', 'subcontracts', 'tangible_goods']
  results[5] = requiredUw.every(k => uw[k] !== undefined && uw[k] !== null && uw[k] !== '')
  results[6] = !!formData.bind?.selectedCarrier
  results[7] = !!formData.bind?.bound
  return results
}

const CARRIERS = [
  { id: 'USLI',           name: 'USLI',            multiplier: 0.91, logo: logoUSLI },
  { id: 'Coterie',        name: 'Coterie',         multiplier: 1.00, logo: logoCoterie },
  { id: 'Hiscox',         name: 'Hiscox',          multiplier: 1.12, logo: logoHiscox },
  { id: 'CNA',            name: 'CNA',             multiplier: 1.34, logo: logoCNA },
  { id: 'Great American', name: 'Great American',  multiplier: 1.62, logo: logoGreatAmerican },
]

// Rough premium estimate from the business data the user has entered.
// Same formula across carriers, then we apply a per-carrier multiplier.
function estimatePremium(formData) {
  const b = formData.business || {}
  const revenue   = Number(String(b.annualRevenue   || '').replace(/[^0-9]/g, '')) || 0
  const payroll   = Number(String(b.annualPayroll   || '').replace(/[^0-9]/g, '')) || 0
  const employees = Number(String(b.numberOfEmployees || '').replace(/[^0-9]/g, '')) || 0
  const base = 800 + (revenue / 100_000) * 55 + (payroll / 100_000) * 110 + employees * 28
  return Math.max(base, 600)
}

const money = (n) => '$' + Math.round(n).toLocaleString()

// Carrier logo chip — square white tile holding the partner logo
function CarrierMark({ name, logo, size = 'sm' }) {
  const dim = size === 'xl' ? 96 : size === 'lg' ? 64 : 40
  const pad = size === 'xl' ? 12 : size === 'lg' ? 8 : 6
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{
        width: dim,
        height: dim,
        background: 'white',
        border: '1px solid #E5E7EB',
        padding: pad,
      }}
    >
      <img
        src={logo}
        alt={name}
        className="max-w-full max-h-full select-none pointer-events-none"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

// Loading price placeholder — a $ sitting inside a spinning ring.
// The arc and the $ both pick up the brand purple→magenta gradient
// so the loader feels on-brand. Track color adapts to dark mode so
// it stays visible against the dark sidebar background.
function LoadingPriceTicker({ isDark = false }) {
  return (
    <div
      className="shrink-0 relative flex items-center justify-center"
      style={{ width: 24, height: 24 }}
      title="Calculating quote…"
      aria-label="Calculating quote"
    >
      <svg
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '1.1s' }}
      >
        <defs>
          <linearGradient id="rpSpinG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#5C2ED4"/>
            <stop offset="100%" stopColor="#A614C3"/>
          </linearGradient>
        </defs>
        <circle
          cx="12" cy="12" r="10"
          stroke={isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}
          strokeWidth="2"
        />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="url(#rpSpinG)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span
        className="relative text-[11px] font-bold"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        $
      </span>
    </div>
  )
}

function SkeletonRow({ isDark = false }) {
  const skelClass = isDark ? 'skel-dark' : 'skel'
  return (
    <div
      className="rounded-xl px-3 py-3 flex items-center gap-3"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
      }}
    >
      <div className={`${skelClass} w-9 h-9 rounded-xl shrink-0`} />
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className={`${skelClass} h-3 rounded w-14`} />
        <div className={`${skelClass} h-3 rounded w-12`} />
      </div>
      <style>{`
        .skel { background: linear-gradient(90deg, #EEF2F7 0%, #F8FAFC 50%, #EEF2F7 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        .skel-dark { background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        @keyframes skelShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}

// Steps shown in the right rail while the user is moving through
// the quote flow (Compare → Package → Add-Ons → Bind & Pay).
const QUOTE_STEPS = [
  { id: 'compare',  n: 1, label: 'Select Carrier' },
  { id: 'package',  n: 2, label: 'Choose Package' },
  { id: 'addons',   n: 3, label: 'Add-Ons' },
  { id: 'bind',     n: 4, label: 'Bind & Pay' },
]

export default function RightPanel({ formData = {}, updateFormData, isDark = false, inQuoteFlow = false, quoteStep = 'compare' }) {
  const selectedCarrier = formData.bind?.selectedCarrier
  const selectCarrier = (id) => {
    if (!updateFormData) return
    // Toggle off if clicking the already-selected card
    updateFormData('bind', { selectedCarrier: selectedCarrier === id ? null : id })
  }

  const completion = useMemo(() => getSectionCompletion(formData), [formData])
  const completedCount = Object.values(completion).filter(Boolean).length
  const progressPct = Math.round((completedCount / 7) * 100)
  // All 5 form sections (Class Code → Underwriting) finished. Used
  // to gate the Application Summary download — no point handing the
  // user a half-filled PDF.
  const formComplete = !!(completion[1] && completion[2] && completion[3] && completion[4] && completion[5])

  // Show the carrier *list* (logos + names, no prices) as soon as a class
  // code is picked. Prices only appear once we have at least one financial
  // input to base the estimate on (revenue, payroll, or employee count).
  const readyToQuote = !!formData.smartStart?.classId
  const biz = formData.business || {}
  const hasAnyFinancial = !!(
    Number(String(biz.annualRevenue     || '').replace(/[^0-9]/g, '')) ||
    Number(String(biz.annualPayroll     || '').replace(/[^0-9]/g, '')) ||
    Number(String(biz.numberOfEmployees || '').replace(/[^0-9]/g, ''))
  )
  const showPrices = readyToQuote && hasAnyFinancial

  // Pre-quote shimmer: re-trigger briefly after the readiness threshold flips, or on Refresh click.
  const [primingQuotes, setPrimingQuotes] = useState(false)
  useEffect(() => {
    if (readyToQuote) {
      setPrimingQuotes(true)
      const t = setTimeout(() => setPrimingQuotes(false), 1100)
      return () => clearTimeout(t)
    }
  }, [readyToQuote])

  const baseEstimate = useMemo(() => estimatePremium(formData), [formData])
  // Sort cheapest-first so the highlighted card is the best price
  const quotes = useMemo(() => {
    return CARRIERS.map(c => ({ ...c, premium: baseEstimate * c.multiplier }))
      .sort((a, b) => a.premium - b.premium)
  }, [baseEstimate])

  const showSkeleton = !readyToQuote || primingQuotes

  // Application-summary preview modal (opened by both right-rail
  // download buttons — form-page version and in-flow version).
  const [summaryPreviewOpen, setSummaryPreviewOpen] = useState(false)
  const openSummaryPreview = () => setSummaryPreviewOpen(true)

  return (
    <aside
      className="w-80 2xl:w-96 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav">

        {/* Title */}
        <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : undefined }}>Quote in Progress</h2>

        {/* Auto-saved + % row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="autoGradRP" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                  <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                </linearGradient>
              </defs>
              <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradRP)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradRP)" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-medium text-gradient">All progress auto-saved</span>
          </div>
          <span className="text-xs font-bold text-gradient">{progressPct}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: BRAND_GRADIENT }}
          />
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* ============================ Live Quotes (form pages) ============================ */}
        {!inQuoteFlow && (
        <div className="mb-5">
          {/* Highlighted top carrier */}
          {showSkeleton ? (
            <div
              className="rounded-2xl px-5 py-6 mb-3 flex flex-col items-center gap-3"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <div className={`${isDark ? 'skel-dark' : 'skel'} w-14 h-14 rounded-xl`} />
              <div className={`${isDark ? 'skel-dark' : 'skel'} h-8 w-32 rounded`} />
              <div className={`${isDark ? 'skel-dark' : 'skel'} h-3 w-20 rounded`} />
            </div>
          ) : showPrices ? (() => {
            const top = quotes[0]
            const isSelected = selectedCarrier === top.id
            return (
              <button
                type="button"
                onClick={() => selectCarrier(top.id)}
                className="w-full rounded-2xl px-5 py-5 mb-3 flex flex-col items-center text-center relative overflow-hidden transition cursor-pointer hover:-translate-y-px"
                style={{
                  background: 'white',
                  border: `1.5px solid ${isSelected ? '#5C2ED4' : '#7C3AED'}`,
                  boxShadow: isSelected
                    ? '0 6px 24px rgba(92,46,212,0.22)'
                    : '0 4px 20px rgba(92,46,212,0.10)',
                }}
              >
                <div
                  className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  BEST
                </div>
                {isSelected && (
                  <div
                    className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <CarrierMark name={top.name} logo={top.logo} size="lg" />
                <div className="mt-3">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {money(top.premium)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Annual Premium</p>
                <p
                  className="text-[10px] font-semibold mt-2"
                  style={{ color: isSelected ? '#5C2ED4' : '#9CA3AF' }}
                >
                  {isSelected ? '✓ Selected' : 'Tap to select'}
                </p>
              </button>
            )
          })() : (
            /* No prices yet — show a small caption above the carrier list */
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              Add revenue, payroll, or employees to see prices.
            </p>
          )}

          {/* Carrier list — when prices are showing this is just the
              non-best carriers (cheapest is the hero card above);
              otherwise it's the full list with a shimmer where the
              price will appear, and rows are non-interactive. */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
              : (showPrices ? quotes.slice(1) : quotes).map(q => {
                  const isSelected = showPrices && selectedCarrier === q.id
                  const Wrapper = showPrices ? 'button' : 'div'
                  return (
                    <Wrapper
                      type={showPrices ? 'button' : undefined}
                      key={q.id}
                      onClick={showPrices ? () => selectCarrier(q.id) : undefined}
                      className={`w-full rounded-xl px-3 py-3 flex items-center gap-3 transition text-left ${showPrices ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{
                        background: isSelected
                          ? (isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.06)')
                          : (isDark ? 'rgba(255,255,255,0.04)' : 'white'),
                        border: `1.5px solid ${isSelected ? '#7C3AED' : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')}`,
                        boxShadow: isSelected ? '0 4px 14px rgba(92,46,212,0.10)' : 'none',
                      }}
                    >
                      <CarrierMark name={q.name} logo={q.logo} />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[11px] font-semibold truncate"
                          style={{ color: isDark ? '#F9FAFB' : '#374151' }}
                        >
                          {q.name}
                        </p>
                        {isSelected && (
                          <p
                            className="text-[9px] font-semibold mt-0.5"
                            style={{
                              background: BRAND_GRADIENT,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            ✓ Selected
                          </p>
                        )}
                      </div>
                      {showPrices ? (
                        <div className="text-right shrink-0">
                          <div
                            className="text-sm font-bold leading-tight"
                            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                          >
                            {money(q.premium)}
                          </div>
                          <div className="text-[9px] text-gray-400">per year</div>
                        </div>
                      ) : (
                        /* Quotes are still loading — gradient $ inside
                           a spinning ring; track adapts to dark mode. */
                        <LoadingPriceTicker isDark={isDark} />
                      )}
                    </Wrapper>
                  )
                })
            }
          </div>

          {!readyToQuote && (
            <p className="text-[10px] text-gray-400 text-left mt-3 leading-relaxed">
              Pick a class code to see live quotes.
            </p>
          )}


          {/* Download Application Summary — the form-page version of
              the right-rail download. Only enabled once every form
              section (Class Code → Underwriting) is filled in; the
              'Quote Proposal' download only unlocks at the Bind & Pay
              step (rendered in the quote-flow branch below). */}
          <button
            type="button"
            disabled={!formComplete}
            onClick={openSummaryPreview}
            className="w-full inline-flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed"
            style={formComplete
              ? {
                  background: BRAND_GRADIENT,
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(92,46,212,0.22)',
                }
              : {
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFB',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                }
            }
          >
            {/* Clipboard-with-form-lines icon — signals 'application' */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
            Download Application Summary
          </button>
          {!formComplete && (
            <p className="text-[10px] text-gray-400 text-left mt-2 leading-relaxed">
              Finish your application to download the summary.
            </p>
          )}
        </div>
        )}

        {/* ============================ Quote-flow summary ============================ */}
        {/* Compare → Package → Add-Ons → Bind. The right rail switches from
            the carrier list to a focused 'selected carrier' summary so the
            user can see their choice and the running total while they
            tune packages and add-ons on the main canvas. */}
        {inQuoteFlow && (() => {
          const carrierName     = formData.bind?.selectedCarrier
          const carrierLogo     = CARRIERS.find(c => c.name === carrierName)?.logo
          const carrierPremium  = Number(formData.bind?.carrierPremium || 0)
          const packageId       = formData.bind?.packageId
          // Only fold package/add-on premiums into the total once a
          // package is actually picked. Stale values from a previous
          // run shouldn't show before the user reaches that step.
          const packagePremium  = packageId ? Number(formData.bind?.packagePremium || 0) : 0
          const addonsPremium   = packageId ? Number(formData.bind?.addonsPremium  || 0) : 0
          const totalPremium    = carrierPremium + packagePremium + addonsPremium
          const PACKAGE_LABEL   = { base: 'Base', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }
          const packageLabel    = packageId ? PACKAGE_LABEL[packageId] : null

          // A step is "done" if the user has navigated past it in the
          // current flow. We deliberately don't infer this from data
          // (formData.bind.packageId etc) because that leaks state from
          // earlier runs and marks future steps as done while the user
          // is still on Compare.
          const currentIdx = Math.max(0, QUOTE_STEPS.findIndex(s => s.id === quoteStep))

          return (
            <div className="mb-5">
              {/* Selected carrier card */}
              {carrierName ? (
                <div
                  className="rounded-2xl px-5 py-5 mb-5 flex flex-col items-center text-center relative"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                    border: `1.5px solid ${isDark ? 'rgba(124,58,237,0.55)' : '#7C3AED'}`,
                    boxShadow: '0 4px 20px rgba(92,46,212,0.10)',
                  }}
                >
                  {/* SELECTED tag — small brand-gradient pill anchored
                      at the top-right rounded corner of the card. The
                      negative offsets let it sit on the corner curve
                      like a corner badge. */}
                  <span
                    className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                    style={{
                      background: BRAND_GRADIENT,
                      boxShadow: '0 2px 6px rgba(92,46,212,0.25)',
                    }}
                  >
                    SELECTED
                  </span>
                  {carrierLogo && <CarrierMark name={carrierName} logo={carrierLogo} size="xl" />}

                  {/* Bind & Pay — selection summary (no price; the page
                      already shows it in the top card). Compare /
                      Package / Add-Ons — price-focused running total. */}
                  {quoteStep === 'bind' ? (() => {
                    const optionalCount = (formData.bind?.optionalAddons || []).length
                    const removedCount  = (formData.bind?.removedPackageItems || []).length
                    return (
                      <>
                        <div
                          className="mt-3 text-base font-bold"
                          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                        >
                          {carrierName}
                        </div>
                        <div
                          className="w-full mt-4 pt-3 text-[11px] space-y-2"
                          style={{
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}`,
                            color: isDark ? '#9CA3AF' : '#6B7280',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>Package</span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                              style={{
                                background: 'rgba(92,46,212,0.14)',
                                color: isDark ? '#C4B5FD' : '#5C2ED4',
                              }}
                            >
                              {packageLabel || '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Optional add-ons</span>
                            <span className="font-semibold" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>
                              {optionalCount === 0 ? 'None' : `${optionalCount} added`}
                            </span>
                          </div>
                          {removedCount > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Removed from package</span>
                              <span className="font-semibold" style={{ color: isDark ? '#FCD34D' : '#B45309' }}>
                                {removedCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  })() : (
                    <>
                      {/* Carrier name — shown on Compare / Package / Add-Ons */}
                      <div
                        className="mt-2 text-sm font-semibold"
                        style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}
                      >
                        {carrierName}
                      </div>
                      <div className="mt-3">
                        <span
                          className="text-3xl font-bold"
                          style={{
                            background: BRAND_GRADIENT,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {money(totalPremium)}
                        </span>
                      </div>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                      >
                        Annual Premium
                      </p>

                      {/* Carrier + package (+ add-ons) breakdown — only once
                          the user has reached the Package step. Before that
                          the carrier premium IS the annual premium, so the
                          breakdown rows would just repeat the headline. */}
                      {packageLabel && (
                        <div
                          className="w-full mt-4 pt-3 text-[11px] space-y-1"
                          style={{
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}`,
                            color: isDark ? '#9CA3AF' : '#6B7280',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{carrierName} base</span>
                            <span className="font-semibold" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>{money(carrierPremium)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{packageLabel} package</span>
                            <span className="font-semibold" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>+{money(packagePremium)}</span>
                          </div>
                          {addonsPremium > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Add-ons</span>
                              <span className="font-semibold" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>+{money(addonsPremium)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-2xl px-5 py-8 mb-5 text-center"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                    border: `1px dashed ${isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}`,
                  }}
                >
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Select a carrier on the left to see your quote here.
                  </p>
                </div>
              )}

              {/* Steps — same numbered-circle pattern as the
                  'What's Next?' block on the submission page. Soft
                  tinted (rgba 0.25) circle with the step number in
                  brand-gradient text. State is conveyed by label
                  weight/color and a soft focus ring on the current
                  step, not by swapping the circle visual. */}
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-4 pl-0.5">
                  Where you are
                </div>
                <div className="space-y-5">
                  {QUOTE_STEPS.map((step, idx) => {
                    const isCurrent = idx === currentIdx
                    const isDone    = idx < currentIdx
                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        <span
                          className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)',
                            ...(isCurrent ? { boxShadow: '0 0 0 3px rgba(124,58,237,0.14)' } : {}),
                            opacity: !isCurrent && !isDone ? 0.55 : 1,
                          }}
                        >
                          <span
                            style={{
                              background: BRAND_GRADIENT,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {step.n}
                          </span>
                        </span>
                        <span
                          className="text-sm leading-tight"
                          style={{
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent
                              ? (isDark ? '#F9FAFB' : '#111827')
                              : isDone
                                ? (isDark ? '#D1D5DB' : '#4B5563')
                                : '#9CA3AF',
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Download Application Summary — same button as the
                  form-page right rail. Always live in the quote flow
                  since a carrier is already selected by this point. */}
              <button
                type="button"
                onClick={openSummaryPreview}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition"
                style={{
                  background: BRAND_GRADIENT,
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(92,46,212,0.22)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                  <line x1="9" y1="17" x2="13" y2="17"/>
                </svg>
                Download Application Summary
              </button>
            </div>
          )
        })()}

      </div>

      {/* Application-summary preview — opened by either Download
          button. Reuses the Underwriting PreviewModal in 'download'
          variant (Close + Download Summary footer). */}
      {summaryPreviewOpen && (
        <PreviewModal
          formData={formData}
          onClose={() => setSummaryPreviewOpen(false)}
          variant="download"
          isDark={isDark}
        />
      )}
    </aside>
  )
}
