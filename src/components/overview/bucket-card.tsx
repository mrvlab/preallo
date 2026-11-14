"use client";

import Link from "next/link";
import { krNoDecimals, krw } from "@/lib/format";

export type Bucket = "needs" | "wants" | "savings";

const LABELS: Record<Bucket, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};

type HistoryPoint = { key: string; amount: number; income: number };

type Props = {
  bucket: Bucket;
  amount: number;
  pct: number;
  goal: number;
  history?: HistoryPoint[];
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

export function BucketCard({ bucket, amount, pct, goal, history = [] }: Props) {
  const diff = Math.round(pct - goal);
  const over = bucket === "savings" ? pct < goal : pct > goal;
  const empty = amount === 0;
  const sub = empty
    ? bucket === "savings"
      ? `${goal}% to put aside`
      : `${goal}% of salary set aside`
    : bucket === "savings"
      ? pct >= goal
        ? "On target"
        : `${Math.abs(diff)}% to the ${goal}% goal`
      : over
        ? `${diff}% over the ${goal}% goal`
        : `${Math.abs(diff)}% under the ${goal}% goal`;
  const tone = empty
    ? "text-[var(--muted-foreground)]"
    : bucket === "savings"
      ? pct >= goal
        ? "text-[var(--savings-ink)]"
        : "text-[var(--muted-foreground)]"
      : over
        ? "text-[var(--wants-ink)]"
        : "text-[var(--muted-foreground)]";

  return (
    <Link
      href={`/plan?b=${bucket}`}
      data-press="card"
      aria-label={`${LABELS[bucket]}, ${krw(amount)}. ${sub}. Open list.`}
      className="@container block rounded-[var(--radius-4)] bg-card shadow-[inset_0_0_0_1px_var(--line)] transition-shadow duration-[120ms] hover:shadow-[inset_0_0_0_1px_var(--p-16)]"
    >
      {/* Sized by the card's own width, so a narrow column on desktop gets the compact layout too. */}
      <div className="grid min-h-[10.2rem] grid-cols-[minmax(0,1fr)_9.375rem] items-center gap-3 px-[1.125rem] py-4 @min-[30rem]:grid-cols-[minmax(0,1fr)_minmax(12rem,23rem)] @min-[36rem]:gap-6 @min-[36rem]:px-7 @min-[36rem]:py-[1.65rem]">
        <div className="min-w-0">
          <div
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: `var(--${bucket}-ink)` }}
          >
            <i
              className="size-2 rounded-full"
              style={{ background: `var(--${bucket})` }}
            />
            {LABELS[bucket]}
          </div>
          <div className="mt-2.5 mb-1.5 text-[1.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] whitespace-nowrap text-[var(--text)] tabular-nums @min-[36rem]:mt-3.5 @min-[36rem]:text-[2.125rem]">
            {krNoDecimals(amount)}
            <small className="ml-1.5 text-[0.9375rem] font-medium tracking-normal text-[var(--muted-foreground)]">
              kr
            </small>
          </div>
          <div
            className={`text-[0.8125rem] leading-snug @min-[36rem]:text-sm ${tone}`}
          >
            {sub}
          </div>
        </div>
        <MiniBars history={history} goal={goal} bucket={bucket} />
      </div>
    </Link>
  );
}

// HTML rather than SVG so labels keep their real size when the chart narrows on phones.
function MiniBars({
  history,
  goal,
  bucket,
}: {
  history: HistoryPoint[];
  goal: number;
  bucket: Bucket;
}) {
  if (history.length === 0) {
    return (
      <div className="flex h-[5.25rem] items-center justify-center border-l border-[var(--line)] pl-3 text-center text-xs text-[var(--muted-foreground)] @min-[36rem]:h-[6.9rem]">
        History shows once months close.
      </div>
    );
  }
  const points = history
    .slice(-3)
    .map((p) => ({
      ...p,
      pct: p.income > 0 ? (p.amount / p.income) * 100 : 0,
    }));
  const top = Math.max(goal, ...points.map((p) => p.pct), 1) * 1.15;
  const goalAt = (goal / top) * 100;

  return (
    <div className="relative h-[5.25rem] border-l border-[var(--line)] pl-3 @min-[36rem]:h-[6.9rem] @min-[36rem]:pl-5">
      <div className="absolute top-0 right-0 bottom-4 left-3 @min-[36rem]:left-5">
        <div
          className="absolute right-0 left-6 border-t border-dashed border-[var(--p-16)]"
          style={{ bottom: `${goalAt}%` }}
        />
        <span
          className="absolute left-0 translate-y-1/2 text-[0.625rem] text-[var(--muted-foreground)] tabular-nums @min-[36rem]:text-[0.6875rem]"
          style={{ bottom: `${goalAt}%` }}
        >
          {goal}%
        </span>
        <div className="absolute inset-y-0 right-0 left-6 flex items-end justify-around">
          {points.map((p, i) => {
            const last = i === points.length - 1;
            return (
              <div
                key={p.key}
                className="relative flex h-full w-[1.375rem] items-end @min-[36rem]:w-8"
              >
                <i
                  className="block w-full rounded-[3px] transition-[height] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{
                    height: `${Math.max(2, (p.pct / top) * 100)}%`,
                    background: `var(--${bucket})`,
                    opacity: last ? 0.95 : 0.35,
                  }}
                />
                {last && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-full pb-0.5 text-[0.625rem] font-semibold tabular-nums @min-[36rem]:text-[0.6875rem]"
                    style={{
                      bottom: `${Math.max(2, (p.pct / top) * 100)}%`,
                      color: `var(--${bucket}-ink)`,
                    }}
                  >
                    {Math.round(p.pct)}%
                  </span>
                )}
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.625rem] whitespace-nowrap text-[var(--muted-foreground)] @min-[36rem]:text-[0.6875rem]">
                  {MONTH_SHORT[Number(p.key.split("-")[1]) - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
