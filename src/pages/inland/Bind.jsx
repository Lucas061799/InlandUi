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
  Banner, BrandText, FieldError, MoneyInput, PrimaryButton, SectionLabel, StepHeader,
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
    /* Selected is the brand purple→magenta as a stroke — a class, so dark
       mode can swap the stops. The flat #7C3AED ring it replaces read as
       plain violet next to the gradient everywhere else. */
    <div
      className={`rounded-xl transition-all ${selected ? 'im-choice-on' : ''}`}
      style={selected ? undefined : { background: 'white', border: '1.5px solid #E5E7EB' }}
    >
      <button type="button" onClick={onSelect} className="w-full text-left px-4 py-3.5 flex items-start gap-3">
        {selected ? (
          <span className="im-radio-on w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center">
            <span className="im-radio-dot w-1.5 h-1.5 rounded-full" />
          </span>
        ) : (
          <span className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ border: '2px solid #D1D5DB' }} />
        )}
        <span className="min-w-0">
          <span className="block text-[13.5px] font-bold text-gray-900">{label}</span>
          <span className="block text-[12px] text-gray-500 leading-relaxed mt-0.5">{detail}</span>
        </span>
      </button>
      {/* pl-11 lines the revealed field up with the label and description,
          not the card edge: the radio is 16px and the gap 12px, so the text
          column starts 28px past the card's own px-4. */}
      {/* What a choice opens sits under a thin rule inside the same card —
          no panel-in-a-card-in-a-card, which read as boxes three deep. */}
      {selected && children && (
        <div className="pl-11 pr-4 pb-4">
          <div className="im-rule-brand pt-4">{children}</div>
        </div>
      )}
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
    <div className="space-y-3">
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

/* The end of the flow, in the framed card the Commercial Auto and GL / BOP
   submission pages close on: accent bar, header, a three-up info row, then
   the details. Not "bound" — the policy binds when the insured signs, and
   saying so is the point of this screen. Colours live in im-sub-* classes
   because this flow themes through index.css, not an isDark prop. */
function SentConfirmation({ carrier, totals, submissionNumber, viaUpload, onStartOver }) {
  const sentOn = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const info = [
    { label: 'Quote number', value: submissionNumber, brand: true },
    { label: viaUpload ? 'Date received' : 'Date sent', value: sentOn },
    { label: 'Status', value: viaUpload ? 'Checking signatures' : 'Awaiting signature', pending: true },
  ]

  return (
    <div className="w-full space-y-5">
      <div className="im-sub-card rounded-2xl overflow-hidden">
        <div className="h-1" style={{ background: BRAND_GRADIENT }} />

        <div className="flex items-start gap-4 px-6 pt-5 pb-4">
          <div className="im-sub-check w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="imSentG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="im-sub-stop-a" />
                  <stop offset="100%" className="im-sub-stop-b" />
                </linearGradient>
              </defs>
              <path d="M5 13l4 4L19 7" stroke="url(#imSentG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {viaUpload ? 'Signed application received' : 'Sent for signature'}
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {viaUpload
                ? 'Both signatures are in. The policy binds once the carrier confirms, and you can track it in NorbieLink until it does.'
                : 'The policy binds automatically as soon as the insured signs, and you can track it in NorbieLink until it does.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            title="Print / Save as PDF"
            className="im-sub-print w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path stroke="url(#imSentG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>

        {/* Quote number · date · status, the same three-up row the other
            submission pages use. */}
        <div className="im-sub-rule grid grid-cols-3">
          {info.map((item, i) => (
            <div key={item.label} className={`px-5 py-4 min-w-0 ${i ? 'im-sub-cell' : ''}`}>
              <p className="text-[10px] text-gray-400 mb-1">{item.label}</p>
              {item.pending ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-sm font-semibold text-amber-500">{item.value}</span>
                </span>
              ) : item.brand ? (
                <p className="text-sm font-semibold"><span className="text-gradient">{item.value}</span></p>
              ) : (
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* What was sent: the carrier and the total it is made of. */}
        <div className="im-sub-rule px-6 py-4">
          <SummaryRow label="Carrier" value={`${carrier.name} · ${carrier.sub}`} />
          {totals.lines.map(l => (
            <SummaryRow key={l.id} label={l.label} value={l.note || money(l.value)} />
          ))}
          <div className="flex items-start justify-between gap-6 pt-3.5 mt-1">
            <span className="text-[13px] font-bold text-gray-800">Total</span>
            <span className="text-[15px] font-bold text-gray-900">{money(totals.total)}</span>
          </div>
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
  const [dragging, setDragging] = useState(false)
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
  /* Files are kept as { name, size }. Older entries were bare names, so
     normalise rather than assume. PDFs only, 10 MB each, 10 at most. */
  const files = (data.files || []).map(f => (typeof f === 'string' ? { name: f, size: 0 } : f))
  const addFiles = (list) => {
    const incoming = [...(list || [])]
      .filter(f => (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) && f.size <= 10 * 1024 * 1024)
      .map(f => ({ name: f.name, size: f.size }))
      .filter(f => !files.some(e => e.name === f.name))
    set({ files: [...files, ...incoming].slice(0, 10) })
  }
  const removeFile = (name) => set({ files: files.filter(f => f.name !== name) })
  const formatBytes = (n) => (!n ? '' : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`)
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
          <div>
            <SectionLabel>Terms</SectionLabel>
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
          </div>

          <div>
            <SectionLabel>Payment</SectionLabel>
            <p className="text-[12px] text-gray-400 mb-3">How the premium is collected.</p>
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
                    <div>
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
                      <p className="text-[12px] font-semibold mt-4 pt-4 im-rule-brand underline underline-offset-2" style={{ color: '#5C2ED4' }}>
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
          </div>

          <div>
            <SectionLabel>Signature</SectionLabel>
            <p className="text-[12px] text-gray-400 mb-3">The application has to be signed by the insured before it binds.</p>
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
                          <div className="im-rule-brand pt-4">
                            <p className="text-[12.5px] font-bold text-gray-800">Step 1 — download the application</p>
                            <p className="text-[11.5px] text-gray-500 leading-relaxed mt-0.5 mb-3">
                              Both the applicant and the agent have to sign it. Backdating is not permitted.
                            </p>
                            {/* The app's download action — the gradient button and
                                arrow the GL / BOP summary downloads with. */}
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold force-white-text transition hover:opacity-90"
                              style={{ background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
                            >
                              Download binding application
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v12m0 0l-4-4m4 4 4-4M5 21h14" />
                              </svg>
                            </button>
                          </div>

                          <div className="im-rule-brand pt-4">
                            <p className="text-[12.5px] font-bold text-gray-800">Step 2 — upload the signed copy</p>
                            <p className="text-[11.5px] text-gray-500 mt-0.5 mb-3">PDF only, up to 10 MB each, 10 files at most.</p>

                            {/* The GL / BOP upload's drop zone: dashed brand border,
                                a paperclip tile, and "click to browse". */}
                            <label
                              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                              onDragLeave={() => setDragging(false)}
                              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                              className={`im-drop ${dragging ? 'im-drop-on' : ''} cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${uploaded ? 'py-3.5' : 'py-7'}`}
                            >
                              <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
                              />
                              <span className="im-icon-tile w-11 h-11 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                                  <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke="url(#imClipG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  <defs>
                                    <linearGradient id="imClipG" x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </span>
                              {uploaded ? (
                                <span className="text-xs text-gray-400">or <span className="text-gradient font-semibold">add more files</span></span>
                              ) : (
                                <>
                                  <span className="text-sm font-semibold text-gray-900">Drop the signed application here</span>
                                  <span className="text-xs text-gray-400">or <span className="text-gradient font-semibold">click to browse</span></span>
                                </>
                              )}
                            </label>

                            {uploaded && (
                              <div className="space-y-2 mt-2.5">
                                {files.map(f => (
                                  <div key={f.name} className="im-file-row flex items-center gap-3 px-3 py-2.5 rounded-xl">
                                    <span className="im-icon-tile w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="url(#imPdfG)" strokeWidth="1.6" strokeLinejoin="round" />
                                        <path d="M13 3v5a1 1 0 001 1h5M9 13h6M9 17h4" stroke="url(#imPdfG)" strokeWidth="1.6" strokeLinecap="round" />
                                        <defs>
                                          <linearGradient id="imPdfG" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
                                          </linearGradient>
                                        </defs>
                                      </svg>
                                    </span>
                                    <span className="flex-1 min-w-0">
                                      <span className="block text-xs font-semibold text-gray-900 truncate">{f.name}</span>
                                      {f.size > 0 && <span className="block text-[10px] text-gray-400">{formatBytes(f.size)}</span>}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(f.name)}
                                      aria-label={`Remove ${f.name}`}
                                      className="im-file-remove w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition"
                                    >
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
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
          </div>
        </div>

        {/* The upload path is not waiting on a decision, it is waiting on a
            document — so it says so instead of offering a tick that changes
            nothing. */}
        {isUpload && data.termsSaved && !uploaded ? (
          <div className="rounded-xl px-4 py-3.5 mt-8" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <p className="text-[12.5px] font-bold" style={{ color: '#B45309' }}>Waiting for the signed application</p>
            <p className="text-[11.5px] leading-relaxed mt-0.5" style={{ color: '#B45309' }}>
              Terms and payment are saved. Attach the signed copy to bind. Nothing has been charged.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <Checkbox
              label="As an agent, I agree that information entered in this application is correct to my knowledge."
              checked={!!data.attested}
              onChange={(v) => set({ attested: v })}
            />
          </div>
        )}

        {/* Same footer shape as every other step: Back left, the action
            right, and the line that qualifies it above them. */}
        <div className="mt-4">
          {/* The figures live in the rail now, but the number the button
              commits belongs next to the button. */}
          <p className="text-xs text-gray-400 mb-4">
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
