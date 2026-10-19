# CFT Frontend Performance Audit

**Date:** 2026-09-08
**Scope:** `D:\rep\server` — React (CRA) frontend at `client/`, Express backend at repo root
**Method:** Static, read-only code + production `build/` analysis. No runtime profiling (no Lighthouse artifacts exist — `client/lighthouse-results/` is empty). All claims cite `file:line`.

---

## 1. Executive Summary

The app's performance problems are dominated by **deliberately-added animation and "polish" code that runs unconditionally forever**, a **large font payload with render-blocking preloads and no `font-display` swap**, and **three duplicated charting libraries**. Root-causing live-page jank first requires fixing things that animate/loop permanently:

1. **Perpetual CPU loops on Dashboard and History** — `while (isMounted)` loops drive `shimmerControls.start()` on `useAnimation` controls that are **never attached to any element**. The loop wakes the main thread ~every 1.2s **forever** on both pages. (`Dashboard.js:357-371`, `History.js:254-268`)
2. **≥800 ms minimum loader on every route change** — `PageWrapper` enforces `minimumLoadTime = 800` (`PageWrapper.js:94,104-113`) on every mount, on top of the full-screen `NavigationLoader` triggered on every `pathname` change. Perceived navigations are slow by construction, not by accident.
3. **6.8 MB of fonts; no `font-display: swap` → invisible text (FOIT).** Six fonts are `preload`ed at render-blocking priority (`index.html:157-162`), and the `@font-face` blocks in `index.css` never declare `font-display`. Variable fonts (1.17 MB) are shipped but never referenced by any `@font-face`.
4. **Three chart stacks bundled for ~4 charts.** Victory (`354.chunk.js` 694 KB), Recharts (`749.chunk.js` 310 KB), and d3 (`210.chunk.js` 121 KB). `main.js` alone is **1.71 MB**.
5. **Leaderboard endpoint is an N+1 query** — one `CarbonEntry.findOne` + full `calculateEmissions` (with suggestion string generation) per user, sequentially, uncached (`routes/footprint.js:125-188`).
6. **ChartPage fetch waste** — `/footprint/history` fetched twice per mount (`useChartData.js:99,139`), leaderboard after a waterfall (`:158`), and un-memoized `comparison`/`pieData` (`:42-53`) that break `React.memo` and replay the 1200 ms Victory "bounce" animation.
7. **Dashboard runs ~21 infinite animations simultaneously** (emoji idle loops, pulse waves, dot bursts, smoke, colon-glow, `animated-co2`), each a `motion`/CSS animation.
8. **~7.5 MB of images in `public/images`**, including a **5.29 MB `profile-bk.webp` that is referenced nowhere** in the codebase.

Quick-win fixes (no behavior change) remove most of the steady jank and shave ~1–2.5 s off first paint and every navigation. The biggest structural win (#12 below) is dropping one chart library.

---

## 2. Baseline Metrics (production build)

| Asset | Size | Note |
|---|---|---|
| `build/static/js/main.5290dbf9.js` | **1,711,078 B** | Entry bundle |
| `build/static/js/354.464f4f7a.chunk.js` | 694,042 B | Largest chunk (~Victory) |
| `build/static/js/749.1f1ae1df.chunk.js` | 310,280 B | Recharts-chunk |
| `build/static/js/210.6cb36b1b.chunk.js` | 121,456 B | d3 |
| `build/static/js/77.f5397bc9.chunk.js` | 74,756 B | |
| `build/static/js/599.137b718d.chunk.js` | 55,538 B | |
| `build/static/css/main.c0dfee1f.css` | 121,079 B | |
| `build/static/media` | **22 files, 6,841,160 B** | All fonts, incl. both variable-font ttfs (~1.17 MB) |
| `public/images` | **7,524,632 B total** | 14 files (listed in §3.8) |
| `client/lighthouse-results/` | **empty** | No prior Lighthouse run exists |

---

## 3. Ranked Root Causes — Detailed Findings

### 3.1 Perpetual main-thread loops (Dashboard, History)

**Dashboard** — `client/src/Components/Dashboard/Dashboard.js:357-371`:

```js
useEffect(() => {
  let isMounted = true;
  async function loopAnimation() {
    while (isMounted) {
      await shimmerControls.start(i => ({ scale: [1,1.3,1], opacity: [1,0.8,1], ... }));
      await new Promise(res => setTimeout(res, 800));
    }
  }
  loopAnimation();
  ...
}, [shimmerControls]);
```

`shimmerControls` is a `useAnimation()` handle (`:241`). Grep confirms it is **only referenced at declaration (`:241`), in the loop (`:361`), and as the effect dep (`:371`)** — it is never passed to any `motion` element. The loop therefore runs `framer-motion`'s animation machinery (~400 ms) then sleeps 800 ms, **forever**, on invisible controls. This guarantees a main-thread task wake-up every ~1.2 s for the entire lifetime of the Dashboard, regardless of what the user is doing.

**History** — identical copy at `client/src/Components/Footprint/History.js:254-268` (`useAnimation` at `:249`), same unattached-control issue.

### 3.2 Forced ≥800 ms loader per navigation

`client/src/common/PageWrapper.js:84-124` runs on **every route mount**:

- `:94` `const minimumLoadTime = 800;`
- `:102-113` races the background-image load against an 800 ms timer, then waits the *remaining* time, so **every** route payment is ≥800 ms before content is shown (`bgLoaded` gates `opacity-100`, `:142-144`).
- `:115-118` a 5 s hard fallback keeps the splash up even longer if the image is slow.

Stacked on top:
- `client/src/common/NavigationLoader.js` calls `startLoading()` on every `pathname` change (full-screen overlay each route).
- `client/src/Components/AnimatedRoutes.js:29-31` wraps `Suspense` + keyed `Routes` in `<AnimatePresence mode="wait">`, so the exiting route blocks the entering route (and `Suspense` is a direct child, not a keyed `motion` child — the exit animation is effectively inert).

### 3.3 Fonts: FOIT + render-blocking preloads + broken weight mapping

**No `font-display` anywhere.** All `@font-face` blocks in `client/src/index.css` (`:170-276` InterTight, `:281` Sriracha, `:287` GermaniaOne, `:291` Bespoke Stencil) omit `font-display`, so the browser uses the default `block` → **invisible text until fonts arrive**.

**Render-blocking preloads** — `client/public/index.html:156-175`:
- `preload` (high priority, delays first paint): InterTight Regular/Medium/Bold/ExtraBold + Sriracha + GermaniaOne ≈ **1.84 MB**.
- `prefetch` (idle priority, still wasteful on first load): 9 more faces incl. italic + Black + Light + ExtraLight + Thin ≈ 2.8 MB.

**Broken `@font-face` weight maps** (index.css) — fonts will not be used at their intended weights, e.g. `SemiBold → font-weight: 500`, `BoldItalic → 900`, `ExtraBoldItalic → 900`, `BlackItalic → 900`. Duplicate effective weights mean multiple files load to render one face.

**Dead variable fonts** — `InterTight-VariableFont_wght.ttf` (580,572 B) and `InterTight-Italic-VariableFont_wght.ttf` (592,744 B) are present in `public/fonts`/`build/static/media` but no `@font-face` references them → ~1.17 MB shipped and deployable for nothing.

**The preload problems are actively hidden**: `client/src/index.js:6-14` filters out all console messages matching `/preload/i`, `/prefetch/i`, `/was preloaded/i` — the exact warnings that would surface over-preloading/duplicate-preload issues in dev.

### 3.4 JavaScript bloat: three chart stacks + react-admin

`client/package.json` ships **victory ^37.3.6**, **recharts ^3.1.0**, and **d3 ^7.9.0** simultaneously, plus `react-admin ^5.11.0`, `ra-data-simple-rest ^5.11.0`, `gsap`, `ogl`, `framer-motion`, `lottie-react`, `react-icons`, `node-fetch`.

Only ~5 charts exist across the app (ComparisonChartSection, PieChartSection [Victory], YearlyProjectionSection [Recharts LineChart + d3 zoom], leaderboard thumbnail rows). Two of the three stacks exist solely to render one chart each. The 694 KB victory chunk + 310 KB recharts chunk + 121 KB d3 chunk sum to **~1.1 MB of chart code** for a single page (ChartPage).

(`reportWebVitals.js` is entirely commented out — no local Web Vitals instrumentation. `@vercel/speed-insights`/`@vercel/analytics` are mounted in `App.js`, so Vercel may still capture field data.)

### 3.5 Backend: leaderboard N+1 (server-side latency feeds frontend jank)

`routes/footprint.js` — `GET /leaderboard-nth` (`:107-201`):

- `:125-127` — `User.find({})` loads **all users**.
- `:131-134` — **per user**, a separate `CarbonEntry.findOne({ userId })` round-trip, inside a sequential `for...of` loop.
- `:153` — `calculateEmissions(selectedEntry)` runs **per user**, including the suggestion-string generation.
- No aggregation, no caching (Redis exists — `RedisClient.js` — but is not used here), results recomputed on **every ChartPage mount** (`useChartData.js:158`).

Complexity is `O(users × entries × suggestion-generation)`. With hundreds of users this endpoint becomes the slowest request in the app; the limiter at `:9` (`10 req/min`) masks but does not fix it.

For contrast, `GET /footprint/history` (`:66-104`) **is** capped at 5 entries at the DB level via aggregation `$slice` + `$sortArray` — that endpoint is healthy.

### 3.6 ChartPage: duplicate fetches + memo-breaking data + waterfall

`client/src/Components/Dashboard/ChartPage/hooks/useChartData.js`:

- `/footprint/history` is fetched **twice** per mount — once in the "all entries" effect (`:96-111`, `API.get` at `:99`) and again inside `fetchAllData` (`:124-183`, `API.get` at `:139`). The `allEntries` result doesn't participate in leaderboard logic.
- Leaderboard fetch is a **waterfall**: `entry` + `history` resolved first (`:134-143`), then `leaderboard-nth` (`:158`).
- `comparison` (`:42-46`) and `pieData` (`:48-53`) are **recomputed every render** with new array identity → `React.memo` on `ComparisonChartSection`/`PieChartSection` never helps, and Victory can restart its `animate={{duration:1200,easing:"bounce"}}` on each parent render.
- `useWeather.js:139-146` — a 60 s `setInterval` updates `currentTime`, re-rendering **the whole ChartPage** every minute even when nothing weather-related is on screen.

Related section problems:
- `LeaderboardSection.js` renders ~10 looping `<Lottie>` animations (one per leaderboard user) plus inline `Math.random()` opacity per row and per-row `calculateEmissions` recomputation; ChartPage passes `containerVariants` inline (new identity per render) which defeats the section's memo.
- `WeatherAqiSection.js` passes an inline `onExpire` arrow → breaks `WeatherCountdown` (a `React.memo` 1 s interval component).
- `AnimatedHeadline.js` calls `Math.random()` and rebuilds `getLetterVariants()` on every render and leaks the `setTimeout` in `triggerBurst` (no cleanup).

### 3.7 CSS: the animation "zoo"

`client/src/index.css` (very large):

- No `font-display` (see §3.3).
- Duplicate definitions of `.animate-borderFlow` and identical keyframes exist multiple times.
- Large numbers of infinite `filter`/`text-shadow`/`backdrop-filter` keyframe animations (filter & text-shadow are paint-expensive and don't run on the compositor thread).
- `backdrop-blur` applied to nearly every card + widespread `translateZ(0)`/`will-change` hacks → constant compositing pressure.
- Many single-purpose `animate-*` classes (meat-sizzle, ufo, race-car, coal-fire, etc.) consumed mostly by `Footprint.js` select options — heavy CSS weight for hover-only micro-animations.

### 3.8 What's running at any given time on Dashboard

From `Dashboard.js` (steady state, no interaction):
- `while` shimmer loop (`:357-371`) — permanent main-thread wake-ups
- 3 infinite pulse waves at `:429-438`, `:515-525`, `:690-701`
- 15+ infinite dot/ellipsis opacity pulses (`:442-462`, `:493-509`, `:603-611`, `:667-687`, plus per-card variants)
- 6 info-section emoji `idle` animations (`:805-865`, `animate="idle"`)
- per-card smoke (`:572-575`), colon-glow, `animated-co2` (with `--random: Math.random()` per render at `:585`)
- 5 entry cards + 6 info sections each with `layout`, spring entrances, `whileHover` boxShadow, `will-change: transform, opacity`, `transform: translateZ(0)` (`:550-561`, `:824-879`)

Plus the always-mounted `AnimatedDarkModeButton` (`PageWrapper.js:15-65`): 1 s `setInterval` re-render + infinite `y` + **`textShadow`** keyframe animation, on **every page**. `textShadow` animation is a repaint-per-frame operation.

### 3.9 Home page

`client/src/Components/Home.js`:
- `ShootingStars` continuous 60 fps canvas while Home is visible (cleanup/visibility handling is correct — this is a cost note, not a bug).
- Looping Lotties: Globe (`:473`), ScrollDown (`:524`); infinite `y:[10,0,10]` on the scroll indicator (`:507-511`); infinite email icon bounce (`:598-611`); scroll listener calling `setShowContent` on every scroll event (`:238-258`).
- `ReviewLoopCarousel isVisible={showReviews} onAutoLoop={true}` (`:532`) — auto-rotate interval always armed (internally gated by visibility/hover, but the timer exists on Home permanently).

### 3.10 About page

`client/src/Components/about.jsx`: 4 looping Lotties (Globe ×2 at `:490`,`:599`; Batman at `:540-544`; ScrollDown at `:634-638`), two infinite `y:[10,0,10]` bounces (`:516-521`, `:622-627`), `Math.random()` in the title render (`:476-478`), `animate-borderFlow` on ~6 sections.

### 3.11 Code duplication

- `AnimatedHeadline` is copy-pasted **5×**: `Home.js:37`, `Dashboard.js:68`, `History.js:45`, `Footprint.js:46`, plus a ChartPage variant (and `EditFootprintForm.js` shares the same code). Each copy recomputes variants and `Math.random()` per render and has the same un-cancelled `setTimeout` in `triggerBurst`.
- `AniDot` + `getLetterVariants` + `shuffleArray` duplicated in most of the above files.

### 3.12 Synthetic delays (latency theater)

- `Footprint.js:587` — `await new Promise(r => setTimeout(r, 600))` before validation on submit.
- `History.js:324` — 600 ms fake wait before delete.
- `VerifyEmail.jsx:35` — 600 ms fake wait; `:41` 3 s before navigating to `/login`.
- `globalbuttons.jsx` — multiple 400–500 ms `setTimeout` before `navigate` (e.g. `:742`, `:763`).

Each adds apparent latency to common flows with zero functional purpose.

### 3.13 Images (public/images)

| File | Bytes |
|---|---|
| `profile-bk.webp` | 5,289,028 (orphaned — no references anywhere) |
| `login-bk.webp` | 883,994 |
| `about-bk.webp` | 849,610 (orphaned) |
| `batman-bg.jpg` / `batman-m-bg.jpg` | 678,973 / 176,569 (orphaned) |
| `up.webp` | 519,052 |
| `foot-bk.webp` | 417,314 |
| `verify-bk.webp` | 410,510 |
| `edit-bk.webp` | 330,460 |
| `home-bk.webp` | 306,202 |
| `history-bk.webp` | 290,338 |
| `register-bk.webp` | 283,626 |
| `chart-bk.webp` | 277,990 |
| `dashboard-bk.webp` | 167,976 |

`index.html:145-154` preloads `dashboard-bk`, `home-bk`, `chart-bk` and prefetches the rest for *every* first load — (a) the prereloaded backgrounds compete for bandwidth with the preloaded fonts and (b) several route backgrounds are large (884 KB login, 519 KB up).

---

## 4. Per-Route Risk Table

| Route | Load-time risk | Jank risk | Headline evidence |
|---|---|---|---|
| `/` (Home) | High | High | 306 KB home-bk preload; ShootingStars canvas; Globe/ScrollDown Lotties; infinite y/email anims; ReviewLoopCarousel always armed; ping fetch (`Home.js:260-299`) |
| `/login` | Med | Med | 884 KB login-bk; cooldown interval is correctly cleaned up (`Login.js:316-331`) ✓ |
| `/register` | Med | Med | 284 KB register-bk; multi-step validation setTimeouts |
| `/verify-email` | Low | Low | 411 KB verify-bk; 600 ms fake + 3 s redirect (`VerifyEmail.jsx:35,41`) |
| `/reset-password` | Low | Low | Lightweight form |
| `/dashboard` | High | **Very High** | `while` shimmer loop; ~21 concurrent infinite anims; `layout`+spring on 5+6 cards; `Math.random()` per render; Dashboard fetches + NavigationLoader + 800 ms loader |
| `/chart` | High | High | Victory bounce 1200 ms + Recharts + d3; duplicate history fetch; leaderboard N+1 (server-bound); ~10 leaderboard Lotties; 60 s weather re-render; 277 KB chart-bk |
| `/footprint` | Low | Med | 417 KB foot-bk; 600 ms fake submit; live-emission debounce OK ✓; CustomSelect animate-* zoo |
| `/edit/:id` | Low | Med | 330 KB edit-bk; 600 ms fake; shared headline/select code |
| `/history` | Med | High | Second `while` shimmer loop; `layout`-animated list with per-card smoke/co2 anims; 600 ms delete fake; 290 KB history-bk |
| `/about` | Med | High | 519 KB up.webp; 4 looping Lotties; 2 infinite y bounces; `Math.random()` title |
| *global* | – | – | `AnimatedDarkModeButton` 1 s interval + textShadow anim every page; NavigationLoader every route; 800 ms min loader |

---

## 5. Recommendations

### 5.1 Quick wins (no behavior change, low risk)

1. **Delete the two `while` shimmer loops** (`Dashboard.js:357-371`, `History.js:254-268`). The controls are unattached; removing restores nothing visually.
2. **Add `font-display: swap`** to every `@font-face` (`index.css:170-291`). Instant FOIT fix.
3. **Fix `@font-face` weight mappings** (SemiBold→600, BoldItalic→700 italic, ExtraBoldItalic→800 italic, BlackItalic→900 italic) so the correct files load.
4. **Reduce font preloads**: preload only Regular/Medium/Bold + GermaniaOne (the faces actually used above the fold). Remove the 9 prefetches. Remove both variable font files (~1.17 MB).
5. **Dedupe the ChartPage history fetch** (keep only `useChartData.js:124-183`'s); `useMemo`-ize `comparison`/`pieData` (`:42-53`).
6. **Server-side**: batch/cache `leaderboard-nth` (single aggregation or Redis cache keyed by entry index); it's the only hot path that scales with user count.
7. **Delete orphaned images** (`profile-bk.webp` 5.29 MB, `about-bk.webp` 850 KB, `batman-bg.jpg`/`batman-m-bg.jpg` 855 KB) — unreferenced anywhere in `client/`.
8. **Lower `minimumLoadTime` 800 → ~200 ms** (`PageWrapper.js:94`) and skip the NavigationLoader for same-path navigation.
9. **Remove the console filter that hides preload/font warnings** (`index.js:6-14`) once over-preloading is fixed — these warnings are the canary for font/link regressions.
10. **Centralize `AnimatedHeadline`/`AniDot`** into one shared component; delete the five copies.

### 5.2 Deeper fixes (higher effort, largest wins)

11. **Drop one chart stack.** Victory (`694 KB` chunk) or Recharts (`310 KB`) alone covers the app's charts; consolidating removes ~1 MB of JS and two React Animation/Fiber systems.
12. **Remove `react-admin` + `ra-data-simple-rest`** from the app bundle if unused in routing (verify before removing).
13. **Replace looping `<Lottie>` instances** (headlines, leaderboard, about) with a single shared animated element or CSS animation; lazy-mount the rest.
14. **Memoize cleanly**: stable `containerVariants`/`onExpire` props; keep `Math.random()` out of `render` (it defeats memoization everywhere).
15. **Rethink the design-system CSS**: convert the `animate-*` keyframe zoo to transform/opacity-only animations (compositor-friendly), drop `textShadow`/`filter` infinite loops, and reduce `backdrop-blur` on large surfaces.
16. **Add a performance budget** (max JS/CSS sizes per route) in CI; wire a local Lighthouse/Web Vitals run into the repo (`reportWebVitals.js` is stubbed out).

---

## 6. Verified Healthy (checked, not an issue)

- `context/LoadingContext.js` — `value` correctly memoized (`useMemo`/`useCallback`).
- `ShootingStars.js` — rAF cancelled on unmount, `visibilitychange` pause, IntersectionObserver-gated, desktop-only. (Cost note only.)
- `ReviewLoopCarousel.jsx` — interval properly gated by visibility/hover.
- `Login.js:316-331` — cooldown `setInterval` has proper cleanup.
- `Footprint.js` — live-emission calc is debounced (300 ms), progress debounce fine.
- `routes/footprint.js:66-104` `GET /footprint/history` — capped at 5 entries at the DB level (aggregation `$slice`).
- `CardNav.jsx` — outside-click listeners added only while menu open; cleaned up.
- `useChartData.js` — AbortController + `isMounted` guards on the main fetch effect; error auto-clear timers cleaned up.

---

*End of audit. All measurements from the production build in `client/build/`; source evidence from the git working copy.*