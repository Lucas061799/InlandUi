/* ──────────────────────────────────────────────────────────────────────────
   Step 7 — Bind this policy.

   The shape of the real flow: terms, then how the premium is collected, then
   how the application gets signed. Nothing is charged here. eSign hands the
   signature to the insured by email and the policy binds when they sign;
   upload keeps the submission bind-incomplete until a wet-signed copy lands.

   The running total sits in its own card beside the form rather than at the
   bottom, so an agent adding a broker fee sees the number move.
   ────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { Checkbox, DateInput, FormGrid, Input } from '../../components/FormField'
import {
  Banner, BrandText, FieldError, FieldGroup, MoneyInput, PrimaryButton, StepHeader,
} from '../../components/inland/primitives'
import {
  BRAND_GRADIENT, MAX_BROKER_FEE, PAYMENT_METHODS, SIGNATURE_METHODS,
  bindTotals, carrierById, financeSchedule, money, money2, quoteFor,
} from '../../data/inland'
import { bindComplete, premiumFor, quoteState } from './validation'

function SummaryRow({ label, value, last = false }) {
  return (
    <div className={`flex items-start justify-between gap-6 py-2.5 ${last ? '' : 'border-b border-gray-100'}`}>
      <span className="text-[13px] text-gray-500 shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-gray-800 text-right">{value}</span>
    </div>
  )
}

/* A radio the whole card answers to — the payment and signature choices are
   both "pick one of two, and the one you pick opens something". */
function ChoiceCard({ selected, label, detail, onSelect, children }) {
  return (
    <div
      className="rounded-xl transition-all"
      style={{
        background: selected ? 'rgba(92,46,212,0.04)' : 'white',
        border: `1.5px solid ${selected ? '#7C3AED' : '#E5E7EB'}`,
      }}
    >
      <button type="button" onClick={onSelect} className="w-full text-left px-4 py-3.5 flex items-start gap-3">
        <span
          className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
          style={selected ? { border: '5px solid #7C3AED' } : { border: '2px solid #D1D5DB' }}
        />
        <span className="min-w-0">
          <span className="block text-[13.5px] font-bold text-gray-900">{label}</span>
          <span className="block text-[12px] text-gray-500 leading-relaxed mt-0.5">{detail}</span>
        </span>
      </button>
      {/* pl-11 lines the revealed field up with the label and description,
          not the card edge: the radio is 16px and the gap 12px, so the text
          column starts 28px past the card's own px-4. */}
      {selected && children && <div className="pl-11 pr-4 pb-4">{children}</div>}
    </div>
  )
}

/* The three things that have to happen in order on the upload path, with
   what is already done ticked off. Read-only — it reports, it does not ask. */
function UploadChecklist({ termsSaved, uploaded }) {
  const steps = [
    {
      done: termsSaved,
      title: 'Save these terms',
      detail: termsSaved
        ? 'Saved.'
        : 'Effective date, payment and broker fee are stored against the submission before the signed copy can be attached to it.',
    },
    {
      done: termsSaved,
      title: 'Download the application and get it signed',
      detail: 'Wet signature by the insured. You can close this and come back — the submission is saved and nothing is charged.',
    },
    {
      done: uploaded,
      title: 'Upload the signed copy',
      detail: termsSaved ? 'Attach the signed PDF below.' : 'Available once the terms above are saved.',
    },
  ]

  return (
    <div className="rounded-xl px-4 py-3.5 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      {steps.map((st, i) => (
        <div key={st.title} className="flex items-start gap-2.5">
          <span
            className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-bold"
            style={st.done
              ? { background: '#10B981', color: 'white' }
              : { border: '1.5px solid #D1D5DB', color: '#9CA3AF' }}
          >
            {st.done ? '✓' : i + 1}
          </span>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-bold text-gray-800">{st.title}</span>
            <span className="block text-[11.5px] text-gray-500 leading-relaxed">{st.detail}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

/* Nobody could price it online, or a carrier wants a human to look first.
   Either way the application goes on rather than dead-ending. */
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
        <SummaryRow label="Status" value={<BrandText>With underwriting</BrandText>} last />
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

/* The end of the flow. Not "bound" — the policy binds when the insured
   signs, and saying so is the whole point of this screen. */
function SentConfirmation({ carrier, totals, submissionNumber, viaUpload, onStartOver }) {
  return (
    <div className="w-full">
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(16,185,129,0.14)' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {viaUpload ? 'Signed application received' : 'Sent for signature'}
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xl mb-7">
        {viaUpload
          ? 'Both signatures are in. The policy binds once the carrier confirms, and you can track it in NorbieLink until it does.'
          : 'The policy binds automatically as soon as the insured signs, and you can track it in NorbieLink until it does.'}
      </p>

      <div className="rounded-2xl p-6 mb-7" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <SummaryRow label="Quote number" value={submissionNumber} />
        <SummaryRow label="Carrier" value={`${carrier.name} · ${carrier.sub}`} />
        {totals.lines.map(l => (
          <SummaryRow key={l.id} label={l.label} value={l.note || money(l.value)} />
        ))}
        <div className="flex items-start justify-between gap-6 pt-3.5 mt-1">
          <span className="text-[13px] font-bold text-gray-800">Total</span>
          <span className="text-[15px] font-bold text-gray-900">{money(totals.total)}</span>
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

export default function Bind({ data, set, submission, submissionNumber, onBack, onBound, onStartOver, showErrors }) {
  const [feeOpen, setFeeOpen] = useState(!!data.brokerFee)
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

  if (!outcome || !carrier) {
    return (
      <div className="w-full">
        <StepHeader title="Bind this policy" subtitle="Bind needs a selected quote to work from." />
        <PrimaryButton onClick={onBack}>Back to quotes</PrimaryButton>
      </div>
    )
  }

  const business = submission.business || {}
  const quote = quoteFor(outcome.carrierId)
  const premium = premiumFor(outcome, submission)
  const brokerFee = Math.min(Number(data.brokerFee) || 0, MAX_BROKER_FEE)
  const totals = bindTotals({ premium, quote, brokerFee, tria: submission.quotes?.tria })
  const effective = data.effectiveDate || business.effectiveDate || ''

  if (data.sent) {
    return (
      <SentConfirmation
        carrier={carrier}
        totals={totals}
        submissionNumber={submissionNumber}
        viaUpload={data.signature === 'upload'}
        onStartOver={onStartOver}
      />
    )
  }

  const schedule = financeSchedule(totals.total)
  const isUpload = data.signature === 'upload'
  const uploaded = (data.files || []).length > 0
  const complete = bindComplete(submission)

  /* The upload path saves the terms first and only then accepts the signed
     copy, so the button has three jobs depending on where you are. */
  const primaryLabel = !isUpload
    ? 'Sign and send to the insured'
    : !data.termsSaved ? 'Continue to upload' : 'Submit signed application'

  const onPrimary = () => {
    if (isUpload && !data.termsSaved) { set({ termsSaved: true }); return }
    onBound()
  }

  return (
    <div className="w-full">
      <StepHeader
        title="Bind this policy"
        subtitle="Coverage starts on the effective date, not the date it is signed."
      />

      {/* One column, like every other step. Splitting the page put a third
          column beside the sidebar and the rail, and the form came out too
          narrow to hold its own labels. The summary reads last instead —
          which is the order you fill this in anyway. */}
      <div>
        <div className="space-y-7">
          <FieldGroup label="Terms">
            {/* Date and fee share a row rather than stacking two narrow
                boxes down the left edge of a wide column. */}
            <FormGrid>
              <DateInput
                label="Effective date"
                required
                value={effective}
                onChange={(v) => set({ effectiveDate: v })}
                error={showErrors && !effective}
              />
              {feeOpen ? (
                <div>
                  <MoneyInput
                    label="Broker fee"
                    value={data.brokerFee}
                    onChange={(v) => set({ brokerFee: v })}
                    min={0}
                    max={MAX_BROKER_FEE}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Fully earned. {money(MAX_BROKER_FEE)} is the maximum we can add.
                  </p>
                </div>
              ) : (
                /* The link takes the cell the fee will occupy, so opening it
                   swaps one control for another instead of reflowing the
                   card — and Terms is never half an empty row. */
                <div className="sm:pt-[26px]">
                  <button
                    type="button"
                    onClick={() => setFeeOpen(true)}
                    className="h-[42px] w-full inline-flex items-center justify-center rounded-lg text-[12.5px] font-semibold transition-all"
                    style={{ background: 'white', border: '1.5px dashed rgba(166,20,195,0.3)', color: '#5C2ED4' }}
                  >
                    + Add a broker fee
                  </button>
                </div>
              )}
            </FormGrid>
          </FieldGroup>

          <FieldGroup label="Payment">
            <p className="text-[12px] text-gray-400 mb-3 -mt-1">How the premium is collected.</p>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map(m => (
                <ChoiceCard
                  key={m.id}
                  selected={data.payment === m.id}
                  label={m.label}
                  detail={m.detail}
                  onSelect={() => set({ payment: m.id })}
                >
                  {m.id === 'financing' && (
                    <div className="rounded-xl px-4 py-3.5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                      {/* Thirds, not a packed row: the figures are one set of
                          numbers to read across, so they get even columns
                          rather than bunching against the left edge. */}
                      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                        {[
                          ['Down payment', money2(schedule.down)],
                          ['Instalments', String(schedule.instalments)],
                          ['Each', money2(schedule.each)],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">{k}</p>
                            <p className="text-[15px] font-bold text-gray-900 mt-1">{v}</p>
                          </div>
                        ))}
                      </div>

                      {/* A rule between what it costs and what you agree to —
                          they are two different things to read. */}
                      <p className="text-[12px] font-semibold mt-4 pt-4 im-rule underline underline-offset-2" style={{ color: '#5C2ED4' }}>
                        Review your premium finance agreement
                      </p>
                      <div className="space-y-2 mt-3">
                        <Checkbox
                          label="I agree to the terms and conditions of your Premium Finance agreement."
                          checked={!!data.financeAgreed}
                          onChange={(v) => set({ financeAgreed: v })}
                        />
                        <Checkbox
                          label="I acknowledge that the insured has read the Important Information."
                          checked={!!data.financeAcknowledged}
                          onChange={(v) => set({ financeAcknowledged: v })}
                        />
                      </div>
                      {showErrors && (!data.financeAgreed || !data.financeAcknowledged) && (
                        <FieldError className="mt-2">Both finance boxes have to be ticked.</FieldError>
                      )}
                    </div>
                  )}
                </ChoiceCard>
              ))}
            </div>
            {showErrors && !data.payment && (
              <FieldError className="mt-2">Choose how the premium is collected.</FieldError>
            )}
          </FieldGroup>

          <FieldGroup label="Signature">
            <p className="text-[12px] text-gray-400 mb-3 -mt-1">The application has to be signed by the insured before it binds.</p>
            <div className="space-y-2.5">
              {SIGNATURE_METHODS.map(m => (
                <ChoiceCard
                  key={m.id}
                  selected={data.signature === m.id}
                  label={m.label}
                  detail={m.detail}
                  onSelect={() => set({ signature: m.id })}
                >
                  {m.id === 'esign' && (
                    <div className="sm:max-w-sm">
                      <Input
                        label="Insured's email"
                        required
                        value={data.insuredEmail}
                        onChange={(v) => set({ insuredEmail: v })}
                        placeholder={business.email || 'name@company.com'}
                        error={showErrors && !data.insuredEmail}
                      />
                    </div>
                  )}

                  {m.id === 'upload' && (
                    <div className="space-y-4">
                      <UploadChecklist termsSaved={!!data.termsSaved} uploaded={uploaded} />

                      {data.termsSaved && (
                        <>
                          <div className="rounded-xl px-4 py-3.5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                            <p className="text-[12.5px] font-bold text-gray-800">Step 1 — download the application</p>
                            <p className="text-[11.5px] text-gray-500 leading-relaxed mt-0.5 mb-3">
                              Both the applicant and the agent have to sign it. Backdating is not permitted.
                            </p>
                            <button
                              type="button"
                              className="h-9 px-4 inline-flex items-center rounded-xl text-[12.5px] font-semibold transition-all"
                              style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
                            >
                              Download binding application
                            </button>
                          </div>

                          <div className="rounded-xl px-4 py-3.5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                            <p className="text-[12.5px] font-bold text-gray-800">Step 2 — upload the signed copy</p>
                            <p className="text-[11.5px] text-gray-500 mt-0.5 mb-3">PDF only, up to 10 MB each, 10 files at most.</p>
                            <label
                              className="block rounded-xl px-4 py-5 text-center cursor-pointer transition-all"
                              style={{ background: '#F9FAFB', border: '1.5px dashed #D1D5DB' }}
                            >
                              <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => set({ files: [...e.target.files].map(f => f.name).slice(0, 10) })}
                              />
                              <span className="block text-[12.5px] font-semibold" style={{ color: '#5C2ED4' }}>
                                Choose files
                              </span>
                              <span className="block text-[11.5px] text-gray-400 mt-0.5">
                                Drag files onto the field or browse for them.
                              </span>
                            </label>
                            {uploaded && (
                              <ul className="mt-3 space-y-1">
                                {data.files.map(f => (
                                  <li key={f} className="text-[11.5px] text-gray-600 flex items-center gap-1.5">
                                    <span style={{ color: '#047857' }}>✓</span> {f}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {showErrors && !uploaded && (
                              <FieldError className="mt-2">Add the signed application to continue.</FieldError>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </ChoiceCard>
              ))}
            </div>
            {showErrors && !data.signature && (
              <FieldError className="mt-2">Choose how the application gets signed.</FieldError>
            )}
          </FieldGroup>
        </div>

        {/* The upload path is not waiting on a decision, it is waiting on a
            document — so it says so instead of offering a tick that changes
            nothing. */}
        {isUpload && data.termsSaved && !uploaded ? (
          <div className="rounded-xl px-4 py-3.5 mt-5" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <p className="text-[12.5px] font-bold" style={{ color: '#B45309' }}>Waiting for the signed application</p>
            <p className="text-[11.5px] leading-relaxed mt-0.5" style={{ color: '#B45309' }}>
              Terms and payment are saved. Attach the signed copy to bind. Nothing has been charged.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <Checkbox
              label="As an agent, I agree that information entered in this application is correct to my knowledge."
              checked={!!data.attested}
              onChange={(v) => set({ attested: v })}
            />
          </div>
        )}

        {/* Same footer shape as every other step: Back left, the action
            right, and the line that qualifies it above them. */}
        <div className="mt-7 pt-2">
          {/* The figures live in the rail now, but the number the button
              commits belongs next to the button. */}
          <p className="text-xs text-gray-400 mb-3">
            <span className="text-[13px] font-bold text-gray-800">Total {money(totals.total)}</span>
            {' · Nothing is charged until the insured signs. '}
            <span className="font-semibold underline underline-offset-2" style={{ color: '#5C2ED4' }}>
              Download quote proposal
            </span>
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={onPrimary}
              disabled={!complete}
              className={`h-10 px-6 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all ${complete ? 'force-white-text' : 'cursor-not-allowed'}`}
              style={complete
                ? { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 16px rgba(92,46,212,0.25)' }
                : { background: '#D1D5DB', color: 'white' }}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
