/* Depth field: a subtle depth-cue canvas behind the content.
   Uses the shared requestAnimationFrame scheduler (one loop for scene, depth
   field and cursor). Pauses when the document is hidden. Reads scroll/pointer
   state in passive listeners and applies it once per frame — no layout reads
   inside scroll handlers. */
import { onFrame, setPaused } from "../scheduler";

interface DepthFieldState {
  vpx: number;
  vpy: number;
  phase: number;
  targetVpx: number;
  targetVpy: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let state: DepthFieldState = {
  vpx: 0,
  vpy: 0,
  phase: 0,
  targetVpx: 0,
  targetVpy: 0,
};
let lastScrollY = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let isReducedMotion = false;
let isMobile = false;
let dpr = 1;
let mounted = false;
let unsubFrame: (() => void) | null = null;

const N = 14;
const zNear = 1;
const zFar = 16;
const spreadFactor = 0.16;
const lerpK = 0.08;
const maxPointerOffset = 0.03;
const scrollSpeed = 0.004;
const vanishingYRatio = 0.42;

function drawDepthField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  d: { vpx: number; vpy: number; phase: number }
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#fff";

  const half = (sign: number) => {
    ctx.save();
    ctx.translate(0, d.vpy);
    ctx.scale(1, sign);
    ctx.translate(0, -d.vpy);
    const fh = sign === 1 ? h - d.vpy : d.vpy;

    for (let k = 0; k < N; k++) {
      const z =
        zNear +
        (((k - d.phase) % N + N) % N) * ((zFar - zNear) / N);
      const y = d.vpy + fh / z;
      ctx.globalAlpha = (0.05 + 0.1 / z) * (sign === 1 ? 1 : 0.5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const spread = w * spreadFactor;
    for (let m = -14; m <= 14; m++) {
      const xb = d.vpx + m * spread;
      ctx.globalAlpha = sign === 1 ? 0.07 : 0.035;
      ctx.beginPath();
      ctx.moveTo(d.vpx, d.vpy);
      ctx.lineTo(xb, d.vpy + fh);
      ctx.stroke();
    }
    ctx.restore();
  };

  half(1);
  half(-1);

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-in";
  const H = Math.max(d.vpy, h - d.vpy);
  const g = ctx.createLinearGradient(0, d.vpy - H, 0, d.vpy + H);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.5, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  const glowRadius = Math.max(w, h) * 0.6;
  const glow = ctx.createRadialGradient(d.vpx, d.vpy, 0, d.vpx, d.vpy, glowRadius);
  glow.addColorStop(0, "rgba(255,255,255,0.03)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function resize(): void {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.vpx = w * 0.5;
  state.vpy = h * vanishingYRatio;
  state.targetVpx = state.vpx;
  state.targetVpy = state.vpy;
  if (mounted) draw();
}

function draw(): void {
  if (!canvas || !ctx) return;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  drawDepthField(ctx, w, h, {
    vpx: state.vpx,
    vpy: state.vpy,
    phase: state.phase,
  });
}

function lerpState(): void {
  state.vpx += (state.targetVpx - state.vpx) * lerpK;
  state.vpy += (state.targetVpy - state.vpy) * lerpK;
}

function frameTask(now: number): void {
  if (document.hidden) return;
  lerpState();
  draw();
}

function onScroll(): void {
  /* No layout read here — just capture a number. The batched apply happens in the frame task. */
  lastScrollY = window.scrollY;
  if (!isReducedMotion && !isMobile) {
    state.phase = lastScrollY * scrollSpeed;
  }
}

function onPointerMove(e: PointerEvent): void {
  if (isReducedMotion || isMobile) return;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const px = (lastPointerX / w - 0.5) * 2;
  const py = (lastPointerY / h - 0.5) * 2;
  state.targetVpx = w * 0.5 + px * w * maxPointerOffset;
  state.targetVpy = h * vanishingYRatio + py * h * maxPointerOffset;
}

function onVisibilityChange(): void {
  if (!document.hidden && mounted) draw();
}

function onResize(): void {
  const wasMobile = isMobile;
  isMobile = window.matchMedia("(max-width: 860px)").matches;
  isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  resize();
}

export function initDepthField(): void {
  if (mounted) return;
  canvas = document.createElement("canvas");
  canvas.id = "depth-field";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.zIndex = String(0);
  canvas.style.pointerEvents = "none";
  document.body.prepend(canvas);
  ctx = canvas.getContext("2d", { alpha: true, desynchronized: true })!;
  isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  isMobile = window.matchMedia("(max-width: 860px)").matches;
  resize();
  if (!isReducedMotion && !isMobile) {
    unsubFrame = onFrame(frameTask);
  } else {
    draw();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibilityChange);
  mounted = true;
}

export function destroyDepthField(): void {
  if (!mounted) return;
  if (unsubFrame) { unsubFrame(); unsubFrame = null; }
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("resize", onResize);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  canvas?.remove();
  canvas = null;
  ctx = null;
  mounted = false;
}
