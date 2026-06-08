const FEATURES = [
  {
    icon:  '🖼️',
    title: '8 formats supportés',
    desc:  'PNG, JPG, GIF, TIFF, PSD, SVG, WEBP et HEIC — tous acceptés sans conversion préalable.',
  },
  {
    icon:  '⚡',
    title: 'Conversion instantanée',
    desc:  'Traitement côté serveur optimisé. Votre PDF est prêt en quelques secondes.',
  },
  {
    icon:  '🔒',
    title: '100% Privé',
    desc:  'Vos fichiers ne sont jamais stockés. Suppression automatique après chaque conversion.',
  },
  {
    icon:  '📄',
    title: 'PDF haute qualité',
    desc:  'Résolution préservée, mise en page soignée. Idéal pour l\'impression et le partage.',
  },
  {
    icon:  '📦',
    title: 'Multi-images en un PDF',
    desc:  'Combinez plusieurs images en un seul document PDF ordonné en un clic.',
  },
  {
    icon:  '✦',
    title: '100% Gratuit',
    desc:  'Aucune limite, aucune inscription, aucun filigrane. Toujours gratuit, pour toujours.',
  },
]

export default function FeaturesGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">

      <div className="text-center mb-12">
        <span className="inline-block text-xs font-bold text-[#cc3234] uppercase tracking-widest bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-4">
          Fonctionnalités
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#343a40]">
          Tout ce dont vous avez besoin
        </h2>
        <p className="text-[#636769] mt-3 max-w-lg mx-auto">
          Un outil simple, puissant et totalement gratuit pour convertir vos images en PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#cc3234]/20 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-200">
              {f.icon}
            </div>
            <h3 className="font-bold text-[#343a40] text-lg mb-2">{f.title}</h3>
            <p className="text-[#636769] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

    </section>
  )
}
