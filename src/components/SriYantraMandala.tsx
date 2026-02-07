import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sandVertexShader, sandFragmentShader } from '@/shaders'
import { generateSriYantraPositions } from '@/utils'
import { PARTICLE_COUNTS } from '@/constants/config'
import type { MutableRefObject } from 'react'
import type { InteractionState, ScrollMetrics } from '@/types'

interface MandalaProps {
  scrollRef: MutableRefObject<number>
  scrollMetricsRef: MutableRefObject<ScrollMetrics>
  interactionRef: MutableRefObject<InteractionState>
  particleCount?: number
}

export function SriYantraMandala({
  scrollRef,
  scrollMetricsRef,
  interactionRef,
  particleCount = PARTICLE_COUNTS.high,
}: MandalaProps) {
  const meshRef = useRef<THREE.Points | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const spinRef = useRef(0)

  // Generate geometry data
  const { positions, startPositions, colors, scales, phases } = useMemo(() => {
    return generateSriYantraPositions(particleCount)
  }, [particleCount])

  // Create geometry with attributes
  useEffect(() => {
    if (!meshRef.current) return

    const geometry = meshRef.current.geometry

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute(
      'aTargetPosition',
      new THREE.BufferAttribute(positions.slice(), 3)
    )
    geometry.setAttribute('aStartPosition', new THREE.BufferAttribute(startPositions, 3))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  })

  // Update uniforms directly from refs each frame (no React re-renders)
  useFrame((state, delta) => {
    const scrollProgress = scrollRef.current
    const scrollMetrics = scrollMetricsRef.current
    const interaction = interactionRef.current

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress
      materialRef.current.uniforms.uVelocity.value = scrollMetrics.normalizedSpeed
      materialRef.current.uniforms.uHover.value = interaction.hover
      materialRef.current.uniforms.uPulse.value = interaction.pulse
      materialRef.current.uniforms.uPointer.value.set(
        interaction.pointer.x,
        interaction.pointer.y
      )
    }

    if (meshRef.current) {
      // Dampen mesh-level transforms during tunnel phase
      // (per-particle shader positioning takes over)
      const tunnelDampen =
        scrollProgress > 0.75
          ? 1.0 - Math.min((scrollProgress - 0.75) / 0.1, 1.0)
          : 1.0

      spinRef.current +=
        delta * (0.15 + scrollMetrics.normalizedSpeed * 0.75) * tunnelDampen
      meshRef.current.rotation.z = spinRef.current * tunnelDampen

      const tilt = interaction.hover * 0.35 * tunnelDampen
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        interaction.pointer.y * tilt,
        0.08
      )
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        interaction.pointer.x * tilt,
        0.08
      )

      const scale = 1 + interaction.pulse * 0.03 * tunnelDampen
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry />
      <shaderMaterial
        ref={materialRef}
        vertexShader={sandVertexShader}
        fragmentShader={sandFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
          uExplosion: { value: 0 },
          uVelocity: { value: 0 },
          uHover: { value: 0 },
          uPulse: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
        }}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}
