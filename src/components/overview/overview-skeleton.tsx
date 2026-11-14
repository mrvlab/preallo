import { Bone, TextBone } from '@/components/ui/skeleton-block'

// Mirrors the real cards class for class, so nothing moves when the data arrives.
const eyebrow = 'text-[0.6875rem] font-semibold tracking-[0.07em] uppercase'

export function OverviewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading overview"
      className="grid gap-6 @min-[60rem]/main:grid-cols-[672fr_486fr]"
    >
      <div className="flex flex-col gap-6">
        <HeroSkeleton />
        {[0, 1, 2].map((i) => (
          <BucketSkeleton key={i} />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <RingsSkeleton />
        <ComingUpSkeleton />
      </div>
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="flex flex-col items-center rounded-[var(--radius-4)] bg-[var(--hero-bg)] px-7 pt-9 pb-6 text-center">
      <TextBone className={eyebrow} w="6.5em" shade="soft" />
      <TextBone
        className="mt-1.5 text-[clamp(2.875rem,4.4vw,3.75rem)] leading-[1.05] font-bold"
        w="4.6em"
        shade="strong"
      />
      <TextBone className="mt-0.5 mb-4 text-[0.84rem] leading-snug" w="9em" shade="soft" />
      <Bone className="mb-7 h-[calc(1.75rem+6px)] w-[calc(9rem+6px)] rounded-[7px]" shade="soft" />
      <div className="grid w-full grid-cols-3 gap-4 border-t border-[var(--line)] pt-5 text-left">
        {[0, 1, 2].map((i) => (
          <div key={i} className="min-w-0">
            <TextBone className={eyebrow} w="4.5em" shade="soft" />
            <TextBone className="text-base font-semibold" w="5.5em" />
          </div>
        ))}
      </div>
    </section>
  )
}

function BucketSkeleton() {
  return (
    <section className="@container block rounded-[var(--radius-4)] bg-card shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="grid min-h-[10.2rem] grid-cols-[minmax(0,1fr)_9.375rem] items-center gap-3 px-[1.125rem] py-4 @min-[30rem]:grid-cols-[minmax(0,1fr)_minmax(12rem,23rem)] @min-[36rem]:gap-6 @min-[36rem]:px-7 @min-[36rem]:py-[1.65rem]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bone className="size-2" shade="mid" round />
            <TextBone w="4em" shade="mid" />
          </div>
          <TextBone
            className="mt-2.5 mb-1.5 text-[1.75rem] leading-[1.05] font-extrabold @min-[36rem]:mt-3.5 @min-[36rem]:text-[2.125rem]"
            w="4.4em"
            shade="strong"
          />
          <TextBone className="text-[0.8125rem] leading-snug @min-[36rem]:text-sm" w="11em" shade="soft" />
        </div>
        <div className="relative h-[5.25rem] border-l border-[var(--line)] pl-3 @min-[36rem]:h-[6.9rem] @min-[36rem]:pl-5">
          <div className="absolute top-0 right-0 bottom-4 left-3 @min-[36rem]:left-5">
            <div className="absolute inset-y-0 right-0 left-6 flex items-end justify-around">
              {['h-[62%]', 'h-[74%]', 'h-[68%]'].map((h, i) => (
                <div key={h} className="flex h-full w-[1.375rem] items-end @min-[36rem]:w-8">
                  <Bone className={`w-full rounded-[3px] ${h}`} shade={i === 2 ? 'mid' : 'soft'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RingsSkeleton() {
  return (
    <section className="@container flex items-center rounded-[var(--radius-4)] bg-card px-5 py-5 shadow-[inset_0_0_0_1px_var(--line)] lg:min-h-[15.5rem] lg:px-7 lg:py-[1.65rem]">
      <div className="flex w-full flex-col items-center gap-4 text-center @min-[19rem]:flex-row @min-[19rem]:gap-5 @min-[19rem]:text-left @min-[28rem]:gap-6">
        <div className="shrink-0">
          <Bone className="hidden size-[195px] @min-[28rem]:block" shade="line" round />
          <Bone className="block size-[140px] @min-[28rem]:hidden" shade="line" round />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <TextBone className={eyebrow} w="6em" shade="soft" />
          <TextBone className="text-lg leading-snug font-bold" w="7.5em" shade="strong" />
          <TextBone className="text-[0.84rem] leading-snug" w="16em" shade="line" />
          <TextBone className="text-[0.84rem] leading-snug" w="6em" shade="line" />
        </div>
      </div>
    </section>
  )
}

function ComingUpSkeleton() {
  return (
    <section className="flex flex-col rounded-[var(--radius-4)] bg-card px-5 py-5 shadow-[inset_0_0_0_1px_var(--line)] lg:px-7 lg:py-[1.65rem]">
      <TextBone className={eyebrow} w="6.5em" shade="soft" />
      <div className="mt-1 mb-[1.125rem] flex flex-wrap items-baseline gap-2">
        <TextBone className="text-2xl font-bold" w="3.2em" shade="strong" />
        <TextBone className="text-sm" w="13em" shade="soft" />
      </div>
      <div className="relative pl-5 before:absolute before:top-3.5 before:bottom-3.5 before:left-1 before:w-0.5 before:rounded-sm before:bg-[var(--p-06)]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative grid grid-cols-[4.75rem_1fr_auto] items-baseline gap-3 py-[0.5625rem] pr-1.5 text-sm">
            <Bone className="absolute top-3.5 -left-[1.3rem] size-2.5" shade="mid" round />
            <TextBone className="text-[0.8125rem] font-medium" w="3.5em" shade="soft" />
            <TextBone className="font-medium" w={['6em', '8em', '5em', '7em'][i]} shade="mid" />
            <TextBone className="font-semibold" w="3em" shade="mid" />
          </div>
        ))}
      </div>
    </section>
  )
}
