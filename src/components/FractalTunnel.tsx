import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { tunnelVertexShader, tunnelFragmentShader } from '@/shaders'
import type { TunnelProps } from '@/types'

export function FractalTunnel({
  scrollRef,
  scrollMetricsRef,
  interactionRef,
}: TunnelProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const { viewport, size } = useThree()

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
  }, [size])

  useFrame((state) => {
    const interaction = interactionRef.current
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uScrollProgress.value = scrollRef.current
      materialRef.current.uniforms.uVelocity.value =
        scrollMetricsRef.current.normalizedSpeed
      materialRef.current.uniforms.uHover.value = interaction.hover
      materialRef.current.uniforms.uPulse.value = interaction.pulse
      materialRef.current.uniforms.uPointer.value.set(
        interaction.pointer.x,
        interaction.pointer.y
      )
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={tunnelVertexShader}
        fragmentShader={tunnelFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
          uVelocity: { value: 0 },
          uHover: { value: 0 },
          uPulse: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
