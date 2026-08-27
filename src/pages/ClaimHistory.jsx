import { Input, Select, RadioGroup, FormGrid } from '../components/FormField'
import AddressAutocomplete from '../components/AddressAutocomplete'

const defaultClaim = () => ({
  id: Date.now(),
  dateOfLoss: '', payoutAmount: '',
  lossAddress: '', lossSuite: '',
  lossCity: '', lossState: '', lossZip: '',
  descriptionOfLoss: '',
  driverOfLoss: '', claimStatus: '',
  lostAtFault: 'No',
  sameAsApplicant: false,
})

const CLAIM_STATUSES = ['Open', 'Closed', 'Pending']

export default function ClaimHistory({ formData, updateFormData, isDark = false }) {
  const data = formData.claims || { hasClaims: undefined, claims: [] }
  const applicant = formData.applicant || null

  // Build driver options from actual driver entries
  const driverOptions = [
    ...(formData.drivers?.drivers || []).map((d, i) =>
      [d.firstName, d.lastName].filter(Boolean).join(' ') || `Driver ${i + 1}`
    ),
    'Other',
  ]
  const setClaims = (list) => updateFormData('claims', { claims: list })
  const setField = (idx, key) => (val) => {
    const updated = data.claims.map((c, i) => i === idx ? { ...c, [key]: val } : c)
    setClaims(updated)
  }
  const handleLossAddressSelect = (idx) => ({ address, city, state, zip }) => {
    const updated = data.claims.map((c, i) => i === idx ? { ...c, lossAddress: address, lossCity: city, lossState: state, lossZip: zip } : c)
    setClaims(updated)
  }
  const applySameAsApplicant = (idx, checked) => {
    const updated = data.claims.map((c, i) => i === idx ? {
      ...c,
      sameAsApplicant: checked,
      lossAddress: checked ? (applicant?.address || '') : '',
      lossSuite:   checked ? (applicant?.suite   || '') : '',
      lossCity:    checked ? (applicant?.city    || '') : '',
      lossState:   checked ? (applicant?.state   || '') : '',
      lossZip:     checked ? (applicant?.zip     || '') : '',
    } : c)
    setClaims(updated)
  }

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-5">List all claims in the past 3 years for all commercial auto policies.</p>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5" style={{ background: isDark ? '#1F2543' : undefined, borderColor: isDark ? 'rgba(255,255,255,0.08)' : undefined }}>
        <RadioGroup
          label="Do you have any claim history?"
          options={['Yes', 'No']}
          value={data.hasClaims}
          onChange={(val) => updateFormData('claims', { hasClaims: val, claims: val === 'Yes' ? [defaultClaim()] : [] })}
        />
      </div>

      {data.hasClaims === 'Yes' && data.claims.map((c, idx) => (
        <div key={c.id} className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-100" style={{ background: isDark ? '#1F2543' : undefined, borderColor: isDark ? 'rgba(255,255,255,0.08)' : undefined }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-navy">Claim History #{idx + 1}</h3>
            {data.claims.length > 1 && (
              <button onClick={() => setClaims(data.claims.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="space-y-4">
            <FormGrid>
              <Input label="Date of loss" placeholder="MM/DD/YYYY" value={c.dateOfLoss} onChange={setField(idx, 'dateOfLoss')} />
              <Input label="Payout amount" placeholder="$0.00" value={c.payoutAmount} onChange={setField(idx, 'payoutAmount')} />
            </FormGrid>
            {/* Same as applicant address */}
            {(() => {
              const hasAddr = !!applicant?.address
              const applied = c.sameAsApplicant
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
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
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
                label="Loss Location Address"
                value={c.lossAddress}
                onChange={setField(idx, 'lossAddress')}
                onSelect={handleLossAddressSelect(idx)}
              />
              <Input label="Suite/Apt/Building" value={c.lossSuite} onChange={setField(idx, 'lossSuite')} />
            </FormGrid>
            <FormGrid cols={3}>
              <Input label="City" value={c.lossCity} onChange={setField(idx, 'lossCity')} />
              <Input label="State" value={c.lossState} onChange={setField(idx, 'lossState')} />
              <Input label="Zip" value={c.lossZip} onChange={setField(idx, 'lossZip')} />
            </FormGrid>
            <Input label="Description of loss" value={c.descriptionOfLoss} onChange={setField(idx, 'descriptionOfLoss')} placeholder="" />
            <FormGrid>
              <Select label="Driver of loss" options={driverOptions} value={c.driverOfLoss} onChange={setField(idx, 'driverOfLoss')} />
              <Select label="Claim status" options={CLAIM_STATUSES} value={c.claimStatus} onChange={setField(idx, 'claimStatus')} />
            </FormGrid>
            <RadioGroup
              label="Lost at fault"
              options={['Yes', 'No']}
              value={c.lostAtFault}
              onChange={setField(idx, 'lostAtFault')}
            />
          </div>
        </div>
      ))}

      {data.hasClaims === 'Yes' && (
        <button
          onClick={() => setClaims([...data.claims, defaultClaim()])}
          className="flex items-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-3 mb-2 add-another-btn transition w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="text-gradient">Add Another Claim</span>
        </button>
      )}
    </div>
  )
}
