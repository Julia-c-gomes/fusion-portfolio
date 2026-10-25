import { ArrowUpRight } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * The split pill CTA from the aero-hero demo: a label pill plus a round
 * arrow chip whose arrow slides out and a twin slides in on hover/focus.
 * Rendered as an <a> so it works for in-page jumps and external links.
 */
export function ArrowPillButton({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "group inline-flex cursor-pointer items-center gap-0 rounded-full outline-none select-none touch-manipulation",
        className,
      )}
      {...props}
    >
      <span className="rounded-full bg-flare px-6 py-3 text-[15px] font-medium text-[#1a0904] transition-colors duration-500 ease-out group-hover:bg-plasma group-hover:text-white group-focus-visible:bg-plasma group-focus-visible:text-white">
        {children}
      </span>
      <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-flare text-[#1a0904] transition-colors duration-500 ease-out group-hover:bg-plasma group-hover:text-white group-focus-visible:bg-plasma group-focus-visible:text-white">
        <ArrowUpRight aria-hidden className="absolute size-5 transition-transform duration-500 ease-out group-hover:translate-x-10 group-hover:-translate-y-10 group-focus-visible:translate-x-10 group-focus-visible:-translate-y-10" />
        <ArrowUpRight aria-hidden className="absolute size-5 -translate-x-10 translate-y-10 transition-transform duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0" />
      </span>
    </a>
  )
}
