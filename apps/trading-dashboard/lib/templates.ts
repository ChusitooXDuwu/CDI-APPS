export type ThumbnailStyle =
  | 'finance'
  | 'news'
  | 'tutorial'
  | 'reaction'
  | 'lifestyle'
  | 'podcast'
  | 'custom'

export const STYLE_OPTIONS: { value: ThumbnailStyle; label: string; desc: string }[] = [
  { value: 'finance',   label: 'Trading / Finanzas',   desc: 'Gráficos, dinero, tickers' },
  { value: 'news',      label: 'Noticias / Análisis',  desc: 'Estilo informativo, periodístico' },
  { value: 'tutorial',  label: 'Tutorial / Educación', desc: 'Limpio, enfocado al tema' },
  { value: 'reaction',  label: 'Reacción / Entretenimiento', desc: 'Expresivo, alto contraste' },
  { value: 'lifestyle', label: 'Lifestyle / Vlog',     desc: 'Cálido, cinematográfico' },
  { value: 'podcast',   label: 'Podcast / Entrevista', desc: 'Tipografía grande, estética moderna' },
  { value: 'custom',    label: 'Personalizado',        desc: 'Define el estilo en notas libres' },
]

// -------------------- EXPRESIÓN (rostro) --------------------
export type Expression =
  | 'shock' | 'confident' | 'serious' | 'excited'
  | 'thinking' | 'neutral' | 'laughing' | 'worried' | 'custom'

export const EXPRESSION_OPTIONS: { value: Expression; label: string; desc: string }[] = [
  { value: 'shock',     label: 'Shock / Sorpresa', desc: 'Ojos muy abiertos, boca abierta' },
  { value: 'confident', label: 'Confiado',          desc: 'Sonrisa ligera de lado' },
  { value: 'serious',   label: 'Serio',             desc: 'Mirada firme, ceño neutro' },
  { value: 'excited',   label: 'Emocionado',        desc: 'Sonrisa amplia, cejas arriba' },
  { value: 'thinking',  label: 'Pensativo',         desc: 'Ceño ligeramente fruncido' },
  { value: 'neutral',   label: 'Neutral',           desc: 'Expresión calmada' },
  { value: 'laughing',  label: 'Riendo',            desc: 'Risa genuina' },
  { value: 'worried',   label: 'Preocupado',        desc: 'Ceño fruncido, mirada tensa' },
  { value: 'custom',    label: 'Personalizada',     desc: 'Escríbela tú mismo' },
]

const EXPRESSION_PROMPT: Record<Exclude<Expression, 'custom'>, string> = {
  shock:     'wide-eyed shocked expression with mouth slightly open, raised eyebrows',
  confident: 'confident slight smirk, calm and sure look',
  serious:   'serious neutral expression, steady firm gaze directly at the camera',
  excited:   'excited genuine smile with raised eyebrows, eyes bright',
  thinking:  'thoughtful expression with slightly furrowed brow, lips closed',
  neutral:   'calm neutral facial expression looking at the camera',
  laughing:  'genuine laugh, mouth open showing teeth, eyes slightly squinted from smiling',
  worried:   'worried look with furrowed brow and tight lips, slightly tense gaze',
}

// -------------------- POSE (cuerpo / postura) --------------------
export type Pose =
  | 'standing-camera' | 'arms-crossed' | 'hand-chin' | 'pointing-viewer'
  | 'thumbs-up' | 'open-palms' | 'looking-aside' | 'none' | 'custom'

export const POSE_OPTIONS: { value: Pose; label: string; desc: string }[] = [
  { value: 'standing-camera', label: 'Mirando a cámara',    desc: 'Frente, hombros relajados' },
  { value: 'arms-crossed',    label: 'Brazos cruzados',     desc: 'Postura firme, autoritaria' },
  { value: 'hand-chin',       label: 'Mano en barbilla',    desc: 'Reflexivo, una sola mano' },
  { value: 'pointing-viewer', label: 'Apuntando al frente', desc: 'Una mano, índice extendido' },
  { value: 'thumbs-up',       label: 'Pulgar arriba',       desc: 'Una mano cerca del pecho' },
  { value: 'open-palms',      label: 'Palmas abiertas',     desc: 'Gesto explicativo sutil' },
  { value: 'looking-aside',   label: 'Perfil ligero',       desc: 'Cara 3/4, mirando de lado' },
  { value: 'none',             label: 'Sin pose específica', desc: 'Solo rostro, sin gesto forzado' },
  { value: 'custom',          label: 'Personalizada',       desc: 'Escríbela tú mismo' },
]

const POSE_PROMPT: Record<Exclude<Pose, 'custom'>, string> = {
  'standing-camera': 'facing the camera directly, shoulders relaxed and straight, no forced gesture',
  'arms-crossed':    'arms crossed over the chest in a confident posture. Exactly two arms, naturally proportioned',
  'hand-chin':       'ONE hand lifted naturally to the chin. The other arm relaxed at the side. Exactly two arms total',
  'pointing-viewer': 'ONE hand pointing with the index finger toward the camera. The other arm relaxed. Exactly two arms total',
  'thumbs-up':       'ONE hand giving a thumbs-up near chest level. The other arm relaxed. Exactly two arms total',
  'open-palms':      'both palms open at chest height in an explanatory, calm gesture. Exactly two arms total',
  'looking-aside':   'head turned slightly 3/4 to one side, gaze off-camera. Shoulders natural, no exaggerated gesture',
  'none':            'head-and-shoulders framing only, no specific body pose, arms not visible or relaxed at sides',
}

// -------------------- ESTILO: fondo y elementos --------------------
const STYLE_BACKGROUND: Record<ThumbnailStyle, string> = {
  finance:   'dark navy-to-black radial gradient with subtle candlestick chart pattern, soft green/red glow for depth',
  news:      'clean studio-style background with soft editorial lighting, subtle gradient in neutral grays or deep blue',
  tutorial:  'minimal clean background with a subtle color wash related to the topic, very readable negative space around the subject',
  reaction:  'bold high-contrast background with vibrant color splashes or gradient, slight motion blur / comic-style accent',
  lifestyle: 'warm cinematic environment photo with soft bokeh, golden-hour lighting, mood-driven',
  podcast:   'clean modern studio with soft gradient, subtle brand-color accent, professional lighting',
  custom:    'background described in the user notes (if not specified, use a tasteful gradient that matches the hook tone)',
}

const STYLE_ELEMENTS: Record<ThumbnailStyle, string> = {
  finance:   'one bold stock-chart element (rising green arrow OR red crashing candles) integrated on the right side',
  news:      'a small lower-third style banner or headline card to give news/editorial feel',
  tutorial:  'a clean icon or prop related to the topic (e.g. laptop, book, tool) on one side',
  reaction:  'comic-style graphic elements (bold shapes, motion lines, emoji-like stamps) for energy',
  lifestyle: 'no extra graphic elements — rely on the scene itself',
  podcast:   'microphone or show logo placement in the composition',
  custom:    'only what the user specifies in notes',
}

// -------------------- PARAMS --------------------
export interface TemplateParams {
  style:              ThumbnailStyle
  hookText:           string
  keyword:            string
  expression:         Expression
  expressionCustom:   string
  pose:               Pose
  poseCustom:         string
  mainTextColor:      string
  keywordColor:       string
  accentColor:        string
  extraElement:       string
  subjectDescription: string
  extraInstructions:  string
  textPosition:       'top' | 'bottom' | 'right' | 'left' | 'center'
}

const POSITION_PROMPT: Record<TemplateParams['textPosition'], string> = {
  top:    'upper area of the frame',
  bottom: 'bottom area of the frame',
  right:  'right side of the frame (subject on the left)',
  left:   'left side of the frame (subject on the right)',
  center: 'center of the frame, overlapping or around the subject',
}

export function buildTemplatePrompt(p: TemplateParams): string {
  const bgText        = STYLE_BACKGROUND[p.style]
  const elementsText  = STYLE_ELEMENTS[p.style]
  const positionText  = POSITION_PROMPT[p.textPosition]

  const expressionText =
    p.expression === 'custom'
      ? (p.expressionCustom.trim() || 'natural calm expression')
      : EXPRESSION_PROMPT[p.expression]

  const poseText =
    p.pose === 'custom'
      ? (p.poseCustom.trim() || 'natural relaxed posture, exactly two arms')
      : POSE_PROMPT[p.pose]

  const styleTone: Record<ThumbnailStyle, string> = {
    finance:   'high-CTR YouTube thumbnail in the style of top Spanish-language finance channels',
    news:      'informative YouTube thumbnail for a news/analysis video — editorial and trustworthy',
    tutorial:  'clean educational YouTube thumbnail that feels approachable and clear',
    reaction:  'high-energy YouTube thumbnail for a reaction or entertainment video',
    lifestyle: 'cinematic lifestyle YouTube thumbnail with a mood-driven, premium feel',
    podcast:   'modern podcast/interview YouTube thumbnail with clean typography',
    custom:    'YouTube thumbnail in a custom style defined by the user notes',
  }

  const facePreservation = p.subjectDescription
    ? `SUBJECT: Use the attached reference photo of the person (${p.subjectDescription}). Preserve their facial identity EXACTLY — same face shape, eyes, skin tone, hair. Do not alter their features.`
    : `SUBJECT: Use the attached reference photo of the person. Preserve their facial identity EXACTLY — same face shape, eyes, skin tone, hair. Do not alter their features.`

  const textOverlay = p.hookText
    ? `TEXT OVERLAY: Large bold Spanish text placed in the ${positionText}, maximum 3-6 words, in ultra-bold sans-serif (Impact / Montserrat Black style). Text EXACTLY as written (do not translate or modify): "${p.hookText}". Main color: ${p.mainTextColor} with a thick black stroke outline (4-6px) for legibility.${p.keyword ? ` The keyword "${p.keyword}" MUST be rendered in the color ${p.keywordColor} while the rest of the text stays in ${p.mainTextColor}.` : ''}`
    : 'TEXT OVERLAY: none — rely on the composition alone.'

  const extraEl = p.extraElement
    ? `EXTRA ELEMENTS: ${p.extraElement}. Keep the composition clean, do not clutter.`
    : `EXTRA ELEMENTS: ${elementsText}. Keep the composition clean, do not clutter.`

  // Sección CRÍTICA anti-errores comunes del modelo
  const criticalRules = `CRITICAL ANATOMY RULES (strict):
- The person has EXACTLY two arms and two hands (no extra limbs, no duplicated arms).
- The person has EXACTLY one head with one face (no second head, no mirrored face).
- Hands must have exactly 5 fingers each, natural proportions.
- Body proportions must be realistic — no stretched or warped limbs.
- Single subject only (do not add any other people unless explicitly requested).`

  const negativePrompt = `STRICT NEGATIVE CONSTRAINTS — DO NOT INCLUDE:
- extra arms, extra hands, extra fingers, extra heads
- duplicated faces or mirrored body parts
- deformed anatomy, warped hands, fused fingers
- text misspellings or invented letters not in the hook
- watermarks, signatures, artist logos
- blurry faces or soft facial details
- additional people beyond the main subject`

  return `Create a ${styleTone[p.style]}.

${facePreservation}

FACIAL EXPRESSION: ${expressionText}.

BODY POSE: ${poseText}.

${criticalRules}

FRAMING: Medium close-up, head and shoulders, subject positioned to leave clean space for the text.

BACKGROUND: ${bgText}. Use ${p.accentColor} as the dominant accent color for mood and atmosphere.

${textOverlay}

${extraEl}

VISUAL STYLE: Photorealistic, sharp focus on face, cinematic lighting with rim light, high contrast, saturated colors. Slight HDR feel.

${negativePrompt}

ASPECT RATIO: 16:9 unless otherwise requested, optimized for YouTube thumbnail legibility on mobile (text must be readable at 320px wide).${p.extraInstructions ? `\n\nADDITIONAL NOTES FROM THE USER: ${p.extraInstructions}` : ''}`
}
