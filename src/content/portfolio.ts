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
  role: "Graduate Chemical Engineer",
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

/** A nucleus drawn as dots in the bottom-left readout: p = protons, n = neutrons. */
export type Nucleus = { sym: string; p: number; n: number }
export type ReactionPart = Nucleus | "+" | "→"

const D: Nucleus = { sym: "²H", p: 1, n: 1 }
const T: Nucleus = { sym: "³H", p: 1, n: 2 }
const He: Nucleus = { sym: "⁴He", p: 2, n: 2 }
const NEUTRON: Nucleus = { sym: "n", p: 0, n: 1 }

export type Stage = {
  id: string
  /** Short label for the progress rail */
  label: string
  /** The physics shown in this step, displayed bottom-left */
  physics: string
  /** Nuclei on screen at this step, shown as proton/neutron dots */
  reaction: ReactionPart[]
  card?: StageCard
}

export const stages: Stage[] = [
  {
    id: "ignition",
    label: "Ignition",
    physics: "Deuterium atom · 1 proton, 1 neutron, 1 electron",
    reaction: [D],
  },
  {
    id: "about",
    label: "About",
    physics: "Fuel · about 1 in 6,400 hydrogen atoms in seawater is deuterium",
    reaction: [D],
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
    physics: "Tritium joins · 1 proton, 2 neutrons, 1 electron",
    reaction: [D, "+", T],
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
    physics: "Plasma · ~150 million °C strips the electrons off",
    reaction: [D, "+", T],
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
    physics: "Magnetic confinement · field lines hold the ions and electrons",
    reaction: [D, "+", T],
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
    physics: "Fusion · the nuclei merge",
    reaction: [D, "+", T, "→", He, "+", NEUTRON],
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
    physics: "17.6 MeV released · ⁴He carries 3.5, the neutron 14.1",
    reaction: [He, "+", NEUTRON],
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
    physics: "Burning plasma · ⁴He (alpha) heating keeps it going",
    reaction: [He],
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
