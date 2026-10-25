import { motion, useReducedMotion } from "framer-motion"
import { ArrowDown, Atom } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { ArrowPillButton } from "@/components/ui/arrow-pill-button"
import { BadgePill } from "@/components/ui/badge-pill"
import { GridLines } from "@/components/ui/grid-lines"
import { profile, stages } from "@/content/portfolio"
import { FusionEngine } from "./fusion-engine"
import { GlassCard } from "./GlassCard"
import { ProgressRail } from "./ProgressRail"

const N = stages.length
/** Fraction of each stage's scroll segment where the card is shown; the rest is the transition. */
const HOLD = 0.5
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.25 + i * 0.14, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

/** Scroll segment height in px. Recomputed only on real resizes, not mobile URL-bar jitter. */
function useSegment() {
  const [seg, setSeg] = useState(() => Math.max(400, Math.round(window.innerHeight * 1.3)))
  useEffect(() => {
    let w = window.innerWidth
    let h = window.innerHeight
    const onResize = () => {
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return
      w = window.innerWidth
      h = window.innerHeight
      setSeg(Math.max(400, Math.round(h * 1.3)))
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return seg
}

export function FusionStory() {
  const reduced = useReducedMotion() ?? false
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<FusionEngine | null>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const seg = useSegment()
  const [view, setView] = useState({ stage: 0, showCard: true })

  useLayoutEffect(() => {
    if (!canvasRef.current) return
    const engine = new FusionEngine(canvasRef.current, reduced)
    engineRef.current = engine
    return () => engine.destroy()
  }, [reduced])

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const r = Math.max(0, window.scrollY / seg) || 0
      const s = Math.min(N - 1, Math.floor(r))
      const u = s === N - 1 ? 0 : r - s
      const P = s === N - 1 ? N - 1 : s + smooth(HOLD, 1, u)
      engineRef.current?.setProgress(P)
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${Math.min(1, r / (N - 1)).toFixed(4)})`
      if (counterRef.current) counterRef.current.textContent = String(s + 1).padStart(2, "0")
      const showCard = u < HOLD * 0.92
      setView((v) => (v.stage === s && v.showCard === showCard ? v : { stage: s, showCard }))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [seg])

  const goTo = useCallback(
    (i: number) => {
      window.scrollTo({ top: i * seg + 1, behavior: reduced ? "auto" : "smooth" })
    },
    [seg, reduced],
  )

  const heroVisible = view.stage === 0 && view.showCard
  const current = stages[view.stage] ?? stages[0]

  return (
    <div className="relative" style={{ height: (N - 1) * seg + seg * 0.4 + window.innerHeight }}>
      {/* Scene */}
      <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-0 block h-dvh w-screen" />
      <GridLines className="fixed z-[1] hidden lg:block" />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-void/80 to-transparent" />

      {/* Hero copy (stage 0) */}
      <section
        aria-labelledby="hero-title"
        className="pointer-events-none fixed inset-0 z-10 flex flex-col px-5 pt-24 sm:px-10 lg:justify-center lg:pt-0 lg:pl-[8.33vw]"
      >
        <motion.div
          className="max-w-[560px] pr-12 sm:pr-0 lg:max-w-[42vw]"
          animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : -30 }}
          transition={{ duration: heroVisible ? 0.7 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <BadgePill icon={<Atom className="size-4 text-aether" aria-hidden />}>
              {profile.role} · {profile.location.split(",")[0]}
            </BadgePill>
          </motion.div>
          <motion.h1
            id="hero-title"
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-5 font-display text-[44px] leading-[0.98] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[clamp(50px,4.5vw,84px)]"
          >
            {profile.headline}{" "}
            <em className="text-plasma-gradient block pr-1">{profile.headlineAccent}</em>
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-5 max-w-md text-[16px] leading-relaxed text-haze sm:text-lg"
          >
            {profile.intro}
          </motion.p>
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={heroVisible ? "pointer-events-auto mt-8 hidden lg:block" : "mt-8 hidden lg:block"}
          >
            <ArrowPillButton
              href="#about"
              onClick={(e) => {
                e.preventDefault()
                goTo(1)
              }}
            >
              Begin the reaction
            </ArrowPillButton>
          </motion.div>
        </motion.div>

        {/* Mobile CTA sits under the nucleus so the orb stays the hero */}
        <motion.div
          className={heroVisible ? "pointer-events-auto absolute inset-x-0 bottom-[max(28px,env(safe-area-inset-bottom))] flex justify-center lg:hidden" : "absolute inset-x-0 bottom-7 flex justify-center lg:hidden"}
          animate={{ opacity: heroVisible ? 1 : 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: heroVisible ? 0.9 : 0 }}
        >
          <ArrowPillButton
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              goTo(1)
            }}
          >
            Begin the reaction
          </ArrowPillButton>
        </motion.div>

        <motion.div
          aria-hidden
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-haze lg:flex"
          animate={{ opacity: heroVisible ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase">Scroll</span>
          <ArrowDown className="size-4 motion-safe:animate-bounce" />
        </motion.div>
      </section>

      {/* Info cards */}
      <div className="pointer-events-none fixed inset-0 z-20">
        <div className="absolute top-[54%] right-12 left-4 h-0 sm:right-20 sm:left-10 lg:top-1/2 lg:right-auto lg:left-[8.33vw] lg:w-[min(460px,34vw)]">
          {stages.map((s, i) =>
            s.card ? (
              <div key={s.id} id={s.id} className="contents">
                <GlassCard card={s.card} index={i} visible={view.stage === i && view.showCard} onFocusStage={goTo} />
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* HUD: stage counter + physics caption, like a reactor readout */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between px-5 pb-[max(20px,env(safe-area-inset-bottom))] font-mono text-[11px] tracking-[0.12em] text-haze uppercase sm:px-10 sm:pb-8">
        <div className={heroVisible ? "opacity-0 transition-opacity lg:opacity-100" : "transition-opacity"}>
          <span className="text-ink">
            <span ref={counterRef}>01</span>/{String(N).padStart(2, "0")}
          </span>{" "}
          // <span className="text-ember">{current.physics}</span>
        </div>
        <div className="hidden sm:block">Cape Town · 33.92°S 18.42°E</div>
      </div>

      <ProgressRail ref={fillRef} stages={stages} active={view.stage} onSelect={goTo} />
    </div>
  )
}
