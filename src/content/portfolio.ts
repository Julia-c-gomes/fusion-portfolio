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
  headlineAccent: "balancing the equation.",
  intro:
    "Chemical engineering graduate focused on process design, optimisation and data analysis, from electrochemistry applications to extracting value from data.",
  email: "jewlcross@gmail.com",
  linkedin: "https://www.linkedin.com/in/julia-c-gomes",
  github: "https://github.com/Julia-c-gomes",
}

export type CardStat = { value: string; label: string }
export type CardLink = { label: string; href: string; kind: "email" | "linkedin" | "github" | "internal" }

/** color: a light tint for this group's chips (any CSS colour) */
export type ChipGroup = { label: string; items: string[]; color?: string }

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
    id: "education",
    label: "Education",
    physics: "Fuel · about 1 in 6,400 hydrogen atoms in seawater is deuterium",
    reaction: [D],
    card: {
      eyebrow: "01 · Education",
      title: "BSc Chemical Engineering, UCT",
      body: "University of Cape Town, 2022–2025. Graduated with 77% in final year.",
      bullets: [
        "Dean's Merit List, 2023–2025",
        "Thesis: plasticisers and water-vapour permeability of carrageenan bioplastics",
        "Coursework: Renewable Energy, Chemical Engineering Design, Data Science & System Dynamics",
      ],
    },
  },
  {
    id: "background",
    label: "Background",
    physics: "Tritium joins · 1 proton, 2 neutrons, 1 electron",
    reaction: [D, "+", T],
    card: {
      eyebrow: "02 · Background",
      title: "Driven by a challenge",
      body:
        "I averaged 77% in each of the last three years of my degree, with a distinction in Renewable Energy, while working 20 hours a week. As an electrochemistry research assistant at UCT I ran lab experiments and taught myself Python to make sense of the data. Outside, I hold an A & B skydiving licence and love surfing, trail running and free diving.",
      stats: [
        { value: "77%", label: "3 years running" },
        { value: "Distinction", label: "Renewable Energy" },
        { value: "20 h", label: "Worked weekly" },
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
        { label: "Code", color: "#A97CFF", items: ["Python", "Scilab", "JavaScript", "SQL", "LaTeX"] },
        { label: "Tools", color: "#7CC8FF", items: ["Aspen Plus", "Microsoft Office", "VS Code"] },
        { label: "Lab", color: "#FFB15C", items: ["Cyclic voltammetry", "Electrochemical setup", "Centrifuge", "Press filter"] },
        { label: "Languages", color: "#7CEBC4", items: ["English", "French", "Afrikaans", "Portuguese"] },
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
