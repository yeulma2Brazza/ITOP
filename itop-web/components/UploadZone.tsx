'use client'

import { useState, useCallback, useRef } from 'react'
import DonateButton from './DonateButton'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://formation.mayscorp.net'

const ACCEPT_ATTR = '.png,.jpg,.jpeg,.gif,.tif,.tiff,.webp,.heic,.heif,.svg,.psd'
const FORMAT_LABEL = 'PNG · JPG · GIF · TIFF · WEBP · HEIC · SVG · PSD'

type Status = 'idle' | 'dragging' | 'ready' | 'uploading' | 'success' | 'error'

interface UploadZoneProps {
  onConverted?: () => void
}

export default function UploadZone({ onConverted }: UploadZoneProps) {
  const [status,   setStatus]   = useState<Status>('idle')
  const [files,    setFiles]    = useState<File[]>([])
  const [pdfUrl,   setPdfUrl]   = useState<string | null>(null)
  const [progress, setProgress] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtre les fichiers acceptés et met à jour l'état
  const loadFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(f =>
      /\.(png|jpe?g|gif|tiff?|webp|heic?|svg|psd)$/i.test(f.name)
    )
    if (arr.length === 0) {
      setErrorMsg('Format non supporté. Acceptés : PNG, JPG, GIF, TIFF, WEBP, HEIC, SVG, PSD.')
      return
    }
    setFiles(arr)
    setStatus('ready')
    setPdfUrl(null)
    setErrorMsg('')
  }, [])

  // Drag & drop handlers
  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setStatus('dragging') }, [])
  const onDragLeave = useCallback(() => setStatus(files.length > 0 ? 'ready' : 'idle'), [files])
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    loadFiles(e.dataTransfer.files)
  }, [loadFiles])

  // Envoi au backend Django
  const handleConvert = useCallback(async () => {
    if (files.length === 0) return
    setStatus('uploading')
    setProgress(`Préparation de ${files.length} image${files.length > 1 ? 's' : ''}…`)
    setPdfUrl(null)
    setErrorMsg('')

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('images', f))

      setProgress('Conversion en cours…')

      const res = await fetch(`${API_BASE}/`, {
        method: 'POST',
        body:   formData,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setProgress('Finalisation du PDF…')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)

      setPdfUrl(url)
      setStatus('success')
      onConverted?.()
    } catch {
      setErrorMsg('Erreur de connexion au serveur. Vérifiez votre réseau et réessayez.')
      setStatus('error')
    }
  }, [files, onConverted])

  // Réinitialisation complète
  const reset = useCallback(() => {
    setStatus('idle')
    setFiles([])
    setPdfUrl(null)
    setErrorMsg('')
    setProgress('')
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  // ── Rendu : Résultat succès ──────────────────────────────────────────────
  if (status === 'success' && pdfUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-100 border border-emerald-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
            <span className="text-white text-2xl font-black">✓</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#343a40]">PDF prêt !</h3>
            <p className="text-[#636769] mt-1">
              {files.length} image{files.length > 1 ? 's converties' : ' convertie'} avec succès
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={pdfUrl}
              download="itop-converted.pdf"
              className="px-6 py-3 rounded-xl bg-[#cc3234] hover:bg-[#a82729] text-white font-bold transition-colors shadow-md shadow-red-200"
            >
              ↓ Télécharger le PDF
            </a>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-[#636769] font-semibold hover:border-[#cc3234] hover:text-[#cc3234] transition-colors"
            >
              Nouveau fichier
            </button>
          </div>

          {/* Don après conversion réussie */}
          <DonateButton />

        </div>
      </div>
    )
  }

  // ── Rendu : Zone de dépôt + bouton ──────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">

      {/* Zone de dépôt */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
        className={[
          'relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 select-none',
          status === 'dragging'
            ? 'border-[#cc3234] bg-red-50 scale-[1.01] shadow-xl shadow-red-100'
            : status === 'ready'
            ? 'border-[#cc3234] bg-red-50/40 shadow-md shadow-red-100'
            : 'border-gray-200 bg-white hover:border-[#cc3234]/60 hover:bg-red-50/20',
          status === 'uploading' ? 'pointer-events-none opacity-80' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={e => e.target.files && loadFiles(e.target.files)}
        />

        {status === 'uploading' ? (
          /* Spinner de chargement */
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-[#cc3234] border-t-transparent animate-spin mx-auto" />
            <p className="text-[#343a40] font-semibold text-lg">{progress}</p>
            <p className="text-[#636769] text-sm">Ne fermez pas cette page…</p>
          </div>
        ) : (
          /* État normal / ready / dragging */
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-[#cc3234]/25 flex items-center justify-center mx-auto transition-transform duration-200 group-hover:scale-105">
              <span className="text-4xl text-[#cc3234]">⊕</span>
            </div>
            <div>
              <p className="text-xl font-bold text-[#343a40]">
                {files.length > 0
                  ? `${files.length} image${files.length > 1 ? 's' : ''} sélectionnée${files.length > 1 ? 's' : ''}`
                  : 'Glissez vos images ici'}
              </p>
              {files.length > 0 ? (
                <p className="text-[#636769] text-sm mt-1 max-w-xs mx-auto truncate">
                  {files.map(f => f.name).join(', ')}
                </p>
              ) : (
                <p className="text-[#636769] mt-1">ou cliquez pour sélectionner</p>
              )}
            </div>
            <span className="text-xs text-[#636769] bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 inline-block">
              {FORMAT_LABEL}
            </span>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {errorMsg && (
        <p className="text-sm text-red-600 text-center font-medium">{errorMsg}</p>
      )}

      {/* Bouton de conversion */}
      {files.length > 0 && status !== 'uploading' && (
        <button
          onClick={handleConvert}
          className="w-full py-4 rounded-2xl bg-[#cc3234] hover:bg-[#a82729] text-white font-black text-lg transition-all duration-200 active:scale-[0.98] shadow-xl shadow-red-200"
        >
          Convertir en PDF →
        </button>
      )}

      {/* Badge confidentialité */}
      <p className="text-center text-xs text-[#636769]">
        🔒 Vos fichiers ne sont jamais stockés — traitement immédiat et suppression automatique
      </p>

    </div>
  )
}
