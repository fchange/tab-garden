import { useEffect, useRef } from 'react';

import type { PaletteDefinition } from '../types/settings';

interface WaveBackgroundProps {
  palette: PaletteDefinition;
  accentColor: string;
  paused: boolean;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const TARGET_FRAME_MS = 1000 / 30;
const MAX_DEVICE_PIXEL_RATIO = 1.5;

function hexToRgb(hex: string): RgbColor {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function lerpRgb(from: RgbColor, to: RgbColor, t: number): RgbColor {
  return {
    r: Math.round(from.r + (to.r - from.r) * t),
    g: Math.round(from.g + (to.g - from.g) * t),
    b: Math.round(from.b + (to.b - from.b) * t),
  };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Perlin noise (matches p5.js output) ───────────────────

const PERM = new Uint8Array(512);
const GRAD: [number, number][] = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

(function initPerm() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }

function gradDot(idx: number, x: number, y: number) {
  const g = GRAD[idx & 7];
  return g[0] * x + g[1] * y;
}

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[X] + Y];
  const ab = PERM[PERM[X] + Y + 1];
  const ba = PERM[PERM[X + 1] + Y];
  const bb = PERM[PERM[X + 1] + Y + 1];

  const nx0 = lerp(gradDot(aa, xf, yf), gradDot(ba, xf - 1, yf), u);
  const nx1 = lerp(gradDot(ab, xf, yf - 1), gradDot(bb, xf - 1, yf - 1), u);
  return lerp(nx0, nx1, v);
}

// Multi-octave noise — mirrors p5.noise with noiseDetail(lod, falloff)
function p5Noise(x: number, y: number): number {
  const lod = 2;       // ceil(1.7)
  const falloff = 1.3;
  let sum = 0;
  let amp = 1;
  let totalAmp = 0;
  for (let i = 0; i < lod; i++) {
    sum += (noise2D(x, y) + 1) / 2 * amp;
    totalAmp += amp;
    amp *= falloff;
    x *= 2;
    y *= 2;
  }
  return sum / totalAmp; // returns [0, 1]
}

// ── Mountain ──────────────────────────────────────────────

interface Mountain {
  alpha: number;
  y: number;      // px from top
  offset: number; // unique noise offset, constant
  t: number;      // animation time (incremented per frame)
}

function createMountains(canvasH: number): Mountain[] {
  // p5 order: i=0 is bottom (alpha 255, lowest y=height-0)
  // i=4 is top (alpha 55, highest y=height-200)
  // Drawn in order 0→4, so top layers paint over bottom layers.
  const mtn: Mountain[] = [];
  for (let i = 0; i < 5; i++) {
    mtn.push({
      alpha: 255 - 50 * i,
      y: canvasH - 50 * i,
      offset: 100 + Math.random() * 100,
      t: 0,
    });
  }
  return mtn;
}

// ── Component ─────────────────────────────────────────────

export function WaveBackground({ palette, accentColor, paused }: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 0 });

  // Palette transition for bg
  const fromBgRef = useRef(hexToRgb(palette.bg));
  const toBgRef = useRef(hexToRgb(palette.bg));
  const bgTransRef = useRef(1);

  // Wave color transition
  const fromWaveRef = useRef(hexToRgb(accentColor));
  const toWaveRef = useRef(hexToRgb(accentColor));
  const waveTransRef = useRef(1);

  const pausedRef = useRef(paused);
  const mtnRef = useRef<Mountain[]>([]);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Palette bg transition
  useEffect(() => {
    const t = bgTransRef.current;
    fromBgRef.current = lerpRgb(fromBgRef.current, toBgRef.current, t);
    toBgRef.current = hexToRgb(palette.bg);
    bgTransRef.current = 0;
  }, [palette.bg]);

  // accentColor transition
  useEffect(() => {
    const t = waveTransRef.current;
    fromWaveRef.current = lerpRgb(fromWaveRef.current, toWaveRef.current, t);
    toWaveRef.current = hexToRgb(accentColor);
    waveTransRef.current = 0;
  }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (dt: number, advanceMountains: boolean) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      const size = sizeRef.current;

      // Re-seed mountains on resize
      if (w !== size.width || h !== size.height || dpr !== size.dpr) {
        sizeRef.current = { width: w, height: h, dpr };
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mtnRef.current = createMountains(h);
      }

      // Advance palette transitions (30fps baseline)
      const transitionDelta = 0.032 * (dt * 30 / 1000);
      bgTransRef.current = Math.min(1, bgTransRef.current + transitionDelta);
      waveTransRef.current = Math.min(1, waveTransRef.current + transitionDelta);
      const bgCol = lerpRgb(fromBgRef.current, toBgRef.current, bgTransRef.current);
      const waveCol = lerpRgb(fromWaveRef.current, toWaveRef.current, waveTransRef.current);

      ctx.clearRect(0, 0, w, h);
      canvas.style.background = `rgb(${bgCol.r},${bgCol.g},${bgCol.b})`;

      const mtn = mtnRef.current;
      for (let i = 0; i < mtn.length; i++) {
        const m = mtn[i];

        ctx.beginPath();
        ctx.moveTo(0, h);

        let xoff = 0;
        for (let x = 0; x <= w + 25; x += 25) {
          const n = p5Noise(xoff + m.offset, m.t + m.offset);
          const yoff = n * 200;
          ctx.lineTo(x, m.y - yoff);
          xoff += 0.08;
        }

        ctx.lineTo(w + 100, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        ctx.fillStyle = `rgba(${waveCol.r},${waveCol.g},${waveCol.b},${m.alpha / 255})`;
        ctx.fill();

        if (advanceMountains) {
          // Normalize to 30fps: at 30fps dt≈33.3ms → increment=0.005
          m.t += 0.005 * (dt * 30 / 1000);
        }
      }

      return bgTransRef.current < 1 || waveTransRef.current < 1;
    };

    let lastFrameTime = 0;
    let lastDrawTime = performance.now();

    const render = (now: number) => {
      if (lastFrameTime && now - lastFrameTime < TARGET_FRAME_MS) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(100, now - lastDrawTime);
      lastDrawTime = now;
      lastFrameTime = now;

      const transitionsPending = draw(dt || TARGET_FRAME_MS, !pausedRef.current);

      if (!pausedRef.current || transitionsPending) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(render);

    const resizeListener = () => {
      sizeRef.current = { width: 0, height: 0, dpr: 0 };

      if (!pausedRef.current || rafRef.current) return;
      draw(TARGET_FRAME_MS, false);
    };
    window.addEventListener('resize', resizeListener);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener('resize', resizeListener);
    };
  }, [accentColor, palette.bg, paused]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ background: palette.bg, zIndex: 0 }}
    />
  );
}
