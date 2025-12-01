"use client"

import clsx from "clsx"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const pathname = usePathname()
  const shouldUseBlueBackground = Boolean(pathname && pathname !== "/" && pathname !== "/servicos")

  return (
    <div className={clsx("relative min-h-screen", shouldUseBlueBackground ? "bg-transparent" : "bg-white")}>
      {shouldUseBlueBackground && (
        <div
          aria-hidden="true"
          className="fixed inset-0 top-0 z-0 h-full bg-gradient-to-b from-[#0f172a] via-[#1c2b5a] to-[#1d4ed8]"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
