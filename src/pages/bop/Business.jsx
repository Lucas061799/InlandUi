import { Input, Select, DateInput, FormGrid } from '../../components/FormField'

const ENTITY_OPTIONS = ['Sole Proprietor', 'Partnership', 'LLC', 'Corporation', 'S-Corporation', 'Non-Profit']

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

export default function Business({ formData, updateFormData, showErrors = false }) {
  const data = formData.business || {}
  const set = (key) => (val) => updateFormData('business', { [key]: val })
  // Required-field validator — used to drive the inline 'required'
  // hint on each FormField when the user has tried to Get Quotes
  // without filling everything in.
  const err = (key) => showErrors && (data[key] === undefined || data[key] === null || data[key] === '')

  return (
    <div className="w-full space-y-6">
      <FieldGroup label="Company Information">
        <div className="space-y-5">
          <Input label="Business Name" required value={data.name} onChange={set('name')} placeholder="Enter legal business name" error={err('name')} />

          <FormGrid>
            <Select label="Entity Type" required options={ENTITY_OPTIONS} value={data.entityType} onChange={set('entityType')} placeholder="Select entity type..." error={err('entityType')} />
            <DateInput label="Policy Effective Date" required value={data.effectiveDate} onChange={set('effectiveDate')} error={err('effectiveDate')} />
          </FormGrid>

          <FormGrid>
            <Input label="Year Established" required value={data.yearEstablished} onChange={set('yearEstablished')} placeholder="e.g. 2020" error={err('yearEstablished')} />
            <div />
          </FormGrid>
        </div>
      </FieldGroup>

      <FieldGroup label="Financials & Employees">
        <div className="space-y-5">
          <FormGrid>
            <Input label="Annual Revenue" required value={data.annualRevenue} onChange={set('annualRevenue')} placeholder="e.g. 200000" error={err('annualRevenue')} />
            <Input label="Annual Payroll" required value={data.annualPayroll} onChange={set('annualPayroll')} placeholder="e.g. 60000" error={err('annualPayroll')} />
          </FormGrid>

          <FormGrid>
            <Input label="Full-Time Employees" required value={data.numberOfEmployees} onChange={set('numberOfEmployees')} placeholder="e.g. 4" error={err('numberOfEmployees')} />
            <div />
          </FormGrid>
        </div>
      </FieldGroup>

      <FieldGroup label="Contact Details">
        <FormGrid>
          <Input label="Phone" required type="tel" value={data.phone} onChange={set('phone')} placeholder="(555) 123-4567" error={err('phone')} />
          <Input label="Email" required type="email" value={data.email} onChange={set('email')} placeholder="e.g. owner@business.com" error={err('email')} />
        </FormGrid>
      </FieldGroup>
    </div>
  )
}
