import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasMiniaturasAccess } from '@/lib/access'
import { generateThumbnail, type ImageRef, type AspectRatio } from '@/lib/gemini'

const VALID_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3', '3:4']

export const maxDuration = 60

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_PROMPT_LENGTH = 2000
const MAX_REFS = 6
const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4MB cada una

function validateImageRef(ref: any): ref is ImageRef {
  if (!ref || typeof ref !== 'object') return false
  if (typeof ref.mimeType !== 'string' || !ALLOWED_MIMES.has(ref.mimeType)) return false
  if (typeof ref.data !== 'string' || ref.data.length === 0) return false
  const approxBytes = (ref.data.length * 3) / 4
  if (approxBytes > MAX_IMAGE_BYTES) return false
  return true
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (!hasMiniaturasAccess(user.email)) {
      return NextResponse.json({ error: 'Sin acceso a miniaturas' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }

    const { prompt, refs, previousImage, aspectRatio } = body
    const ratio: AspectRatio = VALID_RATIOS.includes(aspectRatio) ? aspectRatio : '16:9'

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 })
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: `Prompt excede ${MAX_PROMPT_LENGTH} caracteres` }, { status: 400 })
    }

    const refsArr: ImageRef[] = Array.isArray(refs) ? refs : []
    if (refsArr.length > MAX_REFS) {
      return NextResponse.json({ error: `Máximo ${MAX_REFS} imágenes de referencia` }, { status: 400 })
    }
    for (const r of refsArr) {
      if (!validateImageRef(r)) {
        return NextResponse.json({ error: 'Imagen de referencia inválida o > 4MB' }, { status: 400 })
      }
    }

    let prev: ImageRef | null = null
    if (previousImage) {
      if (!validateImageRef(previousImage)) {
        return NextResponse.json({ error: 'Imagen previa inválida' }, { status: 400 })
      }
      prev = previousImage
    }

    const result = await generateThumbnail(prompt.trim(), refsArr, prev, ratio)

    if (!result.image) {
      return NextResponse.json({
        error: 'El modelo no devolvió una imagen',
        text: result.text ?? null,
      }, { status: 502 })
    }

    return NextResponse.json({ image: result.image, text: result.text })
  } catch (e: any) {
    console.error('[miniaturas/generate]', e)
    const msg = String(e?.message ?? '')
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.toLowerCase().includes('quota')) {
      return NextResponse.json({ error: 'Límite de la API alcanzado, intenta en un momento' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Error al generar la imagen' }, { status: 500 })
  }
}
