'use client'

import { useState, useEffect, useRef } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://formation.mayscorp.net'

interface StatsCounterProps {
  /** Déclenche un re-fetch quand sa valeur change (ex: après une conversion) */
  refreshSignal?: number
}

export default function StatsCounter({ refreshSignal = 0 }: StatsCounterProps) {
  const [target,  setTarget]  = useState(0)
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  // Chargement du compteur depuis le backend
  useEffect(() => {
    fetch(`${API_BASE}/stats/`)
      .then(r => r.json())
      .then(data => setTarget(data.files_converted ?? 0))
      .catch(() => {})
  }, [refreshSignal])

  // Animation ease-out cubic vers la cible
  useEffect(() => {
    if (target === 0) return
    const duration  = 2000
    const start     = performance.now()
    const from      = display

    const tick = (now: number) => {
      const p      = Math.min((now - start) / duration, 1)
      const eased  = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.floor(from + (target - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target])

  return (
    <div className="bg-gradient-to-r from-[#cc3234] to-[#a82729] py-4 shadow-lg shadow-red-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-3 flex-wrap">
        <span className="text-red-200 text-sm font-medium">Fichiers convertis</span>
        <span className="text-white text-3xl font-black tabular-nums">
          {display.toLocaleString('fr-FR')}
        </span>
        <span className="text-red-200 text-sm font-medium">et plus dans le monde</span>
      </div>
    </div>
  )
}
