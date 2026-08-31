import { useState } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import heroImg from '../assets/norbie-heroimg.png'
import jungleImg from '../assets/jungle.png'
import { Select } from '../components/FormField'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Mirrors SmartStart's SAMPLE_CLASSES so the pre-question on PageZero
// can hand the chosen class straight into formData.smartStart.classId.
const MAIN_CLASS_OPTIONS = [
  { value: '722511', label: '722511 — Full-Service Restaurants' },
  { value: '812111', label: '812111 — Barber Shops' },
  { value: '561730', label: '561730 — Landscaping Services' },
  { value: '541611', label: '541611 — Management Consulting Services' },
  { value: '541330', label: '541330 — Engineering Services' },
  { value: '541110', label: '541110 — Offices of Lawyers' },
  { value: '238210', label: '238210 — Electrical Contractors' },
  { value: '238220', label: '238220 — Plumbing, Heating & A/C Contractors' },
  { value: '454110', label: '454110 — Electronic Shopping & Mail-Order' },
  { value: '812112', label: '812112 — Beauty Salons' },
  { value: '624410', label: '624410 — Child Day Care Services' },
  { value: '722513', label: '722513 — Limited-Service Restaurants' },
  { value: '541211', label: '541211 — Offices of CPAs' },
]

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

// What's included in each product. Edit these lists as the real content lands.
const BOP_INCLUDES = [
  'Property coverage — building, equipment, inventory',
  'General liability protection',
  'Business income / interruption',
  'Designed for bundled small-business needs',
]
const GL_INCLUDES = [
  'Third-party bodily injury',
  'Third-party property damage',
  'Personal & advertising injury',
  'Products & completed operations',
]

function ProductCard({ accent, icon, title, tagline, bullets, ctaLabel, onClick, disabled, disabledHint }) {
  // Use an outer box-shadow ring (instead of a CSS border) so the stripe child
  // can clip cleanly to the rounded corners without leaving a gray L at the top.
  const restingShadow = '0 0 0 1.5px #E5E7EB, 0 1px 2px rgba(0,0,0,0.02)'
  const hoverShadow   = '0 0 0 1.5px rgba(124,58,237,0.45), 0 12px 32px rgba(92,46,212,0.12)'
  return (
    <div
      className={`rounded-xl overflow-hidden flex flex-col transition group ${disabled ? 'cursor-not-allowed' : 'hover:-translate-y-0.5 cursor-pointer'}`}
      style={{ background: 'white', boxShadow: restingShadow, opacity: disabled ? 0.7 : 1 }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.boxShadow = hoverShadow }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = restingShadow }}
    >
      <div className="px-5 pt-5 pb-5 flex flex-col flex-1">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3.5"
          style={{ background: accent.bg }}
        >
          {icon}
        </div>

        {/* Title + tagline */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{title}</h3>
        <p className="text-[12px] text-gray-500 leading-snug mb-4">{tagline}</p>

        {/* Divider */}
        <div className="border-t mb-4" style={{ borderColor: '#F3F4F6' }} />

        {/* Bullets */}
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5">What's included</p>
        <ul className="space-y-2 mb-5 flex-1">
          {bullets.map(b => (
            <li key={b} className="flex items-start gap-2 text-[12.5px] text-gray-700 leading-snug">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: accent.bg }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={accent.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (!disabled) onClick() }}
          disabled={disabled}
          title={disabled ? disabledHint : undefined}
          className={`mt-auto w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold text-white transition ${disabled ? 'cursor-not-allowed' : 'hover:opacity-90'}`}
          style={{
            background: disabled ? '#D1D5DB' : BRAND_GRADIENT,
            boxShadow: disabled ? 'none' : '0 4px 14px rgba(92,46,212,0.22)',
          }}
        >
          {ctaLabel}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${disabled ? '' : 'group-hover:translate-x-0.5'}`}
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function PageZero({ onStart }) {
  // Pre-questions. We collect class code + state up front so the
  // SmartStart and Location pages further down the flow start
  // pre-filled with the customer's answer — matches the pattern from
  // Commercial Auto's intake.
  const [mainClass, setMainClass] = useState('')
  const [state, setState] = useState('')

  // Two-step intake: 'questions' captures class + state, then 'products'
  // shows the BOP/GL cards. Only one is visible at a time so the user
  // sees a clean before/after instead of greyed-out cards underneath
  // unanswered dropdowns.
  const [step, setStep] = useState('questions')

  const ready = !!mainClass && !!state
  const goToProducts = () => { if (ready) setStep('products') }
  const goBackToQuestions = () => setStep('questions')

  // BOP button — manager said the real route will be the existing BOP UI
  // once we can merge the two together. For now, start the in-app flow.
  const startBop = () => { if (ready) onStart({ productType: 'bop', mainClass, state }) }
  // GL — starts the full application; class code is the first step inside.
  const startGl = () => { if (ready) onStart({ productType: 'gl', mainClass, state }) }

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide font-semibold">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">

        {/* Left — form panel */}
        <div className="flex-1 lg:w-1/2 lg:flex-none overflow-y-auto relative"
          style={{ borderRight: '1px solid #F3F4F6' }}>

          {/* Faint jungle bg shown until the right-side illustration kicks in */}
          <img
            src={jungleImg} alt=""
            className="lg:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.06 }}
          />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[8%] lg:px-[10%]">
            <div className="w-full max-w-xl">

              {/* Brand heading stays the same across both steps so the
                  page feels stable; only the subtitle + body content
                  swap between question intake and product picker. */}
              <div className="mb-6">
                {/* Product eyebrow above the heading, the same gradient
                    treatment Builder's Risk uses — bold, uppercase, wide
                    tracking, brand gradient. `.text-gradient` already carries
                    its own brighter dark-mode ramp. */}
                <p className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-gradient mb-3">
                  BOP & General Liability Marketplace
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4" style={{ fontWeight: 800 }}>
                  Get Multiple Quotes.<br />
                  <span className="text-gradient">One Easy Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  {step === 'questions'
                    ? 'First, tell us a bit about the business.'
                    : 'Choose a policy to start your application.'}
                </p>
              </div>

              {step === 'questions' ? (
                <>
                  {/* Step 1 — class code + state. Stacked vertically
                      (matching Commercial Auto's intake) so each field
                      gets the full width of the form column and the
                      Class Code labels don't get truncated. */}
                  <div className="space-y-4 mb-6">
                    <Select
                      label="Main Class Code"
                      required
                      options={MAIN_CLASS_OPTIONS}
                      value={mainClass}
                      onChange={setMainClass}
                      placeholder="Select Main Class Code"
                    />
                    <Select
                      label="State"
                      required
                      options={US_STATES}
                      value={state}
                      onChange={setState}
                      placeholder="Select State"
                    />
                  </div>

                  {/* Continue — disabled until both answers are in. */}
                  <button
                    type="button"
                    onClick={goToProducts}
                    disabled={!ready}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition ${ready ? 'hover:opacity-90' : 'cursor-not-allowed'}`}
                    style={{
                      background: ready ? BRAND_GRADIENT : '#D1D5DB',
                      boxShadow: ready ? '0 4px 14px rgba(92,46,212,0.22)' : 'none',
                    }}
                    title={ready ? undefined : 'Select a class code and state to continue'}
                  >
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  {/* Step 2 — product picker. A small "Edit answers"
                      affordance lets the user step back if they picked
                      the wrong class/state. */}
                  <button
                    type="button"
                    onClick={goBackToQuestions}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-4 transition hover:opacity-70"
                    style={{ color: '#5C2ED4' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Edit answers
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <ProductCard
                      title="Business Owners Policy"
                      tagline="Property + Liability bundled into one easy policy."
                      bullets={BOP_INCLUDES}
                      ctaLabel="Start BOP Quote"
                      onClick={startBop}
                      accent={{
                        bg: 'rgba(124,58,237,0.10)',
                        stroke: '#5C2ED4',
                      }}
                      icon={(
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          {/* Briefcase — universal 'business' icon */}
                          <rect x="2" y="7" width="20" height="14" rx="2"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                      )}
                    />
                    <ProductCard
                      title="General Liability"
                      tagline="Standalone liability protection for your business."
                      bullets={GL_INCLUDES}
                      ctaLabel="Start GL Quote"
                      onClick={startGl}
                      accent={{
                        bg: 'rgba(166,20,195,0.10)',
                        stroke: '#A614C3',
                      }}
                      icon={(
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A614C3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      )}
                    />
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* Right — illustration (wide desktop only — hides at <1024px so
            the left panel doesn't get squeezed on narrow laptop windows). */}
        <div className="hidden lg:flex relative overflow-hidden shrink-0 items-center justify-center"
          style={{ width: '50%', background: 'white' }}>
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.25 }} />
          <img
            src={heroImg}
            alt="Norbie"
            className="relative z-10 select-none pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 40px rgba(92,46,212,0.18))',
            }}
          />
        </div>

      </div>
    </div>
  )
}
