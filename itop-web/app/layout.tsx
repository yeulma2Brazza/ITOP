import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ITOP — Convertisseur d\'images en PDF gratuit',
  description:
    'Convertissez vos images PNG, JPG, GIF, TIFF, PSD, SVG, WEBP, HEIC en PDF gratuitement. Rapide, privé, sans inscription.',
  keywords: ['convertir image PDF', 'PNG en PDF', 'HEIC en PDF', 'gratuit', 'ITOP'],
  openGraph: {
    title: 'ITOP — Convertisseur d\'images en PDF',
    description: '100% gratuit. Aucune inscription. Vos fichiers restent privés.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#f8f9fa] text-[#343a40] antialiased">{children}</body>
    </html>
  )
}
