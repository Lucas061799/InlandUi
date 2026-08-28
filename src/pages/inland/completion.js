/* One place that decides whether a step is done. The sidebar ticks, the
   right-rail percentage and the Continue buttons all read this, so they can
   never disagree with each other. */

import {
  businessComplete, classCodeComplete, coverageComplete, interestsComplete,
  quotesComplete, submissionSettled, underwritingComplete,
} from './validation'

export const STEPS = [
  { id: 1, label: 'Business Details',     slice: 'business' },
  { id: 2, label: 'Coverage',             slice: 'coverage' },
  { id: 3, label: 'Underwriting',         slice: 'underwriting' },
  { id: 4, label: 'Additional Interests', slice: 'interests' },
  { id: 5, label: 'Compare Quotes',       slice: 'quotes' },
  { id: 6, label: 'Bind & Pay',           slice: 'bind' },
]

/* Steps are addressed by what they ask about, not by a number that moves
   whenever the flow changes shape. */
export const stepIdFor = (slice) => STEPS.find(s => s.slice === slice).id

export function stepCompletion(formData = {}) {
  return {
    /* The class card sits at the top of this step, so both have to be
       good before it counts as done. */
    1: classCodeComplete(formData.classCode) && businessComplete(formData.business),
    2: coverageComplete(formData.coverage),
    3: underwritingComplete(formData.underwriting),
    4: interestsComplete(formData.interests),
    5: quotesComplete(formData),
    6: submissionSettled(formData),
  }
}

export function completedCount(formData) {
  return Object.values(stepCompletion(formData)).filter(Boolean).length
}
