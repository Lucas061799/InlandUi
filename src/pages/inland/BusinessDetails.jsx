import AddressAutocomplete from '../../components/AddressAutocomplete'
import ClassSummary from '../../components/inland/ClassSummary'
import { Checkbox, DateInput, FormGrid, Input, Select } from '../../components/FormField'
import { FieldError, FieldGroup, InfoLine, NotePanel, StepHeader, StepNav } from '../../components/inland/primitives'
import { BUSINESS_TYPES, US_STATES, YEAR_OPTIONS } from '../../data/inland'
import { businessComplete, businessRuleErrors, classCodeComplete } from './validation'

export default function BusinessDetails({ data, set, classCode, setClassCode, onBack, onContinue, showErrors, hideNav = false }) {
  const err = (key) => showErrors && !data[key]
  const mailingSame = data.mailingSame !== false
  const inspectionSame = data.inspectionSame !== false
  const ruleErrors = businessRuleErrors(data)
  const complete = businessComplete(data)
  const classOk = classCodeComplete(classCode)

  const mailingLine = [data.address, data.city, data.state, data.zip].filter(Boolean).join(', ')

  return (
    <div className="w-full">
      {/* Two sections, each with its own header and rule: what page zero
          answered, then the questions this step actually asks. */}
      <StepHeader title="Class Code" />

      {/* 72px here plus the next header's pt-8 makes the 104px GL leaves
          between the end of one section and the next section's title. */}
      <div className="mb-14 md:mb-[72px]">
        <ClassSummary data={classCode} set={setClassCode} showErrors={showErrors} />
      </div>

      <StepHeader title="Business Details" />

      <div className="space-y-6">
        <FieldGroup label="Applicant">
          <div className="space-y-5">
            <FormGrid>
              <Input label="First name" required value={data.firstName} onChange={(v) => set({ firstName: v })} placeholder="Jordan" error={err('firstName')} />
              <Input label="Last name" required value={data.lastName} onChange={(v) => set({ lastName: v })} placeholder="Reyes" error={err('lastName')} />
            </FormGrid>

            <FormGrid>
              <div>
                <Input label="Business name" required value={data.businessName} onChange={(v) => set({ businessName: v })} placeholder="Reyes Mechanical LLC" error={err('businessName')} />
                <p className="text-[11px] text-gray-400 mt-1">The legal name the business is registered under.</p>
              </div>
              <div>
                <Input label="Doing business as" value={data.dba} onChange={(v) => set({ dba: v })} placeholder="Optional" />
                <p className="text-[11px] text-gray-400 mt-1">Only if they trade under a name other than the legal one.</p>
              </div>
            </FormGrid>

            <FormGrid>
              <Input label="Email" required type="email" value={data.email} onChange={(v) => set({ email: v })} placeholder="jordan@reyesmechanical.com" error={err('email')} />
              <Input label="Phone" required type="tel" value={data.phone} onChange={(v) => set({ phone: v })} placeholder="(555) 555-5555" error={err('phone')} />
            </FormGrid>
          </div>
        </FieldGroup>

        <FieldGroup label="The business">
          <div className="space-y-5">
            <FormGrid>
              <Select label="Type of business" required options={BUSINESS_TYPES} value={data.entityType} onChange={(v) => set({ entityType: v })} placeholder="Select type" error={err('entityType')} />
              <DateInput label="Effective date" required value={data.effectiveDate} onChange={(v) => set({ effectiveDate: v })} error={err('effectiveDate')} />
            </FormGrid>

            <FormGrid>
              <Select label="Years in business" required options={YEAR_OPTIONS} value={data.yearsInBusiness} onChange={(v) => set({ yearsInBusiness: v })} placeholder="Select years" error={err('yearsInBusiness')} />
              <Select label="Industry experience" required options={YEAR_OPTIONS} value={data.industryExperience} onChange={(v) => set({ industryExperience: v })} placeholder="Select years" error={err('industryExperience')} />
            </FormGrid>

            {/* Bare lines, not a panel: a rule broken between two fields is
                the same kind of message as one raised by a single field, so
                it is written the same way. */}
            {ruleErrors.length > 0 && (
              <div>
                {ruleErrors.map(e => (
                  <FieldError key={e}>{e}</FieldError>
                ))}
              </div>
            )}
          </div>
        </FieldGroup>

        <FieldGroup label="Business address">
          {/* Street and suite on one line, then the four fields that
              identify the place. ZIP used to sit alone on its own row with
              a half-empty line beside it. */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-5 items-start">
            <div className="sm:col-span-3">
              <AddressAutocomplete
                label="Street address"
                required
                value={data.address}
                onChange={(v) => set({ address: v })}
                onSelect={({ address, city, state, zip }) => set({ address, city, state, zip })}
                error={err('address')}
              />
            </div>
            <Input label="Suite / unit / apt." value={data.suite} onChange={(v) => set({ suite: v })} placeholder="Suite 200" />

            <Input label="City" required value={data.city} onChange={(v) => set({ city: v })} placeholder="Plano" error={err('city')} />
            <Input label="County" required value={data.county} onChange={(v) => set({ county: v })} placeholder="Collin County" error={err('county')} />
            <Select label="State" required options={US_STATES} value={data.state} onChange={(v) => set({ state: v })} placeholder="Select state" error={err('state')} />
            <Input label="ZIP" required value={data.zip} onChange={(v) => set({ zip: v })} placeholder="75074" error={err('zip')} />
          </div>

          <InfoLine className="mt-5">The county the business operates from.</InfoLine>
        </FieldGroup>

        <FieldGroup label="Mailing and inspection">
          <div className="space-y-5">
            <div className="space-y-3">
              <Checkbox
                label="The mailing address is the same as the business address"
                checked={mailingSame}
                onChange={(v) => set({ mailingSame: v })}
              />
              {mailingSame ? (
                <NotePanel title="Nothing more to enter.">
                  {mailingLine
                    ? `Policy documents go to ${mailingLine}.`
                    : 'Policy documents go to the business address above.'}
                </NotePanel>
              ) : (
                <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB', borderLeft: '3px solid #7C3AED' }}>
                  <p className="text-[13px] font-semibold text-gray-700 mb-4">Mailing address</p>
                  <div className="space-y-5">
                    <AddressAutocomplete
                      label="Street address"
                      required
                      value={data.mailAddress}
                      onChange={(v) => set({ mailAddress: v })}
                      onSelect={({ address, city, state, zip }) => set({ mailAddress: address, mailCity: city, mailState: state, mailZip: zip })}
                      error={showErrors && !data.mailAddress}
                    />
                    <FormGrid>
                      <Input label="Suite / unit / apt." value={data.mailSuite} onChange={(v) => set({ mailSuite: v })} placeholder="Suite 200" />
                      <Input label="City" required value={data.mailCity} onChange={(v) => set({ mailCity: v })} error={showErrors && !data.mailCity} />
                    </FormGrid>
                    <FormGrid>
                      <Select label="State" required options={US_STATES} value={data.mailState} onChange={(v) => set({ mailState: v })} placeholder="Select state" error={showErrors && !data.mailState} />
                      <Input label="ZIP" required value={data.mailZip} onChange={(v) => set({ mailZip: v })} error={showErrors && !data.mailZip} />
                    </FormGrid>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Checkbox
                label="The inspection contact is the applicant"
                checked={inspectionSame}
                onChange={(v) => set({ inspectionSame: v })}
              />
              {inspectionSame ? (
                <NotePanel title="The inspector will call the applicant.">
                  Uncheck this if someone else arranges access to the equipment or the yard.
                </NotePanel>
              ) : (
                <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB', borderLeft: '3px solid #7C3AED' }}>
                  <p className="text-[13px] font-semibold text-gray-700 mb-4">Inspection contact</p>
                  <div className="space-y-5">
                    <FormGrid>
                      <Input label="First name" required value={data.inspFirstName} onChange={(v) => set({ inspFirstName: v })} error={showErrors && !data.inspFirstName} />
                      <Input label="Last name" required value={data.inspLastName} onChange={(v) => set({ inspLastName: v })} error={showErrors && !data.inspLastName} />
                    </FormGrid>
                    <FormGrid>
                      <Input label="Email" type="email" value={data.inspEmail} onChange={(v) => set({ inspEmail: v })} />
                      <Input label="Phone" required type="tel" value={data.inspPhone} onChange={(v) => set({ inspPhone: v })} placeholder="(555) 555-5555" error={showErrors && !data.inspPhone} />
                    </FormGrid>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FieldGroup>
      </div>

      {/* On the long page one Get quotes closes all four sections. */}
      {!hideNav && (
      <div className="mt-7">
        <StepNav
          onBack={onBack}
          onContinue={onContinue}
          canContinue={complete && classOk}
          hint={complete && classOk ? undefined : 'Some answers above still need attention'}
        />
      </div>
      )}
    </div>
  )
}
