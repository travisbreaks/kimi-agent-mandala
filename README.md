# Kimi Agent Mandala

An interactive 3D visualization of a Sri Yantra mandala that responds to scroll, hover, and click interactions. Built with React Three Fiber and custom WebGL shaders.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://travisbreaks.org/research/kimi-agent-mandala/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r182-black)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://typescriptlang.org)


## Features

### Two-Phase Scroll Animation

- **Phase 1 (0-50% scroll)**: Build - Particles fly in from all directions to form the sacred Sri Yantra geometry
- **Phase 2 (50-100% scroll)**: Explode - The mandala explodes outward with a spiral motion while a fractal tunnel emerges in the background

### Interactive Elements

- **Hover**: Tilt the mandala based on pointer position
- **Click**: Create a pulse effect that radiates through the particles
- **Scroll Velocity**: Particle spin speed and visual effects respond to scroll speed

### Accessibility & Performance

- **Adaptive Quality**: Automatically detects GPU capabilities and adjusts particle count
  - High-end: 50,000 particles
  - Medium: 25,000 particles
  - Low-end/integrated GPUs: 10,000 particles
- **Reduced Motion**: Respects `prefers-reduced-motion` media query, reducing particle count for accessibility
- **Error Boundary**: Graceful error handling with fallback UI

## Tech Stack

### Core
- **React** 19.2 - UI framework
- **TypeScript** 5.9 - Type safety
- **Vite** 7.2 - Build tool & dev server

### 3D Graphics
- **Three.js** 0.182 - WebGL 3D library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Helper components for R3F

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Shaders** - GLSL vertex & fragment shaders for procedural effects

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or download the project
cd kimi-agent-mandala

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── App.css                    # Styles
├── main.tsx                   # Entry point
├── index.css                  # Global styles
│
├── shaders/                   # WebGL shader code
│   ├── sandGrain.ts           # Sand particle shaders
│   └── fractalTunnel.ts       # Fractal tunnel background shaders
│
├── utils/                     # Utility functions
│   ├── geometry.ts            # Sri Yantra geometry generation
│   └── performanceDetector.ts # GPU performance detection
│
├── constants/                 # Configuration constants
│   ├── colors.ts              # Color palettes
│   └── config.ts              # App configuration
│
├── types/                     # TypeScript type definitions
│   └── index.ts               # All type exports
│
├── hooks/                     # React hooks
│   ├── useInteraction.ts      # Pointer event handling
│   ├── useReducedMotion.ts    # Accessibility detection
│   └── useAdaptiveQuality.ts  # Performance-based quality
│
└── components/                # React components
    ├── ErrorBoundary.tsx      # Error handling
    ├── LoadingState.tsx       # Loading indicator
    ├── Scene.tsx              # Main 3D scene
    ├── SriYantraMandala.tsx   # Mandala particle system
    ├── FractalTunnel.tsx      # Background tunnel effect
    ├── HUD.tsx                # Scroll velocity display
    └── ScrollOverlays.tsx     # Phase indicator and progress bar, driven by scroll progress
```

Each folder also carries an `index.ts` barrel. The tree above matches the repository as of 2026-09-07.

## How It Works

### Sacred Geometry

The Sri Yantra is an ancient sacred geometry pattern consisting of nine interlocking triangles arranged in a specific configuration. This implementation generates 50,000 particles (on high-end devices) distributed across:

- **Center Bindu**: The central point
- **9 Triangle Layers**: Alternating upward and downward pointing triangles
- **Concentric Rings**: Circular layers radiating outward
- **16 Lotus Petals**: Outer decorative ring
- **Outer Square**: Gates in cardinal directions
- **Protective Circle**: Outermost boundary

### Particle System

Each particle has:
- Position (x, y, z coordinates)
- Color (from a 9-color sacred palette)
- Scale (size variation)
- Phase (animation timing offset)

### Shader Pipeline

1. **Vertex Shader**: Calculates particle position and size
   - Simplex noise for organic variation
   - Phase-based animation (build vs explode)
   - Scroll-driven transformations
   - Interactive tilt and pulse effects

2. **Fragment Shader**: Renders particle appearance
   - Procedural sand grain texture
   - Multiple noise layers for realism
   - Velocity-based glow effects
   - Alpha fading during explosion

### Scroll System

Scrolling is driven by drei's `ScrollControls` in `App.tsx`. The scroll offset is written into a `scrollProgressRef` that the `HUD` and `ScrollOverlays` components read each frame:
- **Progress**: 0 to 1 (where 0.5 is the transition point)
- **Speed**: normalized against `SCROLL_CONFIG.maxVelocity` (2400px/s) in `src/constants/config.ts`

## Performance Notes

### Bundle Size

After refactoring:
- **Before**: ~2.7MB (with 62 unused dependencies)
- **After**: ~500KB (5 essential dependencies)
- **Reduction**: ~81% smaller

### Optimization Strategies

- Geometry generation is memoized
- Shader calculations run on GPU
- Adaptive particle count based on hardware
- Efficient Three.js buffer attributes
- Additive blending for particles

### Browser Support

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported (with reduced particle count)

## Development

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript is configured with strict mode enabled. The project uses:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

## Customization

### Particle Count

Edit `src/constants/config.ts`:

```typescript
export const PARTICLE_COUNTS = {
  high: 50000,   // High-end GPUs
  medium: 25000, // Mid-range
  low: 10000,    // Integrated/mobile
}
```

### Colors

Edit `src/constants/colors.ts`:

```typescript
export const MANDALA_COLOR_PALETTE = [
  new THREE.Color(0x8b0000), // Dark red
  // ... add your colors
]
```

### Scroll Speed

Edit `src/constants/config.ts`:

```typescript
export const SCROLL_CONFIG = {
  maxVelocity: 2400, // pixels per second
}
```

## License

MIT

## Credits

Built with Claude Code and inspired by sacred geometry traditions.

---

Part of the [travisBREAKS](https://travisbreaks.org) portfolio.
