import { Input, Textarea, Select, FormGrid, DateInput } from '../components/FormField'
import AddressAutocomplete from '../components/AddressAutocomplete'

const ENTITY_OPTIONS = ['Individual', 'Corporation', 'Limit Liability Company', 'Partnership']

export default function ApplicantInformation({ formData, updateFormData, errorFields = [] }) {
  const data = formData.applicant || {}
  const set = (key) => (val) => updateFormData('applicant', { [key]: val })
  const hasError = (field) => errorFields.includes(`applicant-${field}`)

  const handleAddressSelect = ({ address, city, state, zip }) => {
    updateFormData('applicant', { address, city, state, zip })
  }

  return (
    <div className="w-full">
      <div className="space-y-5">
        <FormGrid>
          <Input label="Named Insured" required value={data.namedInsured} onChange={set('namedInsured')} error={hasError('namedInsured')} />
          <Input label="DBA" value={data.dba} onChange={set('dba')} placeholder="Doing Business As" />
        </FormGrid>

        <FormGrid>
          <Select label="Entity" required options={ENTITY_OPTIONS} value={data.entity} onChange={set('entity')} error={hasError('entity')} />
          <DateInput label="Effective Date" required value={data.effectiveDate} onChange={set('effectiveDate')} error={hasError('effectiveDate')} />
        </FormGrid>

        <FormGrid>
          <Input label="Email" required type="email" value={data.email} onChange={set('email')} error={hasError('email')} />
          <Input label="Phone" required type="tel" value={data.phone} onChange={set('phone')} placeholder="(555) 000-0000" error={hasError('phone')} />
        </FormGrid>

        <Input label="Years in Business" required value={data.yearsInBusiness} onChange={set('yearsInBusiness')} className="max-w-xs" />

        <Textarea label="Description of operations (be specific)" required rows={3}
          value={data.description} onChange={set('description')}
          placeholder="Describe your business operations in detail..." />

        <Textarea label="How are the vehicle(s) are used in the business?" required rows={3}
          value={data.vehicleUse} onChange={set('vehicleUse')}
          placeholder="Describe how vehicles are used..." />

        {/* Address with inline autocomplete */}
        <FormGrid>
          <AddressAutocomplete
            label="Address"
            value={data.address || ''}
            onChange={set('address')}
            onSelect={handleAddressSelect}
          />
          <Input label="Suite/Apt/Building" value={data.suite} onChange={set('suite')} />
        </FormGrid>

        <FormGrid cols={3}>
          <Input label="City" value={data.city} onChange={set('city')} />
          <Input label="State" value={data.state} onChange={set('state')} placeholder="CA" />
          <Input label="Zip" value={data.zip} onChange={set('zip')} placeholder="00000" />
        </FormGrid>
      </div>
    </div>
  )
}
