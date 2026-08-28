import { useState } from 'react'
import { Textarea } from '../FormField'
import ClassSearch from './ClassSearch'
import { BrandText } from './primitives'
import { BRAND_GRADIENT, classById } from '../../data/inland'
import { MIN_DESCRIPTION_WORDS, countWords } from '../../pages/inland/validation'

/* What page zero answered, confirmed back at the top of the first step.
   Both answers are changed in place — going back for either would cost the
   agent everything they have entered since. */
export default function ClassSummary({ data, set, showErrors }) {
  const [changing, setChanging] = useState(false)
  const [editing, setEditing] = useState(false)

  const classItem = data.classId ? classById(data.classId) : null
  const words = countWords(data.description)
  const enoughWords = words >= MIN_DESCRIPTION_WORDS

  /* One card either way: the top half swaps between the matched class and
     the search, and the description stays put — changing the class is no
     reason to hide what they wrote about the work. */
  const searching = changing || !classItem

  return (
    <div className={searching ? 'rounded-2xl p-5 sm:p-6' : 'im-matched-card rounded-2xl px-5 py-4'}
      style={searching ? { background: '#F9FAFB', border: '1px solid #E5E7EB' } : undefined}>

      {searching ? (
        <ClassSearch
          label="Search classes"
          autoFocus={changing}
          onChoose={(id) => { set({ classId: id }); setChanging(false) }}
          onCancel={classItem ? () => setChanging(false) : undefined}
          error={showErrors && !classItem}
        />
      ) : (
        <div className="flex items-start gap-3.5">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: BRAND_GRADIENT }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[17px] font-bold text-gray-900 leading-tight">{classItem.name}</p>
              <button type="button" onClick={() => setChanging(true)} className="text-[12.5px] font-bold shrink-0">
                <BrandText>Change Class Code</BrandText>
              </button>
            </div>

            <p className="text-[13px] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono font-bold" style={{ color: '#5C2ED4' }}>{classItem.id}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">{classItem.tag}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">SIC {classItem.sic}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">NAICS {classItem.naics}</span>
            </p>
          </div>
        </div>
      )}

      <div className={`mt-4 pt-4 ${searching ? 'im-rule' : 'im-rule-brand'}`}>
        <div className="flex items-end justify-between gap-4 mb-1.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400">What they actually do</p>
          {editing ? (
            <span className="text-[12px] font-semibold">
              {enoughWords
                ? <BrandText>{words} / {MIN_DESCRIPTION_WORDS} words</BrandText>
                : <span className="text-gray-400">{words} / {MIN_DESCRIPTION_WORDS} words</span>}
            </span>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="text-[12.5px] font-bold">
              <BrandText>Edit</BrandText>
            </button>
          )}
        </div>

        {editing ? (
          <>
            <Textarea
              value={data.description}
              onChange={(v) => set({ description: v })}
              rows={3}
              placeholder="For example: service and repair of commercial water heaters, two vans of hand tools."
              error={showErrors && !enoughWords}
            />
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={!enoughWords}
              className="mt-3 h-10 px-4 inline-flex items-center rounded-xl text-[13px] font-semibold transition-all"
              style={{ background: 'white', border: '1.5px solid #E5E7EB', color: enoughWords ? '#6B7280' : '#D1D5DB' }}
            >
              Done
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">{data.description}</p>
        )}
      </div>
    </div>
  )
}
