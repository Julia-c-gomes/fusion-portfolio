import { BatteryCharging, Flame, MoveRight, SlidersHorizontal, Sun, Wrench } from "lucide-react"

import { fmtGWh, fmtMW, fmtRand, loadShift, PEAKER_COST_R_PER_KWH, recommendations, type GridModel, type Recommendation } from "@/lib/eskom"
import { cn } from "@/lib/utils"

const ICONS = { shift: MoveRight, flame: Flame, wrench: Wrench, battery: BatteryCharging, sun: Sun }
const PRIORITY: Record<Recommendation["priority"], string> = {
  High: "border-[#ec835a]/40 bg-[#ec835a]/10 text-[#f4a585]",
  Medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Info: "border-white/15 bg-white/5 text-haze",
}

export function Optimiser({ m, shiftMW, onShift }: { m: GridModel; shiftMW: number; onShift: (v: number) => void }) {
  const r = loadShift(m, shiftMW)
  const recs = recommendations(m)
  return (
    <section aria-labelledby="opt-title" className="glass flex min-h-0 flex-col rounded-2xl p-4 xl:p-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-ember" aria-hidden />
        <h2 id="opt-title" className="text-[15px] font-semibold text-ink">
          Optimisation
        </h2>
      </div>

      {/* What-if */}
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <label htmlFor="shift" className="flex items-baseline justify-between gap-2 text-[13px] text-ink">
          <span>Shift evening load to midday</span>
          <span className="font-mono text-ember tabular-nums">{fmtMW(shiftMW)}</span>
        </label>
        <input
          id="shift"
          type="range"
          min={0}
          max={3000}
          step={100}
          value={shiftMW}
          onChange={(e) => onShift(Number(e.target.value))}
          aria-describedby="shift-help"
          className="mt-2 h-6 w-full cursor-pointer accent-[var(--plasma)]"
        />
        <p id="shift-help" className="sr-only">
          Moves this many megawatts from 17:00 to 21:00 into 10:00 to 15:00. Results update below.
        </p>
        <dl className="mt-2 grid grid-cols-3 gap-2" aria-live="polite">
          <div>
            <dt className="text-[11px] text-haze">Peaker energy avoided</dt>
            <dd className="font-mono text-[15px] text-ink tabular-nums">{fmtGWh(r.avoidedMWhPerWeek)}/wk</dd>
          </div>
          <div>
            <dt className="text-[11px] text-haze">Est. fuel saved*</dt>
            <dd className="font-mono text-[15px] text-ink tabular-nums">{fmtRand(r.randPerWeek)}/wk</dd>
          </div>
          <div>
            <dt className="text-[11px] text-haze">Evening peak cut</dt>
            <dd className="font-mono text-[15px] text-ink tabular-nums">{(r.peakCut * 100).toFixed(1)}%</dd>
          </div>
        </dl>
      </div>

      {/* Recommendations */}
      <h3 className="mt-4 text-[12px] font-medium tracking-[0.12em] text-haze uppercase">Recommendations</h3>
      <ul
        tabIndex={0}
        aria-label="Recommendations (scrollable)"
        className="no-scrollbar mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]"
      >
        {recs.map((rec) => {
          const Icon = ICONS[rec.icon]
          return (
            <li key={rec.id} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-ember" aria-hidden>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[13.5px] font-semibold text-ink">{rec.title}</p>
                    <span className={cn("rounded-full border px-2 py-px text-[10.5px] font-medium", PRIORITY[rec.priority])}>{rec.priority}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[12px] text-ember tabular-nums">{rec.metric}</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-haze">{rec.body}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-[10.5px] leading-snug text-haze/80">
        *Assumes R{PEAKER_COST_R_PER_KWH}/kWh for diesel/gas peaker energy, displaced 1:1 in 17:00–21:00.
      </p>
    </section>
  )
}
