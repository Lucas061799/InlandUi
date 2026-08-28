# Inland Marine — Norbielink

The Inland Marine submission flow, built on the same design system as the GL / BOP app
(`gl-bop-app.vercel.app`): Montserrat, the `#5C2ED4 → #A614C3` brand gradient, the
`#F9FAFB` / `#E5E7EB` card pair, and the `lg / xl / 2xl` radius scale.

```bash
npm run dev
```

## The flow

**Page zero** asks the two questions everything else hangs off — the class, and the words an
underwriter will read — with Norbie alongside them. Both are handed straight into step one.

Then six steps, one question on screen at a time: an Inland Marine submission branches on the
class code, so later questions only make sense once the earlier ones are answered.

| # | Step | What it asks |
|---|------|--------------|
| 1 | Business details | Opens with the class and the description confirmed back from page zero — both changed in place, so a wrong class costs nothing already entered — then the applicant, entity and dates, business address, mailing and inspection contacts |
| 2 | Coverage | Which lines to schedule and the values on each, including the item-by-item equipment schedule |
| 3 | Underwriting | Five questions — bankruptcy, cancellations, losses, activities, equipment rented out — with follow-ups on a yes, and the operator training records |
| 4 | Additional interests | Loss payees, additional insureds and additional named insureds |
| 5 | Compare quotes | Deductible and TRIA, then what each of the three carriers said: a price, no appetite, a decline, or a referral. Great American's enhanced limits can be moved and re-rated |
| 6 | Bind | Recap, payment plan, signature — or, when nobody could price it online, the submission goes to underwriting instead of dead-ending |

## Layout

```
src/
  InlandApp.jsx              shell — header, step rail, main, right rail
  data/inland.js             classes, carriers, coverages, carrier outcomes, payment plans
  pages/inland/PageZero.jsx  the two questions asked before the flow starts
  components/inland/ClassSummary.jsx  those two answers, confirmed and editable at the top of step 1
  pages/inland/              one file per step
  pages/inland/validation.js what "finished" means for each step
  pages/inland/completion.js the step list and the tick/percentage state
  components/inland/         step primitives, the class picker, the sidebar and right rail
  components/FormField.jsx   shared Input / Select / DateInput / Checkbox primitives
```

Two rules keep the flow honest:

- **One source of truth for completeness.** `validation.js` decides whether a step is done.
  The sidebar ticks, the right-rail percentage and every Continue button read it, so they can
  never disagree about whether an answer is good enough to send to a carrier.
- **Carrier answers are rules, not a coin flip.** `carrierOutcomes()` in `data/inland.js` decides
  who quotes, who has no appetite, who declines and who refers, from the class, the coverage lines
  and the underwriting answers. Every "no" comes with the reason in the carrier's own words.
- **Dark mode via the app-wide convention.** `data-dark` on `<html>` plus the `.bop-page`
  class on the content surface. Surfaces are written with the inline values `index.css`
  already targets (`background: '#F9FAFB'`, `background: 'white'`), so no page threads an
  `isDark` prop through its fields. Inland-Marine-specific tokens live in the
  `im-ok-text` / `im-pill-on` / `im-pill-off` block in `index.css`.

## The GL / BOP app

`src/App.jsx` and `src/pages/bop/` are the original GL / BOP flow this repo was seeded from.
Nothing in the Inland Marine flow imports them; they are kept as the reference for the shared
chrome and component patterns.
