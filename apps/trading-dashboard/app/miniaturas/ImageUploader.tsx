'use client'

import { useRef, useState } from 'react'

export interface RefImage {
  id: string
  file: File
  previewUrl: string
  mimeType: string
  dataBase64: string
  originalKB: number
  compressedKB: number
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 20 * 1024 * 1024 // 20MB upload del user (se comprime después)
const MAX_REFS = 6

const MAX_DIMENSION = 1280   // lado largo tras redimensionar
const JPEG_QUALITY  = 0.82   // 0-1

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}

async function compressImage(file: File): Promise<{ blob: Blob; dataBase64: string; mimeType: string }> {
  const img = await loadImage(file)

  let { width, height } = img
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      height = Math.round((height * MAX_DIMENSION) / width)
      width  = MAX_DIMENSION
    } else {
      width  = Math.round((width * MAX_DIMENSION) / height)
      height = MAX_DIMENSION
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width  = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)

  // Siempre re-encode a JPEG (mucho más pequeño que PNG para fotos)
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', JPEG_QUALITY)
  )

  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  return { blob, dataBase64, mimeType: 'image/jpeg' }
}

export default function ImageUploader({
  refs,
  onChange,
}: {
  refs: RefImage[]
  onChange: (next: RefImage[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)

  async function handleFiles(files: FileList | File[]) {
    setError(null)
    const list = Array.from(files)

    if (refs.length + list.length > MAX_REFS) {
      setError(`Máximo ${MAX_REFS} imágenes`)
      return
    }

    setProcessing(true)
    const toAdd: RefImage[] = []

    for (const file of list) {
      if (!ALLOWED_MIMES.includes(file.type)) {
        setError(`Formato no soportado: ${file.name}. Usa JPEG, PNG o WebP.`)
        continue
      }
      if (file.size > MAX_INPUT_BYTES) {
        setError(`${file.name} excede 20MB. Usa una más pequeña.`)
        continue
      }

      try {
        const { blob, dataBase64, mimeType } = await compressImage(file)
        toAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl: URL.createObjectURL(blob),
          mimeType,
          dataBase64,
          originalKB:   Math.round(file.size / 1024),
          compressedKB: Math.round(blob.size / 1024),
        })
      } catch {
        setError(`No se pudo procesar ${file.name}`)
      }
    }

    setProcessing(false)
    if (toAdd.length > 0) onChange([...refs, ...toAdd])
  }

  function remove(id: string) {
    const target = refs.find((r) => r.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)
    onChange(refs.filter((r) => r.id !== id))
  }

  const totalCompressedKB = refs.reduce((s, r) => s + r.compressedKB, 0)

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !processing && inputRef.current?.click()}
        className={`border border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-colors ${
          processing
            ? 'border-accent/40 bg-accent/5 cursor-wait'
            : dragOver
              ? 'border-accent bg-accent/5'
              : 'border-[#1E1E22] hover:border-accent/40 hover:bg-surface/50'
        }`}
      >
        {processing ? (
          <p className="text-sm text-accent font-body">
            Comprimiendo imágenes...
          </p>
        ) : (
          <>
            <p className="text-sm text-white font-body">
              {refs.length === 0
                ? 'Arrastra imágenes o haz click para subir'
                : `${refs.length} de ${MAX_REFS} · Arrastra más o click para agregar`}
            </p>
            <p className="text-xs text-muted mt-1 font-mono">
              JPEG · PNG · WebP · Se comprimen a 1280px automáticamente
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIMES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {error && <p className="text-xs text-negative">{error}</p>}

      {refs.length > 0 && (
        <>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {refs.map((r) => (
              <div key={r.id} className="relative group aspect-square bg-surface border border-[#1E1E22] rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.previewUrl} alt="ref" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-bg/90 to-transparent px-1.5 py-1 text-[9px] font-mono text-muted">
                  {r.originalKB}kb → {r.compressedKB}kb
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-bg/80 text-negative hover:bg-negative hover:text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted font-mono text-right">
            Total payload: {totalCompressedKB}kb / ~3200kb máx
          </p>
        </>
      )}
    </div>
  )
}
