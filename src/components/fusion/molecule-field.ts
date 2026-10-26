/**
 * Drifting ball-and-stick molecules behind the fusion scene. Replaces the
 * starfield/plexus look while keeping the AetherFlow behaviours: colour shifts
 * violet → ember as the plasma heats, a swirl around the confined core, the
 * shockwave push, and gentle repulsion from the mouse.
 *
 * Geometry is a 2D projection with real bond angles (H₂O 104.5°, CO₂ linear,
 * CH₄ tetrahedral, NH₃ pyramidal, benzene hexagonal). Bond length = 1 unit.
 */
export type FieldParams = {
  heat: number // 0..1: violet → ember, faster
  swirl: number // 0..1: tangential flow around (cx, cy)
  push: number // radial impulse (shockwave), px/s
  alpha: number // overall visibility
  cx: number
  cy: number
}

type El = "H" | "D" | "C" | "N" | "O"
type Atom = { el: El; x: number; y: number }
type Bond = [a: number, b: number, order: 1 | 2]
type Species = { atoms: Atom[]; bonds: Bond[] }

const DEG = Math.PI / 180
const at = (el: El, r: number, deg: number): Atom => ({ el, x: r * Math.cos(deg * DEG), y: r * Math.sin(deg * DEG) })

const SPECIES: Species[] = [
  // water
  { atoms: [at("O", 0, 0), at("H", 1, 90 - 52.25), at("H", 1, 90 + 52.25)], bonds: [[0, 1, 1], [0, 2, 1]] },
  // heavy water, D₂O, the deuterium source in seawater
  { atoms: [at("O", 0, 0), at("D", 1, -90 - 52.25), at("D", 1, -90 + 52.25)], bonds: [[0, 1, 1], [0, 2, 1]] },
  // carbon dioxide
  { atoms: [at("C", 0, 0), at("O", 1.16, 0), at("O", 1.16, 180)], bonds: [[0, 1, 2], [0, 2, 2]] },
  // methane, tetrahedral seen slightly off-axis
  { atoms: [at("C", 0, 0), at("H", 1, -90), at("H", 0.95, 30), at("H", 0.95, 150), at("H", 0.42, 80)], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
  // ammonia, trigonal pyramid
  { atoms: [at("N", 0, 0), at("H", 0.95, 70), at("H", 0.95, 190), at("H", 0.95, 310)], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
  // benzene (Kekulé), with hydrogens
  (() => {
    const atoms: Atom[] = []
    const bonds: Bond[] = []
    for (let i = 0; i < 6; i++) atoms.push(at("C", 1.4, i * 60 + 30))
    for (let i = 0; i < 6; i++) atoms.push(at("H", 2.45, i * 60 + 30))
    for (let i = 0; i < 6; i++) {
      bonds.push([i, (i + 1) % 6, i % 2 === 0 ? 2 : 1])
      bonds.push([i, i + 6, 1])
    }
    return { atoms, bonds }
  })(),
  // nitrogen and oxygen gas
  { atoms: [at("N", 0.55, 0), at("N", 0.55, 180)], bonds: [[0, 1, 2]] },
  { atoms: [at("O", 0.6, 0), at("O", 0.6, 180)], bonds: [[0, 1, 2]] },
]

/** Atom radius (bond-length units) and cool / hot colour per element */
const EL: Record<El, { r: number; cool: [number, number, number]; hot: [number, number, number] }> = {
  H: { r: 0.22, cool: [226, 222, 255], hot: [255, 236, 214] },
  D: { r: 0.26, cool: [255, 168, 140], hot: [255, 196, 150] },
  C: { r: 0.36, cool: [150, 128, 230], hot: [255, 150, 96] },
  N: { r: 0.34, cool: [124, 200, 255], hot: [255, 186, 120] },
  O: { r: 0.34, cool: [255, 120, 150], hot: [255, 120, 80] },
}

type Mol = { s: Species; x: number; y: number; vx: number; vy: number; a: number; va: number; scale: number; alpha: number }

export class MoleculeField {
  private mols: Mol[] = []
  private w = 0
  private h = 0
  private still: boolean

  constructor(w: number, h: number, lowPower: boolean, still: boolean) {
    this.still = still
    this.w = w
    this.h = h
    const n = Math.round(Math.min(lowPower ? 14 : 26, Math.max(lowPower ? 8 : 12, (w * h) / (lowPower ? 42000 : 52000))))
    for (let i = 0; i < n; i++) {
      const depth = Math.random()
      const a = Math.random() * Math.PI * 2
      const sp = 5 + Math.random() * 12
      this.mols.push({
        s: SPECIES[i % SPECIES.length],
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        a: Math.random() * Math.PI * 2,
        va: (Math.random() - 0.5) * 0.35,
        scale: (lowPower ? 9 : 11) + depth * (lowPower ? 9 : 13),
        alpha: 0.28 + depth * 0.45,
      })
    }
  }

  resize(w: number, h: number) {
    const sx = this.w ? w / this.w : 1
    const sy = this.h ? h / this.h : 1
    for (const m of this.mols) {
      m.x *= sx
      m.y *= sy
    }
    this.w = w
    this.h = h
  }

  step(dt: number, p: FieldParams, mouse: { x: number; y: number; active: boolean }) {
    if (this.still) return
    const speed = 1 + p.heat * 1.8
    for (const m of this.mols) {
      let dx = m.vx * speed
      let dy = m.vy * speed
      const rx = m.x - p.cx
      const ry = m.y - p.cy
      const d = Math.hypot(rx, ry) || 1
      if (p.swirl > 0) {
        const f = p.swirl * 60 * Math.min(1, 260 / d)
        dx += (-ry / d) * f
        dy += (rx / d) * f * 0.45
      }
      if (p.push !== 0) {
        dx += (rx / d) * p.push
        dy += (ry / d) * p.push
      }
      if (mouse.active) {
        const mx = m.x - mouse.x
        const my = m.y - mouse.y
        const md = Math.hypot(mx, my)
        if (md < 160 && md > 0.1) {
          const f = ((160 - md) / 160) * 240
          dx += (mx / md) * f
          dy += (my / md) * f
        }
      }
      m.x += dx * dt
      m.y += dy * dt
      m.a += m.va * dt * (1 + p.heat * 2)
      const pad = m.scale * 3
      if (m.x < -pad) m.x += this.w + pad * 2
      else if (m.x > this.w + pad) m.x -= this.w + pad * 2
      if (m.y < -pad) m.y += this.h + pad * 2
      else if (m.y > this.h + pad) m.y -= this.h + pad * 2
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: FieldParams) {
    if (p.alpha <= 0.01) return
    const t = Math.min(1, Math.max(0, p.heat))
    const mix = (c: [number, number, number], h: [number, number, number]) =>
      `${Math.round(c[0] + (h[0] - c[0]) * t)},${Math.round(c[1] + (h[1] - c[1]) * t)},${Math.round(c[2] + (h[2] - c[2]) * t)}`
    const bondRGB = mix([170, 150, 235], [255, 170, 110])
    ctx.lineCap = "round"
    for (const m of this.mols) {
      const ca = Math.cos(m.a)
      const sa = Math.sin(m.a)
      const pts = m.s.atoms.map((a) => [m.x + (a.x * ca - a.y * sa) * m.scale, m.y + (a.x * sa + a.y * ca) * m.scale])
      const A = m.alpha * p.alpha
      ctx.strokeStyle = `rgba(${bondRGB},${(A * 0.7).toFixed(3)})`
      ctx.lineWidth = Math.max(1, m.scale * 0.09)
      ctx.beginPath()
      for (const [i, j, order] of m.s.bonds) {
        const [x1, y1] = pts[i]
        const [x2, y2] = pts[j]
        if (order === 2) {
          const len = Math.hypot(x2 - x1, y2 - y1) || 1
          const ox = (-(y2 - y1) / len) * m.scale * 0.11
          const oy = ((x2 - x1) / len) * m.scale * 0.11
          ctx.moveTo(x1 + ox, y1 + oy)
          ctx.lineTo(x2 + ox, y2 + oy)
          ctx.moveTo(x1 - ox, y1 - oy)
          ctx.lineTo(x2 - ox, y2 - oy)
        } else {
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
        }
      }
      ctx.stroke()
      m.s.atoms.forEach((a, i) => {
        const e = EL[a.el]
        const r = e.r * m.scale
        const [x, y] = pts[i]
        const rgb = mix(e.cool, e.hot)
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r)
        g.addColorStop(0, `rgba(255,255,255,${(A * 0.95).toFixed(3)})`)
        g.addColorStop(0.35, `rgba(${rgb},${A.toFixed(3)})`)
        g.addColorStop(1, `rgba(${rgb},${(A * 0.55).toFixed(3)})`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }
}
