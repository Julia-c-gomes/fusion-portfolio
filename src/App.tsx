import { lazy, Suspense, useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"

import { FusionStory } from "@/components/fusion/FusionStory"
import { SiteNav } from "@/components/SiteNav"

// The dashboard only downloads when someone opens the Grid tab.
const Dashboard = lazy(() => import("@/pages/Dashboard"))

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = pathname.startsWith("/grid") ? "Grid dashboard · Julia Gomes" : "Julia Gomes · Chemical Engineer, Cape Town"
    document.getElementById("main")?.focus({ preventScroll: true })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById("main")?.focus()
        }}
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-full bg-flare px-4 py-2 text-sm font-medium text-[#1a0904] focus:translate-y-0"
      >
        Skip to content
      </a>
      <RouteEffects />
      <SiteNav />
      <div id="main" tabIndex={-1} className="outline-none">
        <Routes>
          <Route path="/" element={<FusionStory />} />
          <Route
            path="/grid"
            element={
              <Suspense fallback={<div className="h-dvh" />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route path="*" element={<FusionStory />} />
        </Routes>
      </div>
    </>
  )
}
