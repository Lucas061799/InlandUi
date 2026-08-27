import { useState, useEffect } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import norbielinkLogoDark from '../assets/norbielink-logo-dark.png'
import btisLogo from '../assets/btislogo.png'
import btisLogoDark from '../assets/btislogo-dark.png'
import norbieface from '../assets/norbieface.png'
import sidebarBg from '../assets/sidebar-bg.png'
import iconWorker from '../assets/icon-worker.png'
import iconGL from '../assets/icon-general-liability.png'
import iconBO from '../assets/icon-business-owner.png'
import sellMoreBg from '../assets/sell-more-bg.png'

const SUBMISSION_ID = 'CA0094894'

const STEP_LABELS = ['Applicant','Vehicles','Driver','Eligibility','Coverage','Additional Insured','Loss Payee','Prior History','Claims','Payment Plan']

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: ['#5C2ED4','#A614C3','#ACD697','#75C9B7','#FFD700','#FF6B6B','#4ECDC4'][i % 7],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </div>
  )
}

export default function Submission({ formData, onBack, isDark = false, onToggleDark }) {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4500)
    return () => clearTimeout(t)
  }, [])

  const applicant = formData.applicant || {}
  const vehicles  = formData.vehicles?.vehicles || []
  const drivers   = formData.drivers?.drivers || []
  const eligibility = formData.eligibility || {}
  const coverage  = formData.coverage || {}
  const ai        = formData.additionalInsured || {}
  const blanket   = formData.blanket || {}
  const lp        = formData.lossPayee || {}
  const prior     = formData.priorHistory || {}
  const claims    = formData.claims || {}
  const payment   = formData.payment || {}
  const comments  = formData.comments?.text || ''

  const handlePrint = () => {
    setSummaryOpen(true)
    setTimeout(() => window.print(), 150)
  }

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: isDark ? '#131629' : 'white' }}>
      {showConfetti && <Confetti />}

      {/* Full-width top header */}
      <header
        className="no-print flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: isDark ? '#191D35' : 'white',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-4 md:px-5 md:w-64 md:shrink-0 gap-2">
          {/* Mobile back button */}
          <button onClick={onBack} className="md:hidden p-1.5 rounded-lg focus:outline-none" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={onBack} className="focus:outline-none">
            <img src={isDark ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 md:px-8">
          <span className="text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={isDark ? btisLogoDark : btisLogo} alt="btis" className="h-7" />
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar — hidden on mobile */}
        <aside
          className="no-print hidden md:flex w-64 2xl:w-72 flex-col h-full shrink-0 relative overflow-hidden"
          style={{
            background: isDark ? '#191D35' : '#ffffff',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #F3F4F6',
          }}
        >

          {/* Title */}
          <div className="px-5 pt-5 pb-3 relative z-10">
            <h2 className="text-base font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : undefined }}>Commercial Auto</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Submission Number: {SUBMISSION_ID}</p>
            <div className="mt-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />
          </div>

          {/* Steps */}
          <nav className="flex-1 py-1 px-3 overflow-y-auto sidebar-nav relative z-10">
            {[...STEP_LABELS, 'Submission'].map((label, i) => {
              const isLast = i === STEP_LABELS.length
              return (
                <div key={label} className="relative mb-0.5">
                  {isLast && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full z-20"
                      style={{ background: 'linear-gradient(180deg, #5C2ED4 0%, #A614C3 100%)' }}
                    />
                  )}
                  <div
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={isLast ? isDark ? {
                      background: 'linear-gradient(180deg, rgba(42,28,70,0.28) 0%, rgba(166,20,195,0.68) 100%)',
                      border: '1.5px solid rgba(166,20,195,0.65)',
                      boxShadow: '0 4px 24px rgba(166,20,195,0.25)',
                    } : {
                      background: '#ffffff',
                      border: '1.5px solid #7C3AED',
                      boxShadow: '0 2px 12px rgba(92,46,212,0.12)',
                    } : { border: '1.5px solid transparent' }}
                  >
                    {/* Badge — checkmark for all */}
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: isLast
                        ? isDark ? 'rgba(255,255,255,0.2)' : 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)'
                        : isDark ? 'rgba(166,20,195,0.28)' : 'rgba(166,20,195,0.10)' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                        <defs>
                          <linearGradient id={`cg${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5C2ED4"/>
                            <stop offset="100%" stopColor="#A614C3"/>
                          </linearGradient>
                        </defs>
                        <path d="M2.5 7l3 3 6-6" stroke={isLast ? '#FFFFFF' : (isDark ? '#D8A8F0' : `url(#cg${i})`)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {/* Label */}
                    <span
                      className={`text-xs truncate ${isLast ? 'font-semibold' : 'font-medium'}`}
                      style={isLast
                        ? isDark
                          ? { color: '#FFFFFF' }
                          : {
                              background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }
                        : { color: isDark ? '#9CA3AF' : '#6B7280' }
                      }
                    >
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Chat with Norbie */}
          <div className="px-3 pb-2 relative z-10">
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
                border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
              }}
            >
              <img src={norbieface} alt="Norbie" className="w-8 h-8 rounded-full shrink-0 object-cover" />
              <div>
                <p className="text-sm font-normal" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>Chat with Norbie</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>AI Assistant</p>
              </div>
            </div>
          </div>

          {/* Dark Mode toggle */}
          <div className="px-3 pb-4 relative z-10">
            <button
              onClick={onToggleDark}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
                border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
              }}
            >
              {/* Toggle pill with icon inside the knob */}
              <div
                className="w-10 h-5 rounded-full relative transition-all shrink-0"
                style={{ background: isDark ? '#E8622A' : '#D1D5DB' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all flex items-center justify-center"
                  style={{ left: isDark ? '22px' : '2px', background: 'white' }}
                >
                  {isDark ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  )}
                </div>
              </div>
              {/* Label */}
              <span style={{ fontSize: '14.5px', fontWeight: 400, color: isDark ? '#F9FAFB' : '#6B7280' }}>Dark Mode</span>
            </button>
          </div>

          {/* Background image */}
          <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none select-none">
            <img src={sidebarBg} alt="" className="absolute bottom-0 left-0 w-full h-full object-cover object-bottom" style={{ opacity: isDark ? 0.6 : 0.58, clipPath: 'inset(0 1px 0 0)' }} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scroll" style={{ background: isDark ? '#131629' : 'white' }}>
          <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-4 md:px-10 py-5 md:py-8 space-y-5 md:space-y-6">

            {/* Submission Complete Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: isDark ? '#1A1E38' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
              {/* Gradient top accent bar */}
              <div className="h-1" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }} />

              {/* Header row */}
              <div className="flex items-start gap-4 px-6 pt-5 pb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(88.09deg, rgba(92,46,212,0.45) 0%, rgba(166,20,195,0.45) 100%)'
                      : 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                  }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="checkCircleG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path d="M5 13l4 4L19 7" stroke="url(#checkCircleG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-navy mb-1">Submission Complete!</h1>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your commercial auto insurance application has been received and is being processed. You'll receive a confirmation email shortly.
                  </p>
                </div>
                {/* Quick print button */}
                <button
                  onClick={handlePrint}
                  title="Print / Save as PDF"
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{ border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB', background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.15)' : 'rgba(92,46,212,0.06)'; e.currentTarget.style.borderColor = 'rgba(92,46,212,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'white'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="printIconG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path stroke="url(#printIconG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                </button>
              </div>

              {/* Info row — Submission ID · Date · Status */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                {[
                  { label: 'Submission ID', value: SUBMISSION_ID },
                  { label: 'Date Submitted', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                  { label: 'Status', value: 'Under Review', highlight: true },
                ].map(item => (
                  <div key={item.label} className="px-5 py-4">
                    <p className="text-[10px] text-gray-400 mb-1">{item.label}</p>
                    {item.highlight
                      ? <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <p className="text-sm font-semibold text-amber-500">{item.value}</p>
                        </span>
                      : <p className="text-sm font-semibold text-navy">{item.value}</p>
                    }
                  </div>
                ))}
              </div>

              {/* Expandable details + print */}
              <button
                onClick={() => setSummaryOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-3.5 border-t transition-all"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                  background: summaryOpen
                    ? isDark ? 'rgba(92,46,212,0.18)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)'
                    : isDark ? 'rgba(92,46,212,0.08)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.03) 0%, rgba(166,20,195,0.03) 100%)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(92,46,212,0.22)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.08) 0%, rgba(166,20,195,0.08) 100%)'}
                onMouseLeave={e => e.currentTarget.style.background = summaryOpen
                  ? isDark ? 'rgba(92,46,212,0.18)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)'
                  : isDark ? 'rgba(92,46,212,0.08)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.03) 0%, rgba(166,20,195,0.03) 100%)'}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="expandPrintG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path stroke="url(#expandPrintG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  <span className="text-xs font-semibold text-gradient">
                    Print &amp; View Full Submission
                  </span>
                </span>
                <svg className={`w-4 h-4 shrink-0 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
                  <path stroke="url(#expandPrintG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {summaryOpen && (
                <div id="submission-print-area" className="px-6 pb-6 pt-4" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>

                  {/* Print-only document header — hidden on screen, shown when printing */}
                  <div className="print-only flex-col mb-4">
                    {/* Branding row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 8, borderBottom: '1.5px solid #E5E7EB' }}>
                      <img src={norbielinkLogo} alt="NorbieLink" style={{ height: 22, objectFit: 'contain' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 8, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600 }}>POWERED BY</span>
                        <img src={btisLogo} alt="btis" style={{ height: 18, objectFit: 'contain' }} />
                      </div>
                    </div>
                    {/* Applicant + submission info row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{applicant.namedInsured || '—'}</p>
                        <p style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>
                          {[applicant.entity, applicant.effectiveDate ? `Eff. ${applicant.effectiveDate}` : null, applicant.phone, applicant.email].filter(Boolean).join('  ·  ')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Commercial Auto Application</p>
                        <p style={{ fontSize: 8, color: '#9CA3AF', marginTop: 2 }}>#{SUBMISSION_ID} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">

                    {/* Applicant */}
                    <SummarySection title="Applicant Information" icon="user" isDark={isDark}>
                      <SummaryRow label="Named Insured" value={applicant.namedInsured} isDark={isDark} />
                      <SummaryRow label="Entity Type" value={applicant.entity} isDark={isDark} />
                      <SummaryRow label="Effective Date" value={applicant.effectiveDate} isDark={isDark} />
                      <SummaryRow label="Phone" value={applicant.phone} isDark={isDark} />
                      <SummaryRow label="Email" value={applicant.email} isDark={isDark} />
                      <SummaryRow label="Address" value={[applicant.address, applicant.suite].filter(Boolean).join(', ')} isDark={isDark} />
                      <SummaryRow label="City / State / Zip" value={[applicant.city, applicant.state, applicant.zip].filter(Boolean).join(', ')} isDark={isDark} />
                      <SummaryRow label="Yrs in Business" value={applicant.yearsInBusiness} isDark={isDark} />
                      <SummaryRow label="Business Desc." value={applicant.businessDesc} isDark={isDark} />
                    </SummarySection>

                    {/* Coverage */}
                    <SummarySection title="Coverage" icon="shield" isDark={isDark}>
                      <SummaryRow label="Liability Limit" value={coverage.liabilityLimit} isDark={isDark} />
                      <SummaryRow label="Med. Payments" value={coverage.medicalPayments} isDark={isDark} />
                      <SummaryRow label="Uninsured UM" value={coverage.uninsuredMotorist} isDark={isDark} />
                      <SummaryRow label="Hired Auto" value={coverage.hiredAuto} isDark={isDark} />
                      <SummaryRow label="Non-Owned Auto" value={coverage.nonOwnedAuto} isDark={isDark} />
                      <SummaryRow label="Towing & Labor" value={coverage.towingLabor} isDark={isDark} />
                    </SummarySection>

                    {/* Vehicles — full row, items in 2-col grid inside */}
                    <div className="col-span-1 md:col-span-2">
                      <SummarySection title="Vehicles" icon="truck" isDark={isDark}>
                        {vehicles.length === 0
                          ? <p className="text-[10px] py-0.5" style={{ color: '#9CA3AF' }}>No vehicles added.</p>
                          : <div className={`grid gap-x-6 ${vehicles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {vehicles.map((v, i) => (
                                <div key={i} className="py-1" style={{ borderBottom: vehicles.length > 1 ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6') : 'none' }}>
                                  {vehicles.length > 1 && <SummarySubLabel label={`Vehicle #${i+1}`} isDark={isDark} />}
                                  <SummaryRow label="Year/Make/Model" value={[v.year,v.make,v.model].filter(Boolean).join(' ')} isDark={isDark} />
                                  <SummaryRow label="VIN" value={v.vin} isDark={isDark} />
                                  <SummaryRow label="Use / Radius" value={[v.use, v.radius ? `${v.radius} mi` : null].filter(Boolean).join(' · ')} isDark={isDark} />
                                  <SummaryRow label="GVW / Zip" value={[v.gvw, v.garagingZip].filter(Boolean).join(' / ')} isDark={isDark} />
                                </div>
                              ))}
                            </div>
                        }
                      </SummarySection>
                    </div>

                    {/* Drivers — full row, items in 2-col grid inside */}
                    <div className="col-span-1 md:col-span-2">
                      <SummarySection title="Drivers" icon="user" isDark={isDark}>
                        {drivers.length === 0
                          ? <p className="text-[10px] py-0.5" style={{ color: '#9CA3AF' }}>No drivers added.</p>
                          : <div className={`grid gap-x-6 ${drivers.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {drivers.map((d, i) => (
                                <div key={i} className="py-1" style={{ borderBottom: drivers.length > 1 ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6') : 'none' }}>
                                  {drivers.length > 1 && <SummarySubLabel label={`Driver #${i+1}`} isDark={isDark} />}
                                  <SummaryRow label="Name" value={[d.firstName,d.lastName].filter(Boolean).join(' ')} isDark={isDark} />
                                  <SummaryRow label="DOB / State" value={[d.dob, d.licenseState].filter(Boolean).join(' / ')} isDark={isDark} />
                                  <SummaryRow label="License #" value={d.licenseNumber} isDark={isDark} />
                                  <SummaryRow label="Yrs Licensed" value={d.yearsLicensed} isDark={isDark} />
                                </div>
                              ))}
                            </div>
                        }
                      </SummarySection>
                    </div>

                    {/* Eligibility — full row, 2-col fields inside */}
                    <div className="col-span-1 md:col-span-2">
                      <SummarySection title="Eligibility" icon="shield" isDark={isDark}>
                        <div className="grid grid-cols-2 gap-x-8">
                          {[
                            ['q1','Long-haul trucking (>300 mi)'],['q2','Hazardous materials'],
                            ['q3','Semi-trucks / trailers'],['q4','Snow plowing'],
                            ['q5','2+ losses in 3 yrs'],['q6','Rideshare (Uber/Lyft)'],
                            ['q7','Food/beverage delivery'],['q8','Drivers under 21'],
                            ['q9','DUI/DWI past 5 yrs'],['q10','Suspended license'],
                            ['q11','Outside US/Canada'],['q12','Racing / exhibition'],
                            ['q13','Salvage / rebuilt title'],['q14','Towing / recovery'],
                            ['q15','Mobile business'],
                          ].filter(([k]) => eligibility[k]).map(([k, q]) => (
                            <SummaryYNRow key={k} label={q} value={eligibility[k]} isDark={isDark} />
                          ))}
                        </div>
                      </SummarySection>
                    </div>

                    {/* Additional Insured — full row, items in 2-col grid inside */}
                    <div className="col-span-1 md:col-span-2">
                      <SummarySection title="Additional Insured" icon="users" isDark={isDark}>
                        <SummaryRow label="Has Additionals?" value={ai.hasAdditional} isDark={isDark} />
                        {(blanket.blanketAI || blanket.blanketWOS) && (
                          <div className="flex gap-6 mt-0.5">
                            {blanket.blanketAI  && <SummaryRow label="Blanket AI"  value="Selected" isDark={isDark} />}
                            {blanket.blanketWOS && <SummaryRow label="Blanket WOS" value="Selected" isDark={isDark} />}
                          </div>
                        )}
                        {(ai.insureds||[]).length > 0 && (
                          <div className="grid grid-cols-2 gap-x-6 mt-1">
                            {(ai.insureds||[]).map((ins,i) => (
                              <div key={i} className="py-1" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
                                <SummarySubLabel label={`Insured #${i+1}`} isDark={isDark} />
                                <SummaryRow label="Name" value={ins.name} isDark={isDark} />
                                <SummaryRow label="Address" value={[ins.address,ins.city,ins.state,ins.zip].filter(Boolean).join(', ')} isDark={isDark} />
                                <SummaryRow label="WOS?" value={ins.waiverSubrogation} isDark={isDark} />
                              </div>
                            ))}
                          </div>
                        )}
                      </SummarySection>
                    </div>

                    {/* Loss Payee — full row, items in 2-col grid inside */}
                    <div className="col-span-1 md:col-span-2">
                      <SummarySection title="Loss Payee" icon="building" isDark={isDark}>
                        <SummaryRow label="Has Payees?" value={lp.hasPayee} isDark={isDark} />
                        {(lp.payees||[]).length > 0 && (
                          <div className="grid grid-cols-2 gap-x-6 mt-1">
                            {(lp.payees||[]).map((p,i) => (
                              <div key={i} className="py-1" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
                                <SummarySubLabel label={`Payee #${i+1}`} isDark={isDark} />
                                <SummaryRow label="Name" value={p.name} isDark={isDark} />
                                <SummaryRow label="Address" value={[p.address,p.city,p.state,p.zip].filter(Boolean).join(', ')} isDark={isDark} />
                                <SummaryRow label="Type" value={p.type} isDark={isDark} />
                              </div>
                            ))}
                          </div>
                        )}
                      </SummarySection>
                    </div>

                    {/* Prior Insurance */}
                    <SummarySection title="Prior Insurance" icon="doc" isDark={isDark}>
                      <SummaryRow label="Currently Insured?" value={prior.hasCurrent} isDark={isDark} />
                      <SummaryRow label="Prior Carrier" value={prior.carrier} isDark={isDark} />
                      <SummaryRow label="Policy #" value={prior.policyNumber} isDark={isDark} />
                      <SummaryRow label="Expiration" value={prior.expirationDate} isDark={isDark} />
                      <SummaryRow label="Continuous?" value={prior.continuous} isDark={isDark} />
                      <SummaryRow label="Lapse Reason" value={prior.lapseReason} isDark={isDark} />
                    </SummarySection>

                    {/* Claims — full row, items in 2-col grid inside */}
                    <SummarySection title="Claims History" icon="warning" isDark={isDark}>
                      <SummaryRow label="Claims (3 yrs)?" value={claims.hasClaims} isDark={isDark} />
                      {(claims.claims||[]).map((c,i) => (
                        <div key={i}>
                          <SummarySubLabel label={`Claim #${i+1}`} isDark={isDark} />
                          <SummaryRow label="Date / Type" value={[c.date,c.type].filter(Boolean).join(' · ')} isDark={isDark} />
                          <SummaryRow label="Description" value={c.description} isDark={isDark} />
                          <SummaryRow label="Amount Paid" value={c.amount} isDark={isDark} />
                        </div>
                      ))}
                    </SummarySection>

                    {/* Payment Plan — full row, 4-col fields inside */}
                    <div className="col-span-1 md:col-span-2">
                      <SummarySection title="Payment Plan" icon="card" isDark={isDark}>
                        <div className="grid grid-cols-4 gap-x-8">
                          <SummaryRow label="Paperless?" value={payment.paperless} isDark={isDark} />
                          <SummaryRow label="Reminder?" value={payment.reminder} isDark={isDark} />
                          <SummaryRow label="Plan Duration" value={payment.planDuration} isDark={isDark} />
                          <SummaryRow label="Selected Plan" value={payment.planOption} isDark={isDark} />
                        </div>
                      </SummarySection>
                    </div>

                  </div>

                  {/* Print-only footer */}
                  <div className="print-only items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: 8, color: '#9CA3AF' }}>Generated by NorbieLink · Powered by btis · Confidential</p>
                    <p style={{ fontSize: 8, color: '#9CA3AF' }}>#{SUBMISSION_ID}</p>
                  </div>

                  {/* Print button — screen only */}
                  <div className="screen-only">
                    <button
                      onClick={handlePrint}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold text-white btn-gradient transition hover:opacity-90"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
                        <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                      </svg>
                      Print / Save as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CROSS-SELL OPPORTUNITIES */}
            <div className="rounded-2xl px-4 md:px-10 py-6 md:py-8" style={{ background: isDark ? '#1A1E38' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="url(#lgBolt2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
                    <defs>
                      <linearGradient id="lgBolt2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gradient">CROSS-SELL OPPORTUNITIES</span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-navy mb-2 leading-snug">
                  We prefill your information<br className="hidden md:block" /> to save you time.{' '}
                  <span className="text-gradient">Why wait?</span>
                </h3>
                <p className="text-xs md:text-sm text-gray-400">Client info is already saved — adding coverages takes minutes.</p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { name: "Workers' Compensation", desc: 'Required coverage for employees',        price: '$1,200/year', badge: 'TOP PICK',    badgeClass: 'btn-gradient', icon: iconWorker },
                  { name: 'General Liability',      desc: 'Protect against third-party claims',    price: '$450/year',   badge: 'RECOMMENDED', badgeClass: 'bg-teal',      icon: iconGL },
                  { name: 'Business Owners',        desc: 'Bundle and save on multiple coverages', price: '$850/year',   badge: 'BEST VALUE',  badgeClass: 'bg-teal',      icon: iconBO },
                ].map((item) => (
                  <div key={item.name} className="rounded-2xl overflow-hidden hover:shadow-sm transition" style={{ border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #F3F4F6' }}>

                    {/* Main row: icon + info + price+btn (desktop) */}
                    <div className="flex items-center gap-3 px-4 py-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: isDark ? 'rgba(92,46,212,0.15)' : 'rgba(92,46,212,0.06)' }}>
                        <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
                      </div>

                      {/* Name + badge + desc */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <p className="text-sm font-bold text-navy leading-tight">{item.name}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0 ${item.badgeClass}`}>{item.badge}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                      </div>

                      {/* Price + button — desktop only, inline */}
                      <div className="hidden md:flex items-center gap-4 shrink-0 ml-2">
                        <div className="text-right">
                          <p className="text-base font-bold text-gradient leading-tight">{item.price}</p>
                          <p className="text-[10px] text-gray-400">estimated</p>
                        </div>
                        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition btn-gradient whitespace-nowrap">
                          Get Quote Now →
                        </button>
                      </div>
                    </div>

                    {/* Mobile footer: price + button */}
                    <div className="md:hidden flex items-center justify-between px-4 py-3" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6', background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA' }}>
                      <div>
                        <p className="text-sm font-bold text-gradient leading-tight">{item.price}</p>
                        <p className="text-[10px] text-gray-400">estimated</p>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white rounded-xl transition btn-gradient whitespace-nowrap">
                        Get Quote Now →
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Return to the Jungle CTA */}
            <div
              className="rounded-2xl relative cursor-pointer hover:opacity-95 transition overflow-hidden"
              onClick={onBack}
              style={{ minHeight: '100px' }}
            >
              <img src={sellMoreBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="px-8 py-6 relative z-10">
                <p className="text-lg font-bold mb-1" style={{ color: '#111827' }}>Return to the Jungle?</p>
                <p className="text-xs text-gray-400">Head back to <span className="font-semibold text-gradient underline underline-offset-2">Norbielink</span></p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel — hidden on mobile */}
        <aside className="no-print hidden md:flex w-80 2xl:w-96 flex-col shrink-0" style={{ background: isDark ? '#191D35' : 'white', borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
          <div className="p-5 flex-1 overflow-y-auto custom-scroll">

            {/* Title */}
            <h2 className="text-lg font-bold text-navy mb-3">Quote Submitted</h2>

            {/* Auto-saved + % row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="autoGradSub" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                      <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                    </linearGradient>
                  </defs>
                  <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradSub)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradSub)" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium text-gradient">All progress auto-saved</span>
              </div>
              <span className="text-xs font-bold text-gradient">100%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full w-full transition-all duration-500" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }} />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-5" />

            {/* What's Next */}
            <h3 className="text-sm font-bold text-navy mb-5">What's Next?</h3>
            <div className="space-y-6 mb-5">
              <div className="flex gap-4">
                <span className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)' }}><span className="text-gradient">1</span></span>
                <div>
                  <p className="text-sm font-medium text-navy">Review &amp; Processing</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Your application will be reviewed within 24-48 hours</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)' }}><span className="text-gradient">2</span></span>
                <div>
                  <p className="text-sm font-medium text-navy">Email Confirmation</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">You'll receive detailed quote confirmation via email</p>
                </div>
              </div>
            </div>

          </div>

        </aside>
      </div>


    </div>
  )
}

const GR = 'linear-gradient(88deg,#5C2ED4 0%,#A614C3 100%)'

const SECTION_ICONS = {
  user:    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>,
  truck:   <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l2 1m0-11l3 5h2a1 1 0 011 1v4"/>,
  shield:  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>,
  users:   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
  building:<path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
  doc:     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>,
  card:    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>,
  warning: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
}

function SummarySection({ title, icon = 'shield', children, isDark = false }) {
  return (
    <div className="rounded-xl p-4" style={{
      background: isDark ? '#252948' : 'white',
      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(115,201,183,0.12)' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth={1.5} viewBox="0 0 24 24">
            {SECTION_ICONS[icon]}
          </svg>
        </div>
        <h3 className="text-xs font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function SummaryRow({ label, value, isDark = false }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6' }}>
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{value}</span>
    </div>
  )
}

function SummaryYNRow({ label, value, isDark = false }) {
  if (!value) return null
  const yes = value === 'Yes'
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6' }}>
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: yes ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.1)', color: yes ? '#059669' : '#6B7280' }}>{value}</span>
    </div>
  )
}

function SummarySubLabel({ label, isDark = false }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-wider pt-2 pb-0.5" style={{ color: isDark ? '#A78BFA' : '#5C2ED4' }}>{label}</p>
  )
}
