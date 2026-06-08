import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — ITOP',
  description: 'Politique de confidentialité du service ITOP de conversion d\'images en PDF.',
}

const SECTIONS = [
  {
    title: '1. Données collectées',
    content: `ITOP ne collecte aucune donnée personnelle identifiable. Les images que vous soumettez sont traitées en mémoire vive sur nos serveurs et supprimées immédiatement après la génération du PDF. Aucune image, aucun PDF généré et aucune information vous concernant n'est conservé sur nos serveurs.`,
  },
  {
    title: '2. Utilisation des données',
    content: `Les seules données conservées sont des statistiques agrégées et anonymes : le nombre total de fichiers convertis. Ces données ne permettent en aucun cas d'identifier un utilisateur ou de retrouver les fichiers traités.`,
  },
  {
    title: '3. Cookies',
    content: `ITOP n'utilise aucun cookie publicitaire ni cookie de traçage. Aucune donnée de navigation n'est transmise à des tiers. Le site peut utiliser des cookies techniques essentiels au bon fonctionnement de l'application (session, sécurité CSRF), qui ne sont pas utilisés à des fins commerciales.`,
  },
  {
    title: '4. Sécurité des transferts',
    content: `Toutes les communications entre votre navigateur et nos serveurs sont chiffrées via HTTPS/TLS. Vos fichiers transitent de façon sécurisée et ne peuvent pas être interceptés.`,
  },
  {
    title: '5. Services tiers',
    content: `ITOP est hébergé sur Railway (backend) et Vercel (frontend). Ces plateformes peuvent collecter des journaux techniques (adresse IP, horodatage des requêtes) conformément à leurs propres politiques de confidentialité, dans le but d'assurer la sécurité et la disponibilité des services.`,
  },
  {
    title: '6. Application mobile',
    content: `L'application mobile ITOP (disponible sur Android) envoie vos images au même serveur sécurisé que le site web. Les mêmes principes s'appliquent : aucun stockage, traitement immédiat, suppression automatique.`,
  },
  {
    title: '7. Droits des utilisateurs (RGPD)',
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Puisqu'ITOP ne conserve aucune donnée personnelle, l'exercice de ces droits ne s'applique pas dans ce contexte.`,
  },
  {
    title: '8. Modifications de cette politique',
    content: `ITOP se réserve le droit de modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec la date de mise à jour correspondante.`,
  },
  {
    title: '9. Contact',
    content: `Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter via le site formation.mayscorp.net.`,
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#636769] mb-8">
          <Link href="/" className="hover:text-[#cc3234] transition-colors">Accueil</Link>
          <span>›</span>
          <span>Politique de confidentialité</span>
        </div>

        {/* En-tête */}
        <div className="mb-12">
          <span className="inline-block text-xs font-bold text-[#cc3234] uppercase tracking-widest bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-4">
            Transparence
          </span>
          <h1 className="text-4xl font-black text-[#343a40] mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-[#636769]">
            Dernière mise à jour : juin 2026 · Applicable à ITOP Web et ITOP Mobile
          </p>
        </div>

        {/* Résumé */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10">
          <p className="font-bold text-emerald-800 text-lg mb-2">En résumé ✦</p>
          <p className="text-emerald-700">
            ITOP ne collecte, ne stocke et ne vend <strong>aucune donnée personnelle</strong>.
            Vos images sont converties et immédiatement supprimées. C&apos;est aussi simple que ça.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <section key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#343a40] mb-3">{s.title}</h2>
              <p className="text-[#636769] leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>

        {/* Retour */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#cc3234] text-white font-bold hover:bg-[#a82729] transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  )
}
