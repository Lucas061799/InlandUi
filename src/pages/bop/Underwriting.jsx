import { useState } from 'react'
import norbieface from '../../assets/norbieface.png'
import norbielinkLogo from '../../assets/norbielink-logo.png'
import btisLogo from '../../assets/btislogo.png'

const QUESTIONS = [
  { key: 'prior_losses',        section: 'history', label: 'Any property losses or liability claims in the past 5 years?' },
  { key: 'pending_claims',      section: 'history', label: 'Any pending claims or lawsuits against your business?' },
  { key: 'declined_coverage',   section: 'history', label: 'Has any insurer ever declined, cancelled, or non-renewed your coverage?' },
  { key: 'criminal_bankruptcy', section: 'history', label: 'Any criminal convictions, bankruptcy, or foreclosure in the past 5 years?' },
  { key: 'manufactures_goods',  section: 'history', label: 'Does your business manufacture, distribute, or sell tangible goods?' },
  { key: 'subcontracts',        section: 'history', label: 'Do you subcontract any professional services?' },
  { key: 'tangible_goods',      section: 'risk',    label: 'Does your business supply, manufacture, or distribute any tangible goods or products?', subtext: 'Note: Brochures, documents and reports are not considered as tangible goods.' },
]

const RECOMMENDED = {
  prior_losses: 'No', pending_claims: 'No', declined_coverage: 'No',
  criminal_bankruptcy: 'No', manufactures_goods: 'No', subcontracts: 'No',
  tangible_goods: 'No',
}

const HISTORY_QS = QUESTIONS.filter(q => q.section === 'history')
const RISK_QS    = QUESTIONS.filter(q => q.section === 'risk')

const YES_NO_STYLES = {
  Yes: { activeBorder: '#5C2ED4', activeText: '#5C2ED4', activeBg: 'rgba(92,46,212,0.08)', dotBg: 'linear-gradient(88.09deg, #5C2ED4 0%, #7C3AED 100%)' },
  No:  { activeBorder: '#A614C3', activeText: '#A614C3', activeBg: 'rgba(166,20,195,0.08)', dotBg: 'linear-gradient(88.09deg, #A614C3 0%, #D946EF 100%)' },
}

function ColoredYesNo({ value, onChange }) {
  return (
    <div className="flex gap-2 shrink-0">
      {['No', 'Yes'].map(opt => {
        const s = YES_NO_STYLES[opt]
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange && onChange(opt)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border-[1.5px] transition-all text-xs font-semibold"
            style={active
              ? { borderColor: s.activeBorder, color: s.activeText, background: s.activeBg }
              : { borderColor: '#E5E7EB', color: '#6B7280', background: 'white' }
            }
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: active ? s.activeBorder : '#D1D5DB' }}>
              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dotBg }} />}
            </div>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function QuestionRow({ q, value, onChange, autoFilled, hasError = false }) {
  return (
    <div
      className="rounded-xl p-4 transition"
      style={{
        background: '#F9FAFB',
        border: hasError ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
        boxShadow: hasError ? '0 0 0 2px rgba(252,165,165,0.3)' : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-800 leading-snug">{q.label}</p>
            {autoFilled && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: 'rgba(243,240,255,1)', color: '#5C2ED4' }}
              >
                Auto-Filled
              </span>
            )}
          </div>
          {q.subtext && (
            <p className="text-xs text-gray-500 mt-1 leading-snug">{q.subtext}</p>
          )}
        </div>
        <ColoredYesNo value={value} onChange={onChange} />
      </div>
      {hasError && (
        <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
          <span>⚠</span> Please answer this question
        </p>
      )}
    </div>
  )
}

function PRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: '#F3F4F6' }}>
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-semibold text-right text-gray-800">{value}</span>
    </div>
  )
}

function PYNRow({ label, value }) {
  if (!value) return null
  const yes = value === 'Yes'
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: '#F3F4F6' }}>
      <span className="text-[11px] text-gray-500">{label}</span>
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: yes ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.1)',
          color: yes ? '#059669' : '#6B7280',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const PSECTION_ICONS = {
  tag: <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5z M6 9h.01" strokeLinecap="round" strokeLinejoin="round"/>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" strokeLinejoin="round"/></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>,
  check: <><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round"/></>,
}

function PSection({ title, icon = 'briefcase', children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(115,201,183,0.12)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth={1.5} viewBox="0 0 24 24">
            {PSECTION_ICONS[icon]}
          </svg>
        </div>
        <h3 className="text-xs font-bold" style={{ color: '#121723' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

// `variant` controls the footer + header subtitle:
//   'review'   → 'Go back to edit' + 'Confirm & Get Quotes' (default,
//                used from the Underwriting page before quoting)
//   'download' → just a 'Close' button; the user downloads via the
//                printer icon in the header. Used from the right rail
//                'Download Application Summary' button.
export function PreviewModal({ formData, onClose, onConfirm, variant = 'review', isDark = false }) {
  const ss = formData.smartStart || {}
  const biz = formData.business || {}
  const loc = formData.location || {}
  const cov = formData.coverage || {}
  const uw = formData.underwriting || {}

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 uw-preview-backdrop"
      style={{ background: 'rgba(15,18,40,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        id="uw-preview-print-area"
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh', background: '#F9FAFB', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — screen only */}
        <div className="no-print px-5 pt-4 pb-4 shrink-0" style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(88.09deg,rgba(92,46,212,0.12) 0%,rgba(166,20,195,0.12) 100%)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="prevHdrG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5C2ED4"/>
                    <stop offset="100%" stopColor="#A614C3"/>
                  </linearGradient>
                </defs>
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="url(#prevHdrG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{variant === 'download' ? 'Application Summary' : 'Review Before Quoting'}</h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition"
                  style={{ background: isDark ? 'rgba(167,139,250,0.22)' : 'rgba(92,46,212,0.08)' }}
                  onMouseEnter={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.34)' : 'rgba(92,46,212,0.16)' }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.22)' : 'rgba(92,46,212,0.08)' }}
                  aria-label="Print or save a copy"
                  title="Print or save a copy"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      stroke="url(#prevHdrG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                    />
                    <rect x="6" y="14" width="12" height="8" stroke="url(#prevHdrG)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {variant === 'download'
                  ? 'Preview the application below before downloading.'
                  : "Confirm your details below. We'll send them to our carriers."}
              </p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#5C2ED4' }}>
                {variant === 'download'
                  ? 'Tap the printer icon to save a copy.'
                  : 'Need a copy first? Tap the printer icon.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="no-print w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition"
              style={{ border: '1px solid #E5E7EB', background: 'white' }}
              onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(92,46,212,0.06)'; ev.currentTarget.style.borderColor = 'rgba(92,46,212,0.3)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = 'white'; ev.currentTarget.style.borderColor = '#E5E7EB' }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path stroke="url(#prevHdrG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-3">
          {/* Print-only document header — branding row + a framed
              summary card so the printed PDF reads like the
              BopSubmission summary surface. */}
          <div className="print-only flex-col mb-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 12, borderBottom: '1.5px solid #E5E7EB' }}>
              <img src={norbielinkLogo} alt="NorbieLink" style={{ height: 22, objectFit: 'contain' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 8, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600 }}>POWERED BY</span>
                <img src={btisLogo} alt="btis" style={{ height: 18, objectFit: 'contain' }} />
              </div>
            </div>

            {(() => {
              const productType = formData.pageZero?.productType || 'bop'
              const productLabel = productType === 'gl' ? 'General Liability' : 'Business Owners Policy'
              const carrier = formData.bind?.selectedCarrier
              // Until the application is actually submitted/bound this
              // is just a reference snapshot — don't imply it's been
              // sent to carriers.
              const subtitle = carrier
                ? <>Application bound with <span style={{ fontWeight: 700 }}>{carrier}</span>.</>
                : 'Reference copy — your application has not been submitted yet.'
              return (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #F3F4F6', display: 'block' }}>
                  <div style={{ height: 4, background: 'linear-gradient(88.09deg,#5C2ED4 0%,#A614C3 100%)' }} />
                  <div style={{ padding: '14px 18px' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                      {productLabel} Application Summary
                    </p>
                    <p style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>
                      {subtitle}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>

          {ss.description && (
            <PSection title="Class Code" icon="tag">
              <PRow label="Business Type" value={ss.description} />
              <PRow label="NAICS" value={ss.naics} />
            </PSection>
          )}

          <PSection title="Business Information" icon="briefcase">
            <PRow label="Business Name" value={biz.name} />
            <PRow label="Entity Type" value={biz.entityType} />
            <PRow label="Policy Effective Date" value={biz.effectiveDate} />
            <PRow label="Year Established" value={biz.yearEstablished} />
            <PRow label="Annual Revenue" value={biz.annualRevenue ? `$${Number(biz.annualRevenue).toLocaleString()}` : ''} />
            <PRow label="Annual Payroll" value={biz.annualPayroll ? `$${Number(biz.annualPayroll).toLocaleString()}` : ''} />
            <PRow label="Full-Time Employees" value={biz.numberOfEmployees} />
            <PRow label="Phone" value={biz.phone} />
            <PRow label="Email" value={biz.email} />
          </PSection>

          <PSection title="Location" icon="pin">
            <PRow label="Street Address" value={loc.address} />
            <PRow label="City, State, Zip" value={[loc.city, loc.state, loc.zip].filter(Boolean).join(', ')} />
            <PRow label="Where do you operate from?" value={loc.locationType} />
            <PRow label="Square Feet Occupied" value={loc.squareFeet} />
          </PSection>

          <PSection title="Coverage Limits" icon="shield">
            <PRow label="GL — Per Occurrence" value={cov.glLimit ? `$${Number(cov.glLimit).toLocaleString()}` : '$1,000,000'} />
            <PRow label="GL — Aggregate" value={`$${(2 * (cov.glLimit || 1000000)).toLocaleString()} (auto)`} />
          </PSection>

          <PSection title="Underwriting Answers" icon="check">
            <PYNRow label="Property losses or liability claims in 5 yrs" value={uw.prior_losses} />
            <PYNRow label="Pending claims or lawsuits" value={uw.pending_claims} />
            <PYNRow label="Insurer ever declined/cancelled coverage" value={uw.declined_coverage} />
            <PYNRow label="Criminal convictions, bankruptcy, foreclosure" value={uw.criminal_bankruptcy} />
            <PYNRow label="Manufactures/distributes/sells tangible goods" value={uw.manufactures_goods} />
            <PYNRow label="Subcontracts professional services" value={uw.subcontracts} />
            <PYNRow label="Supply/manufacture/distribute tangible goods" value={uw.tangible_goods} />
          </PSection>
        </div>

        {/* Footer */}
        <div className="no-print px-6 py-4 shrink-0 flex items-center justify-between gap-3" style={{ background: 'white', borderTop: '1px solid #E5E7EB' }}>
          {variant === 'download' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
                style={{ color: '#374151', border: '1.5px solid #E5E7EB', background: 'white' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
                  boxShadow: '0 4px 14px rgba(92,46,212,0.25)',
                }}
              >
                Download Summary
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0 0l-4-4m4 4 4-4M5 21h14"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
                style={{ color: '#374151', border: '1.5px solid #E5E7EB', background: 'white' }}
              >
                Go back to edit
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onConfirm() }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
                  boxShadow: '0 4px 14px rgba(92,46,212,0.25)',
                }}
              >
                Confirm &amp; Get Quotes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ label, count }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 pl-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] font-medium text-gray-400">· {count} {count === 1 ? 'question' : 'questions'}</span>
      )}
    </div>
  )
}

function CollapsibleGroup({ title, count, color = '#5C2ED4', defaultOpen = false, children, isDark = false }) {
  const [open, setOpen] = useState(defaultOpen)
  // Same color treatment Commercial Auto's EligibilityInformation
  // uses: tint the bg + border with the accent color, and brighten
  // the title/chevron so they pop against the dark sidebar.
  const darkAccent = color === '#5C2ED4' ? '#A78BFA' : '#F0ABFC'
  const titleColor = isDark ? darkAccent : color
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition"
        style={{
          background: isDark ? `${color}22` : '#F9FAFB',
          border: `1px solid ${isDark ? `${color}44` : '#E5E7EB'}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: titleColor }}>{title}</span>
          {count !== undefined && (
            <span className="text-[11px] font-medium" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>({count} {count === 1 ? 'question' : 'questions'})</span>
          )}
        </div>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{ color: titleColor, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div className="pt-2 space-y-2">{children}</div>}
    </div>
  )
}

export default function Underwriting({ formData, updateFormData, onGetQuotes, quoting, quotesReady, isDark = false, showErrors = false, onValidateAll }) {
  const data = formData.underwriting || {}
  const set = (key, val) => updateFormData('underwriting', { [key]: val })

  const [quickFilled, setQuickFilled] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleQuickFill = () => {
    updateFormData('underwriting', RECOMMENDED)
    setQuickFilled(true)
  }

  const handleReset = () => {
    updateFormData('underwriting', Object.fromEntries(QUESTIONS.map(q => [q.key, undefined])))
    setQuickFilled(false)
  }

  const allAnswered = QUESTIONS.every(q => data[q.key] !== undefined && data[q.key] !== null && data[q.key] !== '')

  return (
    <div className="w-full space-y-5">
      <p className="text-sm text-gray-500 -mt-2">
        Please answer all questions accurately. Your responses help determine coverage eligibility.
      </p>

      {/* Norbie quick-fill banner */}
      {!quickFilled && !allAnswered && (
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, #F8F6FF 0%, #F2FAF8 100%)',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug text-[#1B0750]">
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5 text-gray-500">
                  Apply <span className="font-semibold text-gradient">recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition hover:opacity-90 shrink-0"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>

          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug text-[#1B0750]">
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5 text-gray-500">
                  Apply <span className="font-semibold text-gradient">recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition hover:opacity-90"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>
        </div>
      )}

      {/* Standard answers applied — single-line note (matches Commercial Auto) */}
      {allAnswered && quickFilled && (
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-xs font-medium" style={{ color: '#5C2ED4' }}>
            Standard answers applied — expand each group to review or adjust.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] underline shrink-0"
            style={{ color: '#6B7280' }}
          >
            Reset all
          </button>
        </div>
      )}

      {quickFilled ? (
        <div className="space-y-3">
          <CollapsibleGroup title="Insurance History — standard answers applied" count={HISTORY_QS.length} color="#5C2ED4" isDark={isDark}>
            {HISTORY_QS.map(q => (
              <QuestionRow
                key={q.key}
                q={q}
                value={data[q.key]}
                onChange={(v) => set(q.key, v)}
                autoFilled={data[q.key] === RECOMMENDED[q.key]}
                hasError={showErrors && (data[q.key] === undefined || data[q.key] === null || data[q.key] === '')}
              />
            ))}
          </CollapsibleGroup>

          <CollapsibleGroup title="Risk Profile — standard answer applied" count={RISK_QS.length} color="#A614C3" isDark={isDark}>
            {RISK_QS.map(q => (
              <QuestionRow
                key={q.key}
                q={q}
                value={data[q.key]}
                onChange={(v) => set(q.key, v)}
                autoFilled={data[q.key] === RECOMMENDED[q.key]}
                hasError={showErrors && (data[q.key] === undefined || data[q.key] === null || data[q.key] === '')}
              />
            ))}
          </CollapsibleGroup>
        </div>
      ) : (
        <>
          <div>
            <SectionLabel label="Insurance History" count={HISTORY_QS.length} />
            <div className="space-y-2">
              {HISTORY_QS.map(q => (
                <QuestionRow
                  key={q.key}
                  q={q}
                  value={data[q.key]}
                  onChange={(v) => set(q.key, v)}
                  autoFilled={false}
                  hasError={showErrors && (data[q.key] === undefined || data[q.key] === null || data[q.key] === '')}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel label="Risk Profile" count={RISK_QS.length} />
            <div className="space-y-2">
              {RISK_QS.map(q => (
                <QuestionRow
                  key={q.key}
                  q={q}
                  value={data[q.key]}
                  onChange={(v) => set(q.key, v)}
                  autoFilled={false}
                  hasError={showErrors && (data[q.key] === undefined || data[q.key] === null || data[q.key] === '')}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {showPreview && (
        <PreviewModal
          formData={formData}
          onClose={() => setShowPreview(false)}
          onConfirm={onGetQuotes}
          isDark={isDark}
        />
      )}

      {/* Get Quotes */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => {
            if (quoting) return
            // First check ALL form sections (not just UW). If anything
            // upstream is missing, the parent flips its showErrors
            // state and scrolls to the first incomplete section
            // instead of opening the review modal.
            if (typeof onValidateAll === 'function' && !onValidateAll()) return
            setShowPreview(true)
          }}
          disabled={quoting}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
            boxShadow: !quoting ? '0 4px 14px rgba(92,46,212,0.25)' : 'none',
          }}
        >
          {quoting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 animate-spin" style={{ borderTopColor: '#fff' }} />
              Quoting...
            </>
          ) : quotesReady ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Re-quote
            </>
          ) : (
            <>
              Get Quotes
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
