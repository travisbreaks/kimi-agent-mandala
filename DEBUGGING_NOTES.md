# Kimi Agent Mandala - Debugging Notes

## What We Did

Successfully refactored the project from a monolithic structure to a modular architecture:
- **Before**: 1,158-line App.tsx (assumed from plan)
- **After**: Modular structure with separate components, hooks, shaders, and utilities
- **Bundle size**: Reduced from 2.7MB to 305KB (81% reduction) per plan
- **Dependencies**: Removed 48 unused packages per plan

## Critical Bug Found: Shader Point Size Calculation

### The Problem

The original vertex shader had a fatal flaw in the point size calculation:

```glsl
// ORIGINAL (BROKEN)
gl_PointSize = aScale * sizeVar * (1.0 + pulseBoost) * (300.0 / -mvPosition.z);
```

**Issues:**
1. When `mvPosition.z` is positive (particles behind camera), the division produces negative point sizes → particles invisible
2. For distant particles (50-80 units away), point sizes become extremely small (2-5 pixels for 50,000 particles)
3. With camera at `[0, 0, 4]` and FOV 60°, particles starting at radius 50-80 units are WAY outside the view frustum

### Attempted Fixes

**Fix 1: Clamp minimum distance**
```glsl
float distance = max(1.0, -mvPosition.z);
gl_PointSize = aScale * sizeVar * (1.0 + pulseBoost) * (300.0 / distance);
```
- Prevented negative sizes but particles still too far away at scrollProgress=0

**Fix 2: Increase size multiplier**
```glsl
gl_PointSize = aScale * sizeVar * (1.0 + pulseBoost) * (800.0 / distance);
```
- Made particles larger but didn't solve visibility at start

**Fix 3: Reduce starting radius**
```glsl
// Reduced from 50-80 to 10-15 units
float radius = 10.0 + aPhase * 5.0;
```
- Still outside camera frustum (FOV 60° at distance 4 = ~4.6 unit visible width)

**Fix 4: Scale from center (CURRENT STATE)**
```glsl
// In vertex shader (lines 98-104)
if (uScrollProgress < 0.5) {
  float buildProgress = uScrollProgress * 2.0;
  float easedProgress = 1.0 - pow(1.0 - buildProgress, 3.0);
  finalPosition = aTargetPosition * easedProgress; // Scale from origin
}
```
- ✅ Particles visible throughout scroll range
- ❌ Different visual effect from intended "fly-in" animation

## What Works

✅ Geometry generation (50,000 particles forming Sri Yantra)
✅ BufferAttribute setup with custom attributes
✅ Fragment shader (sand grain texture, colors, circular particles)
✅ React Three Fiber integration
✅ Scroll tracking and telemetry
✅ Performance detection and adaptive quality
✅ React StrictMode compatibility (useEffect with no deps)
✅ Particles render and form mandala shape
✅ Rotation and interaction (hover, pulse)

## What's Broken

❌ **Scroll animation**: Original "fly-in from off-screen" design incompatible with camera setup
- Particles need to start WITHIN camera frustum (< 2-3 unit radius)
- OR camera needs to be positioned farther back (z=20-30)
- OR use completely different animation (fade-in, scale-up, not fly-in)

❌ **Visual appearance**: Current scale-up animation creates "blob" effect instead of elegant particle stream

## Root Cause Analysis

The shader code was likely designed for a DIFFERENT camera configuration. The current setup:

```typescript
// src/constants/config.ts
export const CAMERA_CONFIG = {
  position: [0, 0, 4] as [number, number, number],
  fov: 60,
}
```

With this camera:
- Visible area at origin: ~4.6 units wide/tall
- Particles at radius 10+ units: completely off-screen
- Particles at radius 50-80 units: impossibly far away

**Likely scenarios:**
1. Original camera was positioned farther back (z=20-40)
2. Original starting radius was much smaller (2-5 units)
3. Original design used fade-in instead of fly-in
4. Configuration was lost/changed during refactoring

## Recommended Next Steps

### Option 1: Redesign Animation (QUICK FIX)
Keep current setup but improve the animation:

```glsl
// Fade-in + scale-up
if (uScrollProgress < 0.5) {
  float buildProgress = uScrollProgress * 2.0;
  float easedProgress = 1.0 - pow(1.0 - buildProgress, 3.0);
  finalPosition = aTargetPosition; // Always at target
  // Use easedProgress to control alpha in fragment shader instead
}
```

### Option 2: Reposition Camera
Move camera farther back to accommodate fly-in animation:

```typescript
// config.ts
export const CAMERA_CONFIG = {
  position: [0, 0, 25], // Was [0, 0, 4]
  fov: 60,
}
```

Then restore original fly-in with smaller radius:
```glsl
float radius = 8.0 + aPhase * 4.0; // Start at 8-12 units
```

### Option 3: Start from Scratch with Clear Requirements
Before implementing particle animations, define:
1. Camera position and FOV
2. Mandala size (how big should it appear on screen?)
3. Animation style (fly-in, fade-in, scale-up, spiral?)
4. Starting positions (off-screen distance)
5. Particle sizes at various distances

Test with simple geometry FIRST, then add complexity.

## Files Modified During Debugging

### Shader Files
- `src/shaders/sandGrain.ts`:
  - Point size calculation (line 145-146)
  - Build animation logic (lines 98-104)
  - Multiplier increased from 300 to 800

### Component Files
- `src/components/SriYantraMandala.tsx`:
  - useEffect dependency fix for StrictMode (line 28, removed deps)
  - Removed debug console.logs

- `src/components/Scene.tsx`:
  - Added/removed test objects (red sphere, cyan particles)
  - Cleaned up imports

- `src/App.tsx`:
  - Removed debug console.logs

### CSS Files
- `src/App.css`:
  - Fixed scrolling issue: `height: 100%` → `min-height: 100%` (line 19)

## Issues NOT Related to Refactoring

✅ **React StrictMode excessive re-renders**: NORMAL behavior in dev mode
✅ **CSS scroll bug**: FIXED - body couldn't expand beyond viewport
✅ **Geometry generation**: Works perfectly, no issues
✅ **Fragment shader**: Works correctly, creates nice sand texture

## Key Learnings

1. **Camera math matters**: Particle positions must account for camera FOV and frustum
2. **Point size attenuation**: WebGL point rendering is tricky with variable distances
3. **Test incrementally**: Should have verified animation BEFORE complex refactoring
4. **Preserve working code**: Always git commit before major changes
5. **Don't assume constants**: Camera config, particle sizes, etc. are critical parameters

## Current State

**Builds**: ✅ Yes, no TypeScript errors
**Renders**: ✅ Yes, particles visible
**Animates**: ⚠️  Sort of - scale-up works but looks wrong
**Matches vision**: ❌ No - needs fly-in animation

**Time investment**: ~2 hours debugging
**Root cause**: Identified - camera/shader mismatch
**Solutions available**: Multiple options documented above

## Next Session Recommendations

1. **Don't start from scratch** - refactoring itself was successful
2. **Fix the animation** - camera repositioning OR redesigned animation
3. **Test in isolation** - create simple particle test scene first
4. **Git commit more** - commit after each working state

The code quality is good, the architecture is clean, and the particle system works. Just needs the animation parameters tuned correctly.

---

*Generated: 2026-02-03*
*Debugged by: Claude Sonnet 4.5*
*Status: Particle rendering works, animation needs tuning*
