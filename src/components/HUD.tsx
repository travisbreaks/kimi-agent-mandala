import { useRef, useEffect } from 'react'
import type { MutableRefObject } from 'react'

interface HUDProps {
  scrollProgressRef: MutableRefObject<number>
}

export function HUD({ scrollProgressRef }: HUDProps) {
  const percentRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number

    const update = () => {
      const progress = scrollProgressRef.current
      const pct = Math.round(progress * 100)

      if (percentRef.current) {
        percentRef.current.textContent = `${pct}%`
      }
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progress})`
      }

      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [scrollProgressRef])

  return (
    <div className="hud">
      <div className="hud-title">MANDALA TRANSMISSION</div>
      <div className="hud-row">
        <span className="hud-label">DEPTH</span>
        <span className="hud-state live" ref={percentRef}>0%</span>
      </div>
      <div className="hud-meter">
        <div className="hud-meter-fill" ref={fillRef} style={{ transform: 'scaleX(0)' }} />
      </div>
      <a href="../" className="hud-back">← Research</a>
    </div>
  )
}
