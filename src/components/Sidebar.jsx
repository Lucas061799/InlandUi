import { useMemo } from 'react'
import sidebarBg from '../assets/sidebar-bg.png'
import norbieface from '../assets/norbieface.png'

// ── Sidebar dark mode controls ──────────────────────────────
const DARK_JUNGLE_OPACITY = 0.6    // jungle bg opacity in dark mode
const DARK_BORDER_RIGHT   = '1px solid rgba(255,255,255,0.12)' // sidebar right border in dark mode
// ────────────────────────────────────────────────────────────

function getSectionCompletion(formData) {
  const results = {}
  // 1: Class Code Search
  results[1] = !!formData.smartStart?.classId
  // 2: Business Information — require name, entity, effective date, employees, phone, email, revenue
  const b = formData.business || {}
  results[2] = !!(b.name && b.entityType && b.effectiveDate && b.annualRevenue && b.annualPayroll && b.numberOfEmployees && b.phone && b.email)
  // 3: Location
  const l = formData.location || {}
  results[3] = !!(l.address && l.city && l.state && l.zip)
  // 4: Coverage Limits — user touched coverage OR passed through to underwriting
  const hasCoverageInput = !!formData.coverage && Object.keys(formData.coverage).length > 0
  const hasUwInput = !!formData.underwriting && Object.keys(formData.underwriting).some(k => formData.underwriting[k] !== undefined && formData.underwriting[k] !== null && formData.underwriting[k] !== '')
  results[4] = hasCoverageInput || hasUwInput
  // 5: Underwriting Questions — all 7 answered
  const uw = formData.underwriting || {}
  const requiredUw = ['prior_losses', 'pending_claims', 'declined_coverage', 'criminal_bankruptcy', 'manufactures_goods', 'subcontracts', 'tangible_goods']
  results[5] = requiredUw.every(k => uw[k] !== undefined && uw[k] !== null && uw[k] !== '')
  // 6: Compare — carrier selected
  results[6] = !!formData.bind?.selectedCarrier
  // 7: Bind & Pay — bound
  results[7] = !!formData.bind?.bound
  return results
}

export default function Sidebar({ steps, activeStep, onStepClick, formData = {}, onCheckErrors, showSubmission, isDark, onToggleDark }) {
  const completion = useMemo(() => getSectionCompletion(formData), [formData])

  const allSteps = showSubmission
    ? [...steps, { id: steps.length + 1, label: 'Submission', key: 'submission' }]
    : steps

  return (
    <aside
      className="w-64 2xl:w-72 flex flex-col h-full sticky top-0 shrink-0 relative overflow-hidden"
      style={{
        background: isDark ? '#191D35' : '#ffffff',
        borderRight: isDark ? DARK_BORDER_RIGHT : '1px solid #F3F4F6',
      }}
    >

      {/* Title — product-aware (GL vs BOP) */}
      {(() => {
        const productType = formData.pageZero?.productType || 'bop'
        const productName = productType === 'gl' ? 'General Liability' : 'Business Owners Policy'
        const submissionId = productType === 'gl' ? 'GL0094894' : 'BO0094894'
        return (
          <div className="px-5 pt-5 pb-3 relative z-10">
            <h2 className="text-base font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : undefined }}>{productName}</h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Submission Number: {submissionId}</p>
            <div className="mt-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }} />
          </div>
        )
      })()}

      {/* Step Navigation */}
      <nav className="flex-1 py-1 px-3 overflow-y-auto sidebar-nav relative z-10">
        {allSteps.map((step) => {
          const isActive = step.id === activeStep
          const isDone = !!completion[step.id]
          const isSubmissionStep = step.id === steps.length + 1

          return (
            <div key={step.id} className="relative mb-0.5">
              {/* Active left accent bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #5C2ED4 0%, #A614C3 100%)' }}
                />
              )}
              <button
                onClick={() => onStepClick(step.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                style={isActive ? isDark ? {
                  background: 'linear-gradient(180deg, rgba(42,28,70,0.28) 0%, rgba(166,20,195,0.68) 100%)',
                  border: '1.5px solid rgba(166,20,195,0.65)',
                  boxShadow: '0 4px 24px rgba(166,20,195,0.25)',
                } : {
                  background: '#ffffff',
                  border: '1.5px solid #7C3AED',
                  boxShadow: '0 2px 12px rgba(92,46,212,0.12)',
                } : {
                  border: '1.5px solid transparent',
                  background: 'transparent'
                }}
              >
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={isActive
                    ? isDark
                      ? { background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }
                      : { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)', color: '#5C2ED4' }
                    : isDone
                      ? isDark
                        ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.7) 0%, rgba(166,20,195,0.7) 100%)', color: '#ffffff' }
                        : { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)', color: '#5C2ED4' }
                      : { background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6', color: isDark ? '#6B7280' : '#9CA3AF' }
                  }
                >
                  {isDone && !isActive ? '✓' : isSubmissionStep ? '✓' : step.id}
                </span>
                <span
                  className={`text-xs truncate ${isActive ? 'font-semibold' : isDone ? 'font-medium' : ''}`}
                  style={isActive
                    ? isDark
                      ? { color: '#FFFFFF' }
                      : {
                          background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }
                    : { color: isDark ? (isDone ? '#D1D5DB' : '#8B8FA8') : (isDone ? '#4B5563' : '#9CA3AF') }
                  }
                >
                  {step.label}
                </span>
              </button>
            </div>
          )
        })}
      </nav>

      {/* Chat with Norbie */}
      <div className="px-3 pb-2 relative z-10">
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
          }}
        >
          <img src={norbieface} alt="Norbie" className="w-8 h-8 rounded-full shrink-0 object-cover" />
          <div>
            <p className="text-sm font-normal" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>Chat with Norbie</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Dark Mode toggle */}
      <div className="px-3 pb-4 relative z-10">
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
          }}
        >
          {/* Toggle pill with icon inside the knob */}
          <div
            className="w-10 h-5 rounded-full relative transition-all shrink-0"
            style={{ background: isDark ? '#E8622A' : '#D1D5DB' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all flex items-center justify-center"
              style={{ left: isDark ? '22px' : '2px', background: 'white' }}
            >
              {isDark ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </div>
          </div>
          {/* Label */}
          <span style={{ fontSize: '14.5px', fontWeight: 400, color: isDark ? '#F9FAFB' : '#6B7280', WebkitTextFillColor: isDark ? '#F9FAFB' : '#6B7280' }}>Dark Mode</span>
        </button>
      </div>

      {/* Background image */}
      <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none select-none">
        <img src={sidebarBg} alt="" className="absolute bottom-0 left-0 w-full h-full object-cover object-bottom" style={{ opacity: isDark ? DARK_JUNGLE_OPACITY : 0.58, clipPath: 'inset(0 1px 0 0)' }} />
      </div>
    </aside>
  )
}
