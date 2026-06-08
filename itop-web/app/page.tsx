'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import StatsCounter from '@/components/StatsCounter'
import UploadZone from '@/components/UploadZone'
import FeaturesGrid from '@/components/FeaturesGrid'
import HowItWorks from '@/components/HowItWorks'
import Footer from '@/components/Footer'

export default function HomePage() {
  // Signal incrémenté après chaque conversion pour rafraîchir le compteur
  const [refresh, setRefresh] = useState(0)
  const handleConverted = useCallback(() => setRefresh(n => n + 1), [])

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Bannière compteur */}
      <StatsCounter refreshSignal={refresh} />

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-b from-white to-[#f8f9fa] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">

          {/* Badge gratuit */}
          <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            100% Gratuit · Aucune inscription · Aucun filigrane
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#343a40] leading-tight">
            Convertissez vos images<br />
            <span className="text-[#cc3234]">en PDF</span> instantanément
          </h1>

          <p className="text-lg text-[#636769] max-w-xl mx-auto">
            PNG, JPG, GIF, TIFF, PSD, SVG, WEBP, HEIC — tous formats acceptés.
            Vos fichiers restent privés et ne sont jamais stockés.
          </p>

        </div>

        {/* Zone de conversion */}
        <UploadZone onConverted={handleConverted} />
      </section>

      {/* Fonctionnalités */}
      <FeaturesGrid />

      {/* Comment ça marche */}
      <HowItWorks />

      {/* Bannière CTA */}
      <section className="bg-gradient-to-r from-[#cc3234] to-[#a82729] py-16 px-6 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          Prêt à convertir ?
        </h2>
        <p className="text-red-200 mb-8 max-w-md mx-auto">
          Gratuit, immédiat, sans compte. Exactement comme ça devrait être.
        </p>
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="inline-block px-8 py-4 bg-white text-[#cc3234] font-black rounded-2xl hover:scale-105 transition-transform duration-200 shadow-xl"
        >
          Commencer maintenant →
        </a>
      </section>

      <Footer />
    </main>
  )
}
