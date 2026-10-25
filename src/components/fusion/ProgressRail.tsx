import { forwardRef } from "react"

import type { Stage } from "@/content/portfolio"
import { cn } from "@/lib/utils"

/**
 * Vertical progress rail (right edge). The fill line is driven imperatively
 * through the forwarded ref so scrolling never re-renders React.
 */
export const ProgressRail = forwardRef<
  HTMLDivElement,
  { stages: Stage[]; active: number; onSelect: (i: number) => void }
>(function ProgressRail({ stages, active, onSelect }, fillRef) {
  const last = stages.length - 1
  return (
    <nav
      aria-label="Fusion sequence progress"
      className="fixed top-1/2 right-2 z-30 h-[min(58vh,440px)] w-10 -translate-y-1/2 sm:right-5"
    >
      <div aria-hidden className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-white/15" />
      <div
        ref={fillRef}
        aria-hidden
        className="absolute top-0 left-1/2 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-aether via-ember to-plasma"
        style={{ height: "100%", transform: "scaleY(0)" }}
      />
      <ol className="absolute inset-0">
        {stages.map((s, i) => {
          const isActive = i === active
          return (
            <li key={s.id} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${(i / last) * 100}%` }}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Go to ${s.label}`}
                aria-current={isActive ? "step" : undefined}
                className="group relative flex size-9 cursor-pointer items-center justify-center rounded-full touch-manipulation"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute rounded-full border transition-all duration-500 ease-out",
                    isActive ? "size-8 border-white/70 bg-white/5" : "size-0 border-transparent",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "relative rounded-full transition-all duration-500 ease-out",
                    isActive
                      ? "size-3 bg-plasma shadow-[0_0_14px_4px_rgba(255,107,74,0.65)]"
                      : i < active
                        ? "size-1.5 bg-ember"
                        : "size-1.5 bg-white/60 group-hover:bg-white",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute right-11 hidden font-mono text-[11px] tracking-[0.14em] whitespace-nowrap uppercase transition-all duration-300 sm:block",
                    isActive
                      ? "translate-x-0 text-ink/90 opacity-100"
                      : "translate-x-1 text-haze opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
})
