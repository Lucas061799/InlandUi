/* ──────────────────────────────────────────────────────────────────────────
   Inland Marine — what "finished" means for each step.

   The step components, the sidebar ticks, the right-rail percentage and the
   Continue buttons all read these, so none of them can disagree about
   whether an answer is good enough to send to a carrier.
   ────────────────────────────────────────────────────────────────────────── */

import {
  SCHEDULE_ITEMS, SCHEDULE_ITEM_MIN, SCHEDULE_TOTAL_MAX, UW_QUESTIONS,
  carrierOutcomes, rerate,
} from '../../data/inland'

const digits = (v) => Number(String(v ?? '').replace(/[^0-9]/g, '')) || 0
const countWords = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length

/* ── 1. Class code ────────────────────────────────────────────────────── */

export const MIN_DESCRIPTION_WORDS = 10

export function classCodeComplete(data = {}) {
  return !!data.classId && countWords(data.description) >= MIN_DESCRIPTION_WORDS
}

export { countWords }

/* ── 2. Business details ──────────────────────────────────────────────── */

export const REQUIRED_BUSINESS_FIELDS = [
  'firstName', 'lastName', 'businessName', 'email', 'phone',
  'entityType', 'effectiveDate', 'yearsInBusiness', 'industryExperience',
  'address', 'city', 'county', 'state', 'zip',
]

const asYears = (v) => (v === '10+' ? 10 : Number(v))

/* Two rules the carriers enforce on their side. Catching them here saves a
   referral, so they are stated as sentences rather than red field borders. */
export function businessRuleErrors(data = {}) {
  const errors = []
  if (data.effectiveDate && data.effectiveDate.length === 10) {
    const [m, d, y] = data.effectiveDate.split('/')
    const chosen = new Date(+y, +m - 1, +d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!isNaN(chosen.getTime()) && chosen < today) errors.push('The effective date cannot be in the past.')
  }
  if (data.yearsInBusiness && data.industryExperience &&
      asYears(data.yearsInBusiness) > asYears(data.industryExperience)) {
    errors.push('Years in business cannot exceed total industry experience.')
  }
  return errors
}

export function businessComplete(data = {}) {
  const filled = REQUIRED_BUSINESS_FIELDS.every(k => !!data[k])
  const mailingOk = data.mailingSame !== false ||
    !!(data.mailAddress && data.mailCity && data.mailState && data.mailZip)
  const inspectionOk = data.inspectionSame !== false ||
    !!(data.inspFirstName && data.inspLastName && data.inspPhone)
  return filled && mailingOk && inspectionOk && businessRuleErrors(data).length === 0
}

/* ── 3. Coverage ──────────────────────────────────────────────────────── */

/* One row of the equipment schedule. The carriers will not list an item
   under the minimum, and they need to know what it is. */
export function scheduleItemErrors(item = {}) {
  const errors = {}
  const limit = digits(item.limit)
  if (!item.equipmentClass) errors.equipmentClass = 'Pick light / medium or heavy.'
  if (!item.limit) errors.limit = 'Enter a limit of insurance.'
  else if (limit < SCHEDULE_ITEM_MIN) errors.limit = `The minimum is $${SCHEDULE_ITEM_MIN.toLocaleString()}.`
  else if (limit > SCHEDULE_TOTAL_MAX) errors.limit = `The maximum is $${SCHEDULE_TOTAL_MAX.toLocaleString()}.`
  if (!String(item.description || '').trim()) errors.description = 'Equipment description is required.'
  return errors
}

export const scheduleItemComplete = (item) => Object.keys(scheduleItemErrors(item)).length === 0

export const scheduleItemsTotal = (items = []) =>
  items.reduce((sum, i) => sum + digits(i.limit), 0)

/* A line is rated once it is switched on and carries at least one number
   inside the band the carriers accept. A scheduled line is rated off its
   items instead. */
export function lineComplete(item, line = {}) {
  if (item.itemSchedule) {
    const items = line.items || []
    return items.length > 0 && items.every(scheduleItemComplete) &&
      scheduleItemsTotal(items) <= SCHEDULE_TOTAL_MAX
  }
  const values = item.fields.filter(f => line[f.key])
  if (values.length === 0) return false
  return values.every(f => {
    const n = digits(line[f.key])
    return n >= f.min && n <= f.max
  })
}

export function selectedLines(data = {}) {
  return SCHEDULE_ITEMS.filter(item => data[item.id]?.on)
}

export function coverageComplete(data = {}) {
  const on = selectedLines(data)
  return on.length > 0 && on.every(item => lineComplete(item, data[item.id]))
}

/* Running total of everything switched on — the number the agent is really
   asking about when they scroll back up. */
export function scheduledTotal(data = {}) {
  return selectedLines(data).reduce((sum, item) => {
    const line = data[item.id] || {}
    if (item.itemSchedule) return sum + scheduleItemsTotal(line.items)
    return sum + digits(line[item.fields[0].key])
  }, 0)
}

/* ── 4. Underwriting ──────────────────────────────────────────────────── */

export const lossComplete = (loss = {}) => !!(loss.amount && loss.date && String(loss.description || '').trim())

export function underwritingComplete(data = {}) {
  const answered = UW_QUESTIONS.every(q => data[q.id] === 'yes' || data[q.id] === 'no')
  if (!answered) return false
  if (data.cancelled === 'yes' && !data.cancelReason) return false
  if (data.losses === 'yes') {
    const losses = data.lossList || []
    if (losses.length === 0 || !losses.every(lossComplete)) return false
  }
  if (data.activities === 'yes' && (data.activityList || []).length === 0) return false
  if (!data.operatorTraining) return false
  return true
}

/* What the Continue hint counts: every question plus every follow-up the
   answers opened. */
export function underwritingAnswered(data = {}) {
  let n = UW_QUESTIONS.filter(q => data[q.id] === 'yes' || data[q.id] === 'no').length
  if (data.cancelled === 'yes' && data.cancelReason) n += 1
  if (data.losses === 'yes') n += (data.lossList || []).filter(lossComplete).length
  if (data.activities === 'yes') n += (data.activityList || []).length
  if (data.operatorTraining) n += 1
  return n
}

/* ── 5. Additional interests ──────────────────────────────────────────── */

export const MAX_INTERESTS = 4

export const interestValid = (i = {}) => {
  if (!(i.type && i.coverage && i.name && i.address && i.city && i.state && i.zip)) return false
  if (i.type === 'lossPayee' && !i.lossPayeeType) return false
  return true
}

export function interestsComplete(data = {}) {
  if (data.hasInterests === 'no') return true
  if (data.hasInterests !== 'yes') return false
  const list = data.interests || []
  return list.length > 0 && list.every(interestValid)
}

/* ── 6. Quotes ────────────────────────────────────────────────────────── */

/* Where the submission stands with the three carriers. When nobody can
   price it online the flow does not dead-end — it goes to underwriting. */
export function quoteState(submission = {}) {
  const outcomes = carrierOutcomes(submission)
  const quoted = outcomes.filter(o => o.status === 'quoted')
  const referred = outcomes.filter(o => o.status === 'referred')
  const terminal = quoted.length > 0 ? null : (referred.length > 0 ? 'referred' : 'underwriting')
  return { outcomes, quoted, referred, terminal }
}

/* Premium as it stands: the carrier's price for the chosen deductible and
   TRIA answer, plus any enhanced limits the agent moved. */
export function premiumFor(outcome, submission = {}) {
  if (!outcome || outcome.status !== 'quoted') return null
  if (!outcome.quote?.enhanced) return outcome.premium
  return rerate(outcome.premium, submission.quotes?.enhanced || {})
}

export function selectedOutcome(submission = {}) {
  const id = submission.quotes?.selectedCarrier
  if (!id) return null
  return quoteState(submission).quoted.find(o => o.carrierId === id) || null
}

export function quotesComplete(submission = {}) {
  const { terminal } = quoteState(submission)
  if (terminal) return true
  return !!selectedOutcome(submission)
}

/* ── 7. Bind ──────────────────────────────────────────────────────────── */

/* What the bind screen needs before its button opens. The upload path asks
   twice — once to save the terms, then again for the signed copy — so what
   counts as complete depends on which half you are in. */
export function bindComplete(submission = {}) {
  if (quoteState(submission).terminal) return true
  const b = submission.bind || {}
  const business = submission.business || {}

  const termsReady = !!(b.effectiveDate || business.effectiveDate)
    && !!b.payment
    && (b.payment !== 'financing' || (b.financeAgreed && b.financeAcknowledged))

  if (b.signature === 'esign') return !!(termsReady && b.insuredEmail && b.attested)
  if (b.signature === 'upload') {
    /* Past the save, the only thing left is the document itself. */
    if (b.termsSaved) return (b.files || []).length > 0
    return !!(termsReady && b.attested)
  }
  return false
}

/* The submission has left the agent's hands — out for signature, or with an
   underwriter. */
export function submissionSettled(submission = {}) {
  return !!quoteState(submission).terminal || !!submission.bind?.sent
}
