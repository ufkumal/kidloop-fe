import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

const MAX_AUDIO_BYTES = 20 * 1024 * 1024
const SUPPORTED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
])

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status })
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured')
    return jsonError('Sesli geri bildirim şu anda kullanılamıyor.', 503)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (error) {
    console.error('Could not read transcription form data:', error)
    return jsonError('Ses kaydı okunamadı.', 400)
  }

  const audio = formData.get('audio')
  if (!(audio instanceof File) || audio.size === 0) {
    return jsonError('Boş bir ses kaydı gönderildi.', 400)
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return jsonError('Ses kaydı çok büyük.', 413)
  }

  const mimeType = audio.type.split(';', 1)[0].toLowerCase()
  if (!SUPPORTED_AUDIO_TYPES.has(mimeType)) {
    return jsonError('Bu ses biçimi desteklenmiyor.', 415)
  }

  const ai = new GoogleGenAI({ apiKey })
  let uploadedFileName: string | undefined

  try {
    const uploadedFile = await ai.files.upload({
      file: audio,
      config: { mimeType },
    })
    uploadedFileName = uploadedFile.name

    if (!uploadedFile.uri) {
      throw new Error('Gemini file upload did not return a URI')
    }

    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-transcribe',
      input: [
        {
          type: 'audio',
          uri: uploadedFile.uri,
          mime_type: uploadedFile.mimeType ?? mimeType,
        },
      ],
      generation_config: {
        transcription_config: {
          language_codes: [],
          mode: 'smart',
        },
      },
    })
    const text = interaction.output_text?.trim() ?? ''

    if (!text) {
      return jsonError('Konuşma metne dönüştürülemedi.', 422)
    }

    return Response.json({ text }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Gemini transcription failed:', error)
    return jsonError('Ses metne dönüştürülemedi.', 502)
  } finally {
    if (uploadedFileName) {
      try {
        await ai.files.delete({ name: uploadedFileName })
      } catch (error) {
        console.error('Could not delete temporary Gemini audio file:', error)
      }
    }
  }
}
