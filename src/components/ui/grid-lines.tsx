import { cn } from "@/lib/utils"

/** The 1 · 3 · 4 · 3 · 1 column hairlines from the aero-hero demo, as a quiet editorial grid. */
export function GridLines({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="grid h-full w-full grid-cols-12 divide-x divide-white/[0.045]">
        <div className="col-span-1" />
        <div className="col-span-3" />
        <div className="col-span-4" />
        <div className="col-span-3" />
        <div className="col-span-1 border-r border-white/[0.045]" />
      </div>
    </div>
  )
}
