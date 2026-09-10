/* ──────────────────────────────────────────────────────────────────────────
   Inland Marine — submission flow.

   Same chrome as the rest of Norbielink: full-width header, step rail on the
   left, the form in the middle, and context on the right at wide widths.

   Steps 1–4 are one scrolling page. None of them depends on another's
   answers — each step reads and validates only its own slice — so an agent
   can fill them in any order, and the rail jumps to a section instead of
   swapping pages. Compare Quotes is the first thing that needs all four, so
   it stays its own page behind a single Get quotes, and Bind follows it.

   Dark mode is the app-wide convention: data-dark on <html> plus the
   .bop-page class on the content surface, which is what index.css targets.
   ────────────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'

import InlandSidebar from './components/inland/InlandSidebar'
import InlandRightRail from './components/inland/InlandRightRail'
import { StepNav } from './components/inland/primitives'
import { usePrototypeMode } from './components/inland/usePrototypeMode'

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
const QUOTE_STEP = stepIdFor('quotes')
const LAST_FORM_STEP = QUOTE_STEP - 1
/* The sections that share the long page, in page order. */
const FORM_STEP_IDS = STEPS.filter(s => s.id < QUOTE_STEP).map(s => s.id)
/* Carriers answer one at a time so the wait reads as three requests rather
   than one spinner. */
const CARRIER_REPLY_MS = 550
/* How close to the top of the scroll area a section has to come before the
   rail calls it the current one. */
const SPY_OFFSET = 140
const sectionId = (id) => `im-section-${id}`

export default function InlandApp() {
  const [formData, setFormData] = useState({})
  const [step, setStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)
  const [attempted, setAttempted] = useState([])
  const [formAttempted, setFormAttempted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [answeredCarriers, setAnsweredCarriers] = useState(0)
  const [started, setStarted] = useState(false)
  const [proto, , toggleProto] = usePrototypeMode()

  const onFormPage = started && step <= LAST_FORM_STEP
  /* A jump into the long page from Compare or Bind lands once the page has
     rendered; and the scroll spy holds off while a programmatic scroll is
     travelling, so the rail does not flicker through every section it passes. */
  const pendingSection = useRef(null)
  const spyHoldUntil = useRef(0)

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
  }, [darkMode])

  const set = useCallback((slice) => (patch) => {
    setFormData(prev => ({ ...prev, [slice]: { ...prev[slice], ...patch } }))
  }, [])

  const scrollToSection = useCallback((id, smooth = true) => {
    const el = document.getElementById(sectionId(id))
    if (!el) return
    spyHoldUntil.current = Date.now() + 900
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }, [])

  const goToStep = useCallback((next) => {
    setMobileNavOpen(false)
    const toForm = next <= LAST_FORM_STEP
    const fromForm = step <= LAST_FORM_STEP

    /* Within the long page a step is a place, not a page. */
    if (toForm && fromForm) {
      setStep(next)
      scrollToSection(next)
      return
    }

    /* Leaving Compare or Bind unfinished is what turns their hints on. */
    if (!fromForm) {
      const done = stepCompletion(formData)
      if (step !== next && !done[step]) {
        setAttempted(a => (a.includes(step) ? a : [...a, step]))
      }
    }
    setStep(next)
    setMaxStep(m => Math.max(m, next))
    if (toForm) {
      pendingSection.current = next
      return
    }
    window.requestAnimationFrame(() => {
      document.getElementById('im-main')?.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [formData, step, scrollToSection])

  /* Get quotes checks the whole page at once. With something missing it turns
     every section's hints on and takes the agent to the first gap; prototype
     mode goes straight through to the carriers. */
  const handleGetQuotes = useCallback(() => {
    const done = stepCompletion(formData)
    const firstMissing = FORM_STEP_IDS.find(id => !done[id])
    if (firstMissing && !proto) {
      setFormAttempted(true)
      setStep(firstMissing)
      scrollToSection(firstMissing)
      return
    }
    setQuoting(true)
    setAnsweredCarriers(0)
    goToStep(QUOTE_STEP)
    CARRIERS.forEach((_, i) => {
      setTimeout(() => setAnsweredCarriers(i + 1), (i + 1) * CARRIER_REPLY_MS)
    })
    setTimeout(() => setQuoting(false), (CARRIERS.length + 1) * CARRIER_REPLY_MS)
  }, [formData, proto, scrollToSection, goToStep])

  const handleContinue = useCallback(() => {
    if (step <= LAST_FORM_STEP) {
      handleGetQuotes()
      return
    }
    goToStep(Math.min(step + 1, TOTAL_STEPS))
  }, [step, goToStep, handleGetQuotes])

  /* Back from Compare Quotes lands on the last section of the long page. */
  const handleBack = useCallback(() => goToStep(Math.max(step - 1, 1)), [step, goToStep])

  /* Scroll spy: the current section is the last one whose top has risen to
     near the top of the scroll area. The final section can be too short to
     get there, so the bottom of the page counts as being on it. */
  useEffect(() => {
    if (!onFormPage) return
    const main = document.getElementById('im-main')
    if (!main) return
    const onScroll = () => {
      if (Date.now() < spyHoldUntil.current) return
      const top = main.getBoundingClientRect().top
      let current = FORM_STEP_IDS[0]
      for (const id of FORM_STEP_IDS) {
        const el = document.getElementById(sectionId(id))
        if (el && el.getBoundingClientRect().top - top <= SPY_OFFSET) current = id
      }
      if (main.scrollTop + main.clientHeight >= main.scrollHeight - 4) current = LAST_FORM_STEP
      setStep(s => (s === current ? s : current))
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [onFormPage])

  useEffect(() => {
    if (!onFormPage || pendingSection.current == null) return
    const id = pendingSection.current
    pendingSection.current = null
    window.requestAnimationFrame(() => scrollToSection(id, false))
  }, [onFormPage, scrollToSection])

  /* Keyboard shortcuts, for building a prototype at typing speed.

     ⌘/Ctrl + Enter is Continue. On the long page that is Get quotes, which
     does its own checking; elsewhere it obeys the same rule the button does.
     ⌥⇧P turns prototype mode on and off. Both stand down while you are in a
     field, so ⌘Enter in a textarea is still the browser's. */
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      const typing = el instanceof HTMLElement
        && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

      if (e.altKey && e.shiftKey && (e.code === 'KeyP' || e.key.toLowerCase() === 'p')) {
        e.preventDefault()
        toggleProto()
        return
      }
      if (typing) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!started) return
        if (step <= LAST_FORM_STEP || proto || stepCompletion(formData)[step]) handleContinue()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [proto, toggleProto, started, step, formData, handleContinue])

  const startOver = useCallback(() => {
    setFormData({})
    setStep(1)
    setMaxStep(1)
    setAttempted([])
    setFormAttempted(false)
    setQuoting(false)
    setAnsweredCarriers(0)
    setStarted(false)
  }, [])

  /* Page zero's two answers are the first section's first half. */
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

  const formDone = stepCompletion(formData)
  const formMissing = FORM_STEP_IDS.some(id => !formDone[id])
  /* On the long page the sections drop their own footers, and their hints
     turn on together once Get quotes has been tried. */
  const sectionProps = { showErrors: formAttempted, hideNav: true }

  const current = onFormPage ? (
    <div>
      {/* 72px plus the next header's pt-8 is the 104px GL leaves between one
          section's end and the next title — the same gap Class Code already
          keeps above Business Details. */}
      <div className="space-y-14 md:space-y-[72px]">
      <section id={sectionId(stepIdFor('business'))} className="scroll-mt-2">
        <BusinessDetails
          data={formData.business || {}}
          set={set('business')}
          classCode={formData.classCode || {}}
          setClassCode={set('classCode')}
          {...sectionProps}
        />
      </section>
      <section id={sectionId(stepIdFor('coverage'))} className="scroll-mt-2">
        <Coverage data={formData.coverage || {}} set={set('coverage')} {...sectionProps} />
      </section>
      <section id={sectionId(stepIdFor('underwriting'))} className="scroll-mt-2">
        <Underwriting
          data={formData.underwriting || {}}
          set={set('underwriting')}
          submission={formData}
          {...sectionProps}
        />
      </section>
      <section id={sectionId(stepIdFor('interests'))} className="scroll-mt-2">
        <AdditionalInterests data={formData.interests || {}} set={set('interests')} {...sectionProps} />
      </section>
      </div>

      <div className="mt-8">
        <StepNav
          onContinue={handleGetQuotes}
          continueLabel="Get quotes"
          hint={formAttempted && formMissing ? 'Some sections above still need attention' : undefined}
        />
      </div>
    </div>
  ) : {
    [QUOTE_STEP]: (
      <CompareQuotes
        data={formData.quotes || {}}
        set={set('quotes')}
        submission={formData}
        quoting={quoting}
        answered={answeredCarriers}
        {...stepProps}
      />
    ),
    [stepIdFor('bind')]: (
      <Bind
        data={formData.bind || {}}
        set={set('bind')}
        submission={formData}
        submissionNumber={SUBMISSION_NUMBER}
        onBack={handleBack}
        /* Nothing binds here — the application goes out for signature. */
        onBound={() => set('bind')({ sent: true })}
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
            maxStep={Math.max(maxStep, LAST_FORM_STEP)}
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
