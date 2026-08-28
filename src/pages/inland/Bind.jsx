import { Checkbox, Input } from '../../components/FormField'
import {
  Banner, BrandText, FieldError, PrimaryButton, SectionLabel, StepHeader, Tag,
} from '../../components/inland/primitives'
import {
  BRAND_GRADIENT, PAYMENT_PLANS, carrierById, classById, money, quoteFor,
} from '../../data/inland'
import { bindComplete, premiumFor, quoteState, scheduledTotal, selectedLines } from './validation'

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 border-b border-gray-100">
      <span className="text-[13px] text-gray-500 shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-gray-800 text-right">{value}</span>
    </div>
  )
}

/* Nobody could price it online, or a carrier wants a human to look first.
   Either way the application goes on rather than dead-ending. Same shape as
   every other step: section header, then the state, then the read-out. */
function UnderwritingOutcome({ kind, submission, submissionNumber, onStartOver }) {
  const referred = kind === 'referred'
  const { referred: referredCarriers } = quoteState(submission)
  const carrier = referred && referredCarriers[0] ? carrierById(referredCarriers[0].carrierId) : null
  const reasons = [...new Set(referredCarriers.map(o => o.reason))].join(' ')

  return (
    <div className="w-full">
      <StepHeader title="Bind & Pay" />

      <div className="mb-6">
        <Banner>
          <strong className="font-bold">{referred ? 'Referred to underwriting.' : 'Sent to underwriting.'}</strong>{' '}
          {referred
            ? `${reasons} The application has gone over with everything you entered, and can no longer be changed here.`
            : 'No carrier could price this risk online, so the full application has gone to the underwriting team. They will come back to you directly.'}
        </Banner>
      </div>

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <SummaryRow label="Quote number" value={submissionNumber} />
        <SummaryRow label="Carrier" value={carrier ? `${carrier.name} · ${carrier.sub}` : 'Not available'} />
        <SummaryRow label="Premium" value={referred ? 'Not available' : 'Not priced online'} />
        <div className="flex items-start justify-between gap-6 py-2.5">
          <span className="text-[13px] text-gray-500">Status</span>
          <span className="text-[13px] font-bold"><BrandText>With underwriting</BrandText></span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
      >
        Start another submission
      </button>
    </div>
  )
}

function BoundConfirmation({ carrier, premium, submission, submissionNumber, onStartOver }) {
  const business = submission.business || {}
  return (
    <div className="w-full">
      <StepHeader title="Bind & Pay" />

      <div className="mb-6">
        <Banner>
          <strong className="font-bold">Bound with {carrier.name}.</strong>{' '}
          {business.businessName || 'The applicant'} is covered from {business.effectiveDate || 'the effective date'}, and
          the policy documents are on their way to {business.email || 'the applicant'}.
        </Banner>
      </div>

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <SummaryRow label="Policy number" value={`IM-${submissionNumber}`} />
        <SummaryRow label="Carrier" value={`${carrier.name} · ${carrier.sub}`} />
        <SummaryRow label="Annual premium" value={money(premium)} />
        <div className="flex items-start justify-between gap-6 py-2.5">
          <span className="text-[13px] text-gray-500">Status</span>
          <span className="text-[13px] font-bold"><BrandText>Bound</BrandText></span>
        </div>
      </div>

      <p className="text-[12.5px] text-gray-500 leading-relaxed mb-7 max-w-xl">
        The inspection contact will hear from the carrier within ten business days. Nothing else is needed from you
        unless the equipment schedule changes.
      </p>

      <button
        type="button"
        onClick={onStartOver}
        className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
      >
        Start another submission
      </button>
    </div>
  )
}

function PlanCard({ plan, premium, selected, onSelect }) {
  const down = Math.round(premium * plan.factor) + plan.fee
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-xl p-4 text-left transition-all"
      style={{
        background: 'white',
        border: `1.5px solid ${selected ? '#7C3AED' : '#E5E7EB'}`,
        boxShadow: selected ? '0 4px 16px rgba(92,46,212,0.14)' : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-bold text-gray-900">{plan.label}</span>
        <span
          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
          style={selected ? { background: BRAND_GRADIENT } : { border: '2px solid #D1D5DB' }}
        >
          {selected && (
            <svg className="w-2 h-2" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>
      <p className="text-[12px] text-gray-400 mb-2.5">{plan.detail}</p>
      <p className="text-lg font-bold text-gray-900">{money(down)}</p>
      <p className="text-[11px] text-gray-400">
        {plan.id === 'full' ? 'charged today' : `today, then the balance monthly${plan.fee ? ` · $${plan.fee} instalment fee` : ''}`}
      </p>
    </button>
  )
}

export default function Bind({ data, set, submission, submissionNumber, onBack, onBound, onStartOver, showErrors }) {
  const { terminal, quoted } = quoteState(submission)

  if (terminal) {
    return (
      <UnderwritingOutcome
        kind={terminal}
        submission={submission}
        submissionNumber={submissionNumber}
        onStartOver={onStartOver}
      />
    )
  }

  const outcome = quoted.find(o => o.carrierId === submission.quotes?.selectedCarrier)
  const carrier = outcome ? carrierById(outcome.carrierId) : null
  const premium = premiumFor(outcome, submission)

  if (!outcome || !carrier) {
    return (
      <div className="w-full">
        <StepHeader title="Bind & Pay" subtitle="Bind needs a selected quote to work from." />
        <PrimaryButton onClick={onBack}>Back to quotes</PrimaryButton>
      </div>
    )
  }

  if (data.bound) {
    return (
      <BoundConfirmation
        carrier={carrier}
        premium={premium}
        submission={submission}
        submissionNumber={submissionNumber}
        onStartOver={onStartOver}
      />
    )
  }

  const business = submission.business || {}
  const classItem = submission.classCode?.classId ? classById(submission.classCode.classId) : null
  const lines = selectedLines(submission.coverage || {})
  const total = scheduledTotal(submission.coverage || {})
  const complete = bindComplete(submission)
  const quote = quoteFor(outcome.carrierId)

  return (
    <div className="w-full">
      <StepHeader title="Bind & Pay" />

      <div className="space-y-6">
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="im-carrier-tile rounded-xl flex items-center justify-center shrink-0" style={{ width: 56, height: 56, padding: 8 }}>
              <img src={carrier.logo} alt="" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{carrier.name}</p>
              <p className="text-[12px] text-gray-400">{carrier.sub}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[26px] font-bold leading-none text-gray-900">{money(premium)}</p>
              <p className="text-[11px] text-gray-400 mt-1">annually · {quote.commission}</p>
            </div>
          </div>

          <SummaryRow label="Named insured" value={business.businessName || '—'} />
          <SummaryRow label="Class" value={classItem ? `${classItem.name} · ${classItem.id}` : '—'} />
          <SummaryRow label="Effective date" value={business.effectiveDate || '—'} />
          <SummaryRow label="Deductible" value={money(submission.quotes?.deductible ?? 2500)} />
          <SummaryRow label="Terrorism coverage" value={submission.quotes?.tria === 'include' ? 'Included' : 'Rejected'} />
          <SummaryRow
            label="Address"
            value={[business.address, business.city, business.state, business.zip].filter(Boolean).join(', ') || '—'}
          />
          <SummaryRow label="Scheduled values" value={total ? money(total) : '—'} />

          {lines.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {lines.map(l => <Tag key={l.id}>{l.label}</Tag>)}
            </div>
          )}
        </div>

        <div>
          <SectionLabel>How they pay</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-3">
            {PAYMENT_PLANS.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                premium={premium}
                selected={data.paymentPlan === plan.id}
                onSelect={() => set({ paymentPlan: plan.id })}
              />
            ))}
          </div>
          {showErrors && !data.paymentPlan && (
            <FieldError className="mt-2">Choose a payment plan.</FieldError>
          )}
        </div>

        <div>
          <SectionLabel>Signature</SectionLabel>
          <div className="rounded-xl p-5 space-y-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <Input
              label="Type the applicant's full name"
              required
              value={data.signature}
              onChange={(v) => set({ signature: v })}
              placeholder={[business.firstName, business.lastName].filter(Boolean).join(' ') || 'Full name'}
              error={showErrors && !data.signature}
            />
            <Checkbox
              label="The applicant confirms the answers on this submission are accurate and authorises the first payment."
              checked={!!data.attested}
              onChange={(v) => set({ attested: v })}
            />
            {showErrors && !data.attested && (
              <FieldError>The applicant has to confirm before we can bind.</FieldError>
            )}
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
        >
          Back
        </button>
        <div className="flex items-center gap-4">
          {!complete && <span className="text-xs text-gray-500">A payment plan and a signature are still needed</span>}
          <PrimaryButton onClick={onBound} disabled={!complete}>Bind with {carrier.name}</PrimaryButton>
        </div>
      </div>
    </div>
  )
}
