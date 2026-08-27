import { useState } from 'react'
import { Input, Select, FormGrid } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

const LOCATION_TYPE_OPTIONS = [
  'Owned',
  'Leased / Rented',
  'Home-Based',
  'No Fixed Premises',
  'Coworking Space',
]

function FieldGroup({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">
        {label}
      </div>
      <div
        className="rounded-xl p-5 sm:p-6"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        {children}
      </div>
    </div>
  )
}

function UspsModal({ entered, standardized, onAccept, onKeep }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,18,40,0.55)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div className="text-center pt-9 pb-6 px-8">
          <div
            className="inline-flex w-14 h-14 items-center justify-center rounded-full mb-4"
            style={{ background: 'linear-gradient(180deg, #5C2ED4 0%, #A614C3 100%)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 leading-snug">
            We found a cleaner version of this address
          </h2>
          <p className="text-sm text-gray-500">
            Pick which one to save. We need to pick before moving on.
          </p>
        </div>

        {/* Cards */}
        <div className="px-6 pb-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* USPS */}
            <div
              className="rounded-xl p-5"
              style={{ border: '2px solid #7C3AED', background: '#FAFAFB' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                  USPS Version
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}
                >
                  Recommended
                </span>
              </div>

              <div
                className="rounded-lg px-4 py-3 mb-4 text-sm text-gray-800 leading-relaxed"
                style={{ background: 'white', border: '1px solid #E5E7EB', minHeight: 84 }}
              >
                {standardized.address}<br />
                {standardized.city}, {standardized.state} {standardized.zip}
              </div>

              <button
                type="button"
                onClick={onAccept}
                className="w-full h-11 inline-flex items-center justify-center rounded-lg text-sm font-bold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
                  border: '1.5px solid transparent',
                  boxShadow: '0 2px 12px rgba(92,46,212,0.25)',
                }}
              >
                Use USPS version
              </button>
            </div>

            {/* Entered */}
            <div
              className="rounded-xl p-5"
              style={{ border: '1.5px solid #E5E7EB', background: 'white' }}
            >
              <div className="mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  What You Entered
                </span>
              </div>

              <div
                className="rounded-lg px-4 py-3 mb-4 text-sm text-gray-700 leading-relaxed"
                style={{ background: '#F9FAFB', border: '1px solid #EAEAEA', minHeight: 84 }}
              >
                {entered.address}<br />
                {entered.city}, {entered.state} {entered.zip}
              </div>

              <button
                type="button"
                onClick={onKeep}
                className="w-full h-11 inline-flex items-center justify-center rounded-lg text-sm font-bold transition hover:bg-gray-50"
                style={{ border: '1.5px solid #E5E7EB', color: '#374151', background: 'white' }}
              >
                Keep what I entered
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function standardize({ address, city, state, zip }) {
  const street = (address || '').toUpperCase()
    .replace(/\bWEST\b/g, 'W').replace(/\bEAST\b/g, 'E')
    .replace(/\bNORTH\b/g, 'N').replace(/\bSOUTH\b/g, 'S')
    .replace(/\bSTREET\b/g, 'ST').replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bROAD\b/g, 'RD').replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bDRIVE\b/g, 'DR')
  const plus4 = String(Math.floor(1000 + Math.random() * 9000))
  return {
    address: street,
    city: (city || '').toUpperCase(),
    state: (state || '').toUpperCase(),
    zip: zip ? `${zip.split('-')[0]}-${plus4}` : '',
  }
}

export default function Location({ formData, updateFormData, showErrors = false }) {
  const data = formData.location || {}
  const set = (key) => (val) => updateFormData('location', { [key]: val })
  const err = (key) => showErrors && (data[key] === undefined || data[key] === null || data[key] === '')

  const [usps, setUsps] = useState(null)

  const handleAddressSelect = ({ address, city, state, zip }) => {
    updateFormData('location', { address, city, state, zip })
    const entered = { address, city, state, zip }
    setUsps({ entered, standardized: standardize(entered) })
  }

  const acceptUsps = () => {
    if (!usps) return
    const s = usps.standardized
    updateFormData('location', { address: s.address, city: s.city, state: s.state, zip: s.zip })
    setUsps(null)
  }

  const keepEntered = () => setUsps(null)

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">Where is the business located?</p>

      <FieldGroup label="Address">
        <div className="space-y-5">
          <AddressAutocomplete
            label="Street Address"
            required
            value={data.address || ''}
            onChange={set('address')}
            onSelect={handleAddressSelect}
            error={err('address') ? 'This field is required' : ''}
          />

          <FormGrid cols={3}>
            <Input label="City" required value={data.city} onChange={set('city')} placeholder="City" error={err('city')} />
            <Select label="State" required options={US_STATES} value={data.state} onChange={set('state')} placeholder="State" error={err('state')} />
            <Input label="Zip Code" required value={data.zip} onChange={set('zip')} placeholder="12345" error={err('zip')} />
          </FormGrid>
        </div>
      </FieldGroup>

      <FieldGroup label="Premises">
        <FormGrid>
          <Select label="Where do you operate from?" options={LOCATION_TYPE_OPTIONS} value={data.locationType} onChange={set('locationType')} placeholder="Select location type..." />
          <Input label="Square Feet Occupied" required value={data.squareFeet} onChange={set('squareFeet')} placeholder="e.g. 1500" error={err('squareFeet')} />
        </FormGrid>
      </FieldGroup>

      {usps && (
        <UspsModal
          entered={usps.entered}
          standardized={usps.standardized}
          onAccept={acceptUsps}
          onKeep={keepEntered}
        />
      )}
    </div>
  )
}
