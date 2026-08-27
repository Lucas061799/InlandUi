import { useState } from 'react'
import { Select, RadioGroup } from '../components/FormField'
import norbieface from '../assets/norbieface.png'

const PLAN_OPTIONS_MAP = {
  '12 Months': [
    'Pay in full',
    'EFT 9% down 11 Installments',
    'Recurring Credit Card 9% down 11 Installments',
    '12% down 9 Installments',
    '16% down 9 Installments',
    '25% down 3 Installments',
  ],
  '6 Months': [
    'EFT 18% down 5 Installments',
    'Recurring Credit Card 18% down 5 Installments',
    '17% down 4 Installments',
    '20% down 4 Installments',
    '34% down 3 Installments',
  ],
}

/* ── Preview Modal — matches Submission page SummarySection style ── */

const P_ICONS = {
  user:    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>,
  truck:   <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l2 1m0-11l3 5h2a1 1 0 011 1v4"/>,
  shield:  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>,
  users:   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
  wheel:   <><circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 9V3M9.17 14.83L3.93 20.07M14.83 14.83l5.24 5.24"/></>,
  building:<path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
  doc:     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>,
  card:    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>,
  warning: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
  check:   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>,
}

function PSection({ title, icon = 'shield', children, isDark }) {
  return (
    <div className="rounded-xl p-4" style={{
      background: isDark ? '#252948' : 'white',
      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(115,201,183,0.12)' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth={1.5} viewBox="0 0 24 24">
            {P_ICONS[icon]}
          </svg>
        </div>
        <h3 className="text-xs font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function PRow({ label, value, isDark }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6' }}>
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{value}</span>
    </div>
  )
}

function PYNRow({ label, value, isDark }) {
  if (!value) return null
  const yes = value === 'Yes'
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6' }}>
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: yes ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.1)', color: yes ? '#059669' : '#6B7280' }}>
        {value}
      </span>
    </div>
  )
}

function PSubLabel({ label, isDark }) {
  return <p className="text-[9px] font-bold uppercase tracking-wider pt-2 pb-0.5" style={{ color: isDark ? '#A78BFA' : '#5C2ED4' }}>{label}</p>
}

function PreviewModal({ formData, onClose, onSubmit, isDark = false }) {
  const a   = formData.applicant || {}
  const vs  = formData.vehicles?.vehicles || []
  const ds  = formData.drivers?.drivers || []
  const e   = formData.eligibility || {}
  const cov = formData.coverage || {}
  const ai  = formData.additionalInsured || {}
  const lp  = formData.lossPayee || {}
  const ph  = formData.priorHistory || {}
  const histories = ph.histories || []
  const cl  = formData.claims || {}
  const pay = formData.payment || {}
  const comments = formData.comments?.text || ''

  const ELIG_LABELS = {
    q1: 'Subsidiary of another entity?', q2: 'Vehicles leased to others?',
    q3: 'All autos owned by applicant?', q4: 'Auto records checked before driving?',
    q5: 'Employees under 18 with access?', q6: 'Family driver exposures?',
    q7: 'Non-business use allowed?', q8: 'Employees use own autos?',
    q9: 'Active auto safety program?', q10: 'Regular scheduled maintenance?',
    q11: 'Annual mileage > 40,000?', q12: 'Exposure to flammables/hazmat?',
    q13: 'Policy declined/cancelled in 3 yrs?', q14: 'Bankruptcies/liens in 5 yrs?',
    q15: 'Crosses state lines?',
  }

  const eligEntries = Object.entries(ELIG_LABELS).filter(([k]) => e[k])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh', background: isDark ? '#1A1E38' : '#F9FAFB' }}
        onClick={ev => ev.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0" style={{ background: isDark ? '#191D35' : 'white', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
          <div className="flex items-start gap-4 px-5 pt-4 pb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: isDark ? 'linear-gradient(88.09deg,rgba(92,46,212,0.45) 0%,rgba(166,20,195,0.45) 100%)' : 'linear-gradient(88.09deg,rgba(92,46,212,0.12) 0%,rgba(166,20,195,0.12) 100%)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="prevHdrG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                    <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                  </linearGradient>
                </defs>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="url(#prevHdrG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Application Preview</h1>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9CA3AF' }}>Review all details before submitting your application.</p>
            </div>
            <button
              onClick={onClose}
              title="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
              style={{ border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB', background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}
              onMouseEnter={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.15)' : 'rgba(92,46,212,0.06)'; ev.currentTarget.style.borderColor = 'rgba(92,46,212,0.3)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'white'; ev.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path stroke="url(#prevHdrG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scroll px-4 py-4" style={{ background: isDark ? '#1A1E38' : '#F9FAFB' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

            {/* Applicant */}
            {(a.namedInsured || a.email) && (
              <PSection title="Applicant Information" icon="user" isDark={isDark}>
                <PRow label="Named Insured" value={a.namedInsured} isDark={isDark} />
                <PRow label="Entity Type" value={a.entity} isDark={isDark} />
                <PRow label="Effective Date" value={a.effectiveDate} isDark={isDark} />
                <PRow label="Phone" value={a.phone} isDark={isDark} />
                <PRow label="Email" value={a.email} isDark={isDark} />
                <PRow label="Address" value={[a.address, a.city, a.state, a.zip].filter(Boolean).join(', ')} isDark={isDark} />
              </PSection>
            )}

            {/* Coverage */}
            {(cov.liabilityLimit || cov.anyAuto) && (
              <PSection title="Coverage" icon="shield" isDark={isDark}>
                <PRow label="BI/PD" value={cov.liabilityLimit} isDark={isDark} />
                <PRow label="UMBI" value={cov.umbi} isDark={isDark} />
                <PRow label="Med Pay" value={cov.medPay} isDark={isDark} />
                <PRow label="PIP" value={cov.pip} isDark={isDark} />
                <PRow label="DOT #" value={cov.dot} isDark={isDark} />
                <PYNRow label="Any Auto (sym 1)" value={cov.anyAuto} isDark={isDark} />
                <PYNRow label="Hired Auto (sym 8)" value={cov.hiredAuto} isDark={isDark} />
                <PYNRow label="Non-Owned (sym 9)" value={cov.nonOwnedAuto} isDark={isDark} />
                <PYNRow label="Cargo Coverage" value={cov.cargoCoverage} isDark={isDark} />
                {cov.cargoCoverage === 'Yes' && <PRow label="Cargo Limit" value={cov.cargoLimit} isDark={isDark} />}
                <PYNRow label="Rental Reimb." value={cov.rentalReimbursement} isDark={isDark} />
                {cov.rentalReimbursement === 'Yes' && <PRow label="Rental Limit" value={cov.rentalLimit} isDark={isDark} />}
                <PYNRow label="State Filing" value={cov.stateFiling} isDark={isDark} />
                {cov.stateFiling === 'Yes' && <PRow label="State Filing #" value={cov.stateFilingNumber} isDark={isDark} />}
                <PYNRow label="Federal Filing" value={cov.federalFiling} isDark={isDark} />
                <PYNRow label="SR 22" value={cov.sr22} isDark={isDark} />
                {cov.sr22 === 'Yes' && <PRow label="SR 22 Driver" value={cov.sr22Driver} isDark={isDark} />}
                <PYNRow label="Add. Driver Endorsement" value={cov.additionalDriverEndorsement} isDark={isDark} />
                <PYNRow label="Roadside Assistance" value={cov.roadside} isDark={isDark} />
              </PSection>
            )}

            {/* Vehicles — full width */}
            {vs.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <PSection title="Vehicles" icon="truck" isDark={isDark}>
                  <div className={`grid gap-x-6 ${vs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {vs.map((v, i) => (
                      <div key={i} className="py-1" style={{ borderBottom: vs.length > 1 ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6') : 'none' }}>
                        {vs.length > 1 && <PSubLabel label={`Vehicle #${i + 1}`} isDark={isDark} />}
                        <PRow label="Year / Make / Model" value={[v.year, v.make, v.model].filter(Boolean).join(' ')} isDark={isDark} />
                        <PRow label="VIN" value={v.vin} isDark={isDark} />
                        <PRow label="Use" value={v.use} isDark={isDark} />
                        <PRow label="Garaging State" value={v.garagingState} isDark={isDark} />
                      </div>
                    ))}
                  </div>
                </PSection>
              </div>
            )}

            {/* Drivers — full width */}
            {ds.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <PSection title="Drivers" icon="wheel" isDark={isDark}>
                  <div className={`grid gap-x-6 ${ds.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {ds.map((d, i) => (
                      <div key={i} className="py-1" style={{ borderBottom: ds.length > 1 ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6') : 'none' }}>
                        {ds.length > 1 && <PSubLabel label={`Driver #${i + 1}`} isDark={isDark} />}
                        <PRow label="Name" value={[d.firstName, d.lastName].filter(Boolean).join(' ')} isDark={isDark} />
                        <PRow label="Date of Birth" value={d.dob} isDark={isDark} />
                        <PRow label="License #" value={d.licenseNumber} isDark={isDark} />
                        <PRow label="Yrs Licensed" value={d.yearsLicensed} isDark={isDark} />
                      </div>
                    ))}
                  </div>
                </PSection>
              </div>
            )}

            {/* Eligibility — full width */}
            {eligEntries.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <PSection title="Eligibility" icon="check" isDark={isDark}>
                  <div className="grid grid-cols-2 gap-x-8">
                    {eligEntries.map(([key, label]) => (
                      <PYNRow key={key} label={label} value={e[key]} isDark={isDark} />
                    ))}
                  </div>
                </PSection>
              </div>
            )}

            {/* Additional Insured */}
            {ai.hasAdditional && (
              <PSection title="Additional Insured" icon="users" isDark={isDark}>
                <PYNRow label="Has Additional Insured" value={ai.hasAdditional} isDark={isDark} />
                {ai.hasAdditional === 'Yes' && <>
                  <PRow label="Name" value={ai.name} isDark={isDark} />
                  <PRow label="Address" value={ai.address} isDark={isDark} />
                </>}
              </PSection>
            )}

            {/* Loss Payee */}
            {lp.hasPayee && (
              <PSection title="Loss Payee" icon="building" isDark={isDark}>
                <PYNRow label="Has Loss Payee" value={lp.hasPayee} isDark={isDark} />
                {lp.hasPayee === 'Yes' && <>
                  <PRow label="Name" value={lp.name} isDark={isDark} />
                  <PRow label="Address" value={lp.address} isDark={isDark} />
                </>}
              </PSection>
            )}

            {/* Prior History */}
            {ph.hasCurrent && (
              <PSection title="Prior Insurance" icon="doc" isDark={isDark}>
                <PYNRow label="Has Prior History" value={ph.hasCurrent} isDark={isDark} />
                {histories.map((h, i) => (
                  <div key={i}>
                    {histories.length > 1 && <PSubLabel label={`Policy #${i + 1}`} isDark={isDark} />}
                    <PRow label="Carrier" value={h.carrierName} isDark={isDark} />
                    <PRow label="Policy #" value={h.policyNumber} isDark={isDark} />
                    <PRow label="BI Limits" value={h.biLimits} isDark={isDark} />
                    <PRow label="Premium" value={h.premium} isDark={isDark} />
                    <PRow label="Effective" value={h.effectiveDate} isDark={isDark} />
                    <PRow label="Expiration" value={h.expirationDate} isDark={isDark} />
                    <PRow label="Type" value={h.policyType} isDark={isDark} />
                  </div>
                ))}
                <PYNRow label="Has GL / WC / BOP?" value={ph.hasOtherPolicy} isDark={isDark} />
              </PSection>
            )}

            {/* Claim History */}
            {cl.hasClaims && (
              <PSection title="Claim History" icon="warning" isDark={isDark}>
                <PYNRow label="Has Claims" value={cl.hasClaims} isDark={isDark} />
                {(cl.claims || []).map((c, i) => (
                  <div key={i}>
                    <PSubLabel label={`Claim #${i + 1}`} isDark={isDark} />
                    <PRow label="Date / Type" value={[c.date, c.type].filter(Boolean).join(' · ')} isDark={isDark} />
                    <PRow label="Amount" value={c.amount ? `$${c.amount}` : ''} isDark={isDark} />
                  </div>
                ))}
              </PSection>
            )}

            {/* Payment Plan */}
            {(pay.planDuration || pay.paperless) && (
              <div className="col-span-1 md:col-span-2">
                <PSection title="Payment Plan" icon="card" isDark={isDark}>
                  <PYNRow label="Paperless?" value={pay.paperless} isDark={isDark} />
                  <PYNRow label="Reminder?" value={pay.reminder} isDark={isDark} />
                  <PRow label="Duration" value={pay.planDuration} isDark={isDark} />
                  <PRow label="Selected Plan" value={pay.planOption} isDark={isDark} />
                </PSection>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E7EB', background: isDark ? '#191D35' : 'white' }}>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB', background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}
            onMouseEnter={ev => ev.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#F9FAFB'}
            onMouseLeave={ev => ev.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'white'}
          >
            ← Back to Edit
          </button>
          <button
            onClick={() => { onClose(); onSubmit() }}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(88.09deg,#5C2ED4 0.11%,#A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.3)' }}
          >
            Submit Application →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── PaymentPlan ─────────────────────────────────────────────── */
export default function PaymentPlan({ formData, updateFormData, onSubmit, isDark = false }) {
  const data = formData.payment || {}
  const comments = formData.comments?.text || ''
  const set = (key) => (val) => updateFormData('payment', { [key]: val })
  const setComments = (val) => updateFormData('comments', { text: val })
  const [showPreview, setShowPreview] = useState(false)

  const handlePlanDuration = (val) => {
    updateFormData('payment', { planDuration: val, planOption: '' })
  }

  return (
    <div className="w-full">
      {showPreview && (
        <PreviewModal
          formData={formData}
          onClose={() => setShowPreview(false)}
          onSubmit={onSubmit}
          isDark={isDark}
        />
      )}

      <p className="text-xs text-gray-500 mb-5">Choose a payment schedule that works best for your business.</p>

      {/* Paperless Notification */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3">
        <RadioGroup
          label="Paperless notification?"
          options={['Yes', 'No']}
          value={data.paperless}
          onChange={set('paperless')}
        />
      </div>

      {/* Payment Reminder */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5">
        <RadioGroup
          label="Payment reminder?"
          options={['Yes', 'No']}
          value={data.reminder}
          onChange={set('reminder')}
        />
      </div>

      {/* Step 1: Pick duration */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3">
        <Select
          label="Payment Plans"
          options={['12 Months', '6 Months']}
          value={data.planDuration}
          onChange={handlePlanDuration}
          placeholder="Select..."
        />
      </div>

      {/* Step 2: Pick installment option based on duration */}
      {data.planDuration && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-8">
          <Select
            label={`${data.planDuration} Options`}
            options={PLAN_OPTIONS_MAP[data.planDuration]}
            value={data.planOption}
            onChange={set('planOption')}
            placeholder="Select..."
          />
        </div>
      )}

      {/* ── Divider separating payment from comments ── */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }} />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-[11px] font-semibold text-gray-400 tracking-widest uppercase" style={{ background: isDark ? '#131629' : 'white' }}>Not related to payment</span>
        </div>
      </div>

      {/* Comments section */}
      <div className="rounded-2xl overflow-hidden" style={isDark ? {
        background: 'linear-gradient(to top, rgba(166,20,195,0.55) 0%, rgba(92,46,212,0.35) 22%, transparent 58%), #1A1B35',
        border: 'none',
      } : {
        background: 'linear-gradient(to right, #F8F6FF, #F2FAF8)',
        border: '1px solid rgba(124,58,237,0.1)',
      }}>

        {/* Header row */}
        <div className="flex items-center gap-3.5 px-5 pt-5 pb-4">
          <img src={norbieface} alt="Norbie" className="w-10 h-10 rounded-full object-cover shrink-0" />
          <div>
            <p className="text-sm font-bold text-navy leading-tight">Anything else you'd like us to know?</p>
            <p className="text-xs text-gray-500 mt-0.5">Comments, special instructions, or questions —<br />we read every one.</p>
          </div>
        </div>

        {/* Textarea area */}
        <div className="px-5 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(92,46,212,0.1)'}` }}>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="e.g. The client prefers email contact. Fleet has seasonal usage April–October. Any additional drivers expected next quarter..."
              rows={6}
              className="w-full px-4 pt-3.5 pb-2 text-sm text-gray-700 placeholder-gray-300 bg-transparent focus:outline-none resize-none transition-all"
              style={{ display: 'block' }}
            />
            <div className="flex items-center justify-between px-4 py-2 border-t gap-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(92,46,212,0.08)', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(92,46,212,0.02)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                <span className="text-[10px] text-gray-400 truncate">Optional — won't affect your submission</span>
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  Auto-saved · submitted with your application
                </span>
                <span className="sm:hidden flex items-center gap-1 text-[10px] text-gray-400">
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  Auto-saved
                </span>
              </div>
              <span className="text-[10px] font-medium shrink-0" style={{ color: comments.length > 0 ? '#5C2ED4' : '#9CA3AF' }}>{comments.length} chars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action button — single solid gradient, left-aligned */}
      <div className="pt-6 flex items-center justify-start">
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
          style={{ background: 'linear-gradient(88.09deg,#5C2ED4 0.11%,#A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
        >
          Preview &amp; Submit
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
