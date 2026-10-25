import { motion } from "framer-motion"
import { ArrowUpRight, FileDown, LayoutDashboard, Mail } from "lucide-react"
import { Link } from "react-router-dom"

import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons"
import type { CardLink, StageCard } from "@/content/portfolio"
import { cn } from "@/lib/utils"

const ICONS = {
  email: Mail,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  cv: FileDown,
  internal: LayoutDashboard,
} as const

const EASE = [0.16, 1, 0.3, 1] as const

function CardLinkButton({ link, primary }: { link: CardLink; primary: boolean }) {
  const Icon = ICONS[link.kind]
  const cls = cn(
    "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-300 touch-manipulation",
    primary
      ? "bg-flare text-[#1a0904] hover:bg-plasma hover:text-white"
      : "border border-white/15 bg-white/5 text-ink hover:border-white/30 hover:bg-white/10",
  )
  const inner = (
    <>
      <Icon className="size-4" aria-hidden />
      {link.label}
    </>
  )
  if (link.kind === "internal") {
    return (
      <Link to={link.href} className={cls}>
        {inner}
      </Link>
    )
  }
  const external = link.href.startsWith("http")
  return (
    <a
      href={link.href}
      className={cls}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...(link.kind === "cv" ? { download: true } : {})}
    >
      {inner}
      {external && <ArrowUpRight className="size-3.5 opacity-60" aria-hidden />}
    </a>
  )
}

/**
 * One frosted info card. All cards stay in the DOM (readable by screen readers
 * and Ctrl+F); only the active one is visible. Focusing a hidden card's link
 * calls `onFocusStage` so the page scrolls to it.
 */
export function GlassCard({
  card,
  index,
  visible,
  onFocusStage,
}: {
  card: StageCard
  index: number
  visible: boolean
  onFocusStage: (i: number) => void
}) {
  return (
    <motion.article
      aria-labelledby={`card-title-${index}`}
      onFocusCapture={() => !visible && onFocusStage(index)}
      initial={false}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.75, ease: EASE, delay: 0.08 } }
          : { opacity: 0, y: 26, scale: 0.985, filter: "blur(6px)", transition: { duration: 0.35, ease: "easeIn" } }
      }
      className={cn(
        "glass absolute inset-x-0 top-1/2 mx-auto w-full -translate-y-1/2 rounded-[22px] p-6 sm:p-7",
        "lg:inset-x-auto lg:left-0",
        visible ? "pointer-events-auto" : "pointer-events-none",
      )}
      style={{ willChange: "transform, opacity" }}
    >
      {/* plasma accent line */}
      <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-plasma/80 to-transparent" />
      <p className="font-mono text-[11px] tracking-[0.18em] text-ember uppercase">{card.eyebrow}</p>
      <h2 id={`card-title-${index}`} className="mt-2 font-display text-[32px] leading-[1.05] text-ink sm:text-[38px]">
        {card.title}
      </h2>
      {card.body && <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{card.body}</p>}

      {card.bullets && (
        <ul className="mt-4 space-y-2">
          {card.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[15px] leading-snug text-ink/85">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-plasma shadow-[0_0_10px_2px_rgba(255,107,74,0.6)]" />
              {b}
            </li>
          ))}
        </ul>
      )}

      {card.chips && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {card.chips.map((c) => (
            <li key={c} className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[13px] text-ink/90">
              {c}
            </li>
          ))}
        </ul>
      )}

      {card.stats && (
        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          {card.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-2xl leading-none text-flare">{s.value}</dd>
              <dd className="mt-1.5 text-[12px] leading-tight text-haze">{s.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {card.links && (
        <div className="mt-5 flex flex-wrap gap-2">
          {card.links.map((l, i) => (
            <CardLinkButton key={l.label} link={l} primary={i === 0} />
          ))}
        </div>
      )}
    </motion.article>
  )
}
