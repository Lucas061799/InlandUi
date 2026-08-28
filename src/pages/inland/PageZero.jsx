import { useState } from 'react'
import norbielinkLogo from '../../assets/norbielink-logo.png'
import btisLogo from '../../assets/btislogo.png'
/* Norbie with the tools this product actually insures. */
import heroImg from '../../assets/norbie-inland-marine.png'
import jungleImg from '../../assets/jungle.png'
import { Textarea } from '../../components/FormField'
import ClassSearch from '../../components/inland/ClassSearch'
import { BrandText } from '../../components/inland/primitives'
import { BRAND_GRADIENT, CARRIERS, classById } from '../../data/inland'
import { MIN_DESCRIPTION_WORDS, countWords } from './validation'

/* Page zero. The class and the words an underwriter will read are the two
   answers everything else hangs off, so they are asked on their own before
   the seven steps start and handed straight into step one. */
export default function PageZero({ onStart, initialClassId, initialDescription }) {
  const [classId, setClassId] = useState(initialClassId || '')
  const [description, setDescription] = useState(initialDescription || '')
  const selected = classId ? classById(classId) : null
  const words = countWords(description)
  const enoughWords = words >= MIN_DESCRIPTION_WORDS
  const ready = !!classId && enoughWords

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">
      <header
        className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0"
        style={{ height: '56px' }}
      >
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide font-semibold">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      <div className="flex flex-1">
        <div className="flex-1 lg:w-1/2 lg:flex-none overflow-y-auto relative" style={{ borderRight: '1px solid #F3F4F6' }}>
          <img
            src={jungleImg}
            alt=""
            className="lg:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.06 }}
          />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[8%] lg:px-[10%]">
            <div className="w-full max-w-xl">
              <div className="mb-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Inland Marine</p>
                <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4" style={{ fontWeight: 800 }}>
                  Get Multiple Quotes.<br />
                  <span className="text-gradient">One Easy Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  First, tell us a bit about the business.
                </p>
              </div>

              <div className="space-y-5 mb-6">
                {selected ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                      What work do they do?<span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setClassId('')}
                      className="im-matched-card w-full rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 truncate">{selected.name}</span>
                        <span className="block text-[11.5px] text-gray-500">
                          {selected.id} · {selected.carriers.length} of {CARRIERS.length} carriers write this
                        </span>
                      </span>
                      <span className="text-[12px] font-semibold shrink-0" style={{ color: '#A614C3' }}>Change</span>
                    </button>
                  </div>
                ) : (
                  <ClassSearch label="What work do they do?" onChoose={setClassId} />
                )}

                <div>
                  <div className="flex items-end justify-between mb-1.5">
                    <label className="block text-[13px] font-semibold text-gray-600 tracking-wide">
                      Describe what they actually do<span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <span className="text-[12px] font-semibold">
                      {enoughWords
                        ? <BrandText>{words} / {MIN_DESCRIPTION_WORDS} words</BrandText>
                        : <span className="text-gray-400">{words} / {MIN_DESCRIPTION_WORDS} words</span>}
                    </span>
                  </div>
                  <Textarea
                    rows={4}
                    value={description}
                    onChange={setDescription}
                    placeholder="For example: service and repair of commercial water heaters, two vans of hand tools."
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    Underwriters read this. Specifics about the work and the equipment help more than job titles.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => ready && onStart({ classId, description })}
                disabled={!ready}
                className={`w-full h-14 flex items-center justify-center rounded-xl text-base font-bold transition ${ready ? 'force-white-text hover:opacity-90' : 'cursor-not-allowed'}`}
                style={{
                  background: ready ? BRAND_GRADIENT : '#D1D5DB',
                  color: 'white',
                  boxShadow: ready ? '0 4px 14px rgba(92,46,212,0.22)' : 'none',
                }}
              >
                Start application
              </button>

            </div>
          </div>
        </div>

        {/* The art is cut to its purple ring so the jungle reads behind it
            rather than through a pale square. */}
        <div
          className="hidden lg:flex relative overflow-hidden shrink-0 items-center justify-center"
          style={{ width: '50%', background: 'white' }}
        >
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.25 }} />
          <img
            src={heroImg}
            alt="Norbie with a van of contractor's equipment"
            className="relative z-10 select-none pointer-events-none"
            /* Same 500px box the GL / BOP page zero gives its hero, but no
               drop shadow: on GL's soft-edged figure it is invisible, while
               a hard-edged circle turns it into a visible halo. */
            style={{ width: '500px', height: '500px', objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  )
}
