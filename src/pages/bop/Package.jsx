const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const PACKAGES = [
  {
    id: 'base',
    name: 'Base',
    tagline: 'Essential coverage for small businesses',
    price: 300,
    period: 'year',
    monthly: 25,
    items: [
      { label: 'Accounts Receivable',    value: '$10,000/$5,000' },
      { label: 'Computer Equipment',     value: '$10,000' },
      { label: 'Backup of Sewers & Drains', value: 'Not Included', dim: true },
      { label: 'Contract Penalties',     value: 'Not Included', dim: true },
      { label: 'Outdoor Signs',          value: '$1,000' },
      { label: 'Employee Dishonesty',    value: '$5,000' },
      { label: 'Mechanical Breakdown',   value: 'Not Included', dim: true },
      { label: 'Spoilage',               value: 'Not Included', dim: true },
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Enhanced protection with broader limits',
    price: 300,
    period: 'year',
    monthly: 25,
    items: [
      { label: 'Accounts Receivable',    value: '$150,000 Blanket' },
      { label: 'Computer Equipment',     value: '$150,000 Blanket' },
      { label: 'Backup of Sewers & Drains', value: '$25,000' },
      { label: 'Contract Penalties',     value: 'Not Included', dim: true },
      { label: 'Outdoor Signs',          value: '$5,000' },
      { label: 'Employee Dishonesty',    value: '$15,000' },
      { label: 'Mechanical Breakdown',   value: '$50,000' },
      { label: 'Spoilage',               value: '$5,000' },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'Most popular — comprehensive protection',
    badge: 'MOST POPULAR',
    price: 300,
    period: 'year',
    monthly: 25,
    items: [
      { label: 'Accounts Receivable',    value: '$350,000 Blanket' },
      { label: 'Computer Equipment',     value: '$350,000 Blanket' },
      { label: 'Backup of Sewers & Drains', value: '$50,000' },
      { label: 'Contract Penalties',     value: '$1,000' },
      { label: 'Outdoor Signs',          value: '$10,000' },
      { label: 'Employee Dishonesty',    value: '$25,000' },
      { label: 'Mechanical Breakdown',   value: '$100,000' },
      { label: 'Spoilage',               value: '$10,000' },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'Maximum coverage for full peace of mind',
    price: 335,
    period: 'year',
    monthly: 28,
    items: [
      { label: 'Accounts Receivable',    value: '$500,000 Blanket' },
      { label: 'Computer Equipment',     value: '$500,000 Blanket' },
      { label: 'Backup of Sewers & Drains', value: '$100,000' },
      { label: 'Contract Penalties',     value: '$2,500' },
      { label: 'Outdoor Signs',          value: '$25,000' },
      { label: 'Employee Dishonesty',    value: '$50,000' },
      { label: 'Mechanical Breakdown',   value: '$250,000' },
      { label: 'Spoilage',               value: '$25,000' },
    ],
  },
]

const money = (n) => '$' + n.toLocaleString()

function PackageCard({ pkg, selected, onSelect }) {
  const popular = pkg.id === 'gold'

  return (
    <div className="relative">
      {pkg.badge && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 text-[10px] font-bold px-3 py-1 rounded-full text-white whitespace-nowrap"
          style={{ background: BRAND_GRADIENT, letterSpacing: '0.08em' }}
        >
          {pkg.badge}
        </div>
      )}
      <div
        onClick={onSelect}
        className="rounded-2xl overflow-hidden h-full flex flex-col transition cursor-pointer hover:-translate-y-px"
        style={{
          background: 'white',
          border: `1.5px solid ${selected ? '#7C3AED' : popular ? '#7C3AED' : '#E5E7EB'}`,
          boxShadow: selected || popular ? '0 4px 20px rgba(92,46,212,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-3">
          <div className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</div>
          <div className="text-xs text-gray-500 leading-relaxed min-h-[40px]">{pkg.tagline}</div>
        </div>

        {/* Price */}
        <div className="px-5 pb-5 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900">{money(pkg.price)}</span>
            <span className="text-xs text-gray-400">/{pkg.period}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{money(pkg.monthly)}/mo</div>
        </div>

        {/* Items */}
        <div className="px-5 pb-4 flex-1">
          <div>
            {pkg.items.map((it, i) => (
              <div
                key={i}
                className="py-2.5 border-b last:border-b-0"
                style={{ borderColor: '#F3F4F6', minHeight: 56 }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 leading-tight mb-1">
                  {it.label}
                </div>
                <div
                  className="text-sm font-semibold leading-tight"
                  style={{ color: it.dim ? '#9CA3AF' : '#1F2937', fontStyle: it.dim ? 'italic' : 'normal' }}
                >
                  {it.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Select */}
        <button
          type="button"
          onClick={onSelect}
          className="w-full py-3.5 text-sm font-bold transition hover:opacity-95"
          style={
            selected
              ? { background: BRAND_GRADIENT, color: '#fff' }
              : { background: '#F9FAFB', color: '#374151', borderTop: '1px solid #E5E7EB' }
          }
        >
          {selected ? '✓ Selected' : 'Select'}
        </button>
      </div>
    </div>
  )
}

export default function Package({ formData, updateFormData, onBack, onContinue }) {
  const carrier = formData.bind?.selectedCarrier
  const selected = formData.bind?.packageId
  const businessName = formData.business?.name

  const selectPackage = (pkgId) => {
    // Stash the package premium so the right-rail summary can add it
    // to the carrier premium without having to know the package data.
    const pkg = PACKAGES.find(p => p.id === pkgId)
    updateFormData('bind', { packageId: pkgId, packagePremium: pkg?.price || 0 })
  }

  const goBack = () => { onBack && onBack() }
  const goContinue = () => { onContinue && onContinue() }

  return (
    <div className="w-full space-y-5">
      <p className="text-sm text-gray-500 -mt-2">
        Select a coverage tier.
      </p>

      {/* 4-col is the default look on regular desktops. The switch
          DOWN to 2-col happens earlier than Tailwind's xl (1280px) —
          at 1400px — so cards never get cramped: as soon as the four
          cards would dip under ~200px of content width, we fall back
          to the comfortable 2×2 grid. Mobile (<640px) is 1-col. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 [@media(min-width:1400px)]:grid-cols-4 gap-4 pt-3">
        {PACKAGES.map(pkg => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selected === pkg.id}
            onSelect={() => selectPackage(pkg.id)}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
          style={{ color: '#374151', border: '1.5px solid #E5E7EB', background: 'white' }}
        >
          Back to Quotes
        </button>
        <button
          type="button"
          onClick={goContinue}
          disabled={!selected}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed"
          style={{
            background: selected ? BRAND_GRADIENT : '#D1D5DB',
            boxShadow: selected ? '0 4px 14px rgba(92,46,212,0.25)' : 'none',
          }}
        >
          Continue to Add-ons
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
