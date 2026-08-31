import { useMemo, useState } from 'react'
import { Select } from '../../components/FormField'
import {
  BrandText, InfoLine, PillGroup, SectionLabel, StepHeader, StepNav, Tag,
} from '../../components/inland/primitives'
import {
  BRAND_GRADIENT, CARRIERS, DEDUCTIBLES, DEFAULT_DEDUCTIBLE, ENHANCED_DEFAULTS,
  ENHANCED_GROUPS, ENHANCED_ITEMS, carrierById, money, quoteFor, rerate,
} from '../../data/inland'
import { premiumFor, quoteState } from './validation'

const TRIA_OPTIONS = [
  { value: 'include', label: 'Include' },
  { value: 'reject', label: 'Reject' },
]

/* GL's row pills: 10px bold, a tinted fill and a border of the same hue.
   Brand purple means "an underwriter can still say yes", grey means the
   carrier is out. */
const STATUS_CHIP = {
  'no-appetite': { className: 'im-chip-muted', label: 'No appetite' },
  declined:      { className: 'im-chip-stop',  label: 'Declined' },
  referred:      { className: 'im-chip-warn',  label: 'Referred' },
}

function CarrierMark({ carrier, size = 44 }) {
  return (
    <div
      className="im-carrier-tile rounded-xl flex items-center justify-center shrink-0"
      style={{ width: size, height: size, padding: 7 }}
    >
      <img src={carrier.logo} alt="" className="max-w-full max-h-full object-contain" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl px-5 py-6 flex flex-col items-center gap-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <div className="im-skel w-11 h-11 rounded-xl" />
      <div className="im-skel h-7 w-24 rounded" />
      <div className="im-skel h-3 w-20 rounded" />
      <div className="im-skel h-9 w-full rounded-xl mt-1" />
    </div>
  )
}

/* One carrier's answer. A price when they have one, and the reason in their
   own words when they do not — an agent should never have to guess why a
   carrier is missing from the list. */
function OutcomeCard({ outcome, submission, selected, onSelect }) {
  const carrier = carrierById(outcome.carrierId)
  const quote = quoteFor(outcome.carrierId)
  const isQuoted = outcome.status === 'quoted'
  const chip = STATUS_CHIP[outcome.status]
  const premium = premiumFor(outcome, submission)
  const changed = isQuoted && quote.enhanced && premium !== outcome.premium

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      /* #F9FAFB / #E5E7EB, not #FAFAFB / #F3F4F6: index.css swaps dark
         surfaces by exact token value, and the near-miss left these cards
         light on navy. */
      style={{
        background: isQuoted ? 'white' : '#F9FAFB',
        border: `1.5px solid ${selected ? '#5C2ED4' : '#E5E7EB'}`,
        boxShadow: selected ? '0 6px 24px rgba(92,46,212,0.18)' : 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CarrierMark carrier={carrier} />
        <div className="min-w-0">
          <p className={`text-[15px] font-bold leading-tight ${isQuoted ? 'text-gray-900' : 'text-gray-500'}`}>{carrier.name}</p>
          <p className="text-[11.5px] text-gray-400">{carrier.sub}</p>
        </div>
      </div>

      {chip && (
        <>
          <span className={`im-chip ${chip.className} self-start mb-2.5`}>{chip.label}</span>
          <p className="text-[12.5px] text-gray-500 leading-relaxed">{outcome.reason}</p>
        </>
      )}

      {isQuoted && (
        <>
          {quote.badge && <div className="mb-2.5"><Tag tone="brand">{quote.badge}</Tag></div>}

          <div className="flex items-end gap-2">
            <span className="text-[30px] font-bold leading-none text-gray-900">{money(premium)}</span>
            <span className="text-[12px] text-gray-400 pb-1">annually</span>
          </div>
          <p className="text-[12px] text-gray-500 mt-1.5">{quote.commission}</p>
          {changed && (
            <p className="text-[11.5px] font-semibold mt-1.5">
              <BrandText>Re-rated from your enhanced limits — base was {money(outcome.premium)}</BrandText>
            </p>
          )}

          <ul className="space-y-1.5 mt-4 mb-5">
            {quote.bullets.map(b => (
              <li key={b} className="flex items-start gap-2 text-[12.5px] text-gray-600">
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="url(#imCheck)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="imCheck" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
                    </linearGradient>
                  </defs>
                </svg>
                {b}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onSelect}
            className={`mt-auto w-full h-10 inline-flex items-center justify-center rounded-xl text-[13px] font-bold transition-all ${selected ? '' : 'force-white-text'}`}
            style={selected
              ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.10) 0%, rgba(166,20,195,0.10) 100%)', border: '1.5px solid #7C3AED', color: '#5C2ED4', WebkitTextFillColor: '#5C2ED4' }
              : { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 16px rgba(92,46,212,0.25)' }}
          >
            {selected ? '✓ Selected' : quote.enhanced ? 'Select and adjust limits' : 'Select'}
          </button>
        </>
      )}
    </div>
  )
}

/* Great American's built-in coverages. They are already in the price — this
   panel is where an agent moves a limit and sees what it costs. */
function EnhancedPanel({ data, set, basePremium }) {
  const selections = useMemo(() => data.enhanced || {}, [data.enhanced])
  const [draft, setDraft] = useState(selections)
  const [openGroup, setOpenGroup] = useState(ENHANCED_GROUPS[0].id)

  const changedCount = useMemo(
    () => ENHANCED_ITEMS.filter(i => (draft[i.id] ?? i.defaultValue) !== i.defaultValue).length,
    [draft],
  )
  const dirty = useMemo(
    () => ENHANCED_ITEMS.some(i => (draft[i.id] ?? i.defaultValue) !== (selections[i.id] ?? i.defaultValue)),
    [draft, selections],
  )
  const draftPremium = rerate(basePremium, draft)
  const appliedPremium = rerate(basePremium, selections)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-gray-900">Great American's enhanced coverages</h3>
            <p className="text-[13px] text-gray-500 mt-1 max-w-xl leading-relaxed">
              All {ENHANCED_ITEMS.length} are included in the price above. Move a limit and re-rate to see what it does.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              {dirty ? 'With your edits' : 'Current premium'}
            </p>
            <p className="text-xl font-bold text-gray-900">{money(dirty ? draftPremium : appliedPremium)}</p>
          </div>
        </div>
        {changedCount > 0 && (
          <p className="text-[12px] font-semibold mt-2">
            <BrandText>{changedCount} {changedCount === 1 ? 'limit' : 'limits'} away from the carrier's defaults</BrandText>
          </p>
        )}
      </div>

      <div>
        {ENHANCED_GROUPS.map(group => {
          const open = openGroup === group.id
          const groupChanged = group.items.filter(i => (draft[i.id] ?? i.defaultValue) !== i.defaultValue).length
          return (
            <div key={group.id} className="border-b border-gray-100">
              <button
                type="button"
                onClick={() => setOpenGroup(open ? null : group.id)}
                aria-expanded={open}
                className="w-full px-6 py-3.5 flex items-center justify-between gap-3 transition"
                style={{ background: 'white' }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-gray-800">{group.title}</span>
                  <span className="text-[11px] text-gray-400">{group.items.length}</span>
                  {groupChanged > 0 && <Tag tone="brand">{groupChanged} changed</Tag>}
                </span>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform text-gray-400"
                  style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="px-6 pb-5 space-y-4">
                  {group.items.map(item => {
                    const value = draft[item.id] ?? item.defaultValue
                    const moved = value !== item.defaultValue
                    return (
                      <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr,220px] gap-x-6 gap-y-2 items-center">
                        <div className="min-w-0">
                          <p className="text-[13.5px] text-gray-700 leading-snug">{item.label}</p>
                          {item.sublabel && <p className="text-[11.5px] text-gray-400 mt-0.5">{item.sublabel}</p>}
                          {moved && <p className="text-[11px] text-gray-400 mt-0.5">Carrier default {item.defaultValue}</p>}
                        </div>
                        <Select
                          options={item.options}
                          value={value}
                          onChange={(v) => setDraft(d => ({ ...d, [item.id]: v }))}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-6 py-4 flex items-center gap-3 flex-wrap" style={{ background: '#F9FAFB' }}>
        <button
          type="button"
          disabled={!dirty}
          onClick={() => set({ enhanced: draft })}
          className={`h-10 px-5 inline-flex items-center rounded-xl text-sm font-bold transition-all ${dirty ? 'force-white-text' : ''}`}
          style={dirty
            ? { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 16px rgba(92,46,212,0.25)' }
            : { background: '#D1D5DB', color: 'white', cursor: 'not-allowed' }}
        >
          Re-rate with these limits
        </button>
        <button
          type="button"
          onClick={() => { setDraft(ENHANCED_DEFAULTS); set({ enhanced: {} }) }}
          className="h-10 px-4 inline-flex items-center rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
        >
          Reset to carrier defaults
        </button>
        <span className="text-[12px] text-gray-400">
          {dirty
            ? `Re-rating moves the premium to ${money(draftPremium)}.`
            : 'The price above already reflects your saved limits.'}
        </span>
      </div>
    </div>
  )
}

export default function CompareQuotes({ data, set, submission, onBack, onContinue, quoting, answered = CARRIERS.length }) {
  const { outcomes, quoted, terminal } = quoteState(submission)
  const deductible = data.deductible ?? DEFAULT_DEDUCTIBLE
  const tria = data.tria ?? 'reject'
  const selectedId = data.selectedCarrier
  const selectedCarrier = quoted.find(o => o.carrierId === selectedId) ? carrierById(selectedId) : null

  return (
    <div className="w-full">
      <StepHeader title="Compare Quotes" />

      {/* One card holding the two answers and the line explaining them —
          without it the controls read as settings already applied rather
          than ones that move the prices below. */}
      <div className="rounded-xl px-5 sm:px-6 py-5 mb-6 space-y-5" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <div>
          <SectionLabel>Deductible</SectionLabel>
          <PillGroup
            label="Deductible"
            options={DEDUCTIBLES.map(d => ({ value: d, label: d.toLocaleString() }))}
            value={deductible}
            onChange={(v) => set({ deductible: v })}
          />
        </div>

        <div>
          <SectionLabel>Terrorism coverage (TRIA)</SectionLabel>
          <PillGroup label="Terrorism coverage" options={TRIA_OPTIONS} value={tria} onChange={(v) => set({ tria: v })} />
          {tria === 'include' && (
            <p className="im-note-warn text-[12.5px] font-semibold mt-2.5">
              · Great American includes terrorism coverage as standard, so this choice does not change their price.
            </p>
          )}
        </div>

        {/* Under both answers rather than above them: it is what to do once
            they are set, not an instruction for setting them. */}
        <InfoLine icon="alert">
          Changing either answer re-rates every price below. Then pick a carrier.
        </InfoLine>
      </div>

      {quoting && (
        <div className="mb-5">
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#F3F4F6' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(answered / CARRIERS.length) * 100}%`, background: BRAND_GRADIENT }}
            />
          </div>
          <p className="text-[13px] text-gray-500">
            Getting prices from {CARRIERS.length} carriers… {answered} of {CARRIERS.length} answered
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {outcomes.map((outcome, i) => (
          quoting && i >= answered
            ? <CardSkeleton key={outcome.carrierId} />
            : (
              <OutcomeCard
                key={outcome.carrierId}
                outcome={outcome}
                submission={submission}
                selected={selectedId === outcome.carrierId}
                onSelect={() => set({ selectedCarrier: selectedId === outcome.carrierId ? null : outcome.carrierId })}
              />
            )
        ))}
      </div>

      {!quoting && selectedId === 'GA' && (
        <div className="mt-7">
          <SectionLabel>Adjust before you bind</SectionLabel>
          <EnhancedPanel data={data} set={set} basePremium={quoted.find(o => o.carrierId === 'GA').premium} />
        </div>
      )}

      <div className="mt-7">
        <StepNav
          onBack={onBack}
          onContinue={onContinue}
          canContinue={!quoting && (!!selectedCarrier || !!terminal)}
          continueLabel={selectedCarrier
            ? `Continue with ${selectedCarrier.name}`
            : terminal
              ? 'Send to underwriting'
              : 'Continue'}
          hint={quoting
            ? 'Quotes are usually back within a few seconds'
            : terminal === 'referred'
              ? 'A carrier is interested but wants an underwriter to look first'
              : terminal === 'underwriting'
                ? 'Nobody could price this online — the team will quote it by hand'
                : selectedCarrier
                  ? undefined
                  : 'Select a carrier to continue'}
        />
      </div>
    </div>
  )
}
