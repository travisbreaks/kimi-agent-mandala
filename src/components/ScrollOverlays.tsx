import { useRef, useEffect } from 'react'
import type { MutableRefObject } from 'react'

interface ScrollOverlaysProps {
  scrollProgressRef: MutableRefObject<number>
}

export function ScrollOverlays({ scrollProgressRef }: ScrollOverlaysProps) {
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number

    const update = () => {
      const p = scrollProgressRef.current

      // Card 1 ("SCROLL SYSTEM"):
      //   0%–10%:  Hold centered, fully visible
      //   10%–25%: Slide up + fade out
      //   >25%:    Hidden
      if (card1Ref.current) {
        let opacity = 1
        let yOffset = 0

        if (p < 0.10) {
          opacity = 1
          yOffset = 0
        } else if (p < 0.25) {
          const t = (p - 0.10) / 0.15
          opacity = 1 - t
          yOffset = -t * 40
        } else {
          opacity = 0
          yOffset = -40
        }

        card1Ref.current.style.opacity = String(opacity)
        card1Ref.current.style.transform = `translate(-50%, -50%) translateY(${yOffset}vh)`
        card1Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none'
      }

      // Card 2 ("The Infinite"):
      //   <60%:     Hidden, below center
      //   60%–75%:  Slide up to center + fade in
      //   75%–80%:  Hold centered
      //   80%–85%:  Fade out in place (no movement)
      //   >85%:     Hidden
      if (card2Ref.current) {
        let opacity = 0
        let yOffset = 40

        if (p < 0.60) {
          opacity = 0
          yOffset = 40
        } else if (p < 0.75) {
          const t = (p - 0.60) / 0.15
          opacity = t
          yOffset = 40 * (1 - t)
        } else if (p < 0.80) {
          opacity = 1
          yOffset = 0
        } else if (p < 0.85) {
          const t = (p - 0.80) / 0.05
          opacity = 1 - t
          yOffset = 0 // stay in place, just fade
        } else {
          opacity = 0
          yOffset = 0
        }

        card2Ref.current.style.opacity = String(opacity)
        card2Ref.current.style.transform = `translate(-50%, -50%) translateY(${yOffset}vh)`
        card2Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none'
      }

      // Card 3 ("Cosmic Tunnel"):
      //   <85%:     Hidden, below center
      //   85%–92%:  Slide up to center + fade in
      //   92%–95%:  Hold centered
      //   95%–100%: IMPLOSION — shrinks to center point + tilts forward
      if (card3Ref.current) {
        let opacity = 0
        let yOffset = 40
        let scale = 1
        let rotateX = 0

        if (p < 0.85) {
          opacity = 0
          yOffset = 40
        } else if (p < 0.92) {
          const t = (p - 0.85) / 0.07
          opacity = t
          yOffset = 40 * (1 - t)
        } else if (p < 0.95) {
          opacity = 1
          yOffset = 0
        } else {
          // IMPLOSION: 95% → 100%
          const t = (p - 0.95) / 0.05
          const easedT = t * t // ease-in: accelerates into the void
          scale = 1 - easedT
          rotateX = easedT * 45 // tilt forward into the tunnel
          opacity = 1 - easedT
          yOffset = 0
        }

        card3Ref.current.style.opacity = String(opacity)
        card3Ref.current.style.transform =
          `translate(-50%, -50%) translateY(${yOffset}vh) perspective(500px) rotateX(${rotateX}deg) scale(${scale})`
        card3Ref.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none'
      }

      // Flash overlay:
      //   99%–99.7%: Radiate out from center (scale 0→2, opacity ramps up)
      //   99.7%–100%: Peak flash then vanish
      if (flashRef.current) {
        let flashOpacity = 0
        let flashScale = 0

        if (p >= 0.99 && p < 0.997) {
          // Radiate outward from center
          const t = (p - 0.99) / 0.007
          flashScale = t * 2.0
          flashOpacity = t
        } else if (p >= 0.997) {
          // Peak and fade fast
          const t = (p - 0.997) / 0.003
          flashScale = 2.0 + t * 0.5 // slight continued expansion
          flashOpacity = 1.0 - t // fade to gone
        }

        flashRef.current.style.opacity = String(Math.max(0, flashOpacity))
        flashRef.current.style.transform = `translate(-50%, -50%) scale(${flashScale})`
      }

      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [scrollProgressRef])

  return (
    <>
      <div className="scroll-overlay-card" ref={card1Ref}>
        <div className="phase-content">
          <p className="eyebrow">SCROLL SYSTEM</p>
          <h1 className="title">Sri Yantra</h1>
          <p className="subtitle">Scroll to build the sacred geometry</p>
          <div className="scroll-indicator">
            <div className="scroll-arrow"></div>
          </div>
          <p className="hint">Hover to bend. Click to pulse.</p>
        </div>
      </div>

      <div className="scroll-overlay-card" ref={card2Ref} style={{ opacity: 0 }}>
        <div className="phase-content">
          <p className="eyebrow">PHASE 02</p>
          <h2 className="title">The Infinite</h2>
          <p className="subtitle">
            The mandala dissolves into the cosmic tunnel
          </p>
        </div>
      </div>

      <div className="scroll-overlay-card" ref={card3Ref} style={{ opacity: 0 }}>
        <div className="phase-content">
          <p className="eyebrow">PHASE 03</p>
          <h2 className="title">Cosmic Tunnel</h2>
          <p className="subtitle">The geometry becomes the vessel</p>
        </div>
      </div>

      <div className="flash-overlay" ref={flashRef} style={{ opacity: 0 }} />
    </>
  )
}
