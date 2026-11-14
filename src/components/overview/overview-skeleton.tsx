import { Bone } from '@/components/ui/skeleton-block'

export function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading overview" className="grid gap-6 lg:grid-cols-[672fr_486fr]">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col items-center rounded-[var(--radius-4)] bg-[var(--hero-bg)] px-7 pt-9 pb-6">
          <Bone className="h-3 w-24" shade="mid" />
          <Bone className="mt-3 h-[3.25rem] w-64" shade="strong" />
          <Bone className="mt-2.5 mb-4 h-3.5 w-36" shade="soft" />
          <Bone className="mb-7 h-[2.125rem] w-[9.5rem] rounded-[7px]" shade="soft" />
          <div className="grid w-full grid-cols-3 gap-4 border-t border-[var(--line)] pt-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Bone className="h-2.5 w-14" shade="soft" />
                <Bone className="h-4 w-20" shade="mid" />
              </div>
            ))}
          </div>
        </section>
        {[0, 1, 2].map((i) => (
          <section
            key={i}
            className="grid grid-cols-[1fr_minmax(0,23rem)] items-center gap-6 rounded-[var(--radius-4)] p-7 shadow-[inset_0_0_0_1px_var(--line)]"
          >
            <div className="flex flex-col gap-3">
              <Bone className="h-3.5 w-20" shade="mid" />
              <Bone className="h-8 w-36" shade="strong" />
              <Bone className="h-3 w-44" shade="soft" />
            </div>
            <div className="flex h-[6.9rem] items-end justify-around border-l border-[var(--line)] pl-5">
              <Bone className="h-12 w-8" shade="soft" />
              <Bone className="h-16 w-8" shade="soft" />
              <Bone className="h-20 w-8" shade="mid" />
            </div>
          </section>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <section className="flex items-center gap-6 rounded-[var(--radius-4)] p-7 shadow-[inset_0_0_0_1px_var(--line)]">
          <Bone className="size-[12.2rem] shrink-0" shade="soft" round />
          <div className="flex flex-1 flex-col gap-2.5">
            <Bone className="h-2.5 w-20" shade="soft" />
            <Bone className="h-5 w-32" shade="strong" />
            <Bone className="h-3 w-full" shade="line" />
            <Bone className="h-3 w-3/4" shade="line" />
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-[var(--radius-4)] p-7 shadow-[inset_0_0_0_1px_var(--line)]">
          <Bone className="h-2.5 w-20" shade="soft" />
          <Bone className="h-6 w-28" shade="strong" />
          <Bone className="mb-3 h-3 w-40" shade="soft" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-[10px_60px_1fr_56px] items-center gap-3 py-1.5">
              <Bone className="size-2.5" shade="mid" round />
              <Bone className="h-3 w-12" shade="soft" />
              <Bone className="h-3.5 w-full max-w-36" shade="mid" />
              <Bone className="h-3.5 w-14" shade="mid" />
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
