import { useState, useRef, useEffect, useCallback } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import Business from './pages/bop/Business'
import Coverage from './pages/bop/Coverage'
import Underwriting from './pages/bop/Underwriting'
import Location from './pages/bop/Location'
import SmartStart from './pages/bop/SmartStart'
import Compare from './pages/bop/Compare'
import Package from './pages/bop/Package'
import AddOns from './pages/bop/AddOns'
import Bind from './pages/bop/Bind'
import Submission from './pages/Submission'
import BopSubmission from './pages/bop/BopSubmission'
import PageZero from './pages/PageZero'

const STEPS = [
  { id: 1, label: 'Class Code',  key: 'smartStart' },
  { id: 2, label: 'Applicant',   key: 'business' },
  { id: 3, label: 'Location',    key: 'location' },
  { id: 4, label: 'Coverage Limits',        key: 'coverage' },
  { id: 5, label: 'Underwriting Questions', key: 'underwriting' },
  { id: 6, label: 'Select Carrier', key: 'compare' },
  { id: 7, label: 'Bind & Pay',   key: 'bind' },
]

const FILE_ICONS = {
  pdf: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="url(#fileG)" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M13 3v5a1 1 0 001 1h5M9 13h6M9 17h4" stroke="url(#fileG)" strokeWidth="1.6" strokeLinecap="round"/>
      <defs>
        <linearGradient id="fileG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  img: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="url(#fileG2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="fileG2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
        </linearGradient>
      </defs>
    </svg>
  ),
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadPopup({ onDismiss }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const addFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return
    const incoming = Array.from(fileList)
    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const merged = [...prev, ...incoming.filter(f => !existingNames.has(f.name))]
      return merged
    })
  }

  const removeFile = (name) => setSelectedFiles(prev => prev.filter(f => f.name !== name))

  const hasFiles = selectedFiles.length > 0

  const btnLabel = hasFiles
    ? selectedFiles.length === 1
      ? `Upload & Continue — ${selectedFiles[0].name}`
      : `Upload & Continue — ${selectedFiles.length} files`
    : 'Upload & Continue'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,10,40,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      <div
        className="relative rounded-2xl shadow-2xl"
        style={{
          width: '460px',
          background: '#ffffff',
          border: '1px solid rgba(92,46,212,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(92,46,212,0.07)', color: '#5C2ED4' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(92,46,212,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(92,46,212,0.07)'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="px-7 pt-5 pb-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(92,46,212,0.07)', border: '1px solid rgba(92,46,212,0.12)' }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="url(#boltG)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="boltG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[11px] font-bold text-gradient tracking-wide">INSTANT FORM PARSING</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-navy mb-1.5 leading-tight">Upload &amp; Skip the Typing</h2>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Have a competitor quote or ACORD form? Drop it here — we'll pre-fill your submission automatically.
          </p>

          {/* Drop zone */}
          <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.png" className="hidden"
            onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all"
            style={{
              padding: hasFiles ? '14px 0' : '28px 0',
              borderColor: dragging ? '#5C2ED4' : 'rgba(92,46,212,0.2)',
              background: dragging ? 'rgba(92,46,212,0.04)' : 'rgba(248,246,255,0.6)',
              marginBottom: hasFiles ? '10px' : '16px',
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(92,46,212,0.08)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  stroke="url(#clipG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="clipG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {hasFiles
              ? <p className="text-xs text-gray-400">or <span className="text-gradient font-semibold">add more files</span></p>
              : <>
                  <p className="text-sm font-semibold text-navy">Drop your file here</p>
                  <p className="text-xs text-gray-400">or <span className="text-gradient font-semibold">click to browse</span></p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG · Max 10MB</p>
                </>
            }
          </div>

          {/* File list */}
          {hasFiles && (
            <div className="space-y-2 mb-4">
              {selectedFiles.map(file => {
                const ext = file.name.split('.').pop().toLowerCase()
                const icon = ext === 'pdf' ? FILE_ICONS.pdf : FILE_ICONS.img
                return (
                  <div key={file.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                    style={{ background: 'rgba(248,246,255,0.7)', borderColor: 'rgba(92,46,212,0.12)' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(92,46,212,0.08)' }}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-navy truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeFile(file.name) }}
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition"
                      style={{ background: 'rgba(92,46,212,0.07)', color: '#A614C3' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(166,20,195,0.15)'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(92,46,212,0.07)'}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upload CTA button */}
          <button
            disabled={!hasFiles}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mb-4 truncate px-4"
            style={hasFiles
              ? { background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 16px rgba(92,46,212,0.3)', cursor: 'pointer' }
              : { background: '#D1D5DB', cursor: 'not-allowed' }
            }
          >
            {btnLabel}
          </button>

          {/* Dismiss */}
          <div className="text-center">
            <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 transition">
              Maybe later — I'll fill it in manually
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  // URL param shortcuts for Builder.io / Figma import
  // ?page=main → skip PageZero
  // ?page=submission → go straight to submission
  // ?product=gl|bop → pre-seed the product when skipping PageZero so
  //   the Sidebar title + submission ID + PDF title reflect the right
  //   coverage (otherwise productType is undefined and everything
  //   defaults to BOP).
  const urlParams = new URLSearchParams(window.location.search)
  const pageParam = urlParams.get('page')
  const productParam = urlParams.get('product')
  const initialProductType = productParam === 'gl' ? 'gl'
                            : productParam === 'bop' ? 'bop'
                            : null

  const [formData, setFormData] = useState(
    initialProductType ? { pageZero: { productType: initialProductType } } : {}
  )
  const [activeStep, setActiveStep] = useState(1)
  const [submitted, setSubmitted] = useState(pageParam === 'submission')
  const [bindSummary, setBindSummary] = useState(null)
  const [pageZeroDone, setPageZeroDone] = useState(pageParam === 'main' || pageParam === 'submission')
  const [darkMode, setDarkMode] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
  }, [darkMode])
  const [pulseUpload, setPulseUpload] = useState(false)
  const [errorFields, setErrorFields] = useState([])
  // Surfaces inline 'required' hints under every empty required
  // field on the form pages. Flipped to true the first time the
  // user tries to Get Quotes with something missing.
  const [attemptedQuote, setAttemptedQuote] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [quotesReady, setQuotesReady] = useState(false)
  const [quoteStep, setQuoteStep] = useState('compare') // 'compare' | 'package' | 'addons'
  const [inQuoteFlow, setInQuoteFlow] = useState(false)
  const sectionRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const isScrollingToRef = useRef(false)

  const updateFormData = (section, data) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...data } }))
    // Clear errors for updated fields
    if (errorFields.length > 0) setErrorFields([])
  }

  const SUBMISSION_STEP_ID = STEPS.length + 1
  const goToStep = useCallback((stepId) => {
    if (stepId === SUBMISSION_STEP_ID) {
      setSubmitted(true)
      return
    }
    // Sidebar tabs 1-5 → form view; 6 → compare slides; 7 → bind page
    const goingToForm = stepId >= 1 && stepId <= 5
    if (goingToForm) {
      setInQuoteFlow(false)
    } else if (stepId === 6) {
      setInQuoteFlow(true)
      if (quoteStep === 'bind') setQuoteStep('compare')
    } else if (stepId === 7) {
      setInQuoteFlow(true)
      setQuoteStep('bind')
    }
    setActiveStep(stepId)

    // Defer scroll so sections rerender after state changes
    setTimeout(() => {
      if (!scrollContainerRef.current) return
      isScrollingToRef.current = true
      if (goingToForm) {
        // Scroll to the specific form section
        const el = sectionRefs.current[stepId]
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        // Quote/Bind page — full-page view, scroll to top
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTimeout(() => { isScrollingToRef.current = false }, 800)
    }, 50)
  }, [SUBMISSION_STEP_ID, quoteStep])

  // Check errors: placeholder until BOP forms are wired in
  const handleCheckErrors = useCallback(() => {
    setErrorFields([])
  }, [])

  // Returns true if every required field across all 5 sections is
  // filled. Side effect: if not, flips attemptedQuote on so inline
  // 'required' hints surface and scrolls to the first incomplete
  // section. Shared by the Underwriting Get Quotes button (gate)
  // and handleGetQuotes (Confirm in the review modal).
  const validateAllForms = useCallback(() => {
    const sm   = formData.smartStart   || {}
    const biz  = formData.business     || {}
    const loc  = formData.location     || {}
    const cov  = formData.coverage     || {}
    const uw   = formData.underwriting || {}
    const REQUIRED_UW = ['prior_losses','pending_claims','declined_coverage','criminal_bankruptcy','manufactures_goods','subcontracts','tangible_goods']
    const ok1 = !!sm.classId
    const ok2 = !!(biz.name && biz.entityType && biz.effectiveDate && biz.annualRevenue && biz.annualPayroll && biz.numberOfEmployees && biz.phone && biz.email)
    const ok3 = !!(loc.address && loc.city && loc.state && loc.zip)
    const ok4 = !!(cov && Object.keys(cov).length > 0)
    const ok5 = REQUIRED_UW.every(k => uw[k] !== undefined && uw[k] !== null && uw[k] !== '')
    if (ok1 && ok2 && ok3 && ok4 && ok5) return true
    setAttemptedQuote(true)
    const firstMissing = !ok1 ? 1 : !ok2 ? 2 : !ok3 ? 3 : !ok4 ? 4 : 5
    goToStep(firstMissing)
    return false
  }, [formData, goToStep])

  const handleGetQuotes = useCallback(() => {
    if (quoting) return
    if (!validateAllForms()) return
    setQuoting(true)
    setQuoteStep('compare')
    setTimeout(() => {
      setQuoting(false)
      setQuotesReady(true)
      setInQuoteFlow(true)
      setActiveStep(6)
      // Scroll to top of new quote page
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 1500)
  }, [quoting, validateAllForms])

  const handleMainScroll = useCallback(() => {
    if (isScrollingToRef.current) return
    const container = scrollContainerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const threshold = containerRect.height * 0.35
    let current = STEPS[0].id
    STEPS.forEach(step => {
      const el = sectionRefs.current[step.id]
      if (el) {
        const top = el.getBoundingClientRect().top - containerRect.top
        if (top <= threshold) current = step.id
      }
    })
    setActiveStep(current)
  }, [])


  if (!pageZeroDone) {
    return (
      <PageZero
        onStart={(data) => {
          // PageZero now collects productType + mainClass + state up
          // front. Stash everything under pageZero, and seed the
          // class/state into the slices the downstream forms read so
          // those pages start pre-filled.
          updateFormData('pageZero', data)
          if (data.mainClass) updateFormData('smartStart', { classId: data.mainClass })
          if (data.state) updateFormData('location', { state: data.state })
          setPageZeroDone(true)
        }}
      />
    )
  }

  if (submitted) {
    return (
      <BopSubmission
        formData={formData}
        summary={bindSummary}
        onBack={() => {
          setSubmitted(false)
          setBindSummary(null)
          setInQuoteFlow(false)
          setQuoteStep('compare')
          setQuotesReady(false)
          setFormData({})
          setActiveStep(1)
        }}
        isDark={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: darkMode ? '#131629' : 'white' }}>
      {showUpload && (
        <UploadPopup onDismiss={() => { setShowUpload(false); setPulseUpload(true); setTimeout(() => setPulseUpload(false), 2500) }} />
      )}
      {/* Full-width top header */}
      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: darkMode ? '#191D35' : 'white',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        {/* Left: logo — same width as sidebar, left-aligned with Commercial Auto below */}
        <div className="flex items-center h-full px-3 md:px-5 w-auto md:w-64 2xl:md:w-72 md:shrink-0">
          <button
            className="md:hidden mr-3 p-1.5 rounded-lg"
            style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <img src={darkMode ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-8" />
        </div>
        {/* Right: powered by btis — pushed to far right */}
        <div className="flex items-center gap-2 px-3 md:px-8">
          <span className="hidden sm:inline text-xs text-gray-400 tracking-wide whitespace-nowrap">POWERED BY</span>
          <img src={darkMode ? btisLogoDark : btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        {/* Sidebar — drawer on mobile, normal on desktop */}
        <div className={`fixed md:relative inset-y-0 left-0 z-40 h-full shrink-0 transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ top: 0 }}>
          <Sidebar
            steps={STEPS.filter(s => {
              if (s.id === 6) return quotesReady
              if (s.id === 7) return !!formData.bind?.packageId && !!formData.bind?.addonsConfirmed
              return true
            })}
            activeStep={activeStep}
            onStepClick={(id) => { goToStep(id); setMobileSidebarOpen(false) }}
            formData={formData}
            onCheckErrors={handleCheckErrors}
            showSubmission={submitted || false}
            isDark={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
          />
        </div>

        {/* Scrollable main content */}
        <main
          ref={scrollContainerRef}
          onScroll={handleMainScroll}
          className="flex-1 overflow-y-auto custom-scroll relative"
          style={{ background: darkMode ? '#131629' : 'white' }}
        >

          <div className={`mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8 ${inQuoteFlow ? 'max-w-7xl' : 'max-w-5xl 2xl:max-w-6xl'}`}>

            {[
              { id: 1, title: 'Class Code',             el: <SmartStart formData={formData} updateFormData={updateFormData} isDark={darkMode} showErrors={attemptedQuote} />, show: !inQuoteFlow },
              { id: 2, title: 'Applicant Information',  el: <Business formData={formData} updateFormData={updateFormData} isDark={darkMode} showErrors={attemptedQuote} />, show: !inQuoteFlow },
              { id: 3, title: 'Location Information',   el: <Location formData={formData} updateFormData={updateFormData} isDark={darkMode} showErrors={attemptedQuote} />, show: !inQuoteFlow },
              { id: 4, title: 'Coverage Limits',         el: <Coverage formData={formData} updateFormData={updateFormData} isDark={darkMode} showErrors={attemptedQuote} />, show: !inQuoteFlow },
              { id: 5, title: 'Underwriting Questions', el: <Underwriting formData={formData} updateFormData={updateFormData} isDark={darkMode} onGetQuotes={handleGetQuotes} quoting={quoting} quotesReady={quotesReady} showErrors={attemptedQuote} onValidateAll={validateAllForms} />, show: !inQuoteFlow },
              { id: 6,
                title: quoteStep === 'package' ? 'Choose Your Package' : quoteStep === 'addons' ? 'Add-On Coverages' : 'Select Carrier',
                el: quoteStep === 'package'
                  ? <Package formData={formData} updateFormData={updateFormData} isDark={darkMode} onBack={() => setQuoteStep('compare')} onContinue={() => setQuoteStep('addons')} />
                  : quoteStep === 'addons'
                    ? <AddOns formData={formData} updateFormData={updateFormData} isDark={darkMode} onBack={() => setQuoteStep('package')} onContinue={() => { updateFormData('bind', { addonsConfirmed: true }); setQuoteStep('bind'); setActiveStep(7); if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' }) }} />
                    : <Compare formData={formData} updateFormData={updateFormData} isDark={darkMode} quotesReady={quotesReady} onSelectCarrier={() => setQuoteStep('package')} onGoToStep={goToStep} />,
                show: inQuoteFlow && quotesReady && quoteStep !== 'bind' },
              { id: 7, title: 'Bind & Pay',             el: <Bind formData={formData} updateFormData={updateFormData} isDark={darkMode} onGoToStep={goToStep} onBound={(s) => { setBindSummary(s); setSubmitted(true) }} />, show: inQuoteFlow && quoteStep === 'bind' },
            ].filter(s => s.show).map(section => (
              <section
                key={section.id}
                ref={el => sectionRefs.current[section.id] = el}
                id={`section-${section.id}`}
                className="rounded-2xl bop-page"
                style={{
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <SectionHeader title={section.title} isDark={darkMode} />
                <div className="px-4 md:px-10 pt-4 md:pt-5 pb-8 md:pb-10">
                  {section.el}
                </div>
              </section>
            ))}

            <div className="pb-8" />
          </div>
        </main>

        {/* Right rail only at 2xl (≥1536px). On standard laptop widths
            (1024–1535px) the content area reclaims the rail's ~320px
            so multi-column blocks like the 4-card payment plan don't
            get squeezed. The Upload + Form Review block above takes
            over for those viewports. */}
        <div className="hidden 2xl:block">
          <RightPanel onFormReview={handleCheckErrors} formData={formData} updateFormData={updateFormData} pulseUpload={pulseUpload} isDark={darkMode} inQuoteFlow={inQuoteFlow} quoteStep={quoteStep} />
        </div>
      </div>
    </div>
  )
}

// Section header — sits at top of each card
function SectionHeader({ title, isDark }) {
  return (
    <div className="px-4 md:px-10 pt-6 md:pt-8 pb-0">
      <div
        className="flex items-center justify-between pb-3 md:pb-4"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#D1D5DB'}` }}
      >
        <h2 className="text-base md:text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : undefined }} >{title}</h2>
      </div>
    </div>
  )
}

export default App
