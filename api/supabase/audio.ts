import { createClient } from '@supabase/supabase-js'
import { getSupabaseRuntimeConfig } from './runtime'

export const AUDIO_BUCKET = 'meli2026-interview-audio'

function safePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120)
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes('ogg')) return 'ogg'
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a'
  return 'webm'
}

export async function POST(request: Request): Promise<Response> {
  try {
    const config = getSupabaseRuntimeConfig()
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 })

    const authClient = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: userData, error: userError } = await authClient.auth.getUser(token)
    if (userError || !userData.user) return Response.json({ error: 'unauthorized' }, { status: 401 })

    const profileResponse = await fetch(`${config.url}/rest/v1/operator_profiles?select=active&user_id=eq.${encodeURIComponent(userData.user.id)}&limit=1`, {
      headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}` },
    })
    const profiles = profileResponse.ok ? await profileResponse.json() as Array<{ active: boolean }> : []
    if (!profiles[0]?.active) return Response.json({ error: 'inactive_operator' }, { status: 403 })

    const form = await request.formData()
    const file = form.get('file')
    const interviewId = String(form.get('interview_id') ?? '')
    const eventId = safePart(String(form.get('event_id') ?? 'meli2026'))
    const audioId = safePart(String(form.get('audio_id') ?? 'audio'))
    const mimeType = String(form.get('mime_type') ?? (file instanceof File ? file.type : 'audio/webm'))
    if (!(file instanceof File) || !interviewId) return Response.json({ error: 'audio_payload_invalid' }, { status: 400 })

    const path = `${eventId}/${safePart(interviewId)}/interview-audio.${extensionFor(mimeType)}`
    const storage = createClient(config.url, config.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(AUDIO_BUCKET)
    const upload = await storage.upload(path, file, { contentType: mimeType, upsert: true, cacheControl: '3600' })
    if (upload.error) return Response.json({ error: 'audio_upload_failed' }, { status: 502 })

    const metadata = {
      audio_id: audioId,
      interview_id: interviewId,
      operator: String(form.get('operator') ?? ''),
      recorded_at: String(form.get('recorded_at') ?? ''),
      mime_type: mimeType,
      duration_seconds: Number(form.get('duration_seconds') ?? 0),
      storage_path: path,
    }
    const sidecar = await storage.upload(`${path}.json`, new Blob([JSON.stringify(metadata)], { type: 'application/json' }), { contentType: 'application/json', upsert: true, cacheControl: '3600' })
    if (sidecar.error) return Response.json({ error: 'audio_metadata_upload_failed' }, { status: 502 })
    return Response.json({ storagePath: path, interviewId })
  } catch {
    return Response.json({ error: 'audio_sync_unavailable' }, { status: 503 })
  }
}

export default POST
