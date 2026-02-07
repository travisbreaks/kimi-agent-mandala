import type { PerformanceLevel } from '@/types'
import { PARTICLE_COUNTS } from '@/constants/config'

export function detectPerformanceLevel(): PerformanceLevel {
  if (typeof window === 'undefined') {
    return 'medium'
  }

  try {
    // Create a temporary canvas to get WebGL context
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null

    if (!gl) {
      return 'low'
    }

    // Get GPU info from WebGL debug extension
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string
      const rendererLower = renderer.toLowerCase()

      // High-end GPUs
      if (
        rendererLower.includes('nvidia') ||
        rendererLower.includes('geforce') ||
        rendererLower.includes('rtx') ||
        rendererLower.includes('radeon') ||
        rendererLower.includes('amd') ||
        rendererLower.includes('apple m1') ||
        rendererLower.includes('apple m2') ||
        rendererLower.includes('apple m3')
      ) {
        return 'high'
      }

      // Low-end or integrated GPUs
      if (
        rendererLower.includes('intel') ||
        rendererLower.includes('integrated')
      ) {
        return 'low'
      }
    }

    // Fallback: Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2
    if (cores >= 8) {
      return 'high'
    } else if (cores >= 4) {
      return 'medium'
    } else {
      return 'low'
    }
  } catch (error) {
    console.warn('Failed to detect performance level:', error)
    return 'medium'
  }
}

export function getParticleCountForPerformance(
  level: PerformanceLevel
): number {
  return PARTICLE_COUNTS[level]
}
