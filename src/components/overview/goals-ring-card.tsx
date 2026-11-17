"use client";

import { GoalsRings, goalUse } from "./goals-rings";

type Amounts = { needs: number; wants: number; savings: number };

export function GoalsRingCard({
  planned,
  goal,
}: {
  planned: Amounts;
  goal: Amounts;
}) {
  // Met to the öre, the same line Plan draws between room left and over. A savings goal of 0 kr
  // has nothing to close, so it counts as met.
  const noSavingsGoal = goal.savings <= 0;
  const savingsMet =
    noSavingsGoal || goalUse("savings", planned.savings, goal.savings) >= 1;
  const onTarget =
    (["needs", "wants"] as const).filter(
      (k) => goalUse(k, planned[k], goal[k]) <= 1,
    ).length + (savingsMet ? 1 : 0);

  const hint = !savingsMet
    ? "Close the savings ring. The other two fill as you plan."
    : onTarget < 3
      ? "Needs or Wants is past its goal. Trim it in Plan."
      : noSavingsGoal
        ? "Needs and Wants on target. No savings goal this month."
        : "All three on target.";

  return (
    <section className="@container flex items-center rounded-[var(--radius-4)] bg-card px-5 py-5 shadow-[inset_0_0_0_1px_var(--line)] lg:min-h-[15.5rem] lg:px-7 lg:py-[1.65rem]">
      {/* Ring beside the text once the card has room, above it when the column is narrow. */}
      <div className="flex w-full flex-col items-center gap-4 text-center @min-[19rem]:flex-row @min-[19rem]:gap-5 @min-[19rem]:text-left @min-[28rem]:gap-6">
        <GoalsRings
          className="size-[8.75rem] shrink-0 @min-[28rem]:size-[12.1875rem]"
          planned={planned}
          goal={goal}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
            Your goals
          </span>
          <h2 className="text-lg leading-snug font-bold text-[var(--text)]">
            {onTarget} of 3 on target
          </h2>
          <p className="text-[0.84rem] leading-snug text-[var(--muted-foreground)]">
            {hint}
          </p>
        </div>
      </div>
    </section>
  );
}
