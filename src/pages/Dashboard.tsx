import { motion } from "framer-motion"
import { Activity, CalendarClock, Database, ExternalLink, Flame, Gauge, Leaf, RefreshCw, TrendingUp, Wrench } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { DemandChart, Legend, MixChart, ProfileChart } from "@/components/dashboard/charts"
import { KpiTile } from "@/components/dashboard/KpiTile"
import { Optimiser } from "@/components/dashboard/Optimiser"
import { buildModel, fmtTime, MIX_SERIES, type EskomFile } from "@/lib/eskom"

function Panel({ title, sub, legend, children, className = "" }: { title: string; sub: string; legend?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`glass-soft flex min-h-0 flex-col rounded-2xl p-4 ${className}`} aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
          <p className="text-[11.5px] text-haze">{sub}</p>
        </div>
        {legend}
      </div>
      <div className="mt-2 min-h-[180px] flex-1 lg:min-h-0">{children}</div>
    </section>
  )
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
}

export default function Dashboard() {
  const [file, setFile] = useState<EskomFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shiftMW, setShiftMW] = useState(800)

  const load = useCallback(() => {
    setError(null)
    fetch(`data/eskom.json?v=${Math.floor(Date.now() / 3.6e6)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setFile)
      .catch((e: Error) => setError(e.message))
  }, [])
  useEffect(load, [load])

  // The dashboard is a single screen: no page scrollbars (desktop fits exactly; phones scroll invisibly).
  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar")
    return () => document.documentElement.classList.remove("no-scrollbar")
  }, [])

  const m = useMemo(() => (file ? buildModel(file) : null), [file])

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center px-6">
        <div className="glass max-w-sm rounded-2xl p-6 text-center">
          <p className="font-semibold text-ink">Couldn't load grid data</p>
          <p className="mt-1 text-sm text-haze">{error}. The data file may still be building.</p>
          <button onClick={load} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-flare px-5 text-sm font-medium text-[#1a0904]">
            <RefreshCw className="size-4" aria-hidden /> Try again
          </button>
        </div>
      </main>
    )
  }

  if (!m) {
    return (
      <main className="viz-root mx-auto grid h-dvh max-w-[1600px] grid-rows-[auto_auto_1fr] gap-3 px-4 pt-20 pb-4 sm:px-6" aria-busy="true">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-white/5" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
        <div className="animate-pulse rounded-2xl bg-white/5" />
      </main>
    )
  }

  const outDelta = m.outageLatest && m.outageWeekAgo ? (m.outageLatest.unplanned ?? 0) - (m.outageWeekAgo.unplanned ?? 0) : null

  return (
    <main className="viz-root mx-auto flex max-w-[1600px] flex-col gap-3 px-4 pt-[76px] pb-4 sm:px-6 lg:h-dvh lg:overflow-hidden">
      {/* Header */}
      <motion.header custom={0} variants={rise} initial="hidden" animate="show" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-ember uppercase">South African grid · Eskom data portal</p>
          <h1 className="mt-1 font-display text-[30px] leading-none text-ink sm:text-[36px]">
            Generation &amp; demand, <em className="text-plasma-gradient">the last {Math.round(m.days)} days</em>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-haze">
          {m.supplyRange && (
            <span className="glass-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <CalendarClock className="size-3.5" aria-hidden /> Data to {fmtTime(m.supplyRange.to)}
            </span>
          )}
          <span className="glass-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Database className="size-3.5" aria-hidden /> Synced {new Date(m.generatedAt).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
          <a href={m.portal} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-ember hover:underline">
            Source <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      </motion.header>

      {/* KPIs */}
      <motion.div custom={1} variants={rise} initial="hidden" animate="show" className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile
          label="Latest demand"
          icon={<Activity />}
          value={m.latest ? (m.latest.demand! / 1000).toFixed(1) : "–"}
          unit="GW"
          spark={m.recentDemand.map((p) => p.v)}
          sub={m.latest ? fmtTime(m.latest.t) : ""}
        />
        <KpiTile
          label="Peak demand · week"
          icon={<TrendingUp />}
          value={m.peak ? (m.peak.demand! / 1000).toFixed(1) : "–"}
          unit="GW"
          sub={m.peak ? fmtTime(m.peak.t) : ""}
        />
        <KpiTile
          label="Forecast peak"
          icon={<Gauge />}
          value={m.fPeak ? (m.fPeak.forecast! / 1000).toFixed(1) : "–"}
          unit="GW"
          sub={m.fPeak ? fmtTime(m.fPeak.t) : "No forecast published"}
        />
        <KpiTile
          label="Renewable share"
          icon={<Leaf />}
          value={(m.reShare * 100).toFixed(1)}
          unit="%"
          sub={`wind + solar · ${(m.energy.renewables / 1000).toFixed(0)} GWh`}
        />
        <KpiTile
          label="Unplanned outages"
          icon={<Wrench />}
          value={m.outageLatest ? ((m.outageLatest.unplanned ?? 0) / 1000).toFixed(1) : "–"}
          unit="GW"
          spark={m.outages.slice(-24 * 14).filter((_, i) => i % 3 === 0).map((p) => p.v)}
          delta={outDelta == null ? null : { text: `${Math.abs(outDelta / 1000).toFixed(1)} GW vs 7 d ago`, good: outDelta <= 0 }}
          sub=""
        />
        <KpiTile
          label="Diesel & gas peakers"
          icon={<Flame />}
          value={(m.peakerEnergy / 1000).toFixed(1)}
          unit="GWh"
          sub={`${m.peakerHours} h · ${((m.peakerEnergy / m.totalEnergy) * 100).toFixed(1)}% of supply`}
        />
      </motion.div>

      {/* Charts + optimisation */}
      <motion.div custom={2} variants={rise} initial="hidden" animate="show" className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-2">
        <Panel
          className="lg:col-span-8"
          title="Supply mix"
          sub="GW, hourly by source"
          legend={<Legend items={MIX_SERIES.map((s) => ({ label: s.label, color: s.color }))} />}
        >
          <MixChart m={m} />
        </Panel>
        <div className="flex min-h-0 lg:col-span-4 lg:row-span-2">
          <Optimiser m={m} shiftMW={shiftMW} onShift={setShiftMW} />
        </div>
        <Panel
          className="lg:col-span-4"
          title="Demand"
          sub="GW, actual → forecast"
          legend={<Legend items={[{ label: "Actual", color: "var(--viz-ink)", line: true }, { label: "Forecast", color: "var(--viz-forecast)", line: true, dashed: true }]} />}
        >
          <DemandChart m={m} />
        </Panel>
        <Panel
          className="lg:col-span-4"
          title="Typical day"
          sub="GW, hourly average"
          legend={
            <Legend
              items={[
                { label: "Demand", color: "var(--viz-ink)", line: true },
                { label: "Solar", color: "var(--series-4)" },
                ...(shiftMW > 0 ? [{ label: "After shift", color: "var(--viz-forecast)", line: true, dashed: true }] : []),
              ]}
            />
          }
        >
          <ProfileChart m={m} shiftMW={shiftMW} />
        </Panel>
      </motion.div>
    </main>
  )
}
