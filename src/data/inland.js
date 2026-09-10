/* ──────────────────────────────────────────────────────────────────────────
   Inland Marine — submission data
   Everything the 7-step flow reads: class codes, carriers, coverages,
   underwriting questions and the sample quotes. Kept in one module so a
   page never invents its own copy of a limit or a carrier name.
   ────────────────────────────────────────────────────────────────────────── */

import logoLevanta       from '../assets/carrier-levanta.png'
import logoRivet         from '../assets/carrier-rivet.png'
import logoGreatAmerican from '../assets/carrier-greatamerican-im.png'

export const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

/* ── Carriers ─────────────────────────────────────────────────────────── */

export const CARRIERS = [
  { id: 'LEV', name: 'Levanta',        sub: 'by AXIS',            logo: logoLevanta },
  { id: 'NAV', name: 'Rivet',          sub: 'by Navigators',      logo: logoRivet },
  { id: 'GA',  name: 'Great American', sub: 'Insurance Group',    logo: logoGreatAmerican },
]

export const carrierById = (id) => CARRIERS.find(c => c.id === id)

/* ── Class codes ──────────────────────────────────────────────────────────
   The trade list an agent searches on step 1. Each entry carries the BTIS
   code, which carriers write it, and the SIC / NAICS pair underwriters ask
   for. Codes are positional — the list is the source of truth for both.  */

const CLASS_NAMES = [
  'Accounting', 'Agricultural Machinery & Equipment', 'Agricultural Operations', 'Agriculture',
  'Air Conditioning', 'Alarm & Security System', 'Ambulance Equipment', 'Animal Shelters',
  'Appliance Install and Repair', 'Appliance Installation Commercial', 'Appliance Installation Residential',
  'Artist', 'ATM Machines', 'Auto Mobile Dent Removal', 'Auto Mobile Glass Repair', 'Auto Detailing',
  'Auto Mechanics Tools', 'Auto Paint Booths', 'Auto Wrapping', 'Band Equipment', 'Beautician Equipment',
  'Boat Mobile Detailing', 'Boiler Installation and Repair', 'Bookkeepers', 'Brewery Equipment',
  'Building Inspector Commercial', 'Building Inspector Residential', 'Cabinet Manufacturer',
  'Carpentry Commercial', 'Carpentry Framing', 'Carpentry Handyman', 'Carpentry Homebuilder',
  'Carpentry Interior', 'Carpentry Residential', 'Carpentry Shop Only', 'Carpet Cleaning',
  'Carpet Rug and Upholstery Cleaning', 'Caterers', 'Catering Equipment', 'Ceiling and Wall Installation Metal',
  'Chimney Cleaning', 'Communication Equipment Installation', 'Concrete Construction',
  'Conduit Construction', 'Consultants', 'Custom Harvesting', 'Custom Harvesting Contractor',
  'Dance Studio Equipment', 'Debris Removal Construction Site', 'Demolition Contractors', 'DJ Equipment',
  'Dog Daycare and Boarding Facility', 'Dog Trainers', 'Dog Walker', 'Door and Millwork Installation',
  'Drywall Commercial', 'Drywall Residential', 'Dumpster Rentals', 'Electrical Within Buildings',
  'Electrical Apparatus Outside Buildings', 'Elevator or Escalator Inspecting', 'Engineers',
  'Event Planners', 'Event Venues', 'Excavation', 'Fabrication Shop', 'Farmer', 'Fence Installation',
  'Financial Advisor', 'Fire Sprinkler Installation and Service', 'Flooring Installation',
  'Food Truck Equipment', 'Framing Commercial', 'Framing Residential', 'Furniture Manufacturing',
  'Garage Door Install', 'General Contractor Commercial', 'General Contractor Residential',
  'Glass Installation Building', 'Grading', 'Gutter Installation', 'Handyman', 'Hardscaping',
  'Home Theater Installation', 'HVAC No LPG', 'HVAC With LPG', 'Ice Cream Truck Equipment',
  'Insulation Installation', 'Interior Designer', 'Janitorial Services', 'Jewelers Equipment',
  'Kitchen and Bath Remodeling', 'Land Surveyor', 'Landscaping', 'Lawn Care', 'Lighting Installation',
  'Locksmith', 'Machine Shop', 'Marine Contractor', 'Masonry', 'Metal Building Erection',
  'Millwright', 'Mobile Car Wash', 'Mobile Notary', 'Mobile Welding', 'Modular Home Setup',
  'Musician Equipment', 'Office Contents Only', 'Oil Field Equipment', 'Ornamental Iron Work',
  'Painting Commercial', 'Painting Residential', 'Paving', 'Pest Control', 'Photography Studio',
  'Piano Tuning', 'Pipeline Construction', 'Plastering', 'Plumber', 'Plumbing Commercial',
  'Plumbing Residential', 'Pool Installation', 'Pool Service and Repair', 'Portable Toilet Rental',
  'Power Washing', 'Pressure Washing', 'Print Shop Equipment', 'Property Manager', 'Real Estate Agent',
  'Refrigeration Installation', 'Restaurant Equipment', 'Restoration Contractor', 'Rigging Contractor',
  'Roofing Commercial', 'Roofing Residential', 'Sandblasting', 'Scaffolding Erection', 'Screen Printing',
  'Security Guard Equipment', 'Septic Tank Installation', 'Sewer Cleaning', 'Sheet Metal Work',
  'Shoring Contractor', 'Siding Installation', 'Sign Installation', 'Site Preparation', 'Snow Removal',
  'Solar Installation', 'Sound and Stage Equipment', 'Sports Equipment Rental', 'Sprinkler Installation',
  'Steel Erection', 'Stone Setting', 'Street Sweeping', 'Stucco', 'Surveyor', 'Swimming Pool Cleaning',
  'Telecommunications Contractor', 'Tent Rental', 'Theatrical Equipment', 'Tile Installation',
  'Tool Rental', 'Tower Erection', 'Traffic Control Equipment', 'Tree Trimming', 'Trenching',
  'Truck Equipment Installation', 'Underground Utility Contractor', 'Upholstery', 'Utility Line Locating',
  'Vending Machines', 'Ventilation Installation', 'Video Production Equipment', 'Wallpaper Installation',
  'Waterproofing', 'Welding', 'Well Drilling', 'Window Cleaning', 'Window Installation',
  'Wine Making Equipment', 'Wood Flooring', 'Woodworking', 'Yard Maintenance',
]

/* Codes read BTIS### and are positional. The offset pins the plumbing block
   to the codes underwriters already quote it under (Plumber = BTIS118), so
   the numbers on screen match what comes back from the rating call. */
const CODE_OFFSET = 118 - CLASS_NAMES.indexOf('Plumber')

/* Small stable hash — keeps a class's appetite/SIC identical across reloads
   without hand-writing 180 rows of reference data. */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/* Classes we have real reference data for. Everything else is derived. */
const CLASS_OVERRIDES = {
  'Plumber':              { carriers: ['NAV', 'GA'], sic: '1711', naics: '238220', tag: 'Contractors equipment' },
  'Plumbing Commercial':  { carriers: ['NAV', 'GA'], sic: '1711', naics: '238220', tag: 'Contractors equipment' },
  'Plumbing Residential': { carriers: ['NAV', 'GA'], sic: '1711', naics: '238220', tag: 'Contractors equipment' },
  'Electrical Within Buildings': { carriers: ['LEV', 'NAV', 'GA'], sic: '1731', naics: '238210', tag: 'Contractors equipment' },
  'Landscaping':          { carriers: ['LEV', 'NAV', 'GA'], sic: '0782', naics: '561730', tag: 'Contractors equipment' },
  'Photography Studio':   { carriers: ['GA'],        sic: '7221', naics: '541921', tag: 'Miscellaneous articles' },
  'DJ Equipment':         { carriers: ['GA'],        sic: '7929', naics: '711510', tag: 'Miscellaneous articles' },
  'Office Contents Only': { carriers: ['LEV', 'NAV', 'GA'], sic: '8742', naics: '541611', tag: 'Office contents' },
}

const DERIVED_TAGS = ['Contractors equipment', 'Miscellaneous articles', 'Installation floater']

export const CLASSES = CLASS_NAMES.map((name, i) => {
  const o = CLASS_OVERRIDES[name]
  const h = hash(name)
  const carriers = o?.carriers ?? (h % 5 === 0 ? ['NAV'] : h % 3 === 0 ? ['LEV', 'NAV', 'GA'] : ['NAV', 'GA'])
  return {
    id: `BTIS${String(i + CODE_OFFSET).padStart(3, '0')}`,
    name,
    carriers,
    sic: o?.sic ?? String(1500 + (h % 400)),
    naics: o?.naics ?? String(238000 + (h % 900)),
    tag: o?.tag ?? DERIVED_TAGS[h % DERIVED_TAGS.length],
  }
})

export const classById = (id) => CLASSES.find(c => c.id === id)

export function searchClasses(query, limit = 8) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const starts = [], contains = []
  for (const c of CLASSES) {
    const n = c.name.toLowerCase()
    if (n.startsWith(q)) starts.push(c)
    else if (n.includes(q)) contains.push(c)
    if (starts.length >= limit) break
  }
  return [...starts, ...contains].slice(0, limit)
}

/* ── Business details options ─────────────────────────────────────────── */

export const BUSINESS_TYPES = [
  'Sole Proprietor or Individual',
  'Partnership',
  'Corporation',
  'Limited Partnership',
  'Joint Venture',
  'Limited Liability Corporation',
]

export const YEAR_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i), label: String(i) })),
  { value: '10+', label: '10+' },
]

export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AR', label: 'Arkansas' }, { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' }, { value: 'CT', label: 'Connecticut' },
  { value: 'DC', label: 'District of Columbia' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'IA', label: 'Iowa' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MD', label: 'Maryland' }, { value: 'ME', label: 'Maine' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MO', label: 'Missouri' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MT', label: 'Montana' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'NE', label: 'Nebraska' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' }, { value: 'NV', label: 'Nevada' },
  { value: 'NY', label: 'New York' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VA', label: 'Virginia' },
  { value: 'VT', label: 'Vermont' }, { value: 'WA', label: 'Washington' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WY', label: 'Wyoming' },
]

/* ── Step 3: what the agent schedules ─────────────────────────────────
   Every limit carries the band the carriers accept. A line is only rated
   once it is switched on, so nothing here has a silent default. */

export const EQUIPMENT_CLASSES = [
  { value: 'lightMedium', label: 'Light / Medium' },
  { value: 'heavy',       label: 'Heavy' },
]

/* Below this, equipment belongs on the miscellaneous tools line instead of
   the schedule — the carriers will not list an item under it. */
export const SCHEDULE_ITEM_MIN = 1501
export const SCHEDULE_TOTAL_MAX = 5000000

export const SCHEDULE_ITEMS = [
  {
    id: 'officeContents',
    label: 'Office Contents',
    info: 'Desks, chairs, filing cabinets and the everyday contents of the office the business works out of. Not the equipment that leaves the yard.',
    fields: [{ key: 'value', label: 'Value', min: 1, max: 3000000 }],
  },
  {
    id: 'computer',
    label: 'Computer System / Electronic Data Processing Equipment',
    info: 'Laptops, tablets, servers and the data on them. Extra expense covers the cost of working around a loss while the equipment is replaced.',
    note: 'Enter at least one of the three.',
    fields: [
      { key: 'equipment',    label: 'Equipment',     min: 1, max: 100000 },
      { key: 'dataMedia',    label: 'Data & media',  min: 1, max: 100000 },
      { key: 'extraExpense', label: 'Extra expense', min: 1, max: 100000 },
    ],
  },
  {
    id: 'miscTools',
    label: 'Miscellaneous Tools',
    info: `Unscheduled hand tools and small equipment. Anything worth more than $${SCHEDULE_ITEM_MIN.toLocaleString()} belongs on the schedule instead.`,
    fields: [{ key: 'value', label: 'Value', min: 1, max: 3000000 }],
  },
  {
    id: 'scheduled',
    label: 'Scheduled Equipment',
    info: `Equipment listed item by item with a serial number and a limit. Carriers rate this line off the schedule, and will not list an item under $${SCHEDULE_ITEM_MIN.toLocaleString()}.`,
    fields: [],
    itemSchedule: true,
  },
  {
    id: 'rented',
    label: 'Rented / Leased Equipment',
    badge: 'Rated on rental cost at Great American',
    info: 'Equipment the business rents, leases or borrows from others and is contractually responsible for.',
    fields: [
      { key: 'rentedValue',   label: 'Rented value',                    min: 1, max: 1000000 },
      { key: 'annualExpense', label: 'Annual equipment rental expense', min: 1, max: 1000000 },
    ],
  },
  {
    id: 'installation',
    label: 'Installation Floater',
    info: 'Materials and fixtures the business installs at a job site, covered until the work is accepted by the owner.',
    fields: [
      { key: 'installationValue', label: 'Installation value',              min: 10001, max: 2000000 },
      { key: 'annualReceipts',    label: 'Est. annual installation receipts', min: 1, max: 1000000 },
    ],
  },
]

/* ── Step 4: underwriting ─────────────────────────────────────────────
   The questions the carriers ask for this class. A yes opens only the
   detail that answer requires. */

export const UW_QUESTIONS = [
  {
    id: 'bankruptcy',
    label: 'Has the applicant filed for bankruptcy within the past 3 years?',
    help: 'A discharged filing is not automatically a decline — the carrier just needs the date.',
  },
  {
    id: 'cancelled',
    label: 'Has the applicant had any Inland Marine policy coverage cancelled or non-renewed within the past 3 years?',
    followUp: 'cancelled',
  },
  {
    id: 'losses',
    label: 'Have there been any paid Inland Marine losses in the past 4 years?',
    followUp: 'losses',
  },
  {
    id: 'activities',
    label: 'Is the applicant involved in any of the following activities or risks?',
    followUp: 'activities',
  },
  {
    id: 'rentsOut',
    label: 'Does the applicant rent or loan out equipment to others without an operator?',
    help: 'Equipment that leaves with someone else at the wheel is rated differently.',
  },
]

export const CANCEL_REASONS = [
  'Non-payment of premium',
  'Claims',
  'Carrier non-renewal',
]

/* Asked whatever the answer to the rent-out question is. Prefilled from
   the industry experience on step 2, because that is where the answer
   already lives. */
export const OPERATOR_TRAINING = [
  { value: 'complete',   label: '10+ yrs experience, complete records' },
  { value: 'incomplete', label: 'Under 10 yrs, incomplete records' },
  { value: 'none',       label: 'Under 10 yrs, no records' },
]

export const operatorTrainingDefault = (yearsOfExperience) =>
  (yearsOfExperience === '10+' || Number(yearsOfExperience) >= 10) ? 'complete' : 'incomplete'

/* Shown under the activities question whatever the answer is — an agent
   should be able to read the list before deciding. */
export const ACTIVITY_RISKS = [
  'Asphalt plants',
  'Bridge building',
  'Cranes',
  'Cryptocurrency mining',
  'Dredging',
  'Farming',
  'Forestry maintenance, management, or brush fire lines',
  'Logging',
  'Mining',
  'Oil drilling',
  'Reclamation of landfills or oilfields',
  'Recycling or scrap yards',
  'Underground operations',
  'Underwater exposure',
  'Unmanned aircraft (drones)',
  'Waterways',
]

/* ── Step 5: additional interests ─────────────────────────────────────── */

export const INTEREST_TYPES = [
  { value: 'lossPayee',      label: 'Loss payee' },
  { value: 'additional',     label: 'Additional insured' },
  { value: 'additionalNamed',label: 'Additional named insured' },
]

/* Only a loss payee has a lender relationship to describe. */
export const LOSS_PAYEE_TYPES = [
  'Lender',
  'Lessor',
  'Owner of leased equipment',
]

export const INTEREST_COVERAGE_TYPES = [
  'Scheduled Equipment',
  'Office Contents',
  'Rented / Leased Equipment',
  'Installation Floater',
  'Miscellaneous Tools',
]

/* ── Step 6: quotes + Great American's enhanced coverages ─────────────── */

export const ENHANCED_GROUPS = [
  {
    id: 'equipment',
    title: 'Equipment',
    items: [
      { id: 'leased-rented-borrowed', label: 'Equipment leased, rented or borrowed from others', sublabel: 'Any one item / all equipment', options: ['$25,000/$50,000', '$50,000/$100,000', '$100,000/$250,000', '$250,000/$500,000'], defaultValue: '$50,000/$100,000' },
      { id: 'annual-rental-cost',     label: 'Est. annual rental cost for leased or rented equipment', options: ['$10,000', '$25,000', '$50,000', '$100,000', '$250,000'], defaultValue: '$50,000' },
      { id: 'office-furniture',       label: 'Office furniture, fixtures and equipment', sublabel: 'Any one item / all items', options: ['$2,500/$5,000', '$5,000/$10,000', '$10,000/$25,000', '$25,000/$50,000'], defaultValue: '$5,000/$10,000' },
      { id: 'employee-tools',         label: 'Employee tools and work clothing', sublabel: 'Any one employee / all equipment', options: ['$1,000/$2,500', '$2,500/$5,000', '$5,000/$10,000', '$10,000/$25,000'], defaultValue: '$2,500/$5,000' },
      { id: 'newly-acquired',         label: 'Newly acquired or upgraded equipment', sublabel: 'Any one item', options: ['$100,000', '$250,000', '$500,000', '$1,000,000'], defaultValue: '$250,000' },
    ],
  },
  {
    id: 'rental-expenses',
    title: 'Rental expenses',
    items: [
      { id: 'continuing-rental', label: 'Continuing rental expense', sublabel: 'Any one month / any one policy year', options: ['$2,500/$5,000', '$5,000/$10,000', '$10,000/$25,000'], defaultValue: '$5,000/$10,000' },
      { id: 'substitute-rental', label: 'Rental expense of substitute equipment', sublabel: 'Any working day / any one policy year', options: ['$250/$2,500', '$500/$5,000', '$1,000/$10,000'], defaultValue: '$500/$5,000' },
    ],
  },
  {
    id: 'property-protection',
    title: 'Property protection',
    items: [
      { id: 'protection-preservation', label: 'Protection and preservation of property', options: ['$25,000', '$50,000', '$100,000'], defaultValue: '$50,000' },
      { id: 'consequential-loss',      label: 'Consequential loss to undamaged attachments', sublabel: 'Not more than 25% of the amount paid for direct physical loss', options: ['$5,000', '$10,000', '$25,000'], defaultValue: '$10,000' },
      { id: 'spare-parts',             label: 'Spare parts and supplies', options: ['$5,000', '$10,000', '$25,000'], defaultValue: '$10,000' },
      { id: 'expediting',              label: 'Expediting expense', options: ['$10,000', '$25,000', '$50,000'], defaultValue: '$25,000' },
      { id: 'fire-dept',               label: 'Fire department service charge', options: ['$10,000', '$25,000', '$50,000'], defaultValue: '$25,000' },
    ],
  },
  {
    id: 'additional-coverage',
    title: 'Additional coverage',
    items: [
      { id: 'crime-reward',    label: 'Crime reward', options: ['$1,000', '$5,000', '$10,000'], defaultValue: '$5,000' },
      { id: 'loss-data-prep',  label: 'Loss data preparation expense', options: ['$5,000', '$10,000', '$25,000'], defaultValue: '$10,000' },
      { id: 'pollutant',       label: 'Pollutant clean up and removal', options: ['$10,000', '$25,000', '$50,000'], defaultValue: '$25,000' },
      { id: 'warranty',        label: 'Warranty or service contract', options: ['$5,000', '$10,000', '$25,000'], defaultValue: '$10,000' },
      { id: 'fire-extinguish', label: 'Recharge of fire extinguishing equipment', options: ['$25,000', '$50,000', '$100,000'], defaultValue: '$50,000' },
      { id: 'leased-loaned',   label: 'Equipment leased, rented or loaned to others', sublabel: 'Any one item / all equipment', options: ['$25,000/$50,000', '$50,000/$100,000', '$100,000/$250,000'], defaultValue: '$50,000/$100,000' },
      { id: 'inflation',       label: 'Inflation protection', options: ['0%', '3%', '5%', '10%'], defaultValue: '3%' },
      { id: 'debris-removal',  label: 'Debris removal', options: ['$25,000', '$50,000', '$75,000', '$100,000'], defaultValue: '$75,000' },
    ],
  },
]

export const ENHANCED_ITEMS = ENHANCED_GROUPS.flatMap(g => g.items)

export const ENHANCED_DEFAULTS = Object.fromEntries(
  ENHANCED_ITEMS.map(item => [item.id, item.defaultValue])
)

export const DEDUCTIBLES = [1000, 2500, 5000, 10000, 25000]
export const DEFAULT_DEDUCTIBLE = 2500

/* What moving the deductible does to the price. Same curve for everyone —
   the carriers differ on appetite, not on this. */
const DEDUCTIBLE_FACTOR = { 1000: 1.15, 2500: 1, 5000: 0.92, 10000: 0.85, 25000: 0.76 }

/* A carrier's answer is a premium plus the fees that ride with it, and the
   policy terms the premium buys. The card adds them up rather than showing a
   number the bind screen would then contradict. */
export const QUOTES = [
  {
    carrierId: 'LEV',
    premium: 890,
    serviceFee: 160,
    inspectionFee: 10,
    commission: '15% commission',
    coveragesRated: 1,
    bullets: ['Non-admitted paper', 'Broad theft terms', 'Agency bill'],
    terms: {
      line: 'Scheduled Equipment',
      valuation: 'Replacement Cost or Actual Cash Value',
      otherCauses: 'All other causes of loss: 1% of the amount of insurance on the item(s) lost or damaged, but not less than $500',
      coinsurance: '80%',
    },
  },
  {
    carrierId: 'NAV',
    premium: 675,
    serviceFee: 100,
    inspectionFee: 0,
    commission: '15% commission',
    coveragesRated: 1,
    bullets: ['BTIS proprietary carrier', 'Admitted paper', 'Agency bill'],
    terms: {
      line: 'Scheduled Equipment',
      valuation: 'Actual Cash Value',
      otherCauses: 'All other causes of loss: 1% of the amount of insurance on the item(s) lost or damaged, but not less than $1,000',
      coinsurance: '80%',
    },
  },
  {
    carrierId: 'GA',
    premium: 1075,
    serviceFee: 250,
    inspectionFee: 0,
    commission: '15% commission',
    badge: 'Enhanced coverage',
    coveragesRated: ENHANCED_ITEMS.length + 6,
    bullets: [`${ENHANCED_ITEMS.length} enhanced coverages built in`, 'Admitted paper', 'Agency bill'],
    enhanced: true,
  },
]

export const quoteFor = (carrierId) => QUOTES.find(q => q.carrierId === carrierId)

/* Great American writes terrorism into the base form, so the TRIA choice
   only moves the other two. */
export const triaSurcharge = (carrierId, tria) =>
  (tria === 'include' && carrierId !== 'GA') ? 0.02 : 0

/* What each carrier says about this submission. Appetite comes from the
   class; the rest are the rules that would otherwise come back as a decline
   letter three days later. */
export function carrierOutcomes(submission = {}) {
  const classItem = classById(submission.classCode?.classId)
  const coverage = submission.coverage || {}
  const uw = submission.underwriting || {}
  const opts = submission.quotes || {}
  const deductible = opts.deductible ?? DEFAULT_DEDUCTIBLE
  const tria = opts.tria ?? 'reject'

  const onLines = SCHEDULE_ITEMS.filter(i => coverage[i.id]?.on)
  const onlyOffice = onLines.length === 1 && onLines[0].id === 'officeContents'

  return CARRIERS.map(carrier => {
    const quote = quoteFor(carrier.id)
    const base = { carrierId: carrier.id, quote }

    if (!classItem || !classItem.carriers.includes(carrier.id)) {
      return { ...base, status: 'no-appetite', reason: 'Does not write this class.' }
    }
    if (carrier.id === 'GA' && onlyOffice) {
      return { ...base, status: 'declined', reason: 'Great American does not write an office contents only policy.' }
    }
    if (uw.activities === 'yes') {
      return { ...base, status: 'referred', reason: 'The activities marked on step 4 need an underwriter to sign off.' }
    }
    if (uw.rentsOut === 'yes' && uw.operatorTraining === 'none') {
      return { ...base, status: 'referred', reason: 'Equipment goes out without an operator and there are no training records.' }
    }

    const factor = DEDUCTIBLE_FACTOR[deductible] ?? 1
    const premium = Math.round(quote.premium * factor * (1 + triaSurcharge(carrier.id, tria)))
    return { ...base, status: 'quoted', premium }
  })
}

/* Each step above the default limit costs premium, each step below returns
   some. Deterministic so the same selections always re-rate to the same
   number — an agent who backs out a change sees the original price again. */
export function rerate(basePremium, selections = {}) {
  let delta = 0
  for (const item of ENHANCED_ITEMS) {
    const chosen = selections[item.id] ?? item.defaultValue
    const steps = item.options.indexOf(chosen) - item.options.indexOf(item.defaultValue)
    delta += steps * 18
  }
  return Math.max(basePremium + delta, Math.round(basePremium * 0.6))
}

/* ── Step 7: payment ──────────────────────────────────────────────────── */

/* ── Step 7: bind ─────────────────────────────────────────────────────── */

export const PAYMENT_METHODS = [
  { id: 'financing', label: 'Paperless Premium Financing', detail: 'Down payment with 10 instalments.' },
  { id: 'agency',    label: 'Agency Bill',                 detail: 'The Agency bills the insured and collects premium.' },
]

export const SIGNATURE_METHODS = [
  {
    id: 'esign',
    label: 'eSign',
    detail: 'You sign now, then we email the insured their signature request. The policy binds as soon as they sign.',
  },
  {
    id: 'upload',
    label: 'Upload signed application',
    detail: 'Collect a wet signature and upload the signed application. We check both signatures before binding, and the submission stays bind-incomplete until it lands.',
  },
]

/* A broker fee is fully earned, so there is a ceiling on it. */
export const MAX_BROKER_FEE = 1000

/* Finance terms: 40% down, the balance plus the finance charge over ten. */
const FINANCE = { downRate: 0.4, instalments: 10, chargeRate: 0.1277 }

export function financeSchedule(total) {
  const down = Math.round(total * FINANCE.downRate * 100) / 100
  const financed = (total - down) * (1 + FINANCE.chargeRate)
  return {
    down,
    instalments: FINANCE.instalments,
    each: Math.round((financed / FINANCE.instalments) * 100) / 100,
  }
}

/* Everything that lands on the invoice, in the order the bind card lists it.
   One function so the quote card, the bind card and the confirmation cannot
   drift apart on what the total is. */
export function bindTotals({ premium = 0, quote, brokerFee = 0, tria } = {}) {
  const lines = [
    { id: 'premium', label: 'Premium', value: premium },
    { id: 'service', label: 'BTIS service fee', value: quote?.serviceFee || 0 },
  ]
  if (quote?.inspectionFee) lines.push({ id: 'inspection', label: 'Inspection fee', value: quote.inspectionFee })
  if (brokerFee > 0) lines.push({ id: 'broker', label: 'Broker fee', value: brokerFee })
  /* Great American writes terrorism into the form, so it is a line that
     costs nothing rather than a surcharge. */
  if (quote?.enhanced && tria === 'include') {
    lines.push({ id: 'terrorism', label: 'Terrorism', value: null, note: 'Included' })
  }
  const total = lines.reduce((sum, l) => sum + (l.value || 0), 0)
  return { lines, total }
}

export const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString()

/* The instalment figures are the one place cents matter. */
export const money2 = (n) =>
  '$' + (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
