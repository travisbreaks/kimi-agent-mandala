import type { MutableRefObject } from 'react'
import type * as THREE from 'three'

export type ScrollMetrics = {
  velocity: number
  speed: number
  normalizedSpeed: number
  direction: -1 | 0 | 1
  isScrolling: boolean
}

export type InteractionState = {
  pointer: THREE.Vector2
  hover: number
  hoverTarget: number
  pulse: number
}

export type PerformanceLevel = 'high' | 'medium' | 'low'

export type GeometryData = {
  positions: Float32Array
  startPositions: Float32Array
  colors: Float32Array
  scales: Float32Array
  phases: Float32Array
}

export interface SceneProps {
  scrollProgress: number
  scrollMetrics: ScrollMetrics
  interactionRef: MutableRefObject<InteractionState>
  particleCount?: number
}

export interface MandalaProps {
  scrollProgress: number
  scrollMetrics: ScrollMetrics
  interactionRef: MutableRefObject<InteractionState>
  particleCount?: number
}

export interface TunnelProps {
  scrollRef: MutableRefObject<number>
  scrollMetricsRef: MutableRefObject<ScrollMetrics>
  interactionRef: MutableRefObject<InteractionState>
}

export interface HUDProps {
  scrollMetrics: ScrollMetrics
}

export interface PhaseIndicatorProps {
  phase: 1 | 2
}

export interface ProgressBarProps {
  scrollProgress: number
  scrollMetrics: ScrollMetrics
}
