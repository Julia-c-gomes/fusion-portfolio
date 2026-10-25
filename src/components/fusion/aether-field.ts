/**
 * Plasma particle network — a typed, mobile-friendly port of the
 * "AetherFlow" hero canvas. Changes from the original:
 *  - neighbour search uses a spatial grid (O(n) instead of O(n²))
 *  - particle count scales with screen area and device class
 *  - lines are batched into a few alpha buckets (4 strokes per frame, not hundreds)
 *  - colour shifts from aether violet to ember as the plasma "heats"
 *  - optional swirl around a centre point (the confined plasma)
 */

export type FieldParams = {
  heat: number // 0..1: violet → ember, faster
  swirl: number // 0..1: tangential flow around (cx, cy)
  push: number // radial impulse (shockwave), px/s
  alpha: number // overall visibility
  cx: number
  cy: number
}

const VIOLET = [169, 124, 255]
const EMBER = [255, 170, 96]
const BUCKETS = 4

export class AetherField {
  private xs: Float32Array
  private ys: Float32Array
  private vx: Float32Array
  private vy: Float32Array
  private size: Float32Array
  private n: number
  private w = 0
  private h = 0
  private linkDist = 120
  private grid = new Map<number, number[]>()
  private paths: Path2D[] = []

  private still: boolean

  constructor(w: number, h: number, lowPower: boolean, still: boolean) {
    this.still = still
    const area = w * h
    this.n = Math.round(Math.min(lowPower ? 55 : 130, Math.max(28, area / (lowPower ? 15000 : 11000))))
    this.xs = new Float32Array(this.n)
    this.ys = new Float32Array(this.n)
    this.vx = new Float32Array(this.n)
    this.vy = new Float32Array(this.n)
    this.size = new Float32Array(this.n)
    this.resize(w, h, true)
  }

  resize(w: number, h: number, reseed = false) {
    const sx = this.w ? w / this.w : 1
    const sy = this.h ? h / this.h : 1
    this.w = w
    this.h = h
    this.linkDist = Math.max(80, Math.min(140, Math.min(w, h) * 0.16))
    for (let i = 0; i < this.n; i++) {
      if (reseed) {
        this.xs[i] = Math.random() * w
        this.ys[i] = Math.random() * h
        const a = Math.random() * Math.PI * 2
        const s = 6 + Math.random() * 14
        this.vx[i] = Math.cos(a) * s
        this.vy[i] = Math.sin(a) * s
        this.size[i] = 0.8 + Math.random() * 1.6
      } else {
        this.xs[i] *= sx
        this.ys[i] *= sy
      }
    }
  }

  step(dt: number, p: FieldParams, mouse: { x: number; y: number; active: boolean }) {
    if (this.still) return
    const speed = 1 + p.heat * 1.6
    const mr = 150
    for (let i = 0; i < this.n; i++) {
      let x = this.xs[i]
      let y = this.ys[i]
      let dx = this.vx[i] * speed
      let dy = this.vy[i] * speed

      const rx = x - p.cx
      const ry = y - p.cy
      const d = Math.hypot(rx, ry) || 1
      if (p.swirl > 0) {
        // tangential flow, strongest near the core
        const f = (p.swirl * 70 * Math.min(1, 260 / d))
        dx += (-ry / d) * f
        dy += (rx / d) * f * 0.45
      }
      if (p.push !== 0) {
        dx += (rx / d) * p.push
        dy += (ry / d) * p.push
      }
      if (mouse.active) {
        const mx = x - mouse.x
        const my = y - mouse.y
        const md = Math.hypot(mx, my)
        if (md < mr && md > 0.1) {
          const f = ((mr - md) / mr) * 260
          dx += (mx / md) * f
          dy += (my / md) * f
        }
      }

      x += dx * dt
      y += dy * dt
      // wrap rather than bounce, so swirling particles flow continuously
      if (x < -20) x += this.w + 40
      else if (x > this.w + 20) x -= this.w + 40
      if (y < -20) y += this.h + 40
      else if (y > this.h + 20) y -= this.h + 40
      this.xs[i] = x
      this.ys[i] = y
    }
  }

  draw(ctx: CanvasRenderingContext2D, p: FieldParams) {
    if (p.alpha <= 0.01) return
    const t = Math.min(1, Math.max(0, p.heat))
    const r = Math.round(VIOLET[0] + (EMBER[0] - VIOLET[0]) * t)
    const g = Math.round(VIOLET[1] + (EMBER[1] - VIOLET[1]) * t)
    const b = Math.round(VIOLET[2] + (EMBER[2] - VIOLET[2]) * t)

    // bucket particles into grid cells of linkDist
    const cell = this.linkDist
    const cols = Math.ceil((this.w + 40) / cell) + 1
    this.grid.clear()
    for (let i = 0; i < this.n; i++) {
      const key = Math.floor((this.ys[i] + 20) / cell) * cols + Math.floor((this.xs[i] + 20) / cell)
      const list = this.grid.get(key)
      if (list) list.push(i)
      else this.grid.set(key, [i])
    }

    for (let k = 0; k < BUCKETS; k++) this.paths[k] = new Path2D()
    const ld2 = cell * cell
    for (let i = 0; i < this.n; i++) {
      const cxI = Math.floor((this.xs[i] + 20) / cell)
      const cyI = Math.floor((this.ys[i] + 20) / cell)
      for (let oy = 0; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (oy === 0 && ox < 0) continue // visit each neighbouring cell pair once
          const list = this.grid.get((cyI + oy) * cols + cxI + ox)
          if (!list) continue
          for (const j of list) {
            if (oy === 0 && ox === 0 && j <= i) continue
            const dx = this.xs[i] - this.xs[j]
            const dy = this.ys[i] - this.ys[j]
            const d2 = dx * dx + dy * dy
            if (d2 > ld2) continue
            const strength = 1 - Math.sqrt(d2) / cell
            const bucket = Math.min(BUCKETS - 1, Math.floor(strength * BUCKETS))
            const path = this.paths[bucket]
            path.moveTo(this.xs[i], this.ys[i])
            path.lineTo(this.xs[j], this.ys[j])
          }
        }
      }
    }

    ctx.lineWidth = 1
    for (let k = 0; k < BUCKETS; k++) {
      ctx.strokeStyle = `rgba(${r},${g},${b},${(((k + 0.5) / BUCKETS) * 0.32 * p.alpha).toFixed(3)})`
      ctx.stroke(this.paths[k])
    }

    ctx.fillStyle = `rgba(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 20)},${(0.85 * p.alpha).toFixed(3)})`
    ctx.beginPath()
    for (let i = 0; i < this.n; i++) {
      ctx.moveTo(this.xs[i] + this.size[i], this.ys[i])
      ctx.arc(this.xs[i], this.ys[i], this.size[i], 0, Math.PI * 2)
    }
    ctx.fill()
  }
}
