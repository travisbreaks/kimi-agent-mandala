import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, ScrollControls } from '@react-three/drei'
import { ErrorBoundary, Scene, HUD } from '@/components'
import { ScrollOverlays } from '@/components/ScrollOverlays'
import {
  useInteraction,
  useReducedMotion,
  useAdaptiveQuality,
} from '@/hooks'
import { CAMERA_CONFIG, CANVAS_CONFIG } from '@/constants/config'
import './App.css'

function App() {
  const {
    interactionRef,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
  } = useInteraction()
  const prefersReducedMotion = useReducedMotion()
  const { particleCount } = useAdaptiveQuality(prefersReducedMotion)
  const scrollProgressRef = useRef(0)

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div
          className="canvas-container"
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
        >
          <Canvas
            camera={{ position: CAMERA_CONFIG.position, fov: CAMERA_CONFIG.fov }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: CANVAS_CONFIG.powerPreference,
            }}
            dpr={CANVAS_CONFIG.dpr}
          >
            <Suspense fallback={null}>
              <PerspectiveCamera
                makeDefault
                position={CAMERA_CONFIG.position}
                fov={CAMERA_CONFIG.fov}
              />
              <ScrollControls pages={4} damping={0.15}>
                <Scene
                  interactionRef={interactionRef}
                  scrollProgressRef={scrollProgressRef}
                  particleCount={particleCount}
                />
              </ScrollControls>
            </Suspense>
          </Canvas>
        </div>

        <HUD scrollProgressRef={scrollProgressRef} />
        <ScrollOverlays scrollProgressRef={scrollProgressRef} />
      </div>
    </ErrorBoundary>
  )
}

export default App
