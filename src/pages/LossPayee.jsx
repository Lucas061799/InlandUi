import { Input, RadioGroup, FormGrid } from '../components/FormField'
import AddressAutocomplete from '../components/AddressAutocomplete'

const defaultPayee = () => ({
  id: Date.now(),
  name: '', additionalInterest: 'No',
  address: '', suite: '',
  city: '', state: '', zip: '',
  vehicles: [],
  sameAsApplicant: false,
})

export default function LossPayee({ formData, updateFormData, isDark = false }) {
  const data = formData.lossPayee || { hasPayee: undefined, payees: [] }
  const applicant = formData.applicant || null
  const setPayees = (list) => updateFormData('lossPayee', { payees: list })
  const setField = (idx, key) => (val) => {
    const updated = data.payees.map((item, i) => i === idx ? { ...item, [key]: val } : item)
    setPayees(updated)
  }
  const handleAddressSelect = (idx) => ({ address, city, state, zip }) => {
    const updated = data.payees.map((item, i) => i === idx ? { ...item, address, city, state, zip } : item)
    setPayees(updated)
  }
  const applySameAsApplicant = (idx, checked) => {
    const updated = data.payees.map((item, i) => i === idx ? {
      ...item,
      sameAsApplicant: checked,
      address: checked ? (applicant?.address || '') : '',
      suite:   checked ? (applicant?.suite   || '') : '',
      city:    checked ? (applicant?.city    || '') : '',
      state:   checked ? (applicant?.state   || '') : '',
      zip:     checked ? (applicant?.zip     || '') : '',
    } : item)
    setPayees(updated)
  }

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4" style={{ background: isDark ? '#1F2543' : undefined, borderColor: isDark ? 'rgba(255,255,255,0.08)' : undefined }}>
        <RadioGroup
          label="Are there any loss payees or lienholders?"
          options={['Yes', 'No']}
          value={data.hasPayee}
          onChange={(val) => updateFormData('lossPayee', { hasPayee: val, payees: val === 'Yes' && data.payees.length === 0 ? [defaultPayee()] : val === 'No' ? [] : data.payees })}
        />
      </div>

      {data.hasPayee === 'Yes' && data.payees.map((p, idx) => (
        <div key={p.id} className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-100" style={{ background: isDark ? '#1F2543' : undefined, borderColor: isDark ? 'rgba(255,255,255,0.08)' : undefined }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-navy">Loss Payee #{idx + 1}</h3>
            {data.payees.length > 1 && (
              <button onClick={() => setPayees(data.payees.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="space-y-4">
            <Input label="Payee Name" value={p.name} onChange={setField(idx, 'name')} />
            <RadioGroup
              label="Additional Interest"
              options={['Yes', 'No']}
              value={p.additionalInterest}
              onChange={setField(idx, 'additionalInterest')}
            />
            {/* Same as applicant address */}
            {(() => {
              const hasAddr = !!applicant?.address
              const applied = p.sameAsApplicant
              return (
                <button
                  type="button"
                  onClick={() => hasAddr && applySameAsApplicant(idx, !applied)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
                  style={applied
                    ? { borderColor: '#5C2ED4', background: 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)' }
                    : { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb', background: isDark ? '#252948' : '#f9fafb', opacity: hasAddr ? 1 : 0.5, cursor: hasAddr ? 'pointer' : 'not-allowed' }}
                >
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                    style={applied
                      ? { background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', borderColor: 'transparent' }
                      : { borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#d1d5db', background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}
                  >
                    {applied && (
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>Same as applicant address</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      {hasAddr ? `${applicant.address}${applicant.city ? `, ${applicant.city}` : ''}${applicant.state ? `, ${applicant.state}` : ''}` : 'Fill in applicant address first'}
                    </p>
                  </div>
                  {applied && (
                    <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full shrink-0" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)' }}>Applied</span>
                  )}
                </button>
              )
            })()}
            <FormGrid>
              <AddressAutocomplete
                label="Address"
                value={p.address}
                onChange={v => { setField(idx, 'sameAsApplicant')(false); setField(idx, 'address')(v) }}
                onSelect={({ address, city, state, zip }) => { setField(idx, 'sameAsApplicant')(false); handleAddressSelect(idx)({ address, city, state, zip }) }}
              />
              <Input label="Suite/Apt/Building" value={p.suite} onChange={setField(idx, 'suite')} />
            </FormGrid>
            <FormGrid cols={3}>
              <Input label="City" value={p.city} onChange={setField(idx, 'city')} />
              <Input label="State" value={p.state} onChange={setField(idx, 'state')} />
              <Input label="Zip" value={p.zip} onChange={setField(idx, 'zip')} />
            </FormGrid>
            <div>
              <p className="text-[11px] font-semibold text-gray-600 mb-2.5 tracking-wide">Check all the vehicles that apply to this payee</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.max(1, (formData.vehicles?.vehicles || []).length) }, (_, i) => `Vehicle ${i + 1}`).map(v => {
                  const selected = (p.vehicles || []).includes(v)
                  const toggleVehicle = () => {
                    const current = p.vehicles || []
                    const next = selected ? current.filter(x => x !== v) : [...current, v]
                    setField(idx, 'vehicles')(next)
                  }
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={toggleVehicle}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                        selected ? 'border-[#5C2ED4] text-[#5C2ED4]' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={selected ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.08) 0%, rgba(166,20,195,0.08) 100%)' } : {}}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                        style={selected ? { background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', borderColor: 'transparent' } : { borderColor: '#d1d5db' }}
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      {v}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {data.hasPayee === 'Yes' && data.payees.length > 0 && (
        <button
          onClick={() => setPayees([...data.payees, defaultPayee()])}
          className="flex items-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-3 mb-2 add-another-btn transition w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="text-gradient">Add More</span>
        </button>
      )}
    </div>
  )
}
