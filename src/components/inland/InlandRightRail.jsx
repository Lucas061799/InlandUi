import { PriceTicker } from './primitives'
import {
  BRAND_GRADIENT, CARRIERS, ENHANCED_ITEMS, bindTotals, carrierById, classById, money, quoteFor,
} from '../../data/inland'
import { STEPS, completedCount, stepCompletion, stepIdFor } from '../../pages/inland/completion'
import { premiumFor, quoteState } from '../../pages/inland/validation'

const QUOTE_STEP = stepIdFor('quotes')
const BIND_STEP = stepIdFor('bind')

const OUTCOME_CHIP = {
  'no-appetite': 'im-chip-muted',
  declined: 'im-chip-stop',
  referred: 'im-chip-warn',
}
const OUTCOME_LABEL = {
  'no-appetite': 'No appetite',
  declined: 'Declined',
  referred: 'Referred',
}


export default function InlandRightRail({ formData, activeStep, isDark, totalSteps = 7, quoting = false, answered = 0 }) {
  const done = completedCount(formData)
  /* The summary is only worth downloading once the form steps are all
     answered — the same gate GL puts on it. */
  const completion = stepCompletion(formData)
  const formComplete = STEPS.filter(st => st.id < QUOTE_STEP).every(st => completion[st.id])
  const progressPct = Math.round((done / totalSteps) * 100)
  const classItem = formData.classCode?.classId ? classById(formData.classCode.classId) : null
  /* Prices only exist once the submission has gone out, so up to then the
     card answers the question it can: who is even in appetite. */
  /* Once a carrier is chosen the list has done its job, so from the bind
     step the rail carries the figures that are about to bind rather than the
     two quotes the agent did not take. */
  const bindOutcome = activeStep >= BIND_STEP
    ? quoteState(formData).quoted.find(o => o.carrierId === formData.quotes?.selectedCarrier)
    : null
  const bindCarrier = bindOutcome ? carrierById(bindOutcome.carrierId) : null
  const bindFigures = bindOutcome
    ? bindTotals({
        premium: premiumFor(bindOutcome, formData),
        quote: quoteFor(bindOutcome.carrierId),
        brokerFee: Math.min(Number(formData.bind?.brokerFee) || 0, 1000),
        tria: formData.quotes?.tria,
      })
    : null
  const bindEffective = formData.bind?.effectiveDate || formData.business?.effectiveDate || '—'

  const showOutcomes = activeStep >= QUOTE_STEP
  const outcomes = showOutcomes ? quoteState(formData).outcomes : []

  return (
    <aside
      className="w-72 2xl:w-96 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav bop-page">
        <h2 className="text-lg font-bold mb-3 text-gray-900">Submission in progress</h2>

        {/* Same order as the GL / BOP rail: the label row, then the bar it
            describes, then the divider. */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="autoGradIM" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'} />
                  <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'} />
                </linearGradient>
              </defs>
              <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradIM)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradIM)" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-medium text-gradient">All progress auto-saved</span>
          </div>
          <span className="text-xs font-bold text-gradient">{progressPct}%</span>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: BRAND_GRADIENT }} />
        </div>

        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* Always on. Who is on the panel is true from the first screen —
            only what they have to say about this risk changes — so gating
            the whole list on the class code emptied the rail for no reason. */}
        {bindCarrier ? (
          <div className="mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5">
              What binds
            </div>

            {/* One card, one stroke: who is binding and what it costs are the
                same fact, so they sit inside the same outline. */}
            <div className="im-figures rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="im-carrier-tile rounded-lg flex items-center justify-center shrink-0"
                  style={{ width: 36, height: 36, padding: 3.5 }}
                >
                  <img src={bindCarrier.logo} alt="" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold leading-tight text-gray-800">{bindCarrier.name}</p>
                  <p className="text-[10.5px] text-gray-400 leading-tight">{bindCarrier.sub}</p>
                </div>
              </div>

              <div className="im-figures-rule mt-3 pt-2">
                <div className="flex items-baseline justify-between gap-3 py-1">
                  <span className="text-[11.5px] text-gray-500">Effective</span>
                  <span className="text-[11.5px] font-semibold text-gray-800">{bindEffective}</span>
                </div>
                {bindFigures.lines.map(l => (
                  <div key={l.id} className="flex items-baseline justify-between gap-3 py-1">
                    <span className="text-[11.5px] text-gray-500">{l.label}</span>
                    <span className="text-[11.5px] font-semibold text-gray-800">{l.note || money(l.value)}</span>
                  </div>
                ))}
                <div className="im-figures-rule flex items-baseline justify-between gap-3 pt-2.5 mt-1.5">
                  <span className="text-[12px] font-bold text-gray-800">Total</span>
                  <span className="im-figures-total text-[18px] font-bold leading-none">{money(bindFigures.total)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5">
            Who can quote this
          </div>

          {quoting && (
            <p className="text-[11.5px] text-gray-400 mb-2.5 leading-relaxed">
              Getting prices… {answered} of {CARRIERS.length} answered.
            </p>
          )}

              <div className="space-y-2">
                {CARRIERS.map((c, i) => {
                  /* Before a class is picked nothing is out of appetite yet —
                     the row names the carrier and claims nothing else. */
                  const inAppetite = !classItem || classItem.carriers.includes(c.id)
                  const outcome = showOutcomes && !(quoting && i >= answered)
                    ? outcomes.find(o => o.carrierId === c.id)
                    : null

                  return (
                    <div
                      key={c.id}
                      className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                      style={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        opacity: inAppetite ? 1 : 0.6,
                      }}
                    >
                      <div
                        className="im-carrier-tile rounded-lg flex items-center justify-center shrink-0"
                        style={{ width: 36, height: 36, padding: 3.5 }}
                      >
                        <img
                          src={c.logo}
                          alt=""
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-[12.5px] font-bold leading-tight ${inAppetite ? 'text-gray-800' : 'text-gray-400'}`}>
                          {c.name}
                        </p>
                        <p className="text-[10.5px] text-gray-400 leading-tight">{c.sub}</p>
                      </div>

                      {/* A carrier outside appetite is never going to return a
                          price, so it says so instead of spinning. */}
                      {!classItem ? null : !inAppetite ? (
                        <span className="im-chip im-chip-muted shrink-0">No appetite</span>
                      ) : outcome?.status === 'quoted' ? (
                        <span className="text-[13px] font-bold text-gray-900 shrink-0">
                          {money(premiumFor(outcome, formData))}
                        </span>
                      ) : outcome ? (
                        <span className={`im-chip shrink-0 ${OUTCOME_CHIP[outcome.status]}`}>
                          {OUTCOME_LABEL[outcome.status]}
                        </span>
                      ) : (
                        <PriceTicker isDark={isDark} />
                      )}
                    </div>
                  )
                })}
              </div>
        </div>
        )}

        {/* Straight from the GL rail: the application download, disabled until
            every form step is answered. */}
        <button
          type="button"
          disabled={!formComplete}
          className="w-full inline-flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed"
          style={formComplete
            ? {
                background: BRAND_GRADIENT,
                color: 'white',
                boxShadow: '0 4px 14px rgba(92,46,212,0.22)',
              }
            : {
                background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFB',
                color: isDark ? '#6B7280' : '#9CA3AF',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
              }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          Download Application Summary
        </button>
        {!formComplete && (
          <p className="text-[10px] text-gray-400 text-left mt-2 leading-relaxed">
            Finish your application to download the summary.
          </p>
        )}

      </div>
    </aside>
  )
}
