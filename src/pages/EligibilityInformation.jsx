import { useState } from 'react'
import { RadioGroup } from '../components/FormField'
import norbieface from '../assets/norbieface.png'

const QUESTIONS = [
  { key: 'q3',  label: 'Are all the autos on the schedule owned by the applicant?' },
  { key: 'q4',  label: 'Are all auto records checked before employees are allowed to drive?' },
  { key: 'q9',  label: 'Does the applicant have an active auto safety program in place?' },
  { key: 'q10', label: 'Do all vehicles receive regular scheduled service and maintenance?' },
  { key: 'q1',  label: 'Is the applicant a subsidiary of another entity or does the applicant have any subsidiaries?' },
  { key: 'q2',  label: 'Are any vehicles leased to others by the applicant?' },
  { key: 'q5',  label: 'Are there any employees under the age of 18 with access to named vehicles?' },
  { key: 'q6',  label: 'Are there any family driver exposures?' },
  { key: 'q7',  label: 'Is non-business use of company vehicles allowed?' },
  { key: 'q8',  label: 'Do employees use their own autos in the business?' },
  { key: 'q11', label: 'Is the annual total mileage driven on any vehicle greater than 40,000 miles?' },
  { key: 'q12', label: 'Is there any exposure to flammables, explosives, or chemicals, or do operators involve transporting hazardous materials?' },
  { key: 'q13', label: 'Has any policy or coverage been declined, cancelled or non-renewed during the prior 3 years?' },
  { key: 'q14', label: 'Have there been any bankruptcies, tax or credit liens against the applicant in the past 5 years?' },
  { key: 'q15', label: 'Does the insured cross state lines?' },
]

const YES_KEYS = ['q3', 'q4', 'q9', 'q10']
const NO_KEYS  = ['q1', 'q2', 'q5', 'q6', 'q7', 'q8', 'q11', 'q12', 'q13', 'q14', 'q15']
const Q_MAP = Object.fromEntries(QUESTIONS.map(q => [q.key, q]))

const QUICK_FILL_DEFAULTS = {
  q1: 'No', q2: 'No', q3: 'Yes', q4: 'Yes', q5: 'No',
  q6: 'No', q7: 'No', q8: 'No', q9: 'Yes', q10: 'Yes',
  q11: 'No', q12: 'No', q13: 'No', q14: 'No', q15: 'No',
}

const YES_NO_STYLES = {
  Yes: { activeBorder: '#5C2ED4', activeText: '#5C2ED4', activeBg: 'rgba(92,46,212,0.08)', dotBg: 'linear-gradient(88.09deg, #5C2ED4 0%, #7C3AED 100%)', dotBorder: '#5C2ED4' },
  No:  { activeBorder: '#A614C3', activeText: '#A614C3', activeBg: 'rgba(166,20,195,0.08)', dotBg: 'linear-gradient(88.09deg, #A614C3 0%, #D946EF 100%)', dotBorder: '#A614C3' },
}

function ColoredYesNo({ value, onChange, isDark = false, autoFilled = false }) {
  return (
    <div className="flex gap-4">
      {['Yes', 'No'].map(opt => {
        const s = YES_NO_STYLES[opt]
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange && onChange(opt)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
            style={active
              ? { borderColor: s.activeBorder, color: isDark ? '#FFFFFF' : s.activeText, background: isDark ? 'rgba(255,255,255,0.08)' : s.activeBg }
              : {
                  borderColor: isDark ? 'rgba(255,255,255,0.22)' : '#E5E7EB',
                  color: isDark ? '#FFFFFF' : '#6b7280',
                  background: autoFilled && !isDark ? '#F9FAFB' : 'transparent',
                }
            }
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: active ? s.dotBorder : isDark ? 'rgba(255,255,255,0.3)' : '#d1d5db' }}>
              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dotBg }} />}
            </div>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function QuestionCard({ q, value, onChange, autoFilled, isDark = false }) {
  return (
    <div
      className="rounded-xl p-4 border transition-all question-card cursor-pointer"
      style={autoFilled
        ? { borderColor: isDark ? 'rgba(92,46,212,0.2)' : '#E5E7EB', background: isDark ? 'rgba(92,46,212,0.12)' : '#F9FAFB' }
        : { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', background: isDark ? '#1F2543' : '#f9fafb' }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold leading-relaxed flex-1" style={{ color: isDark ? '#F9FAFB' : '#1f2937' }}>{q.label}</p>
        {autoFilled && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5" style={{ background: isDark ? 'rgba(166,20,195,0.35)' : 'rgba(243,240,255,1)', color: isDark ? '#F0ABFC' : '#5C2ED4' }}>Auto-Filled</span>
        )}
      </div>
      <div className="mt-3">
        <ColoredYesNo value={value} onChange={onChange} isDark={isDark} autoFilled={autoFilled} />
      </div>
    </div>
  )
}

function CollapsibleGroup({ title, subtitle, keys, data, onChange, defaultColor, defaultOpen = false, isDark = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
        style={{ background: isDark ? defaultColor + '22' : '#F9FAFB', border: `1px solid ${isDark ? defaultColor + '44' : '#E5E7EB'}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: isDark ? (defaultColor === '#5C2ED4' ? '#A78BFA' : '#F0ABFC') : defaultColor }}>{title}</span>
          <span className="text-[10px] font-medium" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>{subtitle}</span>
        </div>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{ color: isDark ? (defaultColor === '#5C2ED4' ? '#A78BFA' : '#F0ABFC') : defaultColor, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="pt-2 space-y-2">
          {keys.map(key => (
            <QuestionCard
              key={key}
              q={Q_MAP[key]}
              value={data[key]}
              onChange={val => onChange(key, val)}
              autoFilled={data[key] === QUICK_FILL_DEFAULTS[key]}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function EligibilityInformation({ formData, updateFormData, isDark = false }) {
  const data = formData.eligibility || {}
  const [quickFilled, setQuickFilled] = useState(false)

  const handleQuickFill = () => {
    updateFormData('eligibility', QUICK_FILL_DEFAULTS)
    setQuickFilled(true)
  }

  const handleChange = (key, val) => {
    updateFormData('eligibility', { [key]: val })
  }

  const handleReset = () => {
    updateFormData('eligibility', {})
    setQuickFilled(false)
  }

  const allAnswered = QUESTIONS.every(q => data[q.key] !== undefined)

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-5">Please answer all questions accurately. Your responses help determine coverage eligibility.</p>

      {/* Norbie Quick-Fill Banner */}
      {!quickFilled && (
        <div
          className="mb-5 rounded-2xl px-5 py-4"
          style={{
            background: isDark ? 'rgba(92,46,212,0.12)' : 'linear-gradient(135deg, #F8F6FF 0%, #F2FAF8 100%)',
            border: isDark ? '1px solid rgba(92,46,212,0.25)' : '1px solid rgba(124,58,237,0.12)',
          }}
        >
          {/* Desktop: single row — icon+text left, button right */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug" style={{ color: isDark ? '#F9FAFB' : '#1B0750' }}>
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Apply <span className="font-semibold text-gradient">recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              onClick={handleQuickFill}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 shrink-0"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>

          {/* Mobile: stacked — icon+text on top, full-width button below */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug" style={{ color: isDark ? '#F9FAFB' : '#1B0750' }}>
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Apply <span className="font-semibold text-gradient">recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              onClick={handleQuickFill}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>
        </div>
      )}

      {/* After quick-fill: two collapsible dropdowns */}
      {quickFilled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium" style={{ color: isDark ? '#C084FC' : '#5C2ED4' }}>
              Standard answers applied — expand each group to review or adjust.
            </p>
            <button onClick={handleReset} className="text-[10px] underline shrink-0" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Reset all</button>
          </div>
          <CollapsibleGroup
            title="Users usually select Yes to these questions"
            subtitle={`(${YES_KEYS.length} questions)`}
            keys={YES_KEYS}
            data={data}
            onChange={handleChange}
            defaultColor="#5C2ED4"
            defaultOpen={false}
            isDark={isDark}
          />
          <CollapsibleGroup
            title="Users usually select No to these questions"
            subtitle={`(${NO_KEYS.length} questions)`}
            keys={NO_KEYS}
            data={data}
            onChange={handleChange}
            defaultColor="#A614C3"
            defaultOpen={false}
            isDark={isDark}
          />
        </div>
      ) : (
        /* Before quick-fill: questions in two labeled groups */
        <div className="space-y-6">
          {/* YES group */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}>
                Ideally answered Yes
              </span>
              <span className="text-[10px] text-gray-400">Low risk / Compliant</span>
            </div>
            <div className="space-y-2">
              {YES_KEYS.map(key => (
                <QuestionCard key={key} q={Q_MAP[key]} value={data[key]} onChange={val => handleChange(key, val)} autoFilled={false} isDark={isDark} />
              ))}
            </div>
          </div>

          {/* NO group */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}>
                Ideally answered No
              </span>
              <span className="text-[10px] text-gray-400">High risk / Warning indicators</span>
            </div>
            <div className="space-y-2">
              {NO_KEYS.map(key => (
                <QuestionCard key={key} q={Q_MAP[key]} value={data[key]} onChange={val => handleChange(key, val)} autoFilled={false} isDark={isDark} />
              ))}
            </div>
          </div>
        </div>
      )}

      {allAnswered && (
        <div className="mt-5 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke={isDark ? '#C084FC' : '#7C3AED'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-[11px] text-gradient font-medium">All eligibility questions answered — you're good to continue!</p>
        </div>
      )}
    </div>
  )
}
