import { useRef, useCallback, type PointerEvent } from 'react'
import * as THREE from 'three'
import type { InteractionState } from '@/types'

export function useInteraction() {
  const interactionRef = useRef<InteractionState>({
    pointer: new THREE.Vector2(0, 0),
    hover: 0,
    hoverTarget: 0,
    pulse: 0,
  })

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width
      const y = (event.clientY - bounds.top) / bounds.height

      interactionRef.current.pointer.x = x * 2 - 1
      interactionRef.current.pointer.y = -(y * 2 - 1)
    },
    []
  )

  const handlePointerEnter = useCallback(() => {
    interactionRef.current.hoverTarget = 1
  }, [])

  const handlePointerLeave = useCallback(() => {
    interactionRef.current.hoverTarget = 0
  }, [])

  const handlePointerDown = useCallback(() => {
    interactionRef.current.pulse = 1
  }, [])

  return {
    interactionRef,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
  }
}
