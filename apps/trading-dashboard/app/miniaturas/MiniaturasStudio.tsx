'use client'

import { useState, useRef, useEffect } from 'react'
import ImageUploader, { type RefImage } from './ImageUploader'
import TemplatePanel from './TemplatePanel'
import { buildTemplatePrompt, type TemplateParams } from '@/lib/templates'

interface Generation {
  id: string
  prompt: string
  mimeType: string
  data: string
  text: string | null
  createdAt: number
  aspectRatio: string
}

type Mode = 'template' | 'free'
type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4'

const ASPECT_OPTIONS: { value: AspectRatio; label: string; hint: string }[] = [
  { value: '16:9', label: '16:9', hint: 'YouTube thumbnail' },
  { value: '9:16', label: '9:16', hint: 'Shorts / Reels' },
  { value: '1:1',  label: '1:1',  hint: 'Instagram' },
  { value: '4:3',  label: '4:3',  hint: 'Clásico' },
  { value: '3:4',  label: '3:4',  hint: 'Retrato' },
]

const DEFAULT_TEMPLATE: TemplateParams = {
  style:              'finance',
  hookText:           '',
  keyword:            '',
  expression:         'confident',
  expressionCustom:   '',
  pose:               'standing-camera',
  poseCustom:         '',
  mainTextColor:      '#FFD60A',
  keywordColor:       '#FF2D2D',
  accentColor:        '#0F172A',
  extraElement:       '',
  subjectDescription: '',
  extraInstructions:  '',
  textPosition:       'right',
}

export default function MiniaturasStudio() {
  const [mode, setMode]             = useState<Mode>('template')
  const [templateParams, setTemplateParams] = useState<TemplateParams>(DEFAULT_TEMPLATE)
  const [prompt, setPrompt]         = useState('')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const [refs, setRefs]             = useState<RefImage[]>([])
  const [history, setHistory]       = useState<Generation[]>([])
  const [activeId, setActiveId]     = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [adjustment, setAdjustment] = useState('')
  const historyEndRef               = useRef<HTMLDivElement>(null)

  const active = history.find((h) => h.id === activeId) ?? history[history.length - 1] ?? null

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history.length])

  async function generate(promptText: string, usePrevious: boolean) {
    if (promptText.trim().length === 0) {
      setError('Escribe una descripción')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/miniaturas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText.trim(),
          refs: refs.map((r) => ({ mimeType: r.mimeType, data: r.dataBase64 })),
          previousImage: usePrevious && active
            ? { mimeType: active.mimeType, data: active.data }
            : null,
          aspectRatio,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al generar')
        setLoading(false)
        return
      }

      const gen: Generation = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        prompt: promptText.trim(),
        mimeType: data.image.mimeType,
        data: data.image.data,
        text: data.text ?? null,
        createdAt: Date.now(),
        aspectRatio,
      }

      setHistory((h) => [...h, gen])
      setActiveId(gen.id)
      if (usePrevious) setAdjustment('')
      setLoading(false)
    } catch (e) {
      setError('No se pudo contactar al servidor')
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!active) return
    const link = document.createElement('a')
    link.href = `data:${active.mimeType};base64,${active.data}`
    const ext = active.mimeType.split('/')[1] ?? 'png'
    link.download = `miniatura-${new Date(active.createdAt).getTime()}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleClearAll() {
    if (history.length > 0 && !confirm('¿Borrar todas las iteraciones?')) return
    setHistory([])
    setActiveId(null)
    setPrompt('')
    setAdjustment('')
    refs.forEach((r) => URL.revokeObjectURL(r.previewUrl))
    setRefs([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Columna izq: controles */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-surface border border-[#1E1E22] rounded-xl p-5 space-y-4">
          {/* Mode selector */}
          <div className="flex gap-1 p-1 bg-bg rounded-lg border border-[#1E1E22]">
            <ModeButton active={mode === 'template'} onClick={() => setMode('template')}>
              Plantilla
            </ModeButton>
            <ModeButton active={mode === 'free'} onClick={() => setMode('free')}>
              Prompt libre
            </ModeButton>
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="text-xs text-muted uppercase tracking-widest font-body">
              Formato
            </label>
            <div className="grid grid-cols-5 gap-1 mt-1.5">
              {ASPECT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAspectRatio(opt.value)}
                  title={opt.hint}
                  className={`py-2 rounded-lg border text-xs font-mono transition-colors ${
                    aspectRatio === opt.value
                      ? 'border-accent/60 bg-accent/10 text-accent'
                      : 'border-[#1E1E22] text-muted hover:border-accent/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modo plantilla o libre */}
          {mode === 'template' ? (
            <TemplatePanel
              params={templateParams}
              onChange={setTemplateParams}
              onPromptReady={(builtPrompt) => { setPrompt(builtPrompt); setMode('free') }}
            />
          ) : (
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-body">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                maxLength={2000}
                placeholder="Describe la miniatura en detalle..."
                className="w-full mt-2 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-accent/50 transition-colors resize-none font-body"
              />
              <div className="flex justify-between mt-1">
                <button
                  type="button"
                  onClick={() => setMode('template')}
                  className="text-[10px] text-muted hover:text-accent font-mono"
                >
                  ← Volver a plantilla
                </button>
                <p className="text-[10px] text-muted font-mono">{prompt.length}/2000</p>
              </div>
            </div>
          )}

          {/* Imágenes de referencia */}
          <div>
            <label className="text-xs text-muted uppercase tracking-widest font-body">
              Imágenes de referencia
            </label>
            <div className="mt-2">
              <ImageUploader refs={refs} onChange={setRefs} />
            </div>
          </div>

          <button
            onClick={() => {
              const finalPrompt = mode === 'template'
                ? buildTemplatePrompt(templateParams)
                : prompt
              generate(finalPrompt, false)
            }}
            disabled={loading}
            className="w-full bg-accent text-bg font-bold py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Generando...' : active ? 'Generar nueva (desde cero)' : 'Generar miniatura'}
          </button>

          {error && (
            <div className="text-negative text-xs bg-negative/10 border border-negative/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div className="bg-surface border border-[#1E1E22] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted uppercase tracking-widest font-body">
                Historial ({history.length})
              </p>
              <button
                onClick={handleClearAll}
                className="text-[10px] font-mono text-muted hover:text-negative transition-colors"
              >
                Limpiar todo
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setActiveId(g.id)}
                  className={`w-full flex gap-2 p-2 rounded-lg border transition-colors text-left ${
                    (active?.id === g.id)
                      ? 'border-accent/60 bg-accent/5'
                      : 'border-[#1E1E22] hover:border-accent/30'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:${g.mimeType};base64,${g.data}`}
                    alt=""
                    className="w-14 h-14 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-muted">
                      v{i + 1} · {g.aspectRatio} · {new Date(g.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-white truncate">{g.prompt.slice(0, 80)}</p>
                  </div>
                </button>
              ))}
              <div ref={historyEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Columna der: preview */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-surface border border-[#1E1E22] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E1E22]">
            <p className="text-xs text-muted uppercase tracking-widest font-body">
              Preview {active ? `· ${active.aspectRatio}` : `· ${aspectRatio}`}
            </p>
            {active && (
              <button
                onClick={handleDownload}
                className="text-xs font-mono text-accent hover:underline"
              >
                ↓ Descargar
              </button>
            )}
          </div>

          <div className="bg-bg flex items-center justify-center relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/80 backdrop-blur z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-muted font-mono">Generando imagen...</p>
                </div>
              </div>
            )}

            {active ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:${active.mimeType};base64,${active.data}`}
                alt="Miniatura generada"
                className="w-full h-auto"
              />
            ) : !loading ? (
              <div className="text-center px-6 py-20">
                <div className="w-12 h-12 rounded-full bg-surface border border-[#1E1E22] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014 0l4 4m-2-2l1-1a3 3 0 014 0l3 3M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm5 5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-muted text-sm font-body">
                  Configura la plantilla o escribe un prompt y genera tu miniatura
                </p>
                <p className="text-[10px] text-muted font-mono mt-2">
                  Gemini 2.5 Flash Image
                </p>
              </div>
            ) : null}
          </div>

          {active?.text && (
            <div className="px-5 py-3 border-t border-[#1E1E22]">
              <p className="text-[10px] text-muted uppercase tracking-widest font-body mb-1">
                Nota del modelo
              </p>
              <p className="text-xs text-muted font-body">{active.text}</p>
            </div>
          )}
        </div>

        {/* Caja de ajuste iterativo */}
        {active && (
          <div className="bg-surface border border-[#1E1E22] rounded-xl p-4">
            <label className="text-xs text-muted uppercase tracking-widest font-body">
              Ajustar esta imagen (iterar)
            </label>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="Hazla más vibrante, cambia el fondo, agrega un texto..."
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adjustment.trim() && !loading) {
                    generate(adjustment, true)
                  }
                }}
                className="flex-1 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50 transition-colors font-body"
              />
              <button
                onClick={() => generate(adjustment, true)}
                disabled={loading || adjustment.trim().length === 0}
                className="bg-accent text-bg font-bold px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
              >
                Aplicar
              </button>
            </div>
            <p className="text-[10px] text-muted font-mono mt-2">
              Usa la imagen actual como base + tu ajuste
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-1.5 text-xs font-body transition-colors rounded-md ${
        active
          ? 'bg-accent text-bg font-bold'
          : 'text-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
