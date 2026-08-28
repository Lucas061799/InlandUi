/* ──────────────────────────────────────────────────────────────────────────
   Inland Marine — 7-step submission flow.

   Same chrome as the rest of Norbielink: full-width header, step rail on the
   left, the question in the middle, and context on the right at wide widths.
   One step is on screen at a time — an Inland Marine submission branches on
   the class code, so the questions further down only make sense once the
   earlier ones are answered.

   Dark mode is the app-wide convention: data-dark on <html> plus the
   .bop-page class on the content surface, which is what index.css targets.
   ────────────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'

import InlandSidebar from './components/inland/InlandSidebar'
import InlandRightRail from './components/inland/InlandRightRail'

import PageZero from './pages/inland/PageZero'
import BusinessDetails from './pages/inland/BusinessDetails'
import Coverage from './pages/inland/Coverage'
import Underwriting from './pages/inland/Underwriting'
import AdditionalInterests from './pages/inland/AdditionalInterests'
import CompareQuotes from './pages/inland/CompareQuotes'
import Bind from './pages/inland/Bind'
import { STEPS, stepCompletion, stepIdFor } from './pages/inland/completion'
import { CARRIERS } from './data/inland'

const SUBMISSION_NUMBER = 'QNI01123354'
const TOTAL_STEPS = STEPS.length
/* Continue on the step before the quotes is the one place the flow waits. */
const LAST_FORM_STEP = stepIdFor('quotes') - 1
/* Carriers answer one at a time so the wait reads as three requests rather
   than one spinner. */
const CARRIER_REPLY_MS = 550

export default function InlandApp() {
  const [formData, setFormData] = useState({})
  const [step, setStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)
  const [attempted, setAttempted] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [answeredCarriers, setAnsweredCarriers] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
  }, [darkMode])

  const set = useCallback((slice) => (patch) => {
    setFormData(prev => ({ ...prev, [slice]: { ...prev[slice], ...patch } }))
  }, [])

  /* Leaving a step that is not finished is what turns its inline hints on.
     Nothing is marked wrong while the agent is still filling it in. */
  const goToStep = useCallback((next) => {
    const done = stepCompletion(formData)
    if (step !== next && !done[step]) {
      setAttempted(a => (a.includes(step) ? a : [...a, step]))
    }
    setStep(next)
    setMaxStep(m => Math.max(m, next))
    setMobileNavOpen(false)
    window.requestAnimationFrame(() => {
      document.getElementById('im-main')?.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [formData, step])

  /* Step 5 hands the submission to every carrier in appetite, so Continue
     there is the one place the flow waits on something. */
  const handleContinue = useCallback(() => {
    if (step === LAST_FORM_STEP) {
      setQuoting(true)
      setAnsweredCarriers(0)
      goToStep(6)
      CARRIERS.forEach((_, i) => {
        setTimeout(() => setAnsweredCarriers(i + 1), (i + 1) * CARRIER_REPLY_MS)
      })
      setTimeout(() => setQuoting(false), (CARRIERS.length + 1) * CARRIER_REPLY_MS)
      return
    }
    goToStep(Math.min(step + 1, TOTAL_STEPS))
  }, [step, goToStep])

  const handleBack = useCallback(() => goToStep(Math.max(step - 1, 1)), [step, goToStep])

  const startOver = useCallback(() => {
    setFormData({})
    setStep(1)
    setMaxStep(1)
    setAttempted([])
    setQuoting(false)
    setAnsweredCarriers(0)
    setStarted(false)
  }, [])

  /* Page zero's two answers are the first step's first half. */
  const handleStart = useCallback(({ classId, description }) => {
    setFormData(prev => ({
      ...prev,
      classCode: { ...prev.classCode, classId, description },
    }))
    setStarted(true)
    setStep(1)
    setMaxStep(m => Math.max(m, 1))
  }, [])

  const showErrors = attempted.includes(step)
  const stepProps = {
    onBack: handleBack,
    onContinue: handleContinue,
    showErrors,
  }

  const current = {
    1: (
      <BusinessDetails
        data={formData.business || {}}
        set={set('business')}
        classCode={formData.classCode || {}}
        setClassCode={set('classCode')}
        {...stepProps}
        onBack={undefined}
      />
    ),
    2: <Coverage data={formData.coverage || {}} set={set('coverage')} {...stepProps} />,
    3: <Underwriting data={formData.underwriting || {}} set={set('underwriting')} submission={formData} {...stepProps} />,
    4: <AdditionalInterests data={formData.interests || {}} set={set('interests')} {...stepProps} />,
    5: (
      <CompareQuotes
        data={formData.quotes || {}}
        set={set('quotes')}
        submission={formData}
        quoting={quoting}
        answered={answeredCarriers}
        {...stepProps}
      />
    ),
    6: (
      <Bind
        data={formData.bind || {}}
        set={set('bind')}
        submission={formData}
        submissionNumber={SUBMISSION_NUMBER}
        onBack={handleBack}
        onBound={() => set('bind')({ bound: true })}
        onStartOver={startOver}
        showErrors={showErrors}
      />
    ),
  }[step]

  if (!started) {
    return (
      <PageZero
        onStart={handleStart}
        initialClassId={formData.classCode?.classId}
        initialDescription={formData.classCode?.description}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: darkMode ? '#131629' : 'white' }}>
      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: darkMode ? '#191D35' : 'white',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-3 md:px-5 w-auto md:w-64 2xl:md:w-72 md:shrink-0">
          <button
            className="md:hidden mr-3 p-1.5 rounded-lg"
            style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open steps"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* The logo goes back to page zero. Nothing is thrown away — the
              two answers there come back filled in. */}
          <button
            type="button"
            onClick={() => setStarted(false)}
            aria-label="Back to the start"
            className="transition hover:opacity-80"
          >
            <img src={darkMode ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-8" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 md:px-8">
          <span className="hidden sm:inline text-xs text-gray-400 tracking-wide whitespace-nowrap">POWERED BY</span>
          <img src={darkMode ? btisLogoDark : btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <div
          className={`fixed md:relative inset-y-0 left-0 z-40 h-full shrink-0 transition-transform duration-300 ease-in-out ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ top: 0 }}
        >
          <InlandSidebar
            activeStep={step}
            maxStep={maxStep}
            formData={formData}
            submissionNumber={SUBMISSION_NUMBER}
            isDark={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onStepClick={goToStep}
          />
        </div>

        <main
          id="im-main"
          className="flex-1 overflow-y-auto custom-scroll"
          style={{ background: darkMode ? '#131629' : 'white' }}
        >
          {/* The GL / BOP shell insets twice — once off the rails, once
              inside the card — which lands the form column at 864px once
              there is room for all three columns. Below that the second
              inset is dropped rather than starving the middle. */}
          <div className="bop-page mx-auto max-w-5xl 2xl:max-w-6xl px-4 md:px-10 py-6 md:py-8">
            {/* No top padding here — the section header carries its own
                pt-8, and doubling them put 96px above the first title
                where GL has 64. */}
            <div className="2xl:px-10 pb-8 md:pb-10">
              {current}
            </div>
          </div>
        </main>

        {/* The rail is context, not chrome: it earns its space from 1280px
            up, which is where most agents actually work. */}
        <div className="hidden xl:block">
          <InlandRightRail
            formData={formData}
            activeStep={step}
            isDark={darkMode}
            totalSteps={TOTAL_STEPS}
            quoting={quoting}
            answered={answeredCarriers}
          />
        </div>
      </div>
    </div>
  )
}
