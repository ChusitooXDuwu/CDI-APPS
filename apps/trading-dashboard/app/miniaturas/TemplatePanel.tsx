'use client'

import {
  STYLE_OPTIONS,
  EXPRESSION_OPTIONS,
  POSE_OPTIONS,
  buildTemplatePrompt,
  type TemplateParams,
  type ThumbnailStyle,
  type Expression,
  type Pose,
} from '@/lib/templates'

interface Props {
  params: TemplateParams
  onChange: (next: TemplateParams) => void
  onPromptReady: (prompt: string) => void
}

const TEXT_POSITIONS: { value: TemplateParams['textPosition']; label: string }[] = [
  { value: 'right',  label: 'Derecha' },
  { value: 'left',   label: 'Izquierda' },
  { value: 'top',    label: 'Arriba' },
  { value: 'bottom', label: 'Abajo' },
  { value: 'center', label: 'Centro' },
]

export default function TemplatePanel({ params, onChange, onPromptReady }: Props) {
  function update<K extends keyof TemplateParams>(key: K, value: TemplateParams[K]) {
    onChange({ ...params, [key]: value })
  }

  function applyToPrompt() {
    onPromptReady(buildTemplatePrompt(params))
  }

  return (
    <div className="space-y-4">
      {/* Estilo */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Tipo de miniatura
        </label>
        <select
          value={params.style}
          onChange={(e) => update('style', e.target.value as ThumbnailStyle)}
          className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
        >
          {STYLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} — {o.desc}
            </option>
          ))}
        </select>
      </div>

      {/* Hook */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Hook (texto principal)
        </label>
        <input
          type="text"
          value={params.hookText}
          onChange={(e) => update('hookText', e.target.value.toUpperCase())}
          maxLength={80}
          placeholder="ej: ¿CRISIS EN 2026?  ·  ÚLTIMA HORA  ·  NADIE TE DIJO ESTO"
          className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-display font-bold text-white outline-none focus:border-accent/50"
        />
        <p className="text-[10px] text-muted font-mono mt-1">Deja vacío para sin texto. 3-6 palabras recomendado.</p>
      </div>

      {/* Keyword + colores */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted uppercase tracking-widest font-body">Keyword</label>
          <input
            type="text"
            value={params.keyword}
            onChange={(e) => update('keyword', e.target.value.toUpperCase())}
            maxLength={20}
            placeholder="ej: CRISIS"
            className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-widest font-body">Color texto</label>
          <div className="flex mt-1.5 rounded-lg overflow-hidden border border-[#1E1E22]">
            <input
              type="color"
              value={params.mainTextColor}
              onChange={(e) => update('mainTextColor', e.target.value)}
              className="w-10 h-9 bg-bg border-0 cursor-pointer"
            />
            <input
              type="text"
              value={params.mainTextColor}
              onChange={(e) => update('mainTextColor', e.target.value)}
              className="flex-1 bg-bg px-2 text-xs font-mono text-white outline-none min-w-0"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-widest font-body">Color keyword</label>
          <div className="flex mt-1.5 rounded-lg overflow-hidden border border-[#1E1E22]">
            <input
              type="color"
              value={params.keywordColor}
              onChange={(e) => update('keywordColor', e.target.value)}
              className="w-10 h-9 bg-bg border-0 cursor-pointer"
            />
            <input
              type="text"
              value={params.keywordColor}
              onChange={(e) => update('keywordColor', e.target.value)}
              className="flex-1 bg-bg px-2 text-xs font-mono text-white outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Posición texto + color de acento */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted uppercase tracking-widest font-body">Posición texto</label>
          <select
            value={params.textPosition}
            onChange={(e) => update('textPosition', e.target.value as TemplateParams['textPosition'])}
            className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          >
            {TEXT_POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-widest font-body">Color mood / fondo</label>
          <div className="flex mt-1.5 rounded-lg overflow-hidden border border-[#1E1E22]">
            <input
              type="color"
              value={params.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              className="w-10 h-9 bg-bg border-0 cursor-pointer"
            />
            <input
              type="text"
              value={params.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              className="flex-1 bg-bg px-2 text-xs font-mono text-white outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Expresión (rostro) */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Expresión facial
        </label>
        <p className="text-[10px] text-muted font-mono mt-0.5 mb-1.5">
          Cómo se ve la cara — sorpresa, enojo, calma, etc.
        </p>
        <select
          value={params.expression}
          onChange={(e) => update('expression', e.target.value as Expression)}
          className="w-full bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
        >
          {EXPRESSION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} — {o.desc}
            </option>
          ))}
        </select>
        {params.expression === 'custom' && (
          <input
            type="text"
            value={params.expressionCustom}
            onChange={(e) => update('expressionCustom', e.target.value)}
            maxLength={200}
            placeholder="ej: cara de incredulidad con una ceja levantada"
            className="w-full mt-2 bg-bg border border-accent/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/70"
          />
        )}
      </div>

      {/* Pose (cuerpo) */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Pose / Postura del cuerpo
        </label>
        <p className="text-[10px] text-muted font-mono mt-0.5 mb-1.5">
          Qué hace con los brazos y el torso — ayuda a evitar manos o brazos extra
        </p>
        <select
          value={params.pose}
          onChange={(e) => update('pose', e.target.value as Pose)}
          className="w-full bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
        >
          {POSE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} — {o.desc}
            </option>
          ))}
        </select>
        {params.pose === 'custom' && (
          <input
            type="text"
            value={params.poseCustom}
            onChange={(e) => update('poseCustom', e.target.value)}
            maxLength={200}
            placeholder="ej: ambos brazos alzados en señal de victoria"
            className="w-full mt-2 bg-bg border border-accent/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/70"
          />
        )}
      </div>

      {/* Elemento extra */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Elemento extra (opcional)
        </label>
        <input
          type="text"
          value={params.extraElement}
          onChange={(e) => update('extraElement', e.target.value)}
          maxLength={120}
          placeholder="ej: micrófono, ticker $SPY, libro, taza de café..."
          className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
        />
        <p className="text-[10px] text-muted font-mono mt-1">
          Deja vacío para usar el elemento por defecto del tipo de miniatura
        </p>
      </div>

      {/* Sujeto */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Descripción del sujeto (opcional)
        </label>
        <input
          type="text"
          value={params.subjectDescription}
          onChange={(e) => update('subjectDescription', e.target.value)}
          maxLength={200}
          placeholder="ej: hombre de cabello corto, mujer rubia con lentes, etc."
          className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
        />
        <p className="text-[10px] text-muted font-mono mt-1">
          Ayuda al modelo a preservar la identidad del rostro
        </p>
      </div>

      {/* Notas extra */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest font-body">
          Notas adicionales (opcional)
        </label>
        <textarea
          value={params.extraInstructions}
          onChange={(e) => update('extraInstructions', e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="ej: fondo de ciudad nocturna, iluminación azul neón, incluir logo en esquina, estilo de revista..."
          className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50 resize-none font-body"
        />
      </div>

      <button
        type="button"
        onClick={applyToPrompt}
        className="w-full bg-surface border border-accent/40 text-accent font-body font-semibold py-2 rounded-lg hover:bg-accent/10 transition-colors text-sm"
      >
        Aplicar plantilla al prompt →
      </button>
    </div>
  )
}
