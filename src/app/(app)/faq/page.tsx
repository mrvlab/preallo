import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

const L = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium text-[var(--brand-primary)] underline decoration-[var(--p-16)] underline-offset-[3px] hover:decoration-[var(--brand-primary)]"
  >
    {children}
  </a>
)

const Src = ({ children }: { children: ReactNode }) => (
  <p className="mt-2.5 border-t border-[var(--line)] pt-2.5 text-[0.78rem] text-[var(--muted-foreground)]">{children}</p>
)

const HOW: Array<[string, ReactNode]> = [
  [
    'What is this app for?',
    <>
      <p>
        Paying the month on payday, in one sitting, and seeing where you stand before you spend. The aim is not to
        scrape by inside your means. It is to put your best foot forward: bills paid on time, savings growing, and the
        credit card never becoming the plan.
      </p>
      <p>
        It runs on the 50/30/20 split: needs up to 50% of salary after tax, wants up to 30%, savings at least 20%. You
        can change the split any month.
      </p>
      <Src>
        Origin of the split: Warren &amp; Tyagi, <i>All Your Worth</i> (2005). Plain summary:{' '}
        <L href="https://www.acorns.com/money-basics/saving-and-budgeting/what-is-the-50-30-20-budget-rule-/">Acorns</L>
      </Src>
    </>,
  ],
  [
    'Needs, wants or savings?',
    <>
      <p>
        <b>Need</b>: if your income stopped, you would still have to pay it. Rent, food, transport, insurance, the
        minimum on a loan.
      </p>
      <p>
        <b>Want</b>: it makes life nicer. Eating out, subscriptions, clothes, tech, travel. Anything bought on credit
        (Klarna, a store card) counts here too.
      </p>
      <p>
        <b>Savings</b>: money that goes into your investment account and stays there.
      </p>
      <p>
        Not sure? Split it. The minimum version is a need, the upgrade is a want. Basic groceries, need. Fancy ones,
        want. The phone plan, need. A new phone while the old one works, want. Pick a place and stay consistent, that
        matters more than the exact call.
      </p>
    </>,
  ],
  [
    'What is "Left to spend"?',
    <>
      <p>
        Salary after tax, minus every row you planned: needs, wants and savings. It is also your room for error:
        spend it to zero and the next surprise lands on the card. For a finished month it becomes Left over.
      </p>
      <p>
        A month runs from payday to the day before the next payday. With payday on the 25th, November is 25 Nov to 24
        Dec and pays the bills marked November. Change the day in Settings.
      </p>
      <p>
        The Week toggle turns it into a weekly amount over the exact days left until payday, so a 31-day month
        gives less a week than a 28-day one. There is no daily number on purpose, and from day
        three the month figure is rounded to the nearest hundred.
      </p>
      <Src>
        Why a visible &quot;available&quot; figure needs care: Amasino et al. (2023), preregistered replication. Why
        weekly, not daily: De La Rosa &amp; Tully (2021), <i>Journal of Consumer Research</i>
      </Src>
    </>,
  ],
  [
    'How do the rings work?',
    <>
      <p>Three rings, one per goal.</p>
      <ul>
        <li>
          <b>Savings fills</b> toward its goal and closes at 100%.
        </li>
        <li>
          <b>Needs and wants drain.</b> Full at payday, shrinking as you plan. The ring shows room left, not money
          spent. At the limit it is empty. Past it, the ring fills again and a darker shade of the same colour draws on top to
          show how far over.
        </li>
      </ul>
      <p>Close the savings ring, keep the other two from lapping. All three on target is the month.</p>
      <Src>
        Closing a goal motivates:{' '}
        <L href="https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal">
          Kivetz, Urminsky &amp; Zheng (2006)
        </L>
        . Showing &quot;spent&quot; as progress makes people spend the slack:{' '}
        <L href="https://dlab.sauder.ubc.ca/sjdm/presentations/2018-Poster-Huang-Liang-Budget-Feedback-Spending~.pdf">
          Huang &amp; Liang (2018)
        </L>
        ,{' '}
        <L href="https://www.tiaa.org/public/institute/publication/2023/splurging-after-reaching-your-goal">
          Yin &amp; Sharif (2023)
        </L>
      </Src>
    </>,
  ],
  [
    'Why are goals set per month?',
    <>
      <p>
        Because life is not the same every month. Settings holds the split for months you start from now on. A month
        you already have keeps its own, and you change it from its card in Settings.
      </p>
      <p>
        Want to save more in December? Raise savings for December. November stays as it was, so the history stays
        honest.
      </p>
      <Src>
        A new month is a fresh start people act on:{' '}
        <L href="https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf">
          Dai, Milkman &amp; Riis (2014)
        </L>
      </Src>
    </>,
  ],
  [
    'Which months can I change?',
    <>
      <p>
        Last month, this month and any month ahead. Older months are locked, so the history stays as it happened.
        Months imported from your old sheets are finished, so every row in them counts as paid.
      </p>
    </>,
  ],
  [
    'Starting a new month',
    <>
      <p>
        Use + next to the month name, or tap the month name and pick one. Your default salary from Settings fills in,
        change it for that month if payday was different. Everything copies by default. Untick one-off costs, or turn
        off amounts for bills that change.
      </p>
      <p>
        Give a bill a payment date under Advanced and it shows in Coming up. Mark it fixed if the bank pulls it on that
        date.
      </p>
    </>,
  ],
  [
    'Can I skip savings?',
    <>
      <p>Yes. Set the savings amounts to 0 for that month. The ring stays open, nothing else happens.</p>
    </>,
  ],
  [
    'Categories and groups',
    <>
      <p>
        Every item has one category from a short fixed list, so each row says what kind of cost it is. Groups are your
        own headings inside a list, optional, used nowhere else.
      </p>
    </>,
  ],
]

const WHY: Array<[string, ReactNode]> = [
  [
    'What The Psychology of Money adds',
    <>
      <p>Four ideas from Morgan Housel shape the app.</p>
      <ul>
        <li>
          <b>Wealth is what you do not see.</b> Savings counts money that never became stuff.
        </li>
        <li>
          <b>Savings rate beats income.</b> The default-split history tracks the rate, not the kronor.
        </li>
        <li>
          <b>Reasonable beats rational.</b> Goals are per month. A split you can live with beats a perfect one you
          abandon.
        </li>
        <li>
          <b>Room for error.</b> Left to spend is the buffer.
        </li>
      </ul>
      <Src>
        <L href="https://www.harriman-house.com/psychologyofmoney">Housel, The Psychology of Money (2020)</L>
      </Src>
    </>,
  ],
  [
    'Why no streaks, badges or alerts?',
    <>
      <p>
        A streak motivates until it breaks, then it does the opposite. So the history shows months and the savings
        trend, nothing that can snap. And nothing pings you. You come here on payday.
      </p>
      <Src>
        <L href="https://www.colorado.edu/business/faculty-research/2023/04/19/or-track-how-broken-streaks-affect-consumer-decisions">
          Silverman &amp; Barasch (2023)
        </L>{' '}
        on broken streaks.{' '}
        <L href="https://fortune.com/well/2025/01/24/apple-watch-bullied-burn-calories-close-rings-obsession-fitness-trackers-notifications">
          Fortune (2025)
        </L>{' '}
        on ring anxiety, reporting not a study.
      </Src>
    </>,
  ],
  [
    'Why is the credit card shown without a total?',
    <>
      <p>
        It appears as dated rows in Coming up, with what it was for. No red block, no debt total. People look away from
        numbers that feel bad, and looking away is how the card becomes the plan. A date and a name are easier to face
        than a sum.
      </p>
      <Src>
        <L href="https://www.nber.org/papers/w23945">Olafsson &amp; Pagel (2017), The Ostrich in Us</L>
      </Src>
    </>,
  ],
]

function Accordion({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map(([q, a]) => (
        <details
          key={q}
          className="group rounded-[var(--radius-4)] bg-card shadow-[inset_0_0_0_1px_var(--line)] open:shadow-[inset_0_0_0_1px_var(--p-16)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-[1.125rem] py-4 text-base font-extrabold text-[var(--text)] [&::-webkit-details-marker]:hidden">
            {q}
            <span aria-hidden className="shrink-0 text-[1.375rem] leading-none text-[var(--brand-primary)]">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="px-[1.125rem] pb-4 text-[0.9375rem] leading-relaxed text-[var(--text)] [&_li]:mb-1 [&_p]:mb-2 [&_ul]:mt-1 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
            {a}
          </div>
        </details>
      ))}
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-10 lg:px-7 lg:pt-0">
      <header className="pt-1 pb-5 lg:flex lg:min-h-[4.875rem] lg:items-center lg:pt-6 lg:pb-7">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label="Back to Settings"
            className="grid size-9 place-items-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.03em] text-[var(--text)] lg:text-[2.1rem]">
              FAQ
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              The parts that take a moment to get, and the thinking behind them.
            </p>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-x-5 gap-y-8 @min-[60rem]/main:grid-cols-[672fr_486fr]">
        <section aria-labelledby="how">
          <h2 id="how" className="mb-3 text-xl font-extrabold tracking-[-0.02em] text-[var(--text)]">
            How it works
          </h2>
          <Accordion items={HOW} />
        </section>
        <section aria-labelledby="why">
          <h2 id="why" className="mb-3 text-xl font-extrabold tracking-[-0.02em] text-[var(--text)]">
            The thinking behind it
          </h2>
          <Accordion items={WHY} />
        </section>
      </div>

      <p className="mt-8 text-[0.8125rem] text-[var(--muted-foreground)]">
        Studies are about people in general, not tests of this app. This is a rule of thumb, not financial advice.
      </p>
    </div>
  )
}
