import { Input, Select, RadioGroup, FormGrid, DateInput } from '../components/FormField'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
import AddressAutocomplete from '../components/AddressAutocomplete'

const MARITAL_STATUS = ['Married', 'Single', 'Widowed', 'Divorced', 'Separated']
const GENDER = ['Male', 'Female', 'Non-Binary', 'Prefer Not To Say']
const RELATIONSHIP = ['Owner/Officer', 'Employee', 'Family Member', 'Other']

const defaultDriver = () => ({
  id: Date.now(),
  firstName: '', lastName: '',
  mailingAddress: '', mailingSuite: '',
  mailingCity: '', mailingState: '', mailingZip: '',
  maritalStatus: '', gender: '',
  relationshipToInsured: '',
  dob: '',
  excludeDriver: 'No',
  licenseNumber: '',
  relation: 'Employee',
  hasViolations: 'No',
})

export default function DriverInformation({ formData, updateFormData, isDark = false }) {
  const data = formData.drivers || { drivers: [defaultDriver()] }
  const drivers = data.drivers

  const setDrivers = (d) => updateFormData('drivers', { drivers: d })
  const setField = (idx, key) => (val) => {
    const updated = drivers.map((d, i) => i === idx ? { ...d, [key]: val } : d)
    setDrivers(updated)
  }
  const handleMailingSelect = (idx) => ({ address, city, state, zip }) => {
    const updated = drivers.map((d, i) => i === idx ? { ...d, mailingAddress: address, mailingCity: city, mailingState: state, mailingZip: zip } : d)
    setDrivers(updated)
  }
  const applySameAsApplicant = (idx, checked) => {
    const applicant = formData.applicant || {}
    const updated = drivers.map((d, i) => i === idx ? {
      ...d,
      sameAsApplicant: checked,
      mailingAddress: checked ? (applicant.address || '') : '',
      mailingSuite:   checked ? (applicant.suite   || '') : '',
      mailingCity:    checked ? (applicant.city    || '') : '',
      mailingState:   checked ? (applicant.state   || '') : '',
      mailingZip:     checked ? (applicant.zip     || '') : '',
    } : d)
    setDrivers(updated)
  }

  const addDriver = () => setDrivers([...drivers, defaultDriver()])
  const removeDriver = (idx) => setDrivers(drivers.filter((_, i) => i !== idx))

  return (
    <div className="w-full">
      {drivers.map((d, idx) => (
        <div key={d.id} className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy">Driver {idx + 1}</h3>
            {drivers.length > 1 && (
              <button onClick={() => removeDriver(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>

          <div className="space-y-4">
            <FormGrid>
              <Input label="Owner First Name" required value={d.firstName} onChange={setField(idx, 'firstName')} placeholder="John" />
              <Input label="Owner Last Name" required value={d.lastName} onChange={setField(idx, 'lastName')} placeholder="Smith" />
            </FormGrid>
            {/* Same as applicant address */}
            {(() => {
              const app = formData.applicant || {}
              const hasAddr = !!app.address
              const applied = d.sameAsApplicant
              return (
                <button
                  type="button"
                  onClick={() => hasAddr && applySameAsApplicant(idx, !applied)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
                  style={applied
                    ? { borderColor: '#7C3AED', background: isDark ? 'rgba(92,46,212,0.18)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)' }
                    : { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb', background: isDark ? '#252948' : '#f9fafb', opacity: hasAddr ? 1 : 0.5, cursor: hasAddr ? 'pointer' : 'not-allowed' }}
                >
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                    style={applied
                      ? { background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', borderColor: 'transparent' }
                      : { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db', background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}
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
                      {hasAddr ? `${app.address}${app.city ? `, ${app.city}` : ''}${app.state ? `, ${app.state}` : ''}` : 'Fill in applicant address first'}
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
                label="Mailing Address"
                value={d.mailingAddress}
                onChange={v => { setField(idx, 'sameAsApplicant')(false); setField(idx, 'mailingAddress')(v) }}
                onSelect={({ address, city, state, zip }) => { setField(idx, 'sameAsApplicant')(false); handleMailingSelect(idx)({ address, city, state, zip }) }}
              />
              <Input label="Suite/Apt/Building" value={d.mailingSuite} onChange={setField(idx, 'mailingSuite')} />
            </FormGrid>
            <FormGrid cols={3}>
              <Input label="City" value={d.mailingCity} onChange={setField(idx, 'mailingCity')} />
              <Input label="State" value={d.mailingState} onChange={setField(idx, 'mailingState')} />
              <Input label="Zip" value={d.mailingZip} onChange={setField(idx, 'mailingZip')} />
            </FormGrid>
            <FormGrid>
              <Select label="Marital status" options={MARITAL_STATUS} value={d.maritalStatus} onChange={setField(idx, 'maritalStatus')} />
              <Select label="Gender" options={GENDER} value={d.gender} onChange={setField(idx, 'gender')} />
            </FormGrid>
            <DateInput label="Date of birth" value={d.dob} onChange={setField(idx, 'dob')} />
            <RadioGroup
              label="Exclude driver"
              options={['Yes', 'No']}
              value={d.excludeDriver}
              onChange={setField(idx, 'excludeDriver')}
            />
            <Input label="Driver license number" value={d.licenseNumber} onChange={setField(idx, 'licenseNumber')} placeholder="D1234567" />
            <FormGrid>
              <RadioGroup
                label="State or foreign license"
                options={['State', 'Foreign']}
                value={d.licenseType || 'State'}
                onChange={setField(idx, 'licenseType')}
              />
              <Select label="License state" options={US_STATES} value={d.licenseState || ''} onChange={setField(idx, 'licenseState')} placeholder="Select state..." />
            </FormGrid>
            <FormGrid>
              <RadioGroup
                label="Commercial driver's license"
                options={['Yes', 'No']}
                value={d.cdl || 'No'}
                onChange={setField(idx, 'cdl')}
              />
              {d.cdl === 'Yes' && (
                <Input label="Date CDL received" value={d.cdlDate || ''} onChange={setField(idx, 'cdlDate')} placeholder="MM/DD/YYYY" />
              )}
            </FormGrid>
            <Select
              label="Relationship to insured"
              options={RELATIONSHIP}
              value={d.relationshipToInsured}
              onChange={setField(idx, 'relationshipToInsured')}
            />
            <RadioGroup
              label="Relation to business"
              options={['Employee', 'Owner', 'Contractor']}
              value={d.relation}
              onChange={setField(idx, 'relation')}
            />
            <RadioGroup
              label="Any violations in the last 3 years?"
              options={['Yes', 'No']}
              value={d.hasViolations}
              onChange={setField(idx, 'hasViolations')}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addDriver}
        className="flex items-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-3 mb-2 add-another-btn transition w-full justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
        </svg>
        <span className="text-gradient">Add Another Driver</span>
      </button>
    </div>
  )
}
