import { RadioGroup, Input, Select, FormGrid, DateInput } from '../components/FormField'

const defaultHistory = () => ({
  id: Date.now(),
  carrierName: '', policyNumber: '', biLimits: '',
  premium: '', effectiveDate: '', expirationDate: '',
  policyType: '',
})

export default function PriorHistory({ formData, updateFormData, isDark = false }) {
  const data = formData.priorHistory || {}
  const set = (key) => (val) => updateFormData('priorHistory', { [key]: val })
  const histories = data.histories || []
  const setHistories = (list) => updateFormData('priorHistory', { histories: list })
  const setField = (idx, key) => (val) => {
    const updated = histories.map((h, i) => i === idx ? { ...h, [key]: val } : h)
    setHistories(updated)
  }

  return (
    <div className="w-full">
      {/* Warning banner */}
      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5" style={{
        background: isDark ? 'rgba(167,139,250,0.08)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)',
        border: isDark ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(166,20,195,0.18)',
      }}>
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke={isDark ? '#C084FC' : 'url(#warn-grad)'} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="warn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C2ED4"/>
              <stop offset="100%" stopColor="#A614C3"/>
            </linearGradient>
          </defs>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <p className="text-xs font-medium leading-relaxed text-gradient">
          Not entering information can affect the premium and or eligibility.
        </p>
      </div>

      {/* Has Prior Insurance History */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-800 mb-3">Has prior insurance history</p>
        <RadioGroup
          options={['Yes', 'No']}
          value={data.hasCurrent}
          onChange={(val) => {
            set('hasCurrent')(val)
            if (val === 'Yes' && histories.length === 0) {
              setHistories([defaultHistory()])
            }
          }}
        />
      </div>

      {/* History entries */}
      {data.hasCurrent === 'Yes' && histories.map((h, idx) => (
        <div key={h.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4 space-y-4">
          <FormGrid cols={3}>
            <Input label="Carrier Name" value={h.carrierName} onChange={setField(idx, 'carrierName')} />
            <Input label="Policy Number" value={h.policyNumber} onChange={setField(idx, 'policyNumber')} />
            <Input label="BI Limits" value={h.biLimits} onChange={setField(idx, 'biLimits')} />
          </FormGrid>
          <FormGrid cols={3}>
            <Input label="Premium" value={h.premium} onChange={setField(idx, 'premium')} placeholder="$0.00" />
            <DateInput label="Effective Date" value={h.effectiveDate} onChange={setField(idx, 'effectiveDate')} />
            <DateInput label="Expiration Date" value={h.expirationDate} onChange={setField(idx, 'expirationDate')} />
          </FormGrid>
          <Select
            label="Personal or commercial"
            options={['Personal', 'Commercial']}
            value={h.policyType}
            onChange={setField(idx, 'policyType')}
          />
        </div>
      ))}

      {/* Add Another History */}
      {data.hasCurrent === 'Yes' && (
        <button
          onClick={() => setHistories([...histories, defaultHistory()])}
          className="flex items-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-3 mb-4 add-another-btn transition w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="text-gradient">Add Another History</span>
        </button>
      )}

      {/* GL/WC/BOP question */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-800 mb-3 leading-relaxed">
          Does the insured have one of the following general liability, worker's compensation or business owners policy?
        </p>
        <RadioGroup
          options={['Yes', 'No']}
          value={data.hasOtherPolicy}
          onChange={set('hasOtherPolicy')}
        />
      </div>
    </div>
  )
}
