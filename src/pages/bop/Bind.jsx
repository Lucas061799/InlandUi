import { useState, useMemo } from 'react'
import { Input, FormGrid } from '../../components/FormField'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Four agency-billing plans. `installments` is how many payments the
// customer makes total; the monthly plan uses a 2-month down payment +
// 10 installments structure (the standard for monthly agency billing).
const PAYMENT_PLANS = [
  { value: 'Annual',     label: 'Pay in Full', period: 'year', installments: 1  },
  { value: 'SemiAnnual', label: 'Semi-Annual', period: '6mo',  installments: 2  },
  { value: 'Quarterly',  label: 'Quarterly',   period: 'qtr',  installments: 4  },
  { value: 'Monthly',    label: 'Monthly',     period: 'mo',   installments: 12, downMonths: 2 },
]

// Returns the per-installment premium amount (no fees), the premium
// portion due today (first installment or down payment), and a short
// description of what's left to pay after today.
function planAmounts(plan, annual, installmentFee = 0) {
  if (plan.value === 'Annual') {
    return { perInstallment: annual, dueTodayPremium: annual, remainingLabel: '' }
  }
  if (plan.value === 'Monthly') {
    const monthly = Math.round(annual / 12)
    const down = monthly * plan.downMonths
    const remaining = plan.installments - plan.downMonths
    return {
      perInstallment: monthly + installmentFee,
      dueTodayPremium: down + installmentFee,
      remainingLabel: `${'$' + down.toLocaleString()} down + ${remaining} installments`,
    }
  }
  // Semi-Annual / Quarterly: equal installments, first one due today.
  const per = Math.round(annual / plan.installments)
  const remaining = plan.installments - 1
  return {
    perInstallment: per + installmentFee,
    dueTodayPremium: per + installmentFee,
    remainingLabel: `${'$' + per.toLocaleString()} today + ${remaining} more`,
  }
}

// Carrier sample premiums — broken down to mirror the Coterie reference
const SAMPLE_PREMIUMS = {
  Coterie:          { basePremium: 300, policyFee: 50, riskProgram: 33,  total: 390, monthly: 35, installmentFee: 0 },
  Hiscox:           { basePremium: 360, policyFee: 40, riskProgram: 0,   total: 400, monthly: 36, installmentFee: 0 },
  CNA:              { basePremium: 420, policyFee: 50, riskProgram: 0,   total: 470, monthly: 42, installmentFee: 5 },
  'Great American': { basePremium: 480, policyFee: 60, riskProgram: 0,   total: 540, monthly: 48, installmentFee: 0 },
}

// Everything the user has to consent to before binding lives here.
// Each item has a short label (shown in the row), a summary (right-rail
// description), and details (the full legal text, revealed when the
// user expands the row).
const CONSENTS = [
  {
    key: 'fraud',
    label: 'Fraud Warning Statement',
    summary: 'Required state disclosure',
    details:
      'It is unlawful to knowingly provide false, incomplete, or misleading facts or information to an insurance ' +
      'company for the purpose of defrauding or attempting to defraud the company. Penalties may include ' +
      'imprisonment, fines, denial of insurance, and civil damages. Any insurance company or agent of an insurance ' +
      'company who knowingly provides false, incomplete, or misleading facts or information to a policyholder or ' +
      'claimant for the purpose of defrauding or attempting to defraud the policyholder or claimant with regard to ' +
      'a settlement or award payable from insurance proceeds shall be reported to the Colorado Division of ' +
      'Insurance within the Department of Regulatory Agencies.',
  },
  {
    key: 'svcFee',
    label: 'BTIS Service Fee ($75)',
    summary: 'One-time, non-refundable',
    details:
      'BTIS will impose a Service Fee of $75.00, separate from amounts charged by the insurer. This fee is ' +
      'non-refundable except where required by law.',
  },
  {
    key: 'broker',
    label: 'Broker Disclosure',
    summary: 'Broker fee and compensation arrangements',
    details:
      'If indicated, Total Amount Due includes a Broker Fee for services that may include performing a risk ' +
      'analysis, comparing policies, processing submissions, communication expenses, searching the markets for ' +
      'the desired coverage, working with underwriters on the coverage proposal, and servicing the policy after ' +
      'issuance. If we are deemed to be a broker, we represent the insured and will represent you honestly and ' +
      'competently in placing the insurance. We will also receive commission from the insurer. Broker Fees on ' +
      'Admitted policies are fully earned and nonrefundable, except when applicable by law. Broker Fees may be ' +
      'applicable to renewal policies. The insured is not obligated to purchase the proposed insurance.',
  },
  {
    key: 'esign',
    label: 'Electronic Delivery Consent',
    summary: 'Receive policy documents electronically',
    details:
      'I consent to receive policy documents, notices, and disclosures electronically at the email address on ' +
      'file. I understand I may withdraw this consent at any time by contacting BTIS.',
  },
  {
    key: 'terms',
    label: 'Quotation Terms & Conditions',
    summary: 'Quote subject to underwriting review',
    details:
      'This is not a final quote, nor is it an offer of insurance. Pricing is based only upon the rating ' +
      'information your agent has provided and may be subject to change due to additional rating variables. In ' +
      'addition, this is not a policy, but merely a general description of coverages available. Refer to actual ' +
      'policy for full coverage details including exclusions and limitations. Your policy will contain all of ' +
      'the terms and conditions applicable in the event of a loss or claim. All quotations should be considered ' +
      'an estimate and are subject to change based on accurate underwriting information, changes in state rates, ' +
      'experience modifications, or any other items by jurisdictions that have control over such items. This ' +
      'quotation is strictly conditioned upon no material change in the risk between the date of this quotation ' +
      'and the inception date of the proposed policy.',
  },
  {
    key: 'sameDay',
    label: 'Same-Day Bind Request',
    summary: 'Must be submitted by 5 PM PST',
    details:
      'Same-day bind requests must be received by 5 pm PST. Requests received after that time will be processed ' +
      'the following business day. This card will be used for renewal — contact bopbinds@btisinc.com within 15 ' +
      'days to change. Pricing is subject to change due to rate and underwriting updates.',
  },
]

const money = (n) => '$' + Math.round(n).toLocaleString()
const money2 = (n) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// =============================================================================
// Input 1 Payments modal — mock placeholder for the real payment processor.
// In production the iframe from Input 1 would render inside this dialog; we
// stub it here with a labeled placeholder + a single Complete Payment button.
// =============================================================================
function Input1Modal({ open, amount, onClose, onComplete, isDark = false }) {
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onComplete()
    }, 900)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto"
        style={{ background: isDark ? '#1A1E38' : 'white' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 sticky top-0 z-10"
          style={{
            background: isDark ? 'rgba(167,139,250,0.18)' : '#F5F3FF',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#C4B5FD' : '#5C2ED4'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
              Card payment
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="transition"
            style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = isDark ? '#F9FAFB' : '#374151' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 pt-6 pb-4">
          <div
            className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #7DD3FC 0%, #0EA5E9 70%, #0369A1 100%)',
              boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)',
            }}
          >
            <span className="text-white font-bold italic" style={{ fontFamily: 'Georgia, serif', fontSize: 18 }}>i1</span>
          </div>
          <div>
            <div className="text-2xl font-bold italic leading-none" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.02em', color: isDark ? '#F9FAFB' : '#111827' }}>
              INPUT 1
            </div>
            <div className="text-[10px] font-semibold tracking-[0.3em] text-right" style={{ color: isDark ? '#7DD3FC' : '#0EA5E9' }}>
              PAYMENTS
            </div>
          </div>
        </div>

        {/* Body — placeholder for the real iframe */}
        <div className="px-5 pb-5">
          <div
            className="rounded-lg p-6 text-center"
            style={{
              border: `1.5px dashed ${isDark ? 'rgba(199,210,254,0.30)' : '#C7D2FE'}`,
              background: isDark
                ? 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(124,58,237,0.12) 100%)'
                : 'linear-gradient(135deg, rgba(14,165,233,0.04) 0%, rgba(92,46,212,0.04) 100%)',
            }}
          >
            <div
              className="inline-flex w-10 h-10 items-center justify-center rounded-full mb-2"
              style={{ background: isDark ? 'rgba(14,165,233,0.22)' : 'rgba(14,165,233,0.12)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#7DD3FC' : '#0EA5E9'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
              Input 1 Payments interface
            </p>
            <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              The real Input 1 card form is embedded here in production. Click below to simulate the payment.
            </p>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="w-full py-3 mt-4 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            style={{
              background: BRAND_GRADIENT,
              boxShadow: submitting ? 'none' : '0 4px 14px rgba(92,46,212,0.25)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                  <path strokeLinecap="round" d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Processing…
              </>
            ) : (
              <>Complete Payment</>
            )}
          </button>

          {/* Secure footer */}
          <div
            className="flex items-center justify-center gap-1.5 mt-3 text-[11px]"
            style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secured by Input 1 Payments · PCI DSS compliant
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldRow({ label, value, bold, muted }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span style={{ color: muted ? '#9CA3AF' : '#6B7280', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="text-gray-800" style={{ fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}

// Consent row with a checkbox + label/summary + an expand chevron for
// the full legal text. Clicking the checkbox area toggles consent;
// clicking the chevron expands the details panel.
function ConsentRow({ item, checked, onChange, open, onToggle, isDark = false }) {
  // Brighter accents in dark mode so icons + text don't sink into the bg
  const accent      = isDark ? '#C4B5FD' : '#5C2ED4'
  const accentBright= isDark ? '#E879F9' : '#A614C3'
  const titleColor  = isDark ? '#F9FAFB' : '#1F2937'
  const subColor    = isDark ? '#9CA3AF' : '#6B7280'
  const bodyColor   = isDark ? '#D1D5DB' : '#4B5563'
  return (
    <div
      className="rounded-lg overflow-hidden transition"
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
        // Soft purple-tinted border once accepted, plain gray before
        border: `1px solid ${
          checked
            ? 'rgba(124,58,237,0.45)'
            : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')
        }`,
      }}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="flex-1 flex items-center gap-3 px-3.5 py-3 transition text-left min-w-0"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          {/* Status icon — soft tinted chip throughout. Alert ! before
              the user accepts, gradient-stroked check after. */}
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: isDark
                ? 'linear-gradient(88.09deg, rgba(167,139,250,0.22) 0%, rgba(232,121,249,0.22) 100%)'
                : 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
            }}
          >
            {checked ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`bindConsentG-${item.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor={accent}/>
                    <stop offset="100%" stopColor={accentBright}/>
                  </linearGradient>
                </defs>
                <path d="M5 13l4 4L19 7" stroke={`url(#bindConsentG-${item.key})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight" style={{ color: titleColor }}>{item.label}</div>
            {item.summary && (
              <div className="text-[11px] leading-tight mt-0.5 truncate" style={{ color: subColor }}>{item.summary}</div>
            )}
          </div>
        </button>
        {item.details && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={open ? 'Hide details' : 'Show details'}
            className="px-3 flex items-center justify-center transition"
            style={{
              background: 'transparent',
              borderLeft: `1px solid ${
                checked
                  ? 'rgba(124,58,237,0.30)'
                  : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6')
              }`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={isDark ? '#9CA3AF' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        )}
      </div>
      {open && item.details && (
        <div
          className="px-3.5 pb-3 pt-2.5 border-t"
          style={{
            borderColor: checked
              ? 'rgba(124,58,237,0.30)'
              : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'),
          }}
        >
          <p className="text-[12px] leading-relaxed" style={{ color: bodyColor }}>{item.details}</p>
        </div>
      )}
    </div>
  )
}

export default function Bind({ formData, updateFormData, onGoToStep, onBound, isDark = false }) {
  const carrier = formData.bind?.selectedCarrier
  const quote = SAMPLE_PREMIUMS[carrier] || SAMPLE_PREMIUMS.Coterie

  // Read the live running total from formData (set by Compare → Package
  // → Add-Ons). Falls back to the hardcoded sample if the flow hasn't
  // populated it yet, so this page still renders during dev / direct
  // navigation.
  const carrierPremiumLive = Number(formData.bind?.carrierPremium || 0)
  const packagePremiumLive = Number(formData.bind?.packagePremium || 0)
  const addonsPremiumLive  = Number(formData.bind?.addonsPremium  || 0)
  const liveAnnual         = carrierPremiumLive + packagePremiumLive + addonsPremiumLive

  const [frequency, setFrequency] = useState('Annual')
  const [brokerFee, setBrokerFee] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  // Which individual consent rows have their details panel expanded
  const [openConsentDetails, setOpenConsentDetails] = useState({})
  const [showChargeConfirm, setShowChargeConfirm] = useState(false)
  // Track whether the user has tried to Bind so we only surface
  // 'required' errors after an actual submit attempt (Commercial
  // Auto pattern) — the form doesn't scream errors on first render.
  const [attemptedBind, setAttemptedBind] = useState(false)

  const contact = formData.bindContact || {}
  const setContact = (id) => (val) => updateFormData('bindContact', { [id]: val })

  const consents = formData.bindConsents || {}
  const setConsent = (key, val) => updateFormData('bindConsents', { [key]: val })

  const btisServiceFee = 75
  const brokerFeeNum = Number(brokerFee) || 0
  const totalFees = btisServiceFee + brokerFeeNum

  // Prefer the live total from the flow; fall back to the sample
  // total if nothing came through (direct nav / dev).
  const annualPremium = liveAnnual > 0 ? liveAnnual : quote.total
  const monthlyPremium = Math.round(annualPremium / 12)
  const isAnnual = frequency === 'Annual'
  const currentPlan = PAYMENT_PLANS.find(p => p.value === frequency) || PAYMENT_PLANS[0]
  const installmentFee = !isAnnual ? (quote.installmentFee || 0) : 0
  const planAmt = planAmounts(currentPlan, annualPremium, installmentFee)
  const premiumPortion = planAmt.dueTodayPremium
  const dueToday = totalFees + premiumPortion

  const allConsented = useMemo(() => CONSENTS.every(c => consents[c.key]), [consents])
  const contactReady = !!(contact.firstName && contact.lastName && contact.email)
  const canBind = allConsented && contactReady

  if (!carrier) {
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
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No carrier selected</p>
        <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
          Pick a carrier from the Compare section above to review payment details and bind your policy.
        </p>
        <button
          type="button"
          onClick={() => onGoToStep && onGoToStep(6)}
          className="text-xs font-semibold px-4 py-2 rounded-lg transition"
          style={{ color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)', background: 'white' }}
        >
          Go to Compare →
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-5">
        {/* ============ PRICING ============ */}

        {/* Carrier + price + single proposal action — match the dark
            #252948 surface that the rest of the page picks up via the
            global [data-dark] CSS override on background: white. */}
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: isDark ? '#252948' : 'white',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
          }}
        >
          <div className="flex items-center justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase"
              style={{
                background: isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.08)',
                // Brand-gradient text in both modes
                backgroundImage: undefined,
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
                {carrier}
              </span>
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-4xl font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{money(annualPremium)}</span>
            <span className="text-sm text-gray-400">/year</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
          >
            {/* SVG icon — gradient stops lighten in dark for legibility.
                The text gradient stays on BRAND_GRADIENT because a
                global [data-dark] CSS rule in index.css already
                auto-brightens that specific gradient-text recipe. */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="bindDownloadG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={isDark ? '#C4B5FD' : '#5C2ED4'}/>
                  <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                </linearGradient>
              </defs>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#bindDownloadG)"/>
              <polyline points="14 2 14 8 20 8" stroke="url(#bindDownloadG)"/>
              <line x1="12" y1="11" x2="12" y2="17" stroke="url(#bindDownloadG)"/>
              <polyline points="9 14 12 17 15 14" stroke="url(#bindDownloadG)"/>
            </svg>
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Download Quote Proposal
            </span>
          </button>
        </div>

          {/* Payment plan — 4 options. On narrow viewports the grid
              collapses to 2×2 so the cards never get cramped. */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Payment Plan</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PAYMENT_PLANS.map(plan => {
                const active = frequency === plan.value
                const amt = planAmounts(plan, annualPremium, plan.value === 'Annual' ? 0 : (quote.installmentFee || 0))
                const cardDueToday = totalFees + amt.dueTodayPremium
                return (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setFrequency(plan.value)}
                    className="text-left rounded-lg px-4 py-3 transition relative flex flex-col"
                    style={{
                      background: active ? 'rgba(124,58,237,0.06)' : 'white',
                      border: `1.5px solid ${active ? '#7C3AED' : '#E5E7EB'}`,
                      minHeight: 160,
                    }}
                  >
                    {/* Top — label + per-installment price. The sub-line
                        row is always rendered with a reserved height
                        (even on Pay in Full, which has no copy) so the
                        dotted divider lands on the same Y across all
                        four cards. The height (32px) accommodates the
                        2-line wrap on Monthly's "$X down + 10 installments". */}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      {plan.label}
                    </div>
                    <div className="text-lg font-bold text-gray-900 leading-tight">
                      {money(amt.perInstallment)}
                      {plan.value !== 'Annual' && (
                        <span className="text-[11px] font-normal text-gray-400 ml-0.5">/{plan.period}</span>
                      )}
                    </div>
                    <div
                      className="text-[11px] text-gray-400 mt-1 leading-snug"
                      style={{ minHeight: 32 }}
                    >
                      {amt.remainingLabel}
                    </div>

                    {/* Dotted divider — sits at the same Y on every card
                        because the rows above all reserve identical height. */}
                    <div
                      className="my-3"
                      style={{ borderTop: '1px dashed #E5E7EB' }}
                    />

                    {/* Bottom — Due Today */}
                    <div className="mt-auto">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Due Today
                      </div>
                      <div className="text-lg font-bold text-gray-900 leading-tight">
                        {money(cardDueToday)}
                      </div>
                    </div>

                    {/* Selected check icon — bottom-right per reference */}
                    {active && (
                      <div
                        className="absolute bottom-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fees */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="text-sm font-semibold text-gray-700 mb-2">Fees</div>
            <FieldRow label="BTIS Service Fee" value={money(btisServiceFee)} />
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                Broker Fee
                <span className="relative inline-block">
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={brokerFee}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9]/g, '')
                      const n = v === '' ? 0 : Math.min(10000, Number(v))
                      setBrokerFee(n)
                    }}
                    className="rounded pl-5 pr-2 py-1 text-sm w-20 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/40 transition"
                    style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                  />
                </span>
              </span>
              <span className="text-gray-800 font-medium">{money(brokerFeeNum)}</span>
            </div>
            <div className="border-t mt-2 pt-2" style={{ borderColor: '#E5E7EB' }}>
              <FieldRow label="Total Fees" value={money(totalFees)} bold />
            </div>
          </div>

          {/* Payment summary */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</div>

            {/* Two-charges callout — same chip style as the consent
                rows below: tinted gradient circle + alert icon, with
                bold title and gray subtitle. */}
            <div
              className="flex items-center gap-3 px-3.5 py-2.5 mb-4 rounded-lg"
              style={{
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: isDark
                    ? 'linear-gradient(88.09deg, rgba(167,139,250,0.22) 0%, rgba(232,121,249,0.22) 100%)'
                    : 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#C4B5FD' : '#5C2ED4'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>Two Separate Charges</div>
                <div className="text-[11px] leading-tight mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Both will be made to your card</div>
              </div>
            </div>

            {/* Charge 1 — policy fees */}
            <div className="mb-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[12px] font-bold uppercase tracking-wider"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Charge 1
                </span>
                <span className="text-[11px] text-gray-400">Policy Fees</span>
              </div>
              <FieldRow label="BTIS Service Fee" value={money(btisServiceFee)} />
              {brokerFeeNum > 0 && <FieldRow label="Broker Fee" value={money(brokerFeeNum)} />}
            </div>

            <div className="border-t my-3" style={{ borderColor: '#F3F4F6' }} />

            {/* Charge 2 — carrier premium */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[12px] font-bold uppercase tracking-wider"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Charge 2
                </span>
                <span className="text-[11px] text-gray-400">
                  Policy Premium
                </span>
              </div>
              {isAnnual ? (
                <>
                  {/* Match the right-rail breakdown — carrier base,
                      package premium, optional add-ons. */}
                  <FieldRow label={`${carrier} Base`} value={money(carrierPremiumLive > 0 ? carrierPremiumLive : quote.basePremium)} />
                  {packagePremiumLive > 0 && (() => {
                    const PACKAGE_LABEL = { base: 'Base', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }
                    const lbl = PACKAGE_LABEL[formData.bind?.packageId] || 'Package'
                    return <FieldRow label={`${lbl} Package`} value={money(packagePremiumLive)} />
                  })()}
                  {addonsPremiumLive > 0 && <FieldRow label="Add-ons" value={money(addonsPremiumLive)} />}
                  {/* Fallbacks from the sample data if no live numbers came through */}
                  {liveAnnual <= 0 && quote.policyFee > 0 && <FieldRow label="Policy Fee" value={money(quote.policyFee)} />}
                  {liveAnnual <= 0 && quote.riskProgram > 0 && <FieldRow label="Manage My Risk Program" value={money2(quote.riskProgram)} />}
                </>
              ) : (
                <>
                  {/* Non-annual: label adapts to the chosen plan so the
                      customer can see what this first payment covers. */}
                  <FieldRow
                    label={
                      currentPlan.value === 'Monthly'
                        ? `Down Payment (${currentPlan.downMonths} mo)`
                        : `First Installment (${currentPlan.period === '6mo' ? '6 mo' : currentPlan.period === 'qtr' ? 'Quarter' : currentPlan.period})`
                    }
                    value={money(planAmt.dueTodayPremium - installmentFee)}
                  />
                  {installmentFee > 0 && <FieldRow label="Installment Fee" value={money(installmentFee)} />}
                </>
              )}
              <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: '#F3F4F6' }}>
                <FieldRow label="Total Premium" value={money(premiumPortion)} bold />
              </div>
            </div>

            <div className="border-t mt-4 pt-3 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <span className="text-sm font-bold text-gray-800">Due Today (Your Card)</span>
              <span className="text-xl font-bold text-gray-900">{money(dueToday)}</span>
            </div>
          </div>

        {/* Insured Contact */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Insured Contact</div>
          <div className="space-y-4">
            <FormGrid>
              <Input label="First Name" required value={contact.firstName} onChange={setContact('firstName')} placeholder="First name" error={attemptedBind && !contact.firstName} />
              <Input label="Last Name"  required value={contact.lastName}  onChange={setContact('lastName')}  placeholder="Last name"  error={attemptedBind && !contact.lastName} />
            </FormGrid>
            <Input label="Email" required type="email" value={contact.email} onChange={setContact('email')} placeholder="name@company.com" error={attemptedBind && !contact.email} />
          </div>
        </div>

        {/* Terms & Acknowledgments — compact accept-all */}
        {(() => {
          const acceptedCount = CONSENTS.filter(c => !!consents[c.key]).length
          const allDone = acceptedCount === CONSENTS.length
          const toggleAll = () => {
            const next = !allDone
            CONSENTS.forEach(c => setConsent(c.key, next))
          }
          return (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: allDone
                  ? (isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.06)')
                  : (isDark ? 'rgba(255,255,255,0.04)' : 'white'),
                border: `1.5px solid ${
                  allDone
                    ? (isDark ? '#A78BFA' : '#7C3AED')
                    : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')
                }`,
                boxShadow: allDone ? '0 2px 12px rgba(92,46,212,0.10)' : 'none',
              }}
            >
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex-1 flex items-center gap-3 px-4 py-3 transition text-left min-w-0"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition"
                    style={{
                      background: allDone ? BRAND_GRADIENT : (isDark ? 'rgba(255,255,255,0.04)' : 'white'),
                      border: `1.5px solid ${allDone ? 'transparent' : (isDark ? 'rgba(255,255,255,0.20)' : '#D1D5DB')}`,
                    }}
                  >
                    {allDone && (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <div className="text-left min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
                      {allDone
                        ? 'All Acknowledgments Accepted'
                        : `Accept All ${CONSENTS.length} Acknowledgments`}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                      {allDone
                        ? "You're good to bind."
                        : acceptedCount > 0
                          ? `${acceptedCount} of ${CONSENTS.length} accepted — tap to accept the rest.`
                          : 'Tap to accept all, or expand to review each.'}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTermsOpen(o => !o)}
                  aria-label={termsOpen ? 'Hide details' : 'Show details'}
                  className="px-3 flex items-center justify-center transition"
                  style={{
                    background: 'transparent',
                    borderLeft: `1px solid ${
                      allDone
                        ? (isDark ? 'rgba(167,139,250,0.30)' : 'rgba(124,58,237,0.18)')
                        : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6')
                    }`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 transition-transform"
                    style={{ transform: termsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
              {termsOpen && (
                <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
                  <div className="space-y-2.5">
                    {CONSENTS.map(c => (
                      <ConsentRow
                        key={c.key}
                        item={c}
                        checked={!!consents[c.key]}
                        onChange={(val) => setConsent(c.key, val)}
                        open={!!openConsentDetails[c.key]}
                        onToggle={() => setOpenConsentDetails(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

      </div>

      {/* Bind button */}
      <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[11px] text-gray-400 max-w-md">
          By clicking Bind, you authorize the two charges shown above to be placed on your card. Your policy will be issued immediately.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!canBind) {
              // Surface inline 'required' indicators under the empty
              // fields and scroll the user to the first one so they
              // can see what's missing.
              setAttemptedBind(true)
              return
            }
            setShowChargeConfirm(true)
          }}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{
            background: canBind ? BRAND_GRADIENT : '#D1D5DB',
            boxShadow: canBind ? '0 4px 14px rgba(92,46,212,0.25)' : 'none',
          }}
        >
          Bind &amp; Pay
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>

      {/* Charge authorization confirmation — opens BEFORE the Input 1 modal */}
      {showChargeConfirm && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,18,40,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => setShowChargeConfirm(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: isDark ? '#1A1E38' : 'white',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(88.09deg, rgba(167,139,250,0.22) 0%, rgba(232,121,249,0.22) 100%)'
                      : 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#C4B5FD' : '#5C2ED4'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold leading-snug" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Confirm Payment Authorization</h2>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    Please confirm by selecting{' '}
                    <span
                      className="font-semibold"
                      style={{
                        background: BRAND_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Continue
                    </span>{' '}
                    for the{' '}
                    <span
                      className="font-semibold"
                      style={{
                        background: BRAND_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      two separate charges
                    </span>{' '}
                    below to your card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChargeConfirm(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition"
                  style={{
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}`,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'white' }}
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#C4B5FD' : '#5C2ED4'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Charge breakdown */}
            <div className="px-6 pt-3 pb-4">
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}` }}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Charge 1</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>Policy Fees</div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{money(totalFees)}</div>
                </div>
                <div className="border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }} />
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Charge 2</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>Annual Premium</div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{money(premiumPortion)}</div>
                </div>
                <div className="border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB' }} />
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: isDark
                      ? 'linear-gradient(88.09deg, rgba(167,139,250,0.10) 0%, rgba(232,121,249,0.10) 100%)'
                      : 'linear-gradient(88.09deg, rgba(92,46,212,0.04) 0%, rgba(166,20,195,0.04) 100%)',
                  }}
                >
                  <div className="text-sm font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>Total Authorized</div>
                  <div
                    className="text-xl font-bold"
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {money(dueToday)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions — Cancel on left, primary CTA on right */}
            <div
              className="flex items-center justify-between gap-2 px-5 py-3 shrink-0"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFB',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <button
                type="button"
                onClick={() => setShowChargeConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition"
                style={{
                  color: isDark ? '#F9FAFB' : '#374151',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}`,
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'white' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChargeConfirm(false)
                  setShowPayment(true)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
              >
                Continue to Payment
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input 1 Payments modal */}
      <Input1Modal
        open={showPayment}
        amount={totalFees}
        isDark={isDark}
        onClose={() => setShowPayment(false)}
        onComplete={() => {
          setShowPayment(false)
          onBound && onBound({
            carrier,
            packageId: formData.bind?.packageId,
            premium: annualPremium,
            dueToday,
            totalFees,
            frequency,
          })
        }}
      />
    </div>
  )
}
