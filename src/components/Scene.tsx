import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { SriYantraMandala } from './SriYantraMandala'
import { FractalTunnel } from './FractalTunnel'
import type { MutableRefObject } from 'react'
import type { InteractionState, ScrollMetrics } from '@/types'

interface SceneProps {
  interactionRef: MutableRefObject<InteractionState>
  scrollProgressRef: MutableRefObject<number>
  particleCount?: number
}

export function Scene({
  interactionRef,
  scrollProgressRef,
  particleCount,
}: SceneProps) {
  const scroll = useScroll()
  const scrollMetricsRef = useRef<ScrollMetrics>({
    velocity: 0,
    speed: 0,
    normalizedSpeed: 0,
    direction: 0,
    isScrolling: false,
  })

  useFrame((_, delta) => {
    // Read scroll offset from drei (0-1)
    const offset = scroll.offset
    const prevOffset = scrollProgressRef.current

    // Derive velocity from scroll delta
    const velocity = (offset - prevOffset) / Math.max(delta, 0.001)
    const speed = Math.abs(velocity)
    const normalizedSpeed = Math.min(speed * 2, 1)

    scrollProgressRef.current = offset
    scrollMetricsRef.current = {
      velocity,
      speed,
      normalizedSpeed,
      direction: velocity > 0.01 ? 1 : velocity < -0.01 ? -1 : 0,
      isScrolling: speed > 0.001,
    }

    // Update interaction state
    const interaction = interactionRef.current
    interaction.hover += (interaction.hoverTarget - interaction.hover) * 0.08
    interaction.pulse = Math.max(0, interaction.pulse - delta * 0.9)
  }, -1)

  return (
    <>
      <FractalTunnel
        scrollRef={scrollProgressRef}
        scrollMetricsRef={scrollMetricsRef}
        interactionRef={interactionRef}
      />

      <SriYantraMandala
        scrollRef={scrollProgressRef}
        scrollMetricsRef={scrollMetricsRef}
        interactionRef={interactionRef}
        particleCount={particleCount}
      />

      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#ffd700" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ff1493" />
      <pointLight position={[0, 0, 10]} intensity={0.8} color="#ffffff" />
    </>
  )
}
