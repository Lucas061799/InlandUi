/* The full submission, the way the Commercial Auto submission page shows it:
   a two-column grid of section cards at the foot of the confirmation card,
   always shown — no bar to open it — teal icon, 10px rows,
   Yes / No as pills. Rows with nothing in them are left out, so a section
   only lists what was answered. The area carries the id the shared print
   stylesheet looks for, so printing shows just the submission. */

import {
  CARRIERS, DEFAULT_DEDUCTIBLE, ENHANCED_ITEMS, EQUIPMENT_CLASSES, INTEREST_TYPES, OPERATOR_TRAINING,
  PAYMENT_METHODS, SCHEDULE_ITEMS, SIGNATURE_METHODS, classById, money,
} from '../../data/inland'

/* Commercial Auto's section icons. */
const SECTION_ICONS = {
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
}

const blank = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
const yesNo = (v) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '')
const moneyOf = (v) => (blank(v) ? '' : money(Number(v)))
const joined = (...parts) => parts.filter(p => !blank(p)).join(', ')
const labelOf = (options, value) => options.find(o => (o.value ?? o.id) === value)?.label || value

function SummarySection({ title, icon = 'shield', children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(115,201,183,0.12)' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={SECTION_ICONS[icon]} />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-gray-900">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  if (blank(value) && value !== 0) return null
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-[10px] font-semibold text-right text-gray-900">{value}</span>
    </div>
  )
}

function SummaryYNRow({ label, value }) {
  if (!value) return null
  const yes = value === 'Yes'
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{ background: yes ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.1)', color: yes ? '#059669' : '#6B7280' }}
      >
        {value}
      </span>
    </div>
  )
}

function SummarySubLabel({ label }) {
  return <p className="im-sub-label text-[9px] font-bold uppercase tracking-wider pt-2 pb-0.5">{label}</p>
}

export default function SubmissionDetails({ submission = {} }) {
  const cls = submission.classCode || {}
  const classItem = classById(cls.classId)
  const b = submission.business || {}
  const cov = submission.coverage || {}
  const uw = submission.underwriting || {}
  const ai = submission.interests || {}
  const q = submission.quotes || {}
  const bind = submission.bind || {}

  const onLines = SCHEDULE_ITEMS.filter(item => cov[item.id]?.on)
  const losses = uw.losses === 'yes' ? (uw.lossList || []) : []
  const interests = ai.hasInterests === 'yes' ? (ai.interests || []) : []
  const carrier = CARRIERS.find(c => c.id === q.selectedCarrier)
  const changedLimits = ENHANCED_ITEMS.filter(item => q.enhanced?.[item.id] && q.enhanced[item.id] !== item.defaultValue)
  const files = (bind.files || []).map(f => (typeof f === 'string' ? f : f.name))

  return (
    <div id="submission-print-area" className="im-sub-rule px-6 pb-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <SummarySection title="Business Details" icon="user">
          <SummaryRow label="Applicant" value={[b.firstName, b.lastName].filter(Boolean).join(' ')} />
          <SummaryRow label="Business Name" value={b.businessName} />
          <SummaryRow label="DBA" value={b.dba} />
          <SummaryRow label="Type of Business" value={b.entityType} />
          <SummaryRow label="Effective Date" value={b.effectiveDate} />
          <SummaryRow label="Phone" value={b.phone} />
          <SummaryRow label="Email" value={b.email} />
          <SummaryRow label="Address" value={joined(b.address, b.suite)} />
          <SummaryRow label="City / State / Zip" value={joined(b.city, b.state, b.zip)} />
          <SummaryRow label="County" value={b.county} />
          <SummaryRow label="Yrs in Business" value={b.yearsInBusiness} />
          <SummaryRow label="Industry Experience" value={b.industryExperience && `${b.industryExperience} yrs`} />
          <SummaryRow
            label="Mailing Address"
            value={b.mailingSame !== false ? 'Same as business' : joined(b.mailAddress, b.mailSuite, b.mailCity, b.mailState, b.mailZip)}
          />
          <SummaryRow
            label="Inspection Contact"
            value={b.inspectionSame !== false
              ? 'The applicant'
              : [[b.inspFirstName, b.inspLastName].filter(Boolean).join(' '), b.inspPhone, b.inspEmail].filter(Boolean).join(' · ')}
          />
        </SummarySection>

        <SummarySection title="Class Code" icon="doc">
          <SummaryRow label="Class" value={classItem?.name} />
          <SummaryRow label="BTIS Code" value={classItem?.id} />
          <SummaryRow label="SIC / NAICS" value={classItem && `${classItem.sic} / ${classItem.naics}`} />
          <SummaryRow label="Operations" value={cls.description} />
        </SummarySection>

        <SummarySection title="Coverage" icon="shield">
          {onLines.length === 0 && <SummaryRow label="Lines Scheduled" value="None" />}
          {onLines.map(item => {
            const line = cov[item.id] || {}
            if (item.itemSchedule) {
              return (
                <div key={item.id}>
                  <SummarySubLabel label={item.label} />
                  {(line.items || []).map((it, i) => (
                    <div key={i}>
                      <SummaryRow label={`Item #${i + 1}`} value={it.description} />
                      <SummaryRow label="Class / Year / Serial" value={[labelOf(EQUIPMENT_CLASSES, it.equipmentClass), it.modelYear, it.serial].filter(Boolean).join(' · ')} />
                      <SummaryRow label="Limit" value={moneyOf(it.limit)} />
                    </div>
                  ))}
                </div>
              )
            }
            if (item.fields.length === 1) {
              return <SummaryRow key={item.id} label={item.label} value={moneyOf(line[item.fields[0].key]) || 'Selected'} />
            }
            return (
              <div key={item.id}>
                <SummarySubLabel label={item.label} />
                {item.fields.map(f => <SummaryRow key={f.key} label={f.label} value={moneyOf(line[f.key])} />)}
              </div>
            )
          })}
        </SummarySection>

        <SummarySection title="Quote & Signature" icon="card">
          <SummaryRow label="Carrier" value={carrier && `${carrier.name} · ${carrier.sub}`} />
          <SummaryRow label="Deductible" value={money(q.deductible ?? DEFAULT_DEDUCTIBLE)} />
          <SummaryRow label="Terrorism (TRIA)" value={(q.tria ?? 'reject') === 'include' ? 'Included' : 'Rejected'} />
          {changedLimits.map(item => <SummaryRow key={item.id} label={item.label} value={q.enhanced[item.id]} />)}
          <SummaryRow label="Effective Date" value={bind.effectiveDate || b.effectiveDate} />
          <SummaryRow label="Payment" value={labelOf(PAYMENT_METHODS, bind.payment)} />
          <SummaryRow label="Signature" value={labelOf(SIGNATURE_METHODS, bind.signature)} />
          {bind.signature === 'esign' && <SummaryRow label="Insured's Email" value={bind.insuredEmail} />}
          {bind.signature === 'upload' && <SummaryRow label="Signed Application" value={files.join(', ')} />}
        </SummarySection>

        {/* Underwriting — full row, 2-col answers inside, as Eligibility. */}
        <div className="col-span-1 md:col-span-2">
          <SummarySection title="Underwriting" icon="warning">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <SummaryYNRow label="Bankruptcy (3 yrs)" value={yesNo(uw.bankruptcy)} />
              <SummaryYNRow label="Cancelled / non-renewed (3 yrs)" value={yesNo(uw.cancelled)} />
              <SummaryYNRow label="Paid losses (4 yrs)" value={yesNo(uw.losses)} />
              <SummaryYNRow label="Listed activities or risks" value={yesNo(uw.activities)} />
              <SummaryYNRow label="Rents out without an operator" value={yesNo(uw.rentsOut)} />
              <SummaryRow label="Operator Training" value={labelOf(OPERATOR_TRAINING, uw.operatorTraining)} />
            </div>
            {uw.cancelled === 'yes' && (
              <div>
                <SummarySubLabel label="Cancellation" />
                <SummaryRow label="Reason" value={uw.cancelReason} />
                <SummaryRow label="Date" value={uw.cancelDate} />
                <SummaryRow label="Description" value={uw.cancelDescription} />
              </div>
            )}
            {losses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-1">
                {losses.map((l, i) => (
                  <div key={i}>
                    <SummarySubLabel label={`Loss #${i + 1}`} />
                    <SummaryRow label="Amount / Date" value={[moneyOf(l.amount), l.date].filter(Boolean).join(' · ')} />
                    <SummaryRow label="Description" value={l.description} />
                  </div>
                ))}
              </div>
            )}
            {uw.activities === 'yes' && (
              <SummaryRow label="Activities" value={(uw.activityList || []).join(', ')} />
            )}
          </SummarySection>
        </div>

        {/* Additional Interests — full row, items in a 2-col grid inside. */}
        <div className="col-span-1 md:col-span-2">
          <SummarySection title="Additional Interests" icon="users">
            <SummaryRow label="Has Interests?" value={yesNo(ai.hasInterests) || 'Not answered'} />
            {interests.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-1">
                {interests.map((it, i) => (
                  <div key={i}>
                    <SummarySubLabel label={`Interest #${i + 1}`} />
                    <SummaryRow label="Type" value={labelOf(INTEREST_TYPES, it.type)} />
                    <SummaryRow label="Loss Payee Type" value={it.lossPayeeType} />
                    <SummaryRow label="Coverage" value={it.coverage} />
                    <SummaryRow label="Name" value={it.name} />
                    <SummaryRow label="Loan / Lease #" value={it.loanNumber} />
                    <SummaryRow label="Address" value={joined(it.address, it.suite, it.city, it.state, it.zip)} />
                  </div>
                ))}
              </div>
            )}
          </SummarySection>
        </div>
      </div>
    </div>
  )
}
