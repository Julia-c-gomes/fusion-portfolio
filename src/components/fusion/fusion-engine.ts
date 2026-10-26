import { MoleculeField } from "./molecule-field"

/**
 * Scroll-driven controlled-fusion scene on a single 2D canvas.
 *
 * `progress` runs 0 → 7, one unit per stage:
 *   0 ignition (one deuterium nucleus)  1 deuterium settles  2 tritium enters
 *   3 plasma heats and starts orbiting  4 magnetic confinement (tokamak rings)
 *   5 fusion → helium-4 + flash         6 neutron escapes, 17.6 MeV shockwave
 *   7 sustained burn
 *
 * Expensive work (nucleus textures, starfield) is pre-rendered to offscreen
 * canvases once; each frame is a handful of drawImage calls plus the particle field.
 */

type Palette = { core: string; mid: string; edge: string; deep: string; halo: [number, number, number] }

const PALETTES = {
  deuterium: { core: "#fff3dc", mid: "#ffb15c", edge: "#ff6b4a", deep: "#7c1f3d", halo: [255, 120, 80] },
  tritium: { core: "#ffeefa", mid: "#ff8fc0", edge: "#b45cff", deep: "#2e1466", halo: [200, 110, 255] },
  helium: { core: "#ffffff", mid: "#fff0d2", edge: "#ffb15c", deep: "#d94a3a", halo: [255, 190, 120] },
  neutron: { core: "#ffffff", mid: "#cfeaff", edge: "#7cc8ff", deep: "#24438f", halo: [124, 200, 255] },
} satisfies Record<string, Palette>

type Orb = { base: HTMLCanvasElement; tex: HTMLCanvasElement; shade: HTMLCanvasElement; halo: HTMLCanvasElement }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const bell = (x: number, c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w))
const TAU = Math.PI * 2

/** Deterministic PRNG so textures look the same on every load */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function canvas(size: number) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  return c
}

function makeOrb(S: number, p: Palette, seed: number): Orb {
  const r = S / 2
  const rand = rng(seed)

  // 1. Fixed shading: lit from upper-left
  const base = canvas(S)
  let g = base.getContext("2d")!
  let grad = g.createRadialGradient(S * 0.38, S * 0.34, S * 0.02, r, r, r * 1.05)
  grad.addColorStop(0, p.core)
  grad.addColorStop(0.32, p.mid)
  grad.addColorStop(0.72, p.edge)
  grad.addColorStop(1, p.deep)
  g.fillStyle = grad
  g.beginPath()
  g.arc(r, r, r * 0.995, 0, TAU)
  g.fill()

  // 2. Rotating plasma granulation (mottled cells + fine sparkle)
  const tex = canvas(S)
  g = tex.getContext("2d")!
  g.save()
  g.beginPath()
  g.arc(r, r, r * 0.99, 0, TAU)
  g.clip()
  g.globalCompositeOperation = "lighter"
  const cells = Math.round(S * 0.5)
  for (let i = 0; i < cells; i++) {
    const a = rand() * TAU
    const d = Math.sqrt(rand()) * r
    const x = r + Math.cos(a) * d
    const y = r + Math.sin(a) * d
    const cr = S * (0.01 + rand() * rand() * 0.05)
    const cg = g.createRadialGradient(x, y, 0, x, y, cr)
    cg.addColorStop(0, `rgba(${p.halo[0]},${Math.min(255, p.halo[1] + 60)},${Math.min(255, p.halo[2] + 40)},${0.05 + rand() * 0.12})`)
    cg.addColorStop(1, "rgba(0,0,0,0)")
    g.fillStyle = cg
    g.fillRect(x - cr, y - cr, cr * 2, cr * 2)
  }
  const sparks = Math.round((S * S) / 30)
  for (let i = 0; i < sparks; i++) {
    const a = rand() * TAU
    const d = Math.sqrt(rand()) * r
    const s = (0.35 + rand() * rand() * 1.6) * (S / 512)
    g.fillStyle = `rgba(255,${235 + Math.round(rand() * 20)},${210 + Math.round(rand() * 45)},${(0.05 + rand() * rand() * 0.55).toFixed(3)})`
    g.fillRect(r + Math.cos(a) * d, r + Math.sin(a) * d, s, s)
  }
  g.restore()

  // 3. Fixed limb darkening + soft white rim (the "atmosphere" edge)
  const shade = canvas(S)
  g = shade.getContext("2d")!
  grad = g.createRadialGradient(S * 0.42, S * 0.4, r * 0.35, r, r, r)
  grad.addColorStop(0, "rgba(10,4,20,0)")
  grad.addColorStop(0.75, "rgba(10,4,20,0.05)")
  grad.addColorStop(1, "rgba(10,4,20,0.42)")
  g.fillStyle = grad
  g.beginPath()
  g.arc(r, r, r, 0, TAU)
  g.fill()
  grad = g.createRadialGradient(r, r, r * 0.86, r, r, r)
  grad.addColorStop(0, "rgba(255,255,255,0)")
  grad.addColorStop(0.85, "rgba(255,240,230,0.16)")
  grad.addColorStop(1, "rgba(255,255,255,0.34)")
  g.fillStyle = grad
  g.beginPath()
  g.arc(r, r, r, 0, TAU)
  g.fill()

  // 4. Additive halo
  const H = Math.round(S * 0.75)
  const halo = canvas(H)
  g = halo.getContext("2d")!
  const hr = H / 2
  grad = g.createRadialGradient(hr, hr, 0, hr, hr, hr)
  const [hR, hG, hB] = p.halo
  grad.addColorStop(0, `rgba(${hR},${hG},${hB},0.55)`)
  grad.addColorStop(0.25, `rgba(${hR},${hG},${hB},0.22)`)
  grad.addColorStop(0.6, `rgba(${hR},${hG},${hB},0.06)`)
  grad.addColorStop(1, `rgba(${hR},${hG},${hB},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, H, H)

  return { base, tex, shade, halo }
}

export type FusionLayout = { ax: number; ay: number; R: number; maxDim: number }

export class FusionEngine {
  private ctx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private dpr = 1
  private raf = 0
  private last = 0
  private time = 0
  private target = 0
  private p = 0
  private spin = 0
  private orbs: Partial<Record<keyof typeof PALETTES, Orb>> = {}
  private bg: HTMLCanvasElement | null = null
  private field: MoleculeField | null = null
  private mouse = { x: 0, y: 0, active: false }
  private lowPower: boolean
  private visible = true

  private el: HTMLCanvasElement
  private reducedMotion: boolean

  constructor(el: HTMLCanvasElement, reducedMotion: boolean) {
    this.el = el
    this.reducedMotion = reducedMotion
    this.ctx = el.getContext("2d", { alpha: false })!
    const cores = navigator.hardwareConcurrency ?? 4
    this.lowPower = window.innerWidth < 768 || cores <= 4

    // The hero nucleus first, so the first frame is ready fast; the rest when idle.
    const S = this.lowPower ? 384 : 640
    this.orbs.deuterium = makeOrb(S, PALETTES.deuterium, 7)
    const later = () => {
      this.orbs.tritium = makeOrb(S, PALETTES.tritium, 11)
      this.orbs.helium = makeOrb(S, PALETTES.helium, 23)
      this.orbs.neutron = makeOrb(Math.round(S / 3), PALETTES.neutron, 31)
    }
    if ("requestIdleCallback" in window) window.requestIdleCallback(later, { timeout: 600 })
    else setTimeout(later, 60)

    this.resize()
    window.addEventListener("resize", this.resize)
    window.addEventListener("pointermove", this.onPointer, { passive: true })
    window.addEventListener("pointerleave", this.onLeave)
    document.addEventListener("visibilitychange", this.onVisibility)
    this.raf = requestAnimationFrame(this.frame)
  }

  setProgress(p: number) {
    if (!Number.isFinite(p)) return
    this.target = p
    if (this.reducedMotion) this.p = p
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener("resize", this.resize)
    window.removeEventListener("pointermove", this.onPointer)
    window.removeEventListener("pointerleave", this.onLeave)
    document.removeEventListener("visibilitychange", this.onVisibility)
  }

  /** Where the nucleus sits; cards and HUD are laid out around this. */
  layout(): FusionLayout {
    const desktop = this.w >= 1024
    const m = Math.min(this.w, this.h)
    return {
      ax: desktop ? this.w * 0.63 : this.w * 0.5,
      ay: desktop ? this.h * 0.52 : this.h * 0.54,
      R: desktop ? m * 0.27 : Math.min(this.w * 0.38, this.h * 0.24),
      maxDim: Math.hypot(this.w, this.h),
    }
  }

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return
    this.mouse.x = e.clientX
    this.mouse.y = e.clientY
    this.mouse.active = true
  }
  private onLeave = () => {
    this.mouse.active = false
  }
  private onVisibility = () => {
    this.visible = !document.hidden
    if (this.visible) {
      this.last = 0
      cancelAnimationFrame(this.raf)
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  private resize = () => {
    const w = Math.max(1, window.innerWidth)
    const h = Math.max(1, window.innerHeight)
    // Mobile URL-bar show/hide only changes height slightly; skip the expensive rebuild.
    if (this.w === w && Math.abs(this.h - h) < 140 && this.bg) {
      this.h = h
      this.el.height = Math.round(h * this.dpr)
      this.el.style.height = `${h}px`
      return
    }
    this.w = w
    this.h = h
    this.dpr = Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.5 : 2)
    this.el.width = Math.round(w * this.dpr)
    this.el.height = Math.round(h * this.dpr)
    this.el.style.width = `${w}px`
    this.el.style.height = `${h}px`
    this.bg = this.makeBackground()
    if (this.field) this.field.resize(w, h)
    else this.field = new MoleculeField(w, h, this.lowPower, this.reducedMotion)
  }

  private makeBackground() {
    const c = document.createElement("canvas")
    c.width = Math.round(this.w * this.dpr)
    c.height = Math.round(this.h * this.dpr)
    const g = c.getContext("2d")!
    g.scale(this.dpr, this.dpr)
    g.fillStyle = "#05040b"
    g.fillRect(0, 0, this.w, this.h)
    const neb = (x: number, y: number, r: number, col: string) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      gr.addColorStop(0, col)
      gr.addColorStop(1, "rgba(5,4,11,0)")
      g.fillStyle = gr
      g.fillRect(0, 0, this.w, this.h)
    }
    neb(this.w * 0.15, this.h * 0.1, Math.max(this.w, this.h) * 0.6, "rgba(90,50,170,0.22)")
    neb(this.w * 0.9, this.h * 0.95, Math.max(this.w, this.h) * 0.55, "rgba(160,50,90,0.14)")
    // faint hexagonal (graphene-like) lattice, fading toward the edges
    const a = this.w < 768 ? 22 : 30 // C–C spacing in px
    const hx = Math.sqrt(3) * a
    g.strokeStyle = "rgba(190,175,255,0.055)"
    g.lineWidth = 1
    g.beginPath()
    for (let row = -1; row * 1.5 * a < this.h + a; row++) {
      for (let col = -1; col * hx < this.w + hx; col++) {
        const cx = col * hx + (row % 2 ? hx / 2 : 0)
        const cy = row * 1.5 * a
        for (let k = 0; k < 3; k++) {
          const t0 = ((60 * k - 30) * Math.PI) / 180
          const t1 = ((60 * k + 30) * Math.PI) / 180
          g.moveTo(cx + a * Math.cos(t0), cy + a * Math.sin(t0))
          g.lineTo(cx + a * Math.cos(t1), cy + a * Math.sin(t1))
        }
      }
    }
    g.stroke()
    const vg = g.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.25, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.75)
    vg.addColorStop(0, "rgba(5,4,11,0)")
    vg.addColorStop(1, "rgba(5,4,11,0.85)")
    g.fillStyle = vg
    g.fillRect(0, 0, this.w, this.h)
    return c
  }

  private drawOrb(kind: keyof typeof PALETTES, x: number, y: number, r: number, alpha: number, rot: number, glow = 1) {
    const orb = this.orbs[kind]
    if (!orb || r < 0.5 || alpha <= 0.01) return
    const ctx = this.ctx
    ctx.globalAlpha = alpha
    ctx.globalCompositeOperation = "lighter"
    const hr = r * 2.7 * glow
    ctx.drawImage(orb.halo, x - hr, y - hr, hr * 2, hr * 2)
    ctx.globalCompositeOperation = "source-over"
    ctx.drawImage(orb.base, x - r, y - r, r * 2, r * 2)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.globalCompositeOperation = "lighter"
    ctx.drawImage(orb.tex, -r, -r, r * 2, r * 2)
    ctx.rotate(-rot * 1.7)
    ctx.globalAlpha = alpha * 0.45
    ctx.drawImage(orb.tex, -r, -r, r * 2, r * 2)
    ctx.restore()
    ctx.globalAlpha = alpha
    ctx.globalCompositeOperation = "source-over"
    ctx.drawImage(orb.shade, x - r, y - r, r * 2, r * 2)
    ctx.globalAlpha = 1
  }

  /** Tokamak field lines, drawn as back (upper) or front (lower) half for depth. */
  private drawRings(L: FusionLayout, a: number, front: boolean, heat: number) {
    if (a <= 0.01) return
    const ctx = this.ctx
    const tilt = -0.2
    const count = this.lowPower ? 4 : 6
    ctx.save()
    ctx.translate(L.ax, L.ay)
    ctx.rotate(tilt)
    ctx.globalCompositeOperation = "lighter"
    for (let i = 0; i < count; i++) {
      const rx = L.R * (1.55 + i * 0.22)
      const ry = rx * (0.24 + i * 0.012)
      const hot = 0.4 + 0.6 * heat
      ctx.strokeStyle = `rgba(${Math.round(169 + 80 * hot * (i % 2))},${Math.round(124 + 40 * hot)},${Math.round(255 - 120 * hot * (i % 2))},${(a * (0.42 - i * 0.04)).toFixed(3)})`
      ctx.lineWidth = i === 0 ? 1.6 : 1
      ctx.beginPath()
      if (front) ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI)
      else ctx.ellipse(0, 0, rx, ry, 0, Math.PI, TAU)
      ctx.stroke()
      // quasi-neutral plasma: on each field line one D/T ion (warm) and one
      // electron (cyan) circulate in opposite directions, as in the plasma current
      const w = this.time * (0.5 + i * 0.13)
      const particles: [number, number, string, string][] = [
        [(((w + i) % TAU) + TAU) % TAU, 7, "255,230,200", "255,150,90"],
        [(((-w * 1.6 + i + Math.PI) % TAU) + TAU) % TAU, 4.5, "220,248,255", "124,210,255"],
      ]
      for (const [th, size, c0, c1] of particles) {
        if (th < Math.PI !== front) continue
        const px = Math.cos(th) * rx
        const py = Math.sin(th) * ry
        const gr = ctx.createRadialGradient(px, py, 0, px, py, size)
        gr.addColorStop(0, `rgba(${c0},${(a * 0.95).toFixed(3)})`)
        gr.addColorStop(1, `rgba(${c1},0)`)
        ctx.fillStyle = gr
        ctx.fillRect(px - size, py - size, size * 2, size * 2)
      }
    }
    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
  }

  /**
   * A hydrogen-isotope atom has exactly one electron: one orbit, one dot.
   * `ionise` (0→1) breaks the orbit apart as the plasma strips the electron
   * away. Back half is drawn before the nucleus, front half after, for depth.
   */
  private drawElectron(x: number, y: number, nr: number, alpha: number, phase: number, ionise: number, front: boolean) {
    const a = alpha * (1 - ionise)
    if (a <= 0.01 || nr < 1) return
    const ctx = this.ctx
    const rx = nr * (1.34 + ionise * 2.2)
    const ry = rx * 0.36
    const th = (((this.time * 1.25 + phase) % TAU) + TAU) % TAU
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-0.38)
    ctx.strokeStyle = `rgba(200,236,255,${(0.34 * a).toFixed(3)})`
    ctx.lineWidth = 1.2
    ctx.setLineDash(ionise > 0.02 ? [3, 7] : [])
    ctx.beginPath()
    if (front) ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI)
    else ctx.ellipse(0, 0, rx, ry, 0, Math.PI, TAU)
    ctx.stroke()
    ctx.setLineDash([])
    if (th < Math.PI === front) {
      const px = Math.cos(th) * rx
      const py = Math.sin(th) * ry
      const size = Math.min(6, Math.max(3.5, nr * 0.025))
      ctx.globalCompositeOperation = "lighter"
      const gr = ctx.createRadialGradient(px, py, 0, px, py, size * 2.2)
      gr.addColorStop(0, `rgba(235,250,255,${a.toFixed(3)})`)
      gr.addColorStop(0.35, `rgba(124,210,255,${(a * 0.8).toFixed(3)})`)
      gr.addColorStop(1, "rgba(124,210,255,0)")
      ctx.fillStyle = gr
      ctx.fillRect(px - size * 2.2, py - size * 2.2, size * 4.4, size * 4.4)
      ctx.globalCompositeOperation = "source-over"
    }
    ctx.restore()
  }

  private frame = (now: number) => {
    if (!this.visible) return
    this.raf = requestAnimationFrame(this.frame)
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60
    this.last = now
    this.time += this.reducedMotion ? dt * 0.25 : dt
    // critically-damped follow of the scroll target → silky even on coarse scroll wheels
    if (!this.reducedMotion) this.p += (this.target - this.p) * (1 - Math.exp(-dt * 5.5))

    const P = this.p
    const L = this.layout()
    const R = L.R
    const ctx = this.ctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    if (this.bg) ctx.drawImage(this.bg, 0, 0, this.w, this.h)

    // ── scene parameters as smooth functions of P ─────────────────
    const s = (a: number, b: number) => smooth(a, b, P)
    const heat = s(2, 3) * (1 - 0.3 * s(5, 7))
    const rings = s(3, 4) * (1 - 0.65 * s(5, 6.3))
    const tEnter = s(1, 2)
    const sep = R * (1.55 * s(1, 2) - 0.3 * s(2, 3) - 0.45 * s(3, 4) - 0.8 * s(4, 4.55))
    const dR = R * (1 - 0.46 * s(0, 1) - 0.04 * s(1, 2) - 0.04 * s(2, 3) - 0.06 * s(3, 4))
    const tR = R * (0.5 - 0.06 * s(3, 4))
    const dtAlpha = 1 - s(4.42, 4.6)
    const omega = 0.9 * s(2, 3) + 2.4 * s(3, 4) + 4 * s(4, 4.5)
    const flash = P > 4.2 && P < 5 ? bell(P, 4.56, 0.09) : 0
    const heA = s(4.48, 4.68)
    const heR = R * (0.38 + 0.26 * s(4.5, 4.95) + 0.32 * s(6, 7))
    const shockT = (P - 4.55) / 1.1
    const pulse = 1 + 0.06 * Math.sin(this.time * 1.6) * s(6, 7)

    // orbit angle: spins up with heat, relaxes back to side-by-side when scrolling up
    const spinBlend = s(2, 3)
    this.spin += omega * dt * (this.reducedMotion ? 0.2 : 1)
    if (spinBlend < 1) {
      const nearest = Math.round(this.spin / TAU) * TAU
      this.spin += (nearest - this.spin) * (1 - spinBlend) * (1 - Math.exp(-dt * 4))
    }

    // ── plasma field ──────────────────────────────────────────────
    const push = shockT > 0 && shockT < 1 ? (1 - shockT) * 420 : 0
    const fp = { heat, swirl: heat * (0.5 + rings * 0.5), push, alpha: 0.55 + 0.45 * heat, cx: L.ax, cy: L.ay }
    this.field?.step(dt, fp, this.mouse)
    this.field?.draw(ctx, fp)

    // warm core glow grows with temperature
    const glowA = 0.08 + 0.2 * heat + 0.12 * heA
    const gg = ctx.createRadialGradient(L.ax, L.ay, 0, L.ax, L.ay, R * 2.9)
    gg.addColorStop(0, `rgba(255,120,80,${glowA.toFixed(3)})`)
    gg.addColorStop(1, "rgba(255,120,80,0)")
    ctx.globalCompositeOperation = "lighter"
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, this.w, this.h)
    ctx.globalCompositeOperation = "source-over"

    this.drawRings(L, rings, false, heat)

    // ── nuclei ────────────────────────────────────────────────────
    const ang = this.spin
    const ca = Math.cos(ang)
    const sa = Math.sin(ang) * 0.42 // orbit seen at an angle
    const dx = L.ax - (sep / 2) * ca
    const dy = L.ay - (sep / 2) * sa
    let tx = L.ax + (sep / 2) * ca
    const ty = L.ay + (sep / 2) * sa
    tx += (1 - tEnter) * (this.w - L.ax + tR * 3) // slides in from the right
    const rotD = this.time * 0.06
    // electrons: bound until the plasma heats past ionisation (stage 2→3)
    const ionise = s(2.15, 2.85)
    this.drawElectron(dx, dy, dR, dtAlpha, 0, ionise, false)
    if (tEnter > 0.001) this.drawElectron(tx, ty, tR, dtAlpha * tEnter, 2.1, ionise, false)
    // draw the one further "back" first
    const dFirst = sa <= 0
    const drawD = () => this.drawOrb("deuterium", dx, dy, dR, dtAlpha, rotD, 1 + heat * 0.4)
    const drawT = () => tEnter > 0.001 && this.drawOrb("tritium", tx, ty, tR, dtAlpha, -rotD * 1.3, 1 + heat * 0.4)
    if (dFirst) { drawD(); drawT() } else { drawT(); drawD() }
    this.drawElectron(dx, dy, dR, dtAlpha, 0, ionise, true)
    if (tEnter > 0.001) this.drawElectron(tx, ty, tR, dtAlpha * tEnter, 2.1, ionise, true)

    this.drawOrb("helium", L.ax, L.ay, heR * pulse, heA, this.time * 0.05, 1.15 + 0.35 * s(6, 7))

    // neutron escaping toward the upper right, with a fading trail
    const nq = s(5, 6)
    const nA = s(5, 5.12) * (1 - s(5.85, 6))
    if (nA > 0.01) {
      const dirX = Math.cos(-0.55)
      const dirY = Math.sin(-0.55)
      const dist = heR * 0.9 + nq * L.maxDim * 0.75
      const nx = L.ax + dirX * dist
      const ny = L.ay + dirY * dist
      const trail = Math.min(dist - heR, R * 2.2)
      const tg = ctx.createLinearGradient(nx, ny, nx - dirX * trail, ny - dirY * trail)
      tg.addColorStop(0, `rgba(170,220,255,${(0.7 * nA).toFixed(3)})`)
      tg.addColorStop(1, "rgba(124,200,255,0)")
      ctx.strokeStyle = tg
      ctx.lineWidth = R * 0.08
      ctx.lineCap = "round"
      ctx.globalCompositeOperation = "lighter"
      ctx.beginPath()
      ctx.moveTo(nx, ny)
      ctx.lineTo(nx - dirX * trail, ny - dirY * trail)
      ctx.stroke()
      ctx.globalCompositeOperation = "source-over"
      this.drawOrb("neutron", nx, ny, R * 0.13, nA, this.time, 1.4)
    }

    this.drawRings(L, rings, true, heat)

    // shockwave rings carrying the 17.6 MeV outward
    if (shockT > 0 && shockT < 1) {
      ctx.globalCompositeOperation = "lighter"
      for (let k = 0; k < 2; k++) {
        const q = clamp(shockT - k * 0.12)
        if (q <= 0) continue
        ctx.strokeStyle = `rgba(255,${200 - k * 40},${150 - k * 30},${((1 - q) * 0.5).toFixed(3)})`
        ctx.lineWidth = 2 + (1 - q) * 6
        ctx.beginPath()
        ctx.arc(L.ax, L.ay, heR + q * L.maxDim * 0.65, 0, TAU)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = "source-over"
    }

    // fusion flash — soft and slow (no strobing), dimmer with reduced motion
    if (flash > 0.01) {
      const fa = flash * (this.reducedMotion ? 0.3 : 0.65)
      const fg = ctx.createRadialGradient(L.ax, L.ay, 0, L.ax, L.ay, L.maxDim * 0.7)
      fg.addColorStop(0, `rgba(255,250,240,${fa.toFixed(3)})`)
      fg.addColorStop(0.25, `rgba(255,190,130,${(fa * 0.6).toFixed(3)})`)
      fg.addColorStop(1, "rgba(255,120,80,0)")
      ctx.globalCompositeOperation = "lighter"
      ctx.fillStyle = fg
      ctx.fillRect(0, 0, this.w, this.h)
      ctx.globalCompositeOperation = "source-over"
    }
  }
}
