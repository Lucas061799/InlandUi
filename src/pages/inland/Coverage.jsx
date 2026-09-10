import { Input, Select } from '../../components/FormField'
import {
  AddAnother, Banner, FieldError, InfoDot, MoneyInput, QuestionCard, RemoveButton, SectionLabel, StepHeader, StepNav, Tag, Toggle,
} from '../../components/inland/primitives'
import {
  ENHANCED_ITEMS, EQUIPMENT_CLASSES, SCHEDULE_ITEMS, SCHEDULE_ITEM_MIN, SCHEDULE_TOTAL_MAX, money,
} from '../../data/inland'
import {
  coverageComplete, lineComplete, scheduleItemErrors, scheduleItemsTotal, scheduledTotal, selectedLines,
} from './validation'

const MAX_SCHEDULE_ITEMS = 10
const blankItem = () => ({ equipmentClass: '', modelYear: '', serial: '', limit: '', description: '' })

/* The equipment schedule. Carriers rate this line item by item, so each row
   carries what they need to list it: what it is, what it is worth, and
   enough identity to pay a claim on it. */
function ScheduleItems({ items = [], onChange, showErrors }) {
  const rows = items.length ? items : [blankItem()]
  const update = (idx, patch) => onChange(rows.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  const total = scheduleItemsTotal(rows)
  const overTotal = total > SCHEDULE_TOTAL_MAX

  return (
    <div className="space-y-4">
      {rows.map((item, idx) => {
        const errors = showErrors ? scheduleItemErrors(item) : {}
        return (
          <div key={idx} className="rounded-xl p-4 sm:p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            {/* Removal belongs to the row it removes, not to a button at the
                bottom of the list. */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <SectionLabel className="mb-0">Scheduled equipment {idx + 1}</SectionLabel>
              {rows.length > 1 && (
                <RemoveButton
                  onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                  label={`Remove scheduled equipment ${idx + 1}`}
                />
              )}
            </div>

            {/* One three-column grid for the whole row, so the limit lines
                up under the class and the description runs the width of the
                two fields beside it. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <Select
                label="Equipment class"
                required
                options={EQUIPMENT_CLASSES}
                value={item.equipmentClass}
                onChange={(v) => update(idx, { equipmentClass: v })}
                placeholder="Light / medium or heavy"
                error={!!errors.equipmentClass}
              />
              <Input
                label="Model year"
                value={item.modelYear}
                onChange={(v) => update(idx, { modelYear: v.replace(/[^0-9]/g, '').slice(0, 4) })}
                placeholder="2020"
              />
              <Input
                label="Serial number"
                value={item.serial}
                onChange={(v) => update(idx, { serial: v })}
                placeholder="Optional"
              />

              <MoneyInput
                label="Limit of insurance"
                required
                value={item.limit}
                onChange={(v) => update(idx, { limit: v })}
                min={SCHEDULE_ITEM_MIN}
                max={SCHEDULE_TOTAL_MAX}
                error={!!errors.limit}
              />
              {/* Make and model is one line, so it is an input — a taller
                  textarea beside the limit left the row uneven. */}
              <div className="sm:col-span-2">
                <Input
                  label="Equipment description"
                  required
                  value={item.description}
                  onChange={(v) => update(idx, { description: v })}
                  placeholder="Make and model — e.g. 2020 Ditch Witch RT45 trencher"
                  error={!!errors.description}
                />
              </div>
            </div>
          </div>
        )
      })}

      {rows.length < MAX_SCHEDULE_ITEMS && (
        <AddAnother onClick={() => onChange([...rows, blankItem()])}>
          Add another item
        </AddAnother>
      )}

      <p className={`text-[12.5px] ${overTotal ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
        Scheduled total <span className="font-bold">{money(total)}</span> of {money(SCHEDULE_TOTAL_MAX)}
        {overTotal && ' — over what the carriers will schedule on one policy.'}
      </p>
    </div>
  )
}

function ScheduleRow({ item, line, set, showErrors }) {
  const on = !!line.on
  const incomplete = on && showErrors && !lineComplete(item, line)

  return (
    <QuestionCard error={incomplete}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-gray-800">{item.label}</span>
            <InfoDot text={item.info} label={`What ${item.label} covers`} />
                {item.badge && <Tag tone="brand">{item.badge}</Tag>}
          </div>
        </div>
        <Toggle checked={on} onChange={(v) => set({ on: v })} ariaLabel={item.label} />
      </div>

      {on && (
        <div className="mt-4 pt-4 im-rule">
          {item.note && <p className="text-[12.5px] text-gray-500 mb-3.5">{item.note}</p>}

          {item.itemSchedule ? (
            <ScheduleItems
              items={line.items}
              onChange={(items) => set({ items })}
              showErrors={showErrors}
            />
          ) : (
            <div className={`grid gap-x-6 gap-y-4 ${
              item.fields.length >= 3 ? 'sm:grid-cols-3' : item.fields.length === 2 ? 'sm:grid-cols-2' : ''
            }`}>
              {item.fields.map(f => (
                <MoneyInput
                  key={f.key}
                  label={f.label}
                  value={line[f.key]}
                  onChange={(v) => set({ [f.key]: v })}
                  min={f.min}
                  max={f.max}
                />
              ))}
            </div>
          )}

          {incomplete && !item.itemSchedule && (
            <FieldError className="mt-3">Enter a value inside the accepted range so this line can be rated.</FieldError>
          )}
        </div>
      )}
    </QuestionCard>
  )
}

export default function Coverage({ data, set, onBack, onContinue, showErrors, hideNav = false }) {
  const setLine = (id) => (patch) => set({ [id]: { ...(data[id] || {}), ...patch } })
  const on = selectedLines(data)
  const complete = coverageComplete(data)
  const total = scheduledTotal(data)

  return (
    <div className="w-full">
      <StepHeader title="Coverage" />

      <div className="mb-6">
        <Banner>
          Great American quotes this class with{' '}
          <strong className="font-bold">{ENHANCED_ITEMS.length} enhanced coverages</strong> built in. You can adjust
          any of their limits when you compare prices — changing a limit changes the price.
        </Banner>
      </div>

      <SectionLabel>Choose what to schedule</SectionLabel>
      <div className="space-y-3">
        {SCHEDULE_ITEMS.map(item => (
          <ScheduleRow
            key={item.id}
            item={item}
            line={data[item.id] || {}}
            set={setLine(item.id)}
            showErrors={showErrors}
          />
        ))}
      </div>

      {total > 0 && (
        <p className="text-[13px] text-gray-500 mt-4">
          {on.length} {on.length === 1 ? 'line' : 'lines'} scheduled, <span className="font-bold text-gray-800">{money(total)}</span> in
          values going to the carriers.
        </p>
      )}

      {/* On the long page one Get quotes closes all four sections. */}
      {!hideNav && (
      <div className="mt-7">
        <StepNav
          onBack={onBack}
          onContinue={onContinue}
          canContinue={complete}
          hint={on.length === 0
            ? 'Nothing selected yet'
            : complete
              ? undefined
              : 'Every line you switched on needs a value'}
        />
      </div>
      )}
    </div>
  )
}
