import React, { useEffect, useRef, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Earth exclusion circle ────────────────────────────────────────────────────
function getEarthRatios(w, h) {
  const asp = w / h;
  if (asp >= 1.6) return { cx: 0.50, cy: 0.50, r: 0.30 };
  if (asp >= 1.2) return { cx: 0.50, cy: 0.50, r: 0.32 };
  if (asp >= 0.8) return { cx: 0.50, cy: 0.48, r: 0.30 };
  return { cx: 0.50, cy: 0.45, r: 0.28 };
}
function computeEarth(w, h) {
  const { cx, cy, r } = getEarthRatios(w, h);
  return { x: w * cx, y: h * cy, r: h * r + 30 };
}
function insideEarth(x, y, e) {
  return Math.hypot(x - e.x, y - e.y) <= e.r;
}
function ptSegDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function segHitsEarth(ax, ay, bx, by, e) {
  return ptSegDist(e.x, e.y, ax, ay, bx, by) <= e.r;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 – AMBIENT STARFIELD  (680 tiny twinkling dots)
// ═══════════════════════════════════════════════════════════════════════════════
const SF_COLORS = [
  [255, 255, 255], [210, 228, 255], [255, 245, 210],
  [180, 210, 255], [230, 240, 255],
];

function buildStarfield(w, h, earth, count = 680) {
  const stars = [];
  for (let i = 0; i < count * 6 && stars.length < count; i++) {
    const x = rand(0, w), y = rand(0, h);
    if (insideEarth(x, y, earth)) continue;
    stars.push({
      x, y,
      size:  rand(0.25, 1.4),
      base:  rand(0.18, 0.72),
      rate:  rand(0.20, 1.10),
      phase: Math.random() * Math.PI * 2,
      color: SF_COLORS[randInt(0, SF_COLORS.length - 1)],
    });
  }
  return stars;
}

function drawStarfield(ctx, stars, t) {
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * s.rate + s.phase);
    const a  = clamp(s.base * tw, 0.05, 1);
    const [r, g, b] = s.color;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARBURST TWINKLES  (1–3 selected stars flare up with a cross sparkle)
// ═══════════════════════════════════════════════════════════════════════════════
// Each twinkle: { star (ref), life 0→1, duration (s) }
// life envelope: sin(life * PI) → smooth bell-curve fade in/out

const MAX_TWINKLES      = 5;
const TWINKLE_SCHED_MIN = 1000; // ms between new twinkle selections
const TWINKLE_SCHED_MAX = 3200;

function drawTwinkle(ctx, twinkle) {
  const { star, life } = twinkle;
  const env = Math.sin(life * Math.PI);          // 0 → 1 → 0 (bell)
  if (env < 0.01) return;

  const [r, g, b] = star.color;
  const baseSize  = star.size;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // ── 1. Bright halo glow around the star ────────────────────────────────────
  const haloR = baseSize * (6 + env * 10);
  const halo  = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, haloR);
  halo.addColorStop(0,    `rgba(255,255,255,${env * 0.90})`);
  halo.addColorStop(0.25, `rgba(${r},${g},${b},${env * 0.55})`);
  halo.addColorStop(0.60, `rgba(${r},${g},${b},${env * 0.18})`);
  halo.addColorStop(1,    `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(star.x, star.y, haloR, 0, Math.PI * 2);
  ctx.fill();

  // ── 2. Cross-shaped starburst arms ────────────────────────────────────────
  // Long axis (H + V) and short diagonal axis at half length
  const longLen  = baseSize * (8 + env * 22);
  const shortLen = longLen * 0.45;
  const armAlpha = env * 0.95;

  function drawArm(fromX, fromY, toX, toY) {
    const g2 = ctx.createLinearGradient(fromX, fromY, toX, toY);
    g2.addColorStop(0,    `rgba(255,255,255,${armAlpha})`);
    g2.addColorStop(0.35, `rgba(${r},${g},${b},${armAlpha * 0.65})`);
    g2.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.strokeStyle = g2;
    ctx.lineWidth   = clamp(baseSize * 0.9 * env, 0.3, 1.6);
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  }

  // Cardinal arms (H + V)
  drawArm(star.x - longLen, star.y, star.x + longLen, star.y);
  drawArm(star.x, star.y - longLen, star.x, star.y + longLen);
  // Diagonal arms (shorter)
  const d = shortLen * 0.707;
  drawArm(star.x - d, star.y - d, star.x + d, star.y + d);
  drawArm(star.x - d, star.y + d, star.x + d, star.y - d);

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 – MID DRIFTERS  (40 slowly-moving medium stars)
// ═══════════════════════════════════════════════════════════════════════════════
const MD_COLORS = [
  [200, 225, 255], [255, 250, 230], [180, 215, 255], [255, 255, 255],
];

function buildMidStars(w, h, earth, count = 40) {
  const stars = [];
  for (let i = 0; i < count * 8 && stars.length < count; i++) {
    const x = rand(0, w), y = rand(0, h);
    if (insideEarth(x, y, earth)) continue;
    const angle = Math.PI * 0.25 + rand(-0.2, 0.2);
    stars.push({
      x, y,
      size:  rand(0.8, 2.2),
      base:  rand(0.30, 0.70),
      rate:  rand(0.15, 0.60),
      phase: Math.random() * Math.PI * 2,
      speed: rand(0.04, 0.13),
      dx:    Math.cos(angle),
      dy:    Math.sin(angle),
      color: MD_COLORS[randInt(0, MD_COLORS.length - 1)],
    });
  }
  return stars;
}

function stepMidStars(stars, w, h, earth) {
  for (const s of stars) {
    s.x += s.dx * s.speed;
    s.y += s.dy * s.speed;
    if (s.x > w + 4) s.x = -4;
    if (s.y > h + 4) s.y = -4;
    if (s.x < -4)    s.x = w + 4;
    if (s.y < -4)    s.y = h + 4;
    if (insideEarth(s.x, s.y, earth)) { s.x = rand(0, w * 0.3); s.y = rand(0, h * 0.3); }
  }
}

function drawMidStars(ctx, stars, t) {
  for (const s of stars) {
    const tw = 0.60 + 0.40 * Math.sin(t * s.rate + s.phase);
    const a  = clamp(s.base * tw, 0.05, 1);
    const [r, g, b] = s.color;
    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
    glow.addColorStop(0, `rgba(${r},${g},${b},${a})`);
    glow.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.4})`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EARTH ATMOSPHERE  (soft pulsing halo drawn ABOVE the starfield layers)
// ═══════════════════════════════════════════════════════════════════════════════
function drawEarthAtmosphere(ctx, earth, t) {
  const pulse    = 0.88 + 0.12 * Math.sin(t * 0.35);
  const innerR   = earth.r * 0.92;
  const outerR   = earth.r * 1.45;

  // Outer diffuse blue halo
  const halo = ctx.createRadialGradient(earth.x, earth.y, innerR, earth.x, earth.y, outerR);
  halo.addColorStop(0,    `rgba(40, 130, 255, ${0.28 * pulse})`);
  halo.addColorStop(0.35, `rgba(20,  90, 200, ${0.14 * pulse})`);
  halo.addColorStop(0.70, `rgba(10,  55, 160, ${0.06 * pulse})`);
  halo.addColorStop(1,    `rgba(0,   20, 100, 0)`);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(earth.x, earth.y, outerR, 0, Math.PI * 2);
  ctx.fill();

  // Thin bright rim just at the Earth edge
  const rim = ctx.createRadialGradient(earth.x, earth.y, innerR * 0.97, earth.x, earth.y, earth.r * 1.06);
  rim.addColorStop(0,   `rgba(80, 160, 255, ${0.22 * pulse})`);
  rim.addColorStop(1,   `rgba(50, 120, 240, 0)`);
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(earth.x, earth.y, earth.r * 1.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 – SHOOTING STARS
// ═══════════════════════════════════════════════════════════════════════════════
const SS_LAYERS = [
  //  sMin, sMax, aMin, aMax, wMin, wMax, lMin, lMax, weight
  [1.8,  3.2,  0.55, 0.70, 0.6,  1.1,  90,  155, 2],
  [3.5,  6.0,  0.68, 0.88, 1.0,  1.8, 145,  225, 2],
  [6.5, 10.5,  0.82, 1.00, 1.6,  2.6, 200,  305, 1],
];
const SS_COLORS = [
  [255, 255, 255], [210, 230, 255], [230, 245, 255], [255, 248, 225],
];

function pickSSLayer() {
  const total = SS_LAYERS.reduce((s, l) => s + l[8], 0);
  let r = Math.random() * total;
  for (const l of SS_LAYERS) { r -= l[8]; if (r <= 0) return l; }
  return SS_LAYERS[1];
}

// Path-uniqueness thresholds
const MIN_ANGLE_DEG = 25;
const MIN_SPAWN_SEP = 130;

function spawnShootingStar(w, h, earth, active, maxTry = 60) {
  const [sMin, sMax, aMin, aMax, wMin, wMax, lMin, lMax] = pickSSLayer();
  const speed  = rand(sMin, sMax);
  const alpha  = rand(aMin, aMax);
  const lwidth = rand(wMin, wMax);
  const tlen   = rand(lMin, lMax);
  const color  = SS_COLORS[randInt(0, SS_COLORS.length - 1)];
  const fRate  = rand(0.10, 0.26);
  const fPhase = Math.random() * Math.PI * 2;

  function pickOrigin() {
    const roll = Math.random();
    if (roll < 0.36) return { sx: rand(0, w),       sy: rand(-18, -4) };       // top
    if (roll < 0.68) return { sx: rand(-18, -4),     sy: rand(0, h * 0.72) };  // left
    if (roll < 0.82) return { sx: rand(0, w * 0.30), sy: rand(0, h * 0.28) };  // top-left
    return               { sx: rand(w + 4, w + 18),  sy: rand(0, h * 0.45) };  // right (rare)
  }

  for (let attempt = 0; attempt < maxTry; attempt++) {
    const { sx, sy } = pickOrigin();
    const angle = Math.PI * 0.25 + rand(-0.23, 0.23); // 45° ± 13°
    const dx = Math.cos(angle), dy = Math.sin(angle);

    if (insideEarth(sx, sy, earth)) continue;
    // Spawn validation: reject if origin segment hits Earth
    const tailX = sx - dx * tlen, tailY = sy - dy * tlen;
    if (segHitsEarth(sx, sy, tailX, tailY, earth)) continue;

    // Path uniqueness: angular + positional separation
    const angleDeg = angle * 180 / Math.PI;
    const tooSimilar = active.some(a => {
      const ad = Math.atan2(a.dy, a.dx) * 180 / Math.PI;
      return (
        Math.abs(angleDeg - ad) < MIN_ANGLE_DEG &&
        Math.abs(sx - a.spawnX) < MIN_SPAWN_SEP
      );
    });
    if (tooSimilar) continue;

    return { x: sx, y: sy, spawnX: sx, dx, dy, speed, alpha, lwidth, tlen, color, fRate, fPhase };
  }
  return null;
}

function drawShootingStar(ctx, s, t) {
  const { x, y, dx, dy, tlen, lwidth, color, fRate, fPhase, alpha } = s;
  const tailX = x - dx * tlen, tailY = y - dy * tlen;
  const [r, g, b] = color;

  // Sparkling tip flicker
  const flicker  = 0.72 + 0.28 * Math.sin(t * fRate * 90 + fPhase);
  const tipAlpha = clamp(alpha * flicker, 0, 1);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Motion-blur ghost
  ctx.globalAlpha = 0.055;
  ctx.strokeStyle = `rgba(${r},${g},${b},1)`;
  ctx.lineWidth   = lwidth * 2.2;
  ctx.lineCap     = 'round';
  ctx.filter      = 'blur(2px)';
  ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(x, y); ctx.stroke();
  ctx.filter = 'none';
  ctx.globalAlpha = 1;

  // Main 5-stop gradient trail
  const grad = ctx.createLinearGradient(tailX, tailY, x, y);
  grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
  grad.addColorStop(0.30, `rgba(${r},${g},${b},${alpha * 0.15})`);
  grad.addColorStop(0.60, `rgba(${r},${g},${b},${alpha * 0.45})`);
  grad.addColorStop(0.85, `rgba(${r},${g},${b},${alpha * 0.82})`);
  grad.addColorStop(1,    `rgba(${r},${g},${b},${tipAlpha})`);
  ctx.strokeStyle = grad;
  ctx.lineWidth   = lwidth;
  ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(x, y); ctx.stroke();

  // Outer bloom
  const br   = lwidth * 10;
  const bloom = ctx.createRadialGradient(x, y, 0, x, y, br);
  bloom.addColorStop(0,   `rgba(${r},${g},${b},${tipAlpha * 0.28})`);
  bloom.addColorStop(0.5, `rgba(${r},${g},${b},${tipAlpha * 0.08})`);
  bloom.addColorStop(1,   `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = bloom;
  ctx.beginPath(); ctx.arc(x, y, br, 0, Math.PI * 2); ctx.fill();

  // White-hot inner core
  const cr   = lwidth * 3;
  const core  = ctx.createRadialGradient(x, y, 0, x, y, cr);
  core.addColorStop(0,    `rgba(255,255,255,${tipAlpha})`);
  core.addColorStop(0.45, `rgba(${r},${g},${b},${tipAlpha * 0.75})`);
  core.addColorStop(1,    `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.fill();

  // Micro sparkle cross at peak flicker
  if (flicker > 0.88) {
    const sl = lwidth * 4;
    ctx.strokeStyle = `rgba(255,255,255,${(flicker - 0.88) * 6})`;
    ctx.lineWidth   = lwidth * 0.5;
    ctx.beginPath();
    ctx.moveTo(x - sl, y); ctx.lineTo(x + sl, y);
    ctx.moveTo(x, y - sl); ctx.lineTo(x, y + sl);
    ctx.stroke();
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const MAX_SS       = 10;
const SPAWN_MIN_MS = 420;
const SPAWN_MAX_MS = 1700;

const SpaceCanvas = React.memo(function SpaceCanvas({ className = '' }) {
  // ── Responsive gate: no canvas on screens below md (768 px) ─────────────────
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const canvasRef = useRef(null);
  const stateRef  = useRef({
    starfield: [], midStars: [], shootingStars: [], twinkles: [],
    earth: null, rafId: null, spawnTimer: null, twinkleTimer: null,
    running: false, t0: null,
  });

  useEffect(() => {
    if (!isDesktop) return;          // skip entirely on small screens
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    const st  = stateRef.current;

    // ── Init / resize ────────────────────────────────────────────────────────
    function init() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      st.earth    = computeEarth(canvas.width, canvas.height);
      st.starfield = buildStarfield(canvas.width, canvas.height, st.earth);
      st.midStars  = buildMidStars(canvas.width, canvas.height, st.earth);
      st.twinkles  = [];
      // Remove shooting stars whose spawn segment now crosses Earth after resize
      st.shootingStars = st.shootingStars.filter(s => {
        const tx = s.x - s.dx * s.tlen, ty = s.y - s.dy * s.tlen;
        return !segHitsEarth(s.x, s.y, tx, ty, st.earth);
      });
    }
    init();

    // ── Twinkle scheduler ────────────────────────────────────────────────────
    function scheduleTwinkle() {
      clearTimeout(st.twinkleTimer);
      st.twinkleTimer = setTimeout(() => {
        if (!st.running || !st.starfield.length) { scheduleTwinkle(); return; }

        // How many new twinkles to add this cycle (1 or 2)
        const toAdd = Math.min(
          randInt(1, 3),
          MAX_TWINKLES - st.twinkles.length
        );

        // Build a set of indices already twinkling so we don't repeat
        const active = new Set(st.twinkles.map(tw => tw.idx));

        for (let n = 0; n < toAdd; n++) {
          // Pick a candidate star not already twinkling (max 20 tries)
          let idx;
          for (let i = 0; i < 20; i++) {
            const c = randInt(0, st.starfield.length - 1);
            if (!active.has(c)) { idx = c; break; }
          }
          if (idx === undefined) continue;

          active.add(idx);
          const duration = rand(1.0, 2.0); // seconds
          st.twinkles.push({ star: st.starfield[idx], idx, life: 0, duration });
        }

        scheduleTwinkle();
      }, rand(TWINKLE_SCHED_MIN, TWINKLE_SCHED_MAX));
    }

    // ── Spawn scheduler ──────────────────────────────────────────────────────
    function scheduleSpawn() {
      clearTimeout(st.spawnTimer);
      st.spawnTimer = setTimeout(() => {
        if (!st.running) return;
        if (st.shootingStars.length < MAX_SS) {
          const s = spawnShootingStar(
            canvas.width, canvas.height, st.earth, st.shootingStars
          );
          if (s) st.shootingStars.push(s);
        }
        scheduleSpawn();
      }, rand(SPAWN_MIN_MS, SPAWN_MAX_MS));
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    function tick(ts) {
      if (!st.running) return;
      // Anchor time so pausing the tab doesn't cause a huge jump on resume
      if (st.t0 === null) st.t0 = ts;
      const t  = (ts - st.t0) * 0.001;
      const w  = canvas.width, h = canvas.height;
      const { earth } = st;

      ctx.clearRect(0, 0, w, h);

      // L1 – starfield
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawStarfield(ctx, st.starfield, t);
      ctx.restore();

      // Starburst twinkles (drawn on top of starfield, before mid-drifters)
      // Advance lifecycle and remove finished twinkles
      const dt = 1 / 60; // approximate dt in seconds
      st.twinkles = st.twinkles.filter(tw => {
        tw.life += dt / tw.duration;
        return tw.life < 1;
      });
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const tw of st.twinkles) drawTwinkle(ctx, tw);
      ctx.restore();

      // L2 – mid drifters
      stepMidStars(st.midStars, w, h, earth);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawMidStars(ctx, st.midStars, t);
      ctx.restore();

      // L3 – shooting stars (NO Earth fading – continuous full trajectory)
      for (const s of st.shootingStars) {
        s.x += s.dx * s.speed;
        s.y += s.dy * s.speed;
      }
      const margin = 320;
      st.shootingStars = st.shootingStars.filter(s =>
        s.x > -margin && s.x < w + margin &&
        s.y > -margin && s.y < h + margin
      );
      for (const s of st.shootingStars) {
        drawShootingStar(ctx, s, t);
      }

      st.rafId = requestAnimationFrame(tick);
    }

    // ── Start / stop ──────────────────────────────────────────────────────────
    function start() {
      if (st.running) return;
      st.running = true;
      st.t0      = null;
      scheduleSpawn();
      scheduleTwinkle();
      st.rafId = requestAnimationFrame(tick);
    }

    function stop() {
      st.running = false;
      clearTimeout(st.spawnTimer);
      clearTimeout(st.twinkleTimer);
      if (st.rafId) { cancelAnimationFrame(st.rafId); st.rafId = null; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      st.shootingStars = [];
      st.twinkles = [];
    }

    // ── Visibility change – prevents burst spawning after tab switch ──────────
    function onVisibilityChange() {
      if (document.hidden) {
        // Pause the RAF but don't fully stop – avoids burst on return
        if (st.rafId) { cancelAnimationFrame(st.rafId); st.rafId = null; }
        clearTimeout(st.spawnTimer);
        clearTimeout(st.twinkleTimer);
        st.shootingStars = [];
        st.twinkles = [];
      } else if (st.running) {
        st.t0  = null;
        st.rafId = requestAnimationFrame(tick);
        st.spawnTimer   = setTimeout(scheduleSpawn,   rand(600, 1200));
        st.twinkleTimer = setTimeout(scheduleTwinkle, rand(400, 900));
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── IntersectionObserver (lazy load) ─────────────────────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? start() : stop(); },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    // Debounced resize
    let rTimer;
    const onResize = () => { clearTimeout(rTimer); rTimer = setTimeout(init, 120); };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onResize);
      clearTimeout(rTimer);
      clearTimeout(st.twinkleTimer);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;   // no canvas, no RAF, no memory on mobile

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ zIndex: 0 }}
    />
  );
});

export default SpaceCanvas;
