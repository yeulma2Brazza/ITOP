import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#343a40] text-white py-12">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Logo + description */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#cc3234] flex items-center justify-center">
                <span className="text-white font-black text-xs tracking-widest">IT</span>
              </div>
              <span className="font-black text-xl tracking-widest">ITOP</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Convertisseur d&apos;images en PDF gratuit. Simple, rapide, privé.
            </p>
          </div>

          {/* Badge gratuit */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl font-black text-[#cc3234]">100% Gratuit</span>
            <span className="text-gray-400 text-sm">Toujours. Sans exception.</span>
          </div>

          {/* Liens */}
          <div className="flex flex-col items-center md:items-end gap-2 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-gray-500">formation.mayscorp.net</span>
          </div>

        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} ITOP. Tous droits réservés.
        </div>

      </div>
    </footer>
  )
}
