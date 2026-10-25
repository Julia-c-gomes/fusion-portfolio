import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Tiny inline sparkline: 1 series, no axes; the tile's label names it. */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(2)},${(28 - ((v - min) / span) * 26).toFixed(2)}`)
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden className={cn("h-7 w-full overflow-visible", className)}>
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

export function KpiTile({
  label,
  value,
  unit,
  sub,
  icon,
  spark,
  delta,
}: {
  label: string
  value: string
  unit?: string
  sub: ReactNode
  icon: ReactNode
  spark?: number[]
  delta?: { text: string; good: boolean } | null
}) {
  return (
    <div className="glass-soft relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl p-3.5 xl:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-medium text-haze">{label}</p>
        <span className="shrink-0 text-haze/80 [&_svg]:size-4" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[22px] leading-none font-medium tracking-tight text-ink tabular-nums xl:text-[26px]">
        {value}
        {unit && <span className="ml-1 text-[13px] text-haze">{unit}</span>}
      </p>
      {spark && <Sparkline values={spark} className="mt-2 text-ember/80" />}
      <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-haze">
        {delta && (
          <span className={cn("font-medium tabular-nums", delta.good ? "text-emerald-400" : "text-[#ec835a]")}>
            {delta.good ? "▼" : "▲"} {delta.text}
          </span>
        )}
        <span className="truncate">{sub}</span>
      </div>
    </div>
  )
}
