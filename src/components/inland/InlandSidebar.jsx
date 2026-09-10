import sidebarBg from '../../assets/sidebar-bg.png'
import norbieface from '../../assets/norbieface.png'
import { BRAND_GRADIENT } from '../../data/inland'
import { STEPS, stepCompletion } from '../../pages/inland/completion'
import { usePrototypeMode } from './usePrototypeMode'

const DARK_JUNGLE_OPACITY = 0.6

export default function InlandSidebar({
  activeStep, maxStep, formData, submissionNumber, isDark, onToggleDark, onStepClick,
}) {
  const completion = stepCompletion(formData)
  const [proto, , toggleProto] = usePrototypeMode()

  return (
    <aside
      className="w-64 2xl:w-72 flex flex-col h-full sticky top-0 shrink-0 relative overflow-hidden"
      style={{
        background: isDark ? '#191D35' : '#ffffff',
        borderRight: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #F3F4F6',
      }}
    >
      <div className="px-5 pt-5 pb-3 relative z-10">
        <h2 className="text-base font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : undefined }}>
          Inland Marine
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Submission Number: {submissionNumber}</p>
        <div className="mt-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }} />
      </div>

      <nav className="flex-1 py-1 px-3 overflow-y-auto sidebar-nav relative z-10">
        {STEPS.map(step => {
          const isActive = step.id === activeStep
          const isDone = !!completion[step.id]
          /* The four form sections share one page and none depends on
             another, so they are always open — InlandApp passes a maxStep
             that covers them. Compare Quotes and Bind open once reached. */
          const reachable = step.id <= maxStep

          return (
            <div key={step.id} className="relative mb-0.5">
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #5C2ED4 0%, #A614C3 100%)' }}
                />
              )}
              <button
                onClick={() => reachable && onStepClick(step.id)}
                disabled={!reachable}
                aria-current={isActive ? 'step' : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                style={isActive
                  ? isDark
                    ? {
                        background: 'linear-gradient(180deg, rgba(42,28,70,0.28) 0%, rgba(166,20,195,0.68) 100%)',
                        border: '1.5px solid rgba(166,20,195,0.65)',
                        boxShadow: '0 4px 24px rgba(166,20,195,0.25)',
                      }
                    : {
                        background: '#ffffff',
                        border: '1.5px solid #7C3AED',
                        boxShadow: '0 2px 12px rgba(92,46,212,0.12)',
                      }
                  : { border: '1.5px solid transparent', background: 'transparent', cursor: reachable ? 'pointer' : 'default' }}
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
                      : { background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6', color: isDark ? '#6B7280' : '#9CA3AF' }}
                >
                  {isDone && !isActive ? '✓' : step.id}
                </span>
                <span
                  className={`text-xs truncate ${isActive ? 'font-semibold' : isDone ? 'font-medium' : ''}`}
                  style={isActive
                    ? isDark
                      ? { color: '#FFFFFF' }
                      : {
                          background: BRAND_GRADIENT,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }
                    : { color: isDark ? (isDone ? '#D1D5DB' : '#8B8FA8') : (isDone ? '#4B5563' : '#9CA3AF') }}
                >
                  {step.label}
                </span>
              </button>
            </div>
          )
        })}
      </nav>

      <div className="px-3 pb-2 relative z-10">
        <button
          type="button"
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
          }}
        >
          <img src={norbieface} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover" />
          <div>
            <p className="text-sm font-normal" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>Chat with Norbie</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>AI Assistant</p>
          </div>
        </button>
      </div>

      <div className="px-3 pb-4 relative z-10">
        <button
          onClick={onToggleDark}
          role="switch"
          aria-checked={isDark}
          aria-label="Dark mode"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
          }}
        >
          <div className="w-10 h-5 rounded-full relative transition-all shrink-0" style={{ background: isDark ? '#E8622A' : '#D1D5DB' }}>
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all flex items-center justify-center"
              style={{ left: isDark ? '22px' : '2px', background: 'white' }}
            >
              {isDark ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </div>
          </div>
          <span style={{ fontSize: '14.5px', fontWeight: 400, color: isDark ? '#F9FAFB' : '#6B7280', WebkitTextFillColor: isDark ? '#F9FAFB' : '#6B7280' }}>
            Dark Mode
          </span>
        </button>

        {/* Prototype mode. Same switch as dark mode so it is obviously a
            setting rather than part of the submission, in the app's amber —
            the hue this flow already uses for "an underwriter should look". */}
        <button
          onClick={toggleProto}
          role="switch"
          aria-checked={proto}
          aria-label="Prototype mode — skip required fields"
          title="Skip required fields while prototyping (⌥⇧P)"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-2"
          style={{
            background: proto
              ? 'rgba(245,158,11,0.14)'
              : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: proto
              ? '1.5px solid rgba(245,158,11,0.45)'
              : isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
          }}
        >
          <div className="w-10 h-5 rounded-full relative transition-all shrink-0" style={{ background: proto ? '#F59E0B' : '#D1D5DB' }}>
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all"
              style={{ left: proto ? '22px' : '2px', background: 'white' }}
            />
          </div>
          <span className="min-w-0 text-left" style={{ fontSize: '14.5px', fontWeight: 400, color: isDark ? '#F9FAFB' : '#6B7280', WebkitTextFillColor: isDark ? '#F9FAFB' : '#6B7280' }}>
            Prototype Mode
            <span className="block text-[11px]" style={{ color: '#9CA3AF', WebkitTextFillColor: '#9CA3AF' }}>
              Skip required fields · ⌥⇧P
            </span>
          </span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none select-none">
        <img
          src={sidebarBg}
          alt=""
          className="absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          style={{ opacity: isDark ? DARK_JUNGLE_OPACITY : 0.58, clipPath: 'inset(0 1px 0 0)' }}
        />
      </div>
    </aside>
  )
}
