# PROMPT: Fix Animation Jank in ProjectsFeed.jsx — Make it Match BIG.dk

## ROLE & GOAL

You are a senior frontend engineer specializing in high-fidelity web animations. Your task is to **rewrite the animation logic** in `components/ProjectsFeed.jsx` so that the "click to expand project" animation is smooth and cinematically identical to [BIG.dk](https://big.dk) — no jank, no jump, no competing transitions.

Do NOT change any business logic, API calls, filtering, mobile portal, drag-to-scroll, or layout structure. Only fix what is described below.

---

## TECH STACK

- Next.js 16 (App Router), React 19
- GSAP `^3.14.2` + `@gsap/react ^2.1.2` (CustomEase, ScrollTrigger registered)
- Framer Motion `^12.38.0`
- Tailwind CSS v4
- `lenis ^1.3.19` for smooth scroll

---

## ROOT CAUSE ANALYSIS — READ CAREFULLY

There are **5 specific bugs** causing the jank. Fix ALL of them.

---

### BUG #1 — CSS `transition` fights Framer Motion FLIP (HIGHEST IMPACT)

**Location:** `<style jsx global>` block, class `.big-project-image-box`

```css
/* CURRENT — BROKEN */
.big-project-image-box {
  transition:
    width 0.78s cubic-bezier(0.45, 0, 0.55, 1),
    height 0.78s cubic-bezier(0.45, 0, 0.55, 1),
    max-height 0.78s cubic-bezier(0.45, 0, 0.55, 1);
}
```

**Why it breaks:** Framer Motion `layoutId` uses the FLIP technique — it reads the element's `getBoundingClientRect()`, overrides its dimensions to match the target, then applies a counter-transform. While Framer Motion is tweening `transform: scale()/translate()`, the CSS `transition: width/height` also fires simultaneously on the same element, creating a double-animation that causes a visible jump.

**Fix:** Remove ALL CSS transitions from `.big-project-image-box`. Framer Motion owns this element entirely.

```css
/* FIXED */
.big-project-image-box {
  /* no transition — Framer Motion layoutId handles all motion */
}
```

---

### BUG #2 — GSAP leaves stale `transform`/`opacity` on the element Framer Motion needs to FLIP

**Location:** `handleSelectProject` callback

```js
// CURRENT — INCOMPLETE CLEANUP
const handleSelectProject = useCallback((project) => {
  if (!project) return;
  window.history.pushState(null, '', `/projects/${project._id}`);
  gsap.killTweensOf(containerRef.current);
  gsap.killTweensOf('.big-project-thumb-shell');
  // ...
}, []);
```

**Why it breaks:** The GSAP ScrollTrigger animation runs `gsap.fromTo(imageBlock, { y: 150, opacity: 0 }, { y: 0, opacity: 1, ... })` on `.project-image` (the direct parent of the `motion.div[layoutId]`). GSAP writes inline `transform: translateY()` and `opacity` on that element. When the user clicks before the scroll animation fully resolves, Framer Motion calls `getBoundingClientRect()` on the layoutId element to measure its origin — but the parent's GSAP-applied transform shifts the bounding rect, making Framer Motion calculate a wrong start position → the image flies in from the wrong place.

**Fix:** Before setting expanded state, forcibly clear GSAP inline styles from ALL potentially affected elements:

```js
const handleSelectProject = useCallback((project) => {
  if (!project) return;
  window.history.pushState(null, '', `/projects/${project._id}`);

  // Kill all tweens first
  gsap.killTweensOf(containerRef.current);
  gsap.killTweensOf('.big-project-thumb-shell');

  // ✅ NEW: Clear stale GSAP inline transforms so Framer Motion FLIP measures correctly
  const projectRow = document.getElementById(`project-${project._id}`);
  if (projectRow) {
    const imageBlock = projectRow.querySelector('.project-image');
    const infoBlock = projectRow.querySelector('.project-info');
    if (imageBlock) gsap.set(imageBlock, { clearProps: 'transform,opacity,y,x' });
    if (infoBlock) gsap.set(infoBlock, { clearProps: 'transform,opacity,y,x' });
  }

  setExpandedProjectIds(prev => {
    const next = new Set(prev);
    next.add(project._id);
    return next;
  });
}, []);
```

---

### BUG #3 — `layout={!isExpanded}` toggling causes instant wrapper resize

**Location:** The main `motion.div` wrapper in the `.map()` loop

```jsx
/* CURRENT — BROKEN */
<motion.div
  key={project._id || index}
  id={`project-${project._id}`}
  layout={!isExpanded}   // ← flips from true to false on same render tick as expand
  className={`...`}
  transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
>
```

**Why it breaks:** When `isExpanded` becomes `true`, `layout` is simultaneously set to `false`. This means Framer Motion **instantly stops** tracking the wrapper's layout change — the wrapper jumps to `w-full h-[75vh]` with no animation, while the `layoutId` image inside still tries to animate smoothly. These two motions are desynced and create a jarring snap.

**Fix:** Remove the `layout` prop entirely from this wrapper. Instead, control the wrapper height transition via a CSS `transition` (separate from the layoutId element — no conflict since the wrapper is not the layoutId element):

```jsx
/* FIXED */
<div
  key={project._id || index}
  id={`project-${project._id}`}
  style={{
    transition: 'height 0.78s cubic-bezier(0.45, 0, 0.55, 1)',
  }}
  className={`${isMobilePortal
    ? 'relative w-full h-0 min-h-0 z-50 my-0 overflow-visible pointer-events-none'
    : isExpanded
      ? 'relative w-full h-[75vh] md:h-[75vh] z-50 my-0'
      : 'relative w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1800px] flex justify-center items-center max-w-[1600px] h-auto my-2'
  }`}
>
```

> Note: Using a plain `<div>` (not `motion.div`) for the wrapper avoids ALL Framer Motion layout tracking conflicts on this level. The `layoutId` animation on the image inside is the only Framer Motion actor needed here.

---

### BUG #4 — Container height jumps instantly, misaligning the FLIP measurement

**Location:** The expanded container className in the map loop

```jsx
isExpanded
  ? 'relative w-full h-[75vh] md:h-[75vh] z-50 my-0'
```

**Why it breaks:** `h-[75vh]` is applied as a Tailwind class that changes `height` from `auto` → `75vh` on the same render that triggers the FLIP. `height: auto` cannot be CSS-transitioned. Even with `transition-all duration-500` Tailwind class, `auto` → fixed value doesn't tween, so the container snaps instantly. Framer Motion's FLIP then tries to animate the image inside a container that already has its final size → bounds calculation is off.

**Fix:** Use an explicit `height: 0` → `height: 75vh` transition (not `auto` → `75vh`) by controlling height through a ref:

```jsx
// Add a ref for height tracking
const expandedHeightRef = useRef({});

// In the wrapper div style:
style={{
  height: isExpanded ? '75vh' : expandedHeightRef.current[project._id] || 'auto',
  transition: isExpanded ? 'height 0.78s cubic-bezier(0.45, 0, 0.55, 1)' : 'none',
  overflow: 'hidden',
}}
```

Or, simpler: wrap the expand container in a fixed-height shell that pre-allocates the space before the FLIP fires:

```jsx
// Before setting expandedProjectIds, set a data-height attribute
// so CSS can pre-allocate space via a height already known to the browser
```

The simplest working fix compatible with your existing code: add `will-change: height` and use `max-height` transition instead of `height`:

```jsx
isExpanded
  ? 'relative w-full z-50 my-0 overflow-hidden'  // no explicit height class
  style={{ maxHeight: isExpanded ? '75vh' : '0', transition: 'max-height 0.78s cubic-bezier(0.45, 0, 0.55, 1)' }}
```

---

### BUG #5 — Mismatched easing between wrapper and image creates desync

**Location:** Two separate transition configs

```jsx
// Wrapper motion.div:
transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}

// layoutId image (in InlineProjectDetail):
transition={{ duration: 0.78, ease: [0.45, 0, 0.55, 1] }}
```

**Why it breaks:** `type: "spring"` does not respect `duration` as an exact value — a spring with `bounce: 0.2` overshoots and settles according to physics, typically landing slightly after or before 0.8s. Meanwhile the image tween is exact 0.78s. This timing desync makes the image arrive while the wrapper is still settling → they don't feel like one unified motion.

**Fix:** Use identical easing for both. Since you're removing `motion.div` wrapper (Bug #3 fix), this is automatically resolved. For the `layoutId` image, the correct BIG.dk-style easing is a fast-out, slow-in bezier:

```jsx
// In InlineProjectDetail, on the motion.div with layoutId:
transition={{
  duration: 0.72,
  ease: [0.76, 0, 0.24, 1],  // matches BIG.dk's feel: fast start, smooth deceleration
}}

// In the collapsed thumbnail motion.div with layoutId:
transition={{
  duration: 0.72,
  ease: [0.76, 0, 0.24, 1],
}}
```

Both `layoutId` elements (collapsed thumbnail and expanded detail) **must have the same `transition` config** for Framer Motion FLIP to work correctly.

---

## ADDITIONAL POLISH — Make it feel like BIG.dk

After fixing the 5 bugs above, apply these polish items:

### P1 — Add `will-change: transform` to layoutId elements

```jsx
// On the motion.div with layoutId in the thumbnail (collapsed state):
style={{ willChange: 'transform' }}

// On the motion.div with layoutId in InlineProjectDetail:
style={{ willChange: 'transform' }}
```

This pre-promotes the element to its own compositor layer, preventing repaint during the FLIP.

### P2 — Disable GSAP ScrollTrigger for the row that is being expanded

When a project expands, GSAP's ScrollTrigger `toggleActions: 'play none none reverse'` can re-fire on scroll during the animation. Disable the trigger for the expanding row:

```js
// In handleSelectProject, after clearing props:
ScrollTrigger.getAll()
  .filter(t => t.trigger === projectRow)
  .forEach(t => t.kill());
```

### P3 — `overflow: hidden` on the thumbnail wrapper during collapse-to-expand

BIG.dk's thumbnail appears to "burst" out from the grid position. Ensure the parent `.big-project-thumb-shell` has `overflow: hidden` (it already does) and that GSAP's velocity scale CSS var is reset to `1` before the FLIP starts:

```js
// In handleSelectProject:
gsap.set(containerRef.current, { '--project-velocity-scale': 1 });
```

### P4 — Delay text fade-in until image FLIP completes

In `InlineProjectDetail`, the info/description panels have `transition={{ delay: 1.4, duration: 0.6 }}`. This is correct — text should appear AFTER the image settles. Keep this as-is.

### P5 — Prevent Lenis from interfering during expansion

If Lenis smooth scroll is active, the page may scroll during the FLIP, causing Framer Motion to measure moving bounds. Stop Lenis during the animation:

```js
// If you have a lenis ref or window.__lenis:
if (window.__lenis) window.__lenis.stop();
// Restart after animation:
setTimeout(() => { if (window.__lenis) window.__lenis.start(); }, 800);
```

---

## SUMMARY: EXACT CHANGES TO MAKE

| # | Location in file | What to change |
|---|---|---|
| 1 | `<style jsx global>` → `.big-project-image-box` | Remove all `transition:` declarations |
| 2 | `handleSelectProject` callback | Add `gsap.set(imageBlock, { clearProps: 'transform,opacity,y,x' })` before state update |
| 3 | `motion.div` wrapper in `.map()` | Replace with plain `<div>`, remove `layout` and `motion.div` wrapper transition |
| 4 | Expanded wrapper className | Switch from `h-[75vh]` Tailwind class to inline `style={{ maxHeight }}` with CSS transition |
| 5 | `layoutId` `transition` prop | Use `{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }` on BOTH collapsed and expanded instances |
| P1 | Both `layoutId` elements | Add `style={{ willChange: 'transform' }}` |
| P2 | `handleSelectProject` | Kill ScrollTrigger for the expanding row |
| P3 | `handleSelectProject` | Reset `--project-velocity-scale` to 1 |
| P5 | `handleSelectProject` | Pause Lenis during animation |

---

## CONSTRAINTS — DO NOT CHANGE

- Do NOT modify `MobileProjectDetail` component
- Do NOT modify `InlineProjectDetail` internal layout, drag logic, or gallery structure
- Do NOT modify the GSAP ScrollTrigger scroll-reveal animation on project rows
- Do NOT modify the velocity-based image scale effect (CSS var `--project-velocity-scale`)
- Do NOT modify API calls, filtering logic, or URL routing
- Do NOT modify the mobile portal (`createPortal`) logic
- Do NOT add new npm packages

---

## REFERENCE BEHAVIOR (BIG.dk)

When a user clicks a project on big.dk:
1. The thumbnail image **smoothly scales and repositions** to fill the center of the expanded detail view — no jump, no flash
2. The container around it grows at the same speed as the image
3. Text info fades in AFTER the image settles (~700ms delay)
4. The overall duration feels like ~700-750ms with a fast-out-slow-in easing (quick start, gentle arrival)
5. Scrolling away from the expanded project keeps it open (no auto-close)
6. The reverse (close) animation is the same curve in reverse

Your implementation already has the correct structural approach (layoutId, InlineProjectDetail, GSAP scroll effects). The bugs are entirely in the CSS/transition layer conflicting with Framer Motion's FLIP internals.
