import { GoogleGenAI, Modality } from '@google/genai'

export interface ImageRef {
  mimeType: string
  data: string
}

export interface GenerateResult {
  image: ImageRef | null
  text: string | null
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4'

export async function generateThumbnail(
  prompt: string,
  refs: ImageRef[],
  previousImage?: ImageRef | null,
  aspectRatio: AspectRatio = '16:9'
): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const ai = new GoogleGenAI({ apiKey })

  const parts: any[] = [{ text: prompt }]

  for (const ref of refs) {
    parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } })
  }

  if (previousImage) {
    parts.push({ inlineData: { mimeType: previousImage.mimeType, data: previousImage.data } })
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts }],
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
      imageConfig: { aspectRatio },
    } as any,
  })

  let image: ImageRef | null = null
  let text: string | null = null

  const candidateParts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of candidateParts) {
    if (part.inlineData?.data) {
      image = {
        mimeType: part.inlineData.mimeType ?? 'image/png',
        data: part.inlineData.data,
      }
    } else if (part.text) {
      text = (text ?? '') + part.text
    }
  }

  return { image, text }
}
