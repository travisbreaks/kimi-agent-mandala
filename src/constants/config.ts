// Sri Yantra geometry parameters
export const SRI_YANTRA_CONFIG = {
  centerRadius: 0.15,
  triangleLayers: 9,
}

// Particle count configurations for different performance levels
export const PARTICLE_COUNTS = {
  high: 50000,
  medium: 25000,
  low: 10000,
}

// Scroll telemetry configuration
export const SCROLL_CONFIG = {
  maxVelocity: 2400,
}

// Camera configuration
export const CAMERA_CONFIG = {
  position: [0, 0, 4] as [number, number, number],
  fov: 60,
}

// Canvas rendering configuration
export const CANVAS_CONFIG = {
  dpr: [1, 2] as [number, number],
  powerPreference: 'high-performance' as const,
}
