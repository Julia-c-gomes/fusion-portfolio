/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT ME — every word on the portfolio page lives in this file.
 * ─────────────────────────────────────────────────────────────
 * Each `stage` is one step of the fusion sequence. Its `card` is the
 * glass panel that floats in once the transition finishes.
 * Keep cards short: they sit over the animation and must not scroll.
 */

export const profile = {
  name: "Julia Gomes",
  initials: "JG",
  role: "Chemical Engineer",
  location: "Cape Town, South Africa",
  headline: "Engineering energy,",
  headlineAccent: "one reaction at a time.",
  intro:
    "Chemical engineering graduate focused on process design, optimisation and data analysis, from the electrochemistry lab to Python.",
  email: "jewlcross@gmail.com",
  linkedin: "https://www.linkedin.com/in/julia-c-gomes",
  github: "https://github.com/Julia-c-gomes",
}

export type CardStat = { value: string; label: string }
export type CardLink = { label: string; href: string; kind: "email" | "linkedin" | "github" | "internal" }

export type ChipGroup = { label: string; items: string[] }

export type StageCard = {
  eyebrow: string
  title: string
  body?: string
  bullets?: string[]
  chips?: string[]
  /** Labelled rows of chips (e.g. skills by category) */
  chipGroups?: ChipGroup[]
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
      title: "Process, optimisation & data",
      body:
        "Chemical Engineering graduate with a strong academic record and a focus on process design, optimisation and data analysis. Experienced in electrochemical lab work and Python-driven data interpretation, and kept high standards while working 20+ hours a week.",
      stats: [
        { value: "77%", label: "Weighted GPA" },
        { value: "3×", label: "Dean's Merit List" },
        { value: "20 h", label: "Worked weekly" },
      ],
    },
  },
  {
    id: "education",
    label: "Education",
    physics: "³H · tritium joins · 1p + 2n",
    card: {
      eyebrow: "02 · Education",
      title: "BSc Chemical Engineering, UCT",
      body: "University of Cape Town, 2022–2025. Graduated with a 77% year-weighted GPA.",
      bullets: [
        "Dean's Merit List, 2023–2025",
        "Thesis: plasticisers and water-vapour permeability of carrageenan bioplastics",
        "Coursework: Renewable Energy, Chemical Engineering Design, Data Science & System Dynamics",
      ],
    },
  },
  {
    id: "skills",
    label: "Skills",
    physics: "Plasma · 150 million °C",
    card: {
      eyebrow: "03 · Toolkit",
      title: "Lab bench to code",
      chipGroups: [
        { label: "Code", items: ["Python", "Scilab", "JavaScript", "SQL", "LaTeX"] },
        { label: "Tools", items: ["Aspen Plus", "Microsoft Office", "VS Code"] },
        { label: "Lab", items: ["Cyclic voltammetry", "Electrochemical setup", "Centrifuge", "Press filter"] },
        { label: "Languages", items: ["English", "French", "Afrikaans", "Portuguese"] },
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
      ],
    },
  },
]
