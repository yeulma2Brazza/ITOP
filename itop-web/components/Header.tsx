import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#cc3234] flex items-center justify-center shadow-md shadow-red-200">
            <span className="text-white font-black text-xs tracking-widest">IT</span>
          </div>
          <div>
            <span className="font-black text-lg text-[#343a40] tracking-widest">ITOP</span>
            <span className="text-xs text-[#636769] ml-2 hidden sm:inline">PDF Converter</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            ✦ 100% Gratuit
          </span>
          <Link
            href="/privacy"
            className="text-sm text-[#636769] hover:text-[#cc3234] transition-colors font-medium"
          >
            Confidentialité
          </Link>
        </nav>

      </div>
    </header>
  )
}
