import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** The glowing pill label from the AetherFlow hero ("Dynamic Rendering Engine"). */
export function BadgePill({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-aether/25 bg-aether/10 px-4 py-1.5 backdrop-blur-sm",
        className,
      )}
    >
      {icon}
      <span className="text-sm font-medium text-ink/90">{children}</span>
    </div>
  )
}
