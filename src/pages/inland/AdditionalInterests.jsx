import AddressAutocomplete from '../../components/AddressAutocomplete'
import { FormGrid, Input, Select } from '../../components/FormField'
import {
  AddAnother, QuestionRow, RemoveButton, SectionLabel, StepHeader, StepNav,
} from '../../components/inland/primitives'
import {
  INTEREST_COVERAGE_TYPES, INTEREST_TYPES, LOSS_PAYEE_TYPES, US_STATES,
} from '../../data/inland'
import { MAX_INTERESTS, interestsComplete } from './validation'

const blank = () => ({
  type: '', lossPayeeType: '', coverage: '', name: '', loanNumber: '',
  address: '', suite: '', city: '', state: '', zip: '',
})

function InterestBlock({ index, value, total, onChange, onRemove, showErrors }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const err = (key) => showErrors && !value[key]
  const isLossPayee = value.type === 'lossPayee'

  return (
    <div className={index === 0 ? '' : 'pt-5 mt-5 border-t border-gray-100'}>
      {total > 1 && (
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <SectionLabel className="mb-0">Additional interest {index + 1}</SectionLabel>
          <RemoveButton onClick={onRemove} label={`Remove interest ${index + 1}`} />
        </div>
      )}

      <div className="space-y-5">
        <FormGrid>
          <Select
            label="Interest type"
            required
            options={INTEREST_TYPES}
            value={value.type}
            onChange={(v) => set({ type: v, lossPayeeType: v === 'lossPayee' ? value.lossPayeeType : '' })}
            placeholder="Select interest type"
            error={err('type')}
          />
          <Select
            label="Which coverage"
            required
            options={INTEREST_COVERAGE_TYPES}
            value={value.coverage}
            onChange={(v) => set({ coverage: v })}
            placeholder="Select coverage"
            error={err('coverage')}
          />
        </FormGrid>

        {/* Only a loss payee has a lender relationship to describe, so the
            question appears once that is the answer. */}
        {isLossPayee && (
          <FormGrid>
            <Select
              label="Loss payee type"
              required
              options={LOSS_PAYEE_TYPES}
              value={value.lossPayeeType}
              onChange={(v) => set({ lossPayeeType: v })}
              placeholder="Select loss payee type"
              error={err('lossPayeeType')}
            />
            <div />
          </FormGrid>
        )}

        <FormGrid>
          <Input label="Name" required value={value.name} onChange={(v) => set({ name: v })} placeholder="Lender or leasing company" error={err('name')} />
          <Input label="Loan or lease number" value={value.loanNumber} onChange={(v) => set({ loanNumber: v })} placeholder="Optional" />
        </FormGrid>

        {/* Address and suite share a line, then the three fields that
            place it — the same shape as the business address on step 1. */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-5 items-start">
          <div className="sm:col-span-3">
            <AddressAutocomplete
              label="Address"
              required
              value={value.address}
              onChange={(v) => set({ address: v })}
              onSelect={({ address, city, state, zip }) => set({ address, city, state, zip })}
              error={err('address')}
            />
          </div>
          <Input label="Suite / unit" value={value.suite} onChange={(v) => set({ suite: v })} placeholder="Optional" />

          {/* City takes the slot the missing fourth field would have used —
              town names are long and were being truncated. */}
          <div className="sm:col-span-2">
            <Input label="City" required value={value.city} onChange={(v) => set({ city: v })} error={err('city')} />
          </div>
          <Select label="State" required options={US_STATES} value={value.state} onChange={(v) => set({ state: v })} placeholder="Select state" error={err('state')} />
          <Input label="ZIP" required value={value.zip} onChange={(v) => set({ zip: v })} error={err('zip')} />
        </div>
      </div>
    </div>
  )
}

export default function AdditionalInterests({ data, set, onBack, onContinue, showErrors, hideNav = false }) {
  const list = data.interests || []
  const complete = interestsComplete(data)

  const setList = (next) => set({ interests: next })
  const answerYes = () => set({ hasInterests: 'yes', interests: list.length ? list : [blank()] })

  return (
    <div className="w-full">
      <StepHeader title="Additional Interests" />

      <div className="space-y-4">
        <div>
          <QuestionRow
            label="Does the applicant want to add an additional interest — a loss payee, an additional insured, or an additional named insured — to their policy?"
            value={data.hasInterests}
            onChange={(v) => (v === 'yes' ? answerYes() : set({ hasInterests: 'no' }))}
            error={showErrors && data.hasInterests !== 'yes' && data.hasInterests !== 'no'}
          >
            {data.hasInterests === 'yes' && (
              <div>
                {list.map((interest, i) => (
                  <InterestBlock
                    key={i}
                    index={i}
                    value={interest}
                    total={list.length}
                    onChange={(next) => setList(list.map((it, idx) => (idx === i ? next : it)))}
                    onRemove={() => setList(list.filter((_, idx) => idx !== i))}
                    showErrors={showErrors}
                  />
                ))}

                {list.length < MAX_INTERESTS && (
                  <div className="mt-5">
                    <AddAnother onClick={() => setList([...list, blank()])}>
                      Add another interest
                    </AddAnother>
                  </div>
                )}
                {list.length >= MAX_INTERESTS && (
                  <p className="text-[12px] text-gray-400 mt-3">
                    {MAX_INTERESTS} is the most the carriers accept on the submission. Anything further gets added by endorsement.
                  </p>
                )}
              </div>
            )}
          </QuestionRow>
        </div>

      </div>

      {/* mt-3, not mt-7: the question row above already ends on 20px of its
          own padding, so the usual 28px stacked into a 56px hole. */}
      {/* On the long page one Get quotes closes all four sections. */}
      {!hideNav && (
      <div className="mt-3">
        <StepNav
          onBack={onBack}
          onContinue={onContinue}
          canContinue={complete}
          continueLabel={complete ? 'Get quotes' : 'Continue'}
          /* No hint until the question is answered — a lone Yes/No needs no
             footnote telling you to click it. */
          hint={!data.hasInterests || complete
            ? undefined
            : 'Please fill in all the mandatory details'}
        />
      </div>
      )}
    </div>
  )
}
