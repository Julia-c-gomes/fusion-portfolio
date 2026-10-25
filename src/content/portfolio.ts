/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT ME — every word on the portfolio page lives in this file.
 * ─────────────────────────────────────────────────────────────
 * Each `stage` is one step of the fusion sequence. Its `card` is the
 * glass panel that floats in once the transition finishes.
 * Keep cards short: they sit over the animation and must not scroll.
 */

export const profile = {
  name: "Your Name",
  initials: "YN",
  role: "Chemical Engineer",
  location: "Cape Town, South Africa",
  headline: "Engineering energy,",
  headlineAccent: "one reaction at a time.",
  intro:
    "Chemical engineering graduate turning process thinking into cleaner, more reliable energy systems.",
  email: "you@example.com",
  linkedin: "https://www.linkedin.com/in/your-handle",
  github: "https://github.com/your-handle",
  /** Put your CV in /public (e.g. public/cv.pdf) and keep this path. */
  cvUrl: "./cv.pdf",
}

export type CardStat = { value: string; label: string }
export type CardLink = { label: string; href: string; kind: "email" | "linkedin" | "github" | "cv" | "internal" }

export type StageCard = {
  eyebrow: string
  title: string
  body?: string
  bullets?: string[]
  chips?: string[]
  stats?: CardStat[]
  links?: CardLink[]
}

export type Stage = {
  id: string
  /** Short label for the progress rail */
  label: string
  /** The physics shown in this step, displayed bottom-left */
  physics: string
  card?: StageCard
}

export const stages: Stage[] = [
  {
    id: "ignition",
    label: "Ignition",
    physics: "²H · deuterium · 1p + 1n",
  },
  {
    id: "about",
    label: "About",
    physics: "Fuel · deuterium, extracted from seawater",
    card: {
      eyebrow: "01 · Background",
      title: "A process engineer at heart",
      body:
        "I grew up in Cape Town, fascinated by how raw materials become energy, fuel and food. I like problems where thermodynamics, data and people meet: plants that need to run cleaner, cheaper and more safely.",
      stats: [
        { value: "BSc(Eng)", label: "Chemical Eng." },
        { value: "4+", label: "Major projects" },
        { value: "ZA", label: "Based in CPT" },
      ],
    },
  },
  {
    id: "education",
    label: "Education",
    physics: "³H · tritium joins · 1p + 2n",
    card: {
      eyebrow: "02 · Education",
      title: "University of Cape Town",
      body: "BSc in Chemical Engineering, specialising in energy and process systems.",
      bullets: [
        "Final-year design: green hydrogen production plant",
        "Research: CO₂ capture solvent performance",
        "Dean's Merit List · ECSA-accredited programme",
      ],
    },
  },
  {
    id: "skills",
    label: "Skills",
    physics: "Plasma · 150 million °C",
    card: {
      eyebrow: "03 · Toolkit",
      title: "Heat, mass and data",
      chips: [
        "Aspen Plus / HYSYS",
        "Process design & P&IDs",
        "Mass & energy balances",
        "Python · pandas",
        "MATLAB",
        "HAZOP & safety",
        "Techno-economics",
        "Power BI",
        "Reactor design",
        "Energy systems",
      ],
    },
  },
  {
    id: "project-1",
    label: "Project I",
    physics: "Magnetic confinement · tokamak field",
    card: {
      eyebrow: "04 · Project",
      title: "Green hydrogen plant design",
      body:
        "Designed a 20 MW PEM electrolysis plant on the West Coast, from flowsheet through to cost model.",
      stats: [
        { value: "R/kg", label: "LCOH modelled" },
        { value: "20 MW", label: "Electrolyser" },
        { value: "Aspen", label: "Simulation" },
      ],
    },
  },
  {
    id: "project-2",
    label: "Project II",
    physics: "Fusion · D + T → ⁴He + n",
    card: {
      eyebrow: "05 · Project",
      title: "Carbon capture solvent study",
      body:
        "Compared amine solvents for post-combustion CO₂ capture, cutting modelled regeneration energy by optimising stripper conditions.",
      bullets: ["Rate-based absorber model", "Sensitivity & optimisation in Python"],
    },
  },
  {
    id: "project-3",
    label: "Project III",
    physics: "Energy release · 17.6 MeV per reaction",
    card: {
      eyebrow: "06 · Project",
      title: "Grid demand analytics",
      body:
        "Built a dashboard on Eskom's public data to find where demand can shift, so less diesel is burned at the evening peak. It's live in the Grid tab.",
      links: [{ label: "Open the dashboard", href: "/grid", kind: "internal" }],
    },
  },
  {
    id: "contact",
    label: "Contact",
    physics: "Sustained burn · Q > 1",
    card: {
      eyebrow: "07 · Contact",
      title: "Let's start a reaction",
      body: "Open to graduate roles in process, energy and sustainability, in Cape Town or remote.",
      links: [
        { label: "Email me", href: `mailto:${profile.email}`, kind: "email" },
        { label: "LinkedIn", href: profile.linkedin, kind: "linkedin" },
        { label: "GitHub", href: profile.github, kind: "github" },
        { label: "Download CV", href: profile.cvUrl, kind: "cv" },
      ],
    },
  },
]
