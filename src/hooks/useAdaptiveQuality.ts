import { useState, useEffect } from 'react'
import { detectPerformanceLevel, getParticleCountForPerformance } from '@/utils'
import { PARTICLE_COUNTS } from '@/constants/config'
import type { PerformanceLevel } from '@/types'

export function useAdaptiveQuality(prefersReducedMotion: boolean) {
  const [performanceLevel, setPerformanceLevel] =
    useState<PerformanceLevel>('medium')
  const [particleCount, setParticleCount] = useState(PARTICLE_COUNTS.medium)

  useEffect(() => {
    // Detect performance level on mount
    const level = detectPerformanceLevel()
    setPerformanceLevel(level)

    // If user prefers reduced motion, use low quality
    if (prefersReducedMotion) {
      setParticleCount(PARTICLE_COUNTS.low)
    } else {
      setParticleCount(getParticleCountForPerformance(level))
    }
  }, [prefersReducedMotion])

  return {
    performanceLevel,
    particleCount,
  }
}
