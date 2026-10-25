import type { ReactNode } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { fmtDay, fmtMW, fmtTime, MIX_SERIES, PEAK_HOURS, SOLAR_HOURS, type GridModel } from "@/lib/eskom"

const AXIS = { stroke: "transparent", tick: { fill: "var(--viz-muted)", fontSize: 11 }, tickLine: false }
const GRID = <CartesianGrid stroke="var(--viz-grid)" vertical={false} />
const gwTick = (v: number) => `${(v / 1000).toFixed(0)}`

type TipRow = { label: string; value: string; swatch?: string; dashed?: boolean }
function TipBox({ title, rows, footer }: { title: string; rows: TipRow[]; footer?: ReactNode }) {
  return (
    <div className="min-w-48 rounded-xl border border-white/12 bg-[#120f22]/95 px-3 py-2.5 text-[12px] shadow-2xl backdrop-blur-md">
      <p className="mb-1.5 font-medium text-ink">{title}</p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-haze">
              {r.swatch && (
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-[3px]"
                  style={r.dashed ? { border: `1.5px dashed ${r.swatch}` } : { background: r.swatch }}
                />
              )}
              {r.label}
            </span>
            <span className="font-mono text-ink tabular-nums">{r.value}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-1.5 border-t border-white/10 pt-1.5 text-haze">{footer}</div>}
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean; line?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-haze">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={i.line ? "inline-block h-0 w-4" : "inline-block size-2.5 rounded-[3px]"}
            style={i.line ? { borderTop: `2px ${i.dashed ? "dashed" : "solid"} ${i.color}` } : { background: i.color }}
          />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

/** Hourly supply by source, stacked. One axis (GW). */
export function MixChart({ m }: { m: GridModel }) {
  const dayTicks = m.mix.filter((p) => p.t.endsWith("00:00")).map((p) => p.t)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={m.mix} margin={{ top: 6, right: 4, bottom: 0, left: -6 }}>
        {GRID}
        <XAxis dataKey="t" ticks={dayTicks} tickFormatter={(t: string) => fmtDay(t).split(" ").slice(0, 2).join(" ")} {...AXIS} />
        <YAxis tickFormatter={gwTick} {...AXIS} width={30} />
        <Tooltip
          cursor={{ stroke: "var(--viz-cursor)", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as GridModel["mix"][number]
            const total = MIX_SERIES.reduce((a, s) => a + p[s.key], 0)
            return (
              <TipBox
                title={fmtTime(String(label))}
                rows={[...MIX_SERIES].reverse().map((s) => ({ label: s.label, value: fmtMW(p[s.key]), swatch: s.color }))}
                footer={
                  <span className="flex justify-between">
                    <span>Total</span>
                    <span className="font-mono text-ink">{fmtMW(total)}</span>
                  </span>
                }
              />
            )
          }}
        />
        {MIX_SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId="mix"
            stroke="var(--viz-surface)"
            strokeWidth={1.5}
            fill={s.color}
            fillOpacity={0.92}
            isAnimationActive={false}
            activeDot={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Actual demand flowing into Eskom's forecast. */
export function DemandChart({ m }: { m: GridModel }) {
  const dayTicks = m.demandSeries.filter((p) => p.t.endsWith("00:00")).map((p) => p.t)
  const nowT = m.latest?.t
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={m.demandSeries} margin={{ top: 6, right: 4, bottom: 0, left: -6 }}>
        {GRID}
        <XAxis dataKey="t" ticks={dayTicks.filter((_, i) => i % 2 === 0)} tickFormatter={(t: string) => fmtDay(t).split(" ").slice(1, 3).join(" ")} {...AXIS} />
        <YAxis tickFormatter={gwTick} {...AXIS} width={30} domain={["dataMin - 1500", "dataMax + 500"]} />
        {nowT && <ReferenceLine x={nowT} stroke="var(--viz-cursor)" strokeDasharray="2 3" label={{ value: "latest", position: "insideTopRight", fill: "var(--viz-muted)", fontSize: 10 }} />}
        <Tooltip
          cursor={{ stroke: "var(--viz-cursor)", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as GridModel["demandSeries"][number]
            const rows: TipRow[] = []
            if (p.actual != null) rows.push({ label: "Actual", value: fmtMW(p.actual), swatch: "var(--viz-ink)" })
            if (p.forecast != null && p.actual == null) rows.push({ label: "Forecast", value: fmtMW(p.forecast), swatch: "var(--viz-forecast)", dashed: true })
            return <TipBox title={fmtTime(String(label))} rows={rows} />
          }}
        />
        <Area type="monotone" dataKey="actual" stroke="none" fill="var(--viz-ink)" fillOpacity={0.06} isAnimationActive={false} connectNulls={false} />
        <Line type="monotone" dataKey="actual" stroke="var(--viz-ink)" strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4, stroke: "var(--viz-surface)", strokeWidth: 2 }} />
        <Line type="monotone" dataKey="forecast" stroke="var(--viz-forecast)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} activeDot={{ r: 4, stroke: "var(--viz-surface)", strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/** Typical day: average demand vs solar, with the evening peak and solar windows marked. */
export function ProfileChart({ m, shiftMW }: { m: GridModel; shiftMW: number }) {
  // what-if line: shifted demand (peak hours lowered, solar hours raised by the same energy)
  const add = (shiftMW * PEAK_HOURS.length) / SOLAR_HOURS.length
  const data = m.profile.map((p) => ({
    ...p,
    shifted: shiftMW > 0 ? p.demand - (PEAK_HOURS.includes(p.hour) ? shiftMW : 0) + (SOLAR_HOURS.includes(p.hour) ? add : 0) : null,
  }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -6 }}>
        {GRID}
        <ReferenceArea x1="10:00" x2="14:00" fill="var(--series-4)" fillOpacity={0.08} ifOverflow="hidden" />
        <ReferenceArea x1="17:00" x2="20:00" fill="var(--series-5)" fillOpacity={0.1} ifOverflow="hidden" />
        <XAxis dataKey="label" interval={5} {...AXIS} />
        <YAxis tickFormatter={gwTick} {...AXIS} width={30} />
        <Tooltip
          cursor={{ stroke: "var(--viz-cursor)", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as (typeof data)[number]
            const rows: TipRow[] = [
              { label: "Avg demand", value: fmtMW(p.demand), swatch: "var(--viz-ink)" },
              { label: "Avg solar", value: fmtMW(p.solar), swatch: "var(--series-4)" },
            ]
            if (p.shifted != null) rows.push({ label: "After shift", value: fmtMW(p.shifted), swatch: "var(--viz-forecast)", dashed: true })
            return <TipBox title={`${label} (hour beginning)`} rows={rows} />
          }}
        />
        <Area type="monotone" dataKey="solar" stroke="var(--series-4)" strokeWidth={2} fill="var(--series-4)" fillOpacity={0.35} isAnimationActive={false} activeDot={false} />
        <Line type="monotone" dataKey="demand" stroke="var(--viz-ink)" strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4, stroke: "var(--viz-surface)", strokeWidth: 2 }} />
        <Line type="monotone" dataKey="shifted" stroke="var(--viz-forecast)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} activeDot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
