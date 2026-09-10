import { useEffect } from 'react'
import { Checkbox, DateInput, FormGrid, Select, Textarea } from '../../components/FormField'
import {
  AddAnother, FieldError, MoneyInput, QuestionCard, QuestionRow, RemoveButton, SectionLabel, StepHeader, StepNav, YesNo,
} from '../../components/inland/primitives'
import {
  ACTIVITY_RISKS, CANCEL_REASONS, OPERATOR_TRAINING, UW_QUESTIONS, operatorTrainingDefault,
} from '../../data/inland'
import { lossComplete, underwritingComplete } from './validation'

const MAX_LOSSES = 5

/* The three questions that open a follow-up stay in one list; the activity
   grid and the training question each need room of their own. */
const FOLLOW_UP_QUESTIONS = UW_QUESTIONS.filter(q => ['bankruptcy', 'cancelled', 'losses'].includes(q.id))
const ACTIVITIES_QUESTION = UW_QUESTIONS.find(q => q.id === 'activities')
const RENTS_OUT_QUESTION = UW_QUESTIONS.find(q => q.id === 'rentsOut')
const blankLoss = () => ({ amount: '', date: '', description: '' })

/* The activity list stays on screen whatever the answer is. An agent should
   be able to read what "activities or risks" means before deciding. */
function ActivityGrid({ enabled, selected = [], onChange }) {
  const toggle = (risk) => onChange(
    selected.includes(risk) ? selected.filter(r => r !== risk) : [...selected, risk],
  )

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
      {ACTIVITY_RISKS.map(risk => (
        <Checkbox
          key={risk}
          label={risk}
          checked={selected.includes(risk)}
          onChange={() => toggle(risk)}
          disabled={!enabled}
        />
      ))}
    </div>
  )
}

function LossBlock({ index, loss, total, onChange, onRemove, showErrors }) {
  const set = (patch) => onChange({ ...loss, ...patch })
  return (
    <div className={index === 0 ? '' : 'pt-5 mt-5 border-t border-gray-100'}>
      {total > 1 && (
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <SectionLabel className="mb-0">Loss {index + 1}</SectionLabel>
          <RemoveButton onClick={onRemove} label={`Remove loss ${index + 1}`} />
        </div>
      )}
      <div className="space-y-4">
        <FormGrid>
          <MoneyInput
            label="Loss amount"
            required
            value={loss.amount}
            onChange={(v) => set({ amount: v })}
            min={1}
            max={5000000}
            error={showErrors && !loss.amount}
          />
          <DateInput
            label="Loss date"
            required
            value={loss.date}
            onChange={(v) => set({ date: v })}
            error={showErrors && !loss.date}
          />
        </FormGrid>
        <Textarea
          label="Loss description"
          required
          rows={3}
          value={loss.description}
          onChange={(v) => set({ description: v })}
          placeholder="What was lost, how, and what changed afterwards — a locked yard or a tracker counts for a lot here."
          error={showErrors && !String(loss.description || '').trim()}
        />
      </div>
    </div>
  )
}

export default function Underwriting({ data, set, submission, onBack, onContinue, showErrors, hideNav = false }) {
  const experience = submission?.business?.industryExperience
  const complete = underwritingComplete(data)
  const losses = data.lossList?.length ? data.lossList : [blankLoss()]
  const answered = (v) => v === 'yes' || v === 'no'
  const activitiesError = showErrors && (!answered(data.activities)
    || (data.activities === 'yes' && !(data.activityList || []).length))
  const rentsOutError = showErrors && (!answered(data.rentsOut) || !data.operatorTraining)

  /* Operator training follows the industry experience answered in Business
     Details until the agent picks it themselves. It used to be seeded once on
     mount, which only held while Business Details was always filled first —
     on the long page every section mounts together, so it has to keep up. */
  useEffect(() => {
    if (data.operatorTrainingTouched) return
    const seeded = operatorTrainingDefault(experience)
    if (data.operatorTraining !== seeded) set({ operatorTraining: seeded })
  }, [experience, data.operatorTraining, data.operatorTrainingTouched, set])

  const setLosses = (list) => set({ lossList: list })

  return (
    <div className="w-full">
      <StepHeader title="Underwriting Questions" />

      {/* The three questions that open a follow-up, then the two that need
          room of their own — one card each, as GL lays out its questions. */}
      <div className="space-y-3">
        {FOLLOW_UP_QUESTIONS.map((q) => (
          <QuestionRow
            key={q.id}
            label={q.label}
            help={q.help}
            value={data[q.id]}
            onChange={(v) => set({ [q.id]: v })}
            error={showErrors && data[q.id] !== 'yes' && data[q.id] !== 'no'}
          >
            {q.followUp === 'cancelled' && data.cancelled === 'yes' && (
              <div className="space-y-4">
                <FormGrid>
                  <Select
                    label="Reason"
                    required
                    options={CANCEL_REASONS}
                    value={data.cancelReason}
                    onChange={(v) => set({ cancelReason: v })}
                    placeholder="Select the reason"
                    error={showErrors && !data.cancelReason}
                  />
                  <DateInput
                    label="Date of the cancellation"
                    value={data.cancelDate}
                    onChange={(v) => set({ cancelDate: v })}
                  />
                </FormGrid>
                <Textarea
                  label="What happened"
                  rows={2}
                  value={data.cancelDescription}
                  onChange={(v) => set({ cancelDescription: v })}
                  placeholder="A sentence is enough. The underwriter is looking for whether it has been resolved."
                />
              </div>
            )}

            {q.followUp === 'losses' && data.losses === 'yes' && (
              <div>
                {losses.map((loss, idx) => (
                  <LossBlock
                    key={idx}
                    index={idx}
                    loss={loss}
                    total={losses.length}
                    onChange={(next) => setLosses(losses.map((l, i2) => (i2 === idx ? next : l)))}
                    onRemove={() => setLosses(losses.filter((_, i2) => i2 !== idx))}
                    showErrors={showErrors && !lossComplete(loss)}
                  />
                ))}
                {losses.length < MAX_LOSSES && (
                  <div className="mt-4">
                    <AddAnother onClick={() => setLosses([...losses, blankLoss()])}>
                      Add another loss
                    </AddAnother>
                  </div>
                )}
              </div>
            )}
          </QuestionRow>
        ))}

      {/* Its own card: the list is long enough that nesting it inside a
          question row buries every question under it. */}
      <QuestionCard error={activitiesError}>
        <p className={`text-sm leading-relaxed mb-1 ${activitiesError ? 'text-red-500' : 'text-gray-800'}`}>{ACTIVITIES_QUESTION.label}</p>
        <p className="text-[12px] text-gray-400 mb-3">Tick everything that applies. Any of these needs an underwriter to look at the risk.</p>
        <YesNo value={data.activities} onChange={(v) => set({ activities: v })} name={ACTIVITIES_QUESTION.label} />
        <ActivityGrid
          enabled={data.activities === 'yes'}
          selected={data.activityList}
          onChange={(list) => set({ activityList: list })}
        />
        {showErrors && data.activities === 'yes' && (data.activityList || []).length === 0 && (
          <FieldError className="mt-3">Tick at least one activity, or answer no.</FieldError>
        )}
      </QuestionCard>

      {/* The rent-out answer and the training records behind it. */}
      <QuestionCard error={rentsOutError}>
        <p className={`text-sm leading-relaxed mb-1 ${rentsOutError ? 'text-red-500' : 'text-gray-800'}`}>{RENTS_OUT_QUESTION.label}</p>
        <p className="text-[12px] text-gray-400 mb-3">{RENTS_OUT_QUESTION.help}</p>
        <YesNo value={data.rentsOut} onChange={(v) => set({ rentsOut: v })} name={RENTS_OUT_QUESTION.label} />

        <div className="sm:max-w-md mt-5 pt-5 im-rule">
          <Select
            label="Operator training and experience"
            required
            options={OPERATOR_TRAINING}
            value={data.operatorTraining}
            onChange={(v) => set({ operatorTraining: v, operatorTrainingTouched: true })}
            placeholder="Select"
            error={showErrors && !data.operatorTraining}
          />
          <p className="text-[11.5px] text-gray-400 mt-1.5 leading-relaxed">
            {experience
              ? `Prefilled from the ${experience} years of industry experience on the business step. Change it if the training records are incomplete.`
              : 'Change it if the training records are incomplete.'}
          </p>
        </div>
      </QuestionCard>
      </div>

      {/* On the long page one Get quotes closes all four sections. */}
      {!hideNav && (
      <div className="mt-7">
        <StepNav
          onBack={onBack}
          onContinue={onContinue}
          canContinue={complete}
          hint={complete ? undefined : 'Every question needs an answer'}
        />
      </div>
      )}
    </div>
  )
}
