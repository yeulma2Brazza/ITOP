const STEPS = [
  {
    num:   '01',
    title: 'Sélectionnez vos images',
    desc:  'Glissez-déposez vos fichiers ou cliquez pour les choisir depuis votre appareil. PNG, JPG, HEIC, PSD et plus encore.',
  },
  {
    num:   '02',
    title: 'Cliquez sur Convertir',
    desc:  'Notre serveur traite vos images en quelques secondes et génère un PDF haute qualité.',
  },
  {
    num:   '03',
    title: 'Téléchargez votre PDF',
    desc:  'Votre PDF est immédiatement disponible au téléchargement. Aucune inscription requise.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white border-y border-gray-100 py-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#cc3234] uppercase tracking-widest bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#343a40]">
            3 étapes, c&apos;est tout
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Ligne de connexion (desktop) */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#cc3234]/30 to-transparent" />

          {STEPS.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-[#cc3234] text-white font-black text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-200">
                {step.num}
              </div>
              <h3 className="font-bold text-[#343a40] text-lg mb-3">{step.title}</h3>
              <p className="text-[#636769] text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
