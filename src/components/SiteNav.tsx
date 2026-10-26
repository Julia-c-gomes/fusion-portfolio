import { motion } from "framer-motion"
import { Atom, LayoutDashboard } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { profile } from "@/content/portfolio"
import { cn } from "@/lib/utils"

const TABS = [
  { to: "/", label: "Portfolio", icon: Atom },
  { to: "/grid", label: "Grid dashboard", short: "Grid", icon: LayoutDashboard },
]

export function SiteNav() {
  const { pathname } = useLocation()
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
        <NavLink to="/" className="group flex min-h-11 items-center gap-3 rounded-full pr-2" aria-label={`${profile.name} portfolio, home`}>
          <img
            src="./avatar.webp"
            alt=""
            width={44}
            height={44}
            className="size-10 shrink-0 rounded-full sm:size-11 object-cover ring-2 ring-white/20 transition-shadow duration-300 group-hover:ring-flare/70"
          />
          <span className="flex items-baseline gap-2.5">
            <span className="text-[17px] font-semibold tracking-[-0.02em] whitespace-nowrap text-ink sm:text-[22px]">{profile.name}</span>
            <span aria-hidden className="hidden h-4 w-px self-center bg-white/25 sm:block" />
            <span className="hidden font-mono text-[11px] tracking-[0.2em] text-haze uppercase sm:inline">Portfolio</span>
          </span>
        </NavLink>

        <nav aria-label="Main" className="glass flex items-center gap-1 rounded-full p-1">
          {TABS.map((t) => {
            const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to)
            const Icon = t.icon
            return (
              <NavLink
                key={t.to}
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium transition-colors duration-300 touch-manipulation sm:px-4",
                  active ? "text-[#1a0904]" : "text-haze hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-flare"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative hidden size-4 sm:block" aria-hidden />
                <span className="relative">
                  {t.short ? (
                    <>
                      <span className="sm:hidden">{t.short}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </>
                  ) : (
                    t.label
                  )}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
