/* ──────────────────────────────────────────────────────────────────────────
   Inland Marine — shared step primitives

   Everything here is built from the same tokens the rest of the app uses:
   the brand gradient, the #F9FAFB / #E5E7EB card pair, 13px semibold field
   labels and the lg/xl/2xl radius scale. Surfaces are written with the
   inline values index.css already targets under [data-dark="true"] .bop-page,
   so dark mode comes for free instead of every page threading isDark down.
   ────────────────────────────────────────────────────────────────────────── */

import { Children, useRef, useState } from 'react'
import { useClickAway } from './useClickAway'
import { usePrototypeMode } from './usePrototypeMode'
import { BRAND_GRADIENT } from '../../data/inland'

/* Gradient text — the app's accent for anything that reads as "brand". */
export function BrandText({ children, className = '' }) {
  return (
    <span
      className={className}
      style={{
        background: BRAND_GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}

/* The question this step asks. One per step, in plain words. The step
   counter lives in the rail and the sidebar, not above every heading. */
/* Same shape and rhythm as the GL / BOP section header: space above the
   title, a bold 16/18px title over a hairline rule, then a smaller gap
   before the answers. */
export function StepHeader({ title, subtitle }) {
  return (
    <div className="pt-6 md:pt-8 mb-4 md:mb-5">
      <div className="pb-3 md:pb-4 border-b" style={{ borderColor: '#D1D5DB' }}>
        <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mt-1.5">{subtitle}</p>}
      </div>
    </div>
  )
}

/* Uppercase label above a group of fields. */
export function SectionLabel({ children, className = '' }) {
  return (
    <div className={`text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5 ${className}`}>
      {children}
    </div>
  )
}

/* Labelled card holding a set of fields. */
export function FieldGroup({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <div className="rounded-xl p-5 sm:p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

/* Brand-tinted banner — carrier context the agent needs before answering. */
export function Banner({ children, icon = true }) {
  return (
    <div className="im-banner rounded-xl px-4 py-3.5 flex gap-3 items-start">
      {icon && (
        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="url(#imBannerG)" strokeWidth="1.7" />
          <path d="M12 11v5M12 8h.01" stroke="url(#imBannerG)" strokeWidth="1.9" strokeLinecap="round" />
          <defs>
            <linearGradient id="imBannerG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <p className="text-[13px] leading-relaxed text-gray-600">{children}</p>
    </div>
  )
}

/* A note under a group of fields: an icon and one grey line. Quieter than
   the tinted Banner, which is for things a carrier is telling you.

   `icon="alert"` swaps the circled i for a circled exclamation — same ring,
   the glyph just turns over — for a note that is a heads-up rather than a
   definition. */
export function InfoLine({ children, className = '', icon = 'info' }) {
  return (
    <p className={`flex items-start gap-2 text-[11.5px] text-gray-400 leading-relaxed ${className}`}>
      <svg className="w-3.5 h-3.5 shrink-0 mt-px" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="url(#imInfoLine)" strokeWidth="1.7" />
        <path d={icon === 'alert' ? 'M12 7v6M12 16h.01' : 'M12 11v5M12 8h.01'} stroke="url(#imInfoLine)" strokeWidth="1.9" strokeLinecap="round" />
        <defs>
          <linearGradient id="imInfoLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
          </linearGradient>
        </defs>
      </svg>
      <span>{children}</span>
    </p>
  )
}

/* Quiet panel that explains what a ticked checkbox means. */
export function NotePanel({ title, children }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <p className="text-[13px] font-semibold text-gray-700">{title}</p>
      {children && <p className="text-[12.5px] text-gray-500 mt-0.5 leading-relaxed">{children}</p>}
    </div>
  )
}

/* Tag chip — SIC / NAICS / coverage family. */
export function Tag({ children, tone = 'default' }) {
  const styles = tone === 'brand'
    ? { background: 'rgba(92,46,212,0.08)', border: '1px solid rgba(92,46,212,0.18)', color: '#5C2ED4' }
    : { background: 'white', border: '1px solid #E5E7EB', color: '#6B7280' }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" style={styles}>
      {children}
    </span>
  )
}

/* Info dot. Opens on hover and closes when the pointer leaves — the card
   is a descendant of this span, so moving onto it does not count as
   leaving. Click still toggles it, which is what touch does. */
export function InfoDot({ text, title, label = 'What this covers' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickAway(ref, () => setOpen(false))

  return (
    <span
      className="relative inline-flex"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="im-info-dot w-3.5 h-3.5 rounded-full flex items-center justify-center"
      >
        <span className="text-[9px] font-bold leading-none">i</span>
      </button>

      {open && (
        /* The pt-2 is the bridge across the gap: without it the pointer
           leaves the span on its way to the card. */
        <span className="absolute left-0 top-full pt-2 z-40">
          <span
            role="dialog"
            aria-label={title || label}
            className="im-info-pop block w-80 max-w-[80vw] rounded-2xl overflow-hidden text-left"
          >
            <span className="im-info-pop-head flex items-start justify-between gap-3 px-4 py-3">
              <span className="text-[14px] font-bold text-gray-900 leading-snug">{title || label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="im-info-pop-close w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span className="block px-4 py-3.5 text-[12.5px] text-gray-600 leading-relaxed">{text}</span>
          </span>
        </span>
      )}
    </span>
  )
}

/* Price placeholder — a $ sitting inside a spinning ring. The arc and the $
   both pick up the brand gradient, so waiting still looks like the product. */
export function PriceTicker({ isDark = false }) {
  return (
    <div
      className="shrink-0 relative flex items-center justify-center"
      style={{ width: 24, height: 24 }}
      title="Waiting on this carrier…"
      aria-label="Waiting on this carrier"
    >
      <svg
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '1.1s' }}
      >
        <defs>
          <linearGradient id="imSpinG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke={isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'} strokeWidth="2" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="url(#imSpinG)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        className="relative text-[11px] font-bold"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        $
      </span>
    </div>
  )
}

/* Switch. Off is a neutral track; on is the brand gradient. */
export function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full shrink-0 transition-all"
      /* No glow on the track — the gradient is signal enough, and the halo
         read as a blur around the pill. */
      style={{ background: checked ? BRAND_GRADIENT : '#D1D5DB' }}
    >
      <span
        className="im-toggle-knob absolute top-[3px] w-4 h-4 rounded-full transition-all"
        style={{ left: checked ? '21px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
      />
    </button>
  )
}

/* Currency field. Shows the band the carriers accept and says so out loud
   when the number falls outside it, rather than failing silently on quote. */
export function MoneyInput({ label, value, onChange, min, max, required = false, error = false, className = '' }) {
  const digits = (v) => String(v ?? '').replace(/[^0-9]/g, '')
  const display = value ? Number(digits(value)).toLocaleString() : ''
  const numeric = Number(digits(value))
  const outOfRange = !!value && (numeric < min || numeric > max)

  return (
    <div className={className}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(digits(e.target.value))}
          placeholder="0"
          className={`w-full border rounded-lg pl-7 pr-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
            error || outOfRange
              ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 bg-white focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300'
          }`}
        />
      </div>
      <p className="text-[11px] mt-1 text-gray-400">
        ${min.toLocaleString()} to ${max.toLocaleString()}
      </p>
      {outOfRange && (
        <FieldError className="mt-0.5">
          {numeric < min ? `The minimum is $${min.toLocaleString()}.` : `The maximum is $${max.toLocaleString()}.`}
        </FieldError>
      )}
    </div>
  )
}

/* Yes / No pair. The answer is the control: the chosen side carries the
   brand gradient, the other stays a plain outline. */
export function YesNo({ value, onChange, name }) {
  const opts = [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]
  return (
    <div className="flex gap-2 shrink-0" role="radiogroup" aria-label={name}>
      {opts.map(o => {
        const selected = value === o.v
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.v)}
            /* Selected is the gradient alone — no outline, no glow. The
               outline belongs to the option you have not picked. */
            className={`px-6 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              selected ? 'force-white-text' : 'border-[1.5px]'
            }`}
            style={selected
              ? { background: BRAND_GRADIENT, color: 'white' }
              : { background: 'white', borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

/* A row of mutually exclusive choices — deductible, TRIA. Same visual
   language as Yes / No, which is the same question with two options. */
export function PillGroup({ options, value, onChange, label, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="radiogroup" aria-label={label}>
      {options.map(opt => {
        const v = opt.value ?? opt
        const l = opt.label ?? opt
        const selected = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              selected ? 'force-white-text' : 'border-[1.5px]'
            }`}
            style={selected
              ? { background: BRAND_GRADIENT, color: 'white' }
              : { background: 'white', borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

/* One question: the sentence, the answer under it, and any follow-up the
   answer opened nested behind a brand rule so it reads as a consequence of
   the answer rather than a new question. */
export function QuestionRow({ label, help, value, onChange, error = false, last = false, children }) {
  /* A step passes every possible follow-up as a child and lets the answer
     decide which one renders. Unrendered branches come through as `false`,
     so test for real content before drawing the nested block. */
  const hasFollowUp = Children.toArray(children).some(Boolean)

  return (
    <div className={`py-5 ${last ? '' : 'border-b border-gray-100'}`}>
      <p className={`text-sm leading-relaxed mb-1 ${error ? 'text-red-500' : 'text-gray-800'}`}>{label}</p>
      {help && <p className="text-[12px] text-gray-400 mb-2.5 leading-relaxed max-w-2xl">{help}</p>}
      <div className={help ? '' : 'mt-3'}>
        <YesNo value={value} onChange={onChange} name={label} />
      </div>
      {/* The detail sits directly under the answer with the small indent
          the other Norbielink apps use — no rule down the side. */}
      {hasFollowUp && <div className="mt-4 pl-2">{children}</div>}
    </div>
  )
}

/* The error line FormField already uses — a warning glyph and 10px red —
   so a message raised by a group looks like one raised by a field. */
export function FieldError({ children, className = '' }) {
  return (
    <p className={`text-[10px] text-red-500 mt-1 flex items-center gap-1 ${className}`}>
      <span>⚠</span> {children}
    </p>
  )
}

/* Removes the row it sits in. An × rather than the word, so a list of
   them does not read as a column of links. */
export function RemoveButton({ onClick, label = 'Remove' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="im-remove w-6 h-6 rounded-full flex items-center justify-center shrink-0"
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

/* Dashed "add another" action — the GL recipe: a magenta dashed outline
   with gradient text, full width. */
/* One look, the same one the GL / BOP pages use: a purple dashed row with
   gradient text. There is deliberately no disabled variant — a greyed-out
   dashed button reads as broken, so a caller that cannot offer another row
   stops rendering this instead of dimming it. */
export function AddAnother({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="add-another-btn w-full flex items-center justify-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-3 transition"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#A614C3' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-gradient">{children}</span>
    </button>
  )
}

/* Primary gradient button. Disabled is a muted surface, never a grey blob
   the eye reads as the next thing to click. */
export function PrimaryButton({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all ${disabled ? '' : 'force-white-text'} ${className}`}
      style={disabled
        ? { background: '#D1D5DB', color: 'white', cursor: 'not-allowed' }
        : { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 16px rgba(92,46,212,0.28)' }}
    >
      {children}
    </button>
  )
}

/* Says out loud that the button is only open because prototype mode is on,
   so a half-filled step is never mistaken for a finished one. */
export function SkipBadge({ className = '' }) {
  return (
    <span
      className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide align-middle ${className}`}
      style={{ background: 'rgba(245,158,11,0.14)', color: '#B45309' }}
    >
      Prototype · skipping
    </span>
  )
}

/* Back + Continue, with the reason Continue is not available spelled out
   next to it instead of only on the field that is missing.

   `canContinue` still arrives from the step's own completeness rules and is
   still what the hint reports. Prototype mode does not change that answer —
   it only lets the button through anyway, and says so. */
export function StepNav({ onBack, onContinue, canContinue = true, hint, continueLabel = 'Continue' }) {
  const [proto] = usePrototypeMode()
  const skipping = proto && !canContinue

  return (
    /* Back on the left, forward on the right — the same footer shape as the
       GL / BOP review page. The empty span keeps Continue pinned right on
       the first step, which has nowhere to go back to. */
    <div className="pt-2">
      {/* The hint gets its own line above the buttons. Wedged between Back
          and Continue it squeezed both and read as a label on the button
          rather than a note about the step. */}
      {hint && (
        <p className={`text-xs mb-3 ${canContinue ? 'text-gray-400' : 'text-gray-500'}`}>
          {hint}
          {/* Never let a skipped step look like a finished one. */}
          {skipping && <SkipBadge />}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            Back
          </button>
        ) : <span />}

        <PrimaryButton onClick={onContinue} disabled={!canContinue && !proto}>{continueLabel}</PrimaryButton>
      </div>
    </div>
  )
}
