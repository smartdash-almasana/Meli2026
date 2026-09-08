import type { SyncOutboxEntry } from '../../src/types/sync'
import { getSupabaseRuntimeConfig } from './runtime'
import { createClient } from '@supabase/supabase-js'

function mapPayload(entry: SyncOutboxEntry, userId: string): Record<string, unknown> {
  const payload = (entry.payload && typeof entry.payload === 'object') ? entry.payload as Record<string, unknown> : {}
  if (entry.entityType === 'event_contacts') return {
    id: entry.entityId, created_at: payload.createdAt, updated_at: payload.updatedAt, captured_by: userId,
    actor_type: payload.actorType, full_name: payload.fullName, company_name: payload.companyName, whatsapp: payload.whatsapp,
    email: payload.email, meli_nickname: payload.meliNickname, followup_consent: payload.followupConsent ?? false,
  }
  if (entry.entityType === 'discovery_interviews') return {
    id: entry.entityId, contact_id: payload.contactId, event_id: payload.eventId, actor_type: payload.actorType,
    operator_id: userId, started_at: payload.startedAt, updated_at: payload.updatedAt, completed_at: payload.completedAt,
    current_step: payload.currentStep, status: payload.status, payload,
  }
  if (entry.entityType === 'pain_observations') return {
    id: entry.entityId, contact_id: payload.contactId, tag: payload.painCode, text: payload.quote, is_primary: payload.isPrimary, created_at: payload.createdAt,
  }
  return {
    id: entry.entityId, entity_type: payload.entityType, entity_id: payload.entityId, contact_id: payload.contactId,
    event_type: payload.eventType, payload: payload.metadata ?? {}, occurred_at: payload.occurredAt,
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const config = getSupabaseRuntimeConfig()
    const authorization = request.headers.get('authorization') ?? ''
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 })
    const authClient = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: userData, error: userError } = await authClient.auth.getUser(token)
    if (userError || !userData.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
    const profileResponse = await fetch(`${config.url}/rest/v1/operator_profiles?select=active&user_id=eq.${encodeURIComponent(userData.user.id)}&limit=1`, {
      headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}` },
    })
    const profiles = profileResponse.ok ? await profileResponse.json() as Array<{ active: boolean }> : []
    if (!profiles[0]?.active) return Response.json({ error: 'inactive_operator' }, { status: 403 })
    const body = await request.json() as { entries?: SyncOutboxEntry[] }
    const entries = Array.isArray(body.entries) ? body.entries.slice(0, 50) : []
    let synced = 0
    for (const entry of entries) {
      const table = entry.entityType
      if (!['event_contacts', 'discovery_interviews', 'pain_observations', 'event_timeline'].includes(table)) continue
      const response = await fetch(`${config.url}/rest/v1/${table}?on_conflict=id`, {
        method: 'POST',
        headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(mapPayload(entry, userData.user.id)),
      })
      if (!response.ok) return Response.json({ error: 'remote_upsert_failed', entityId: entry.entityId }, { status: 502 })
      synced += 1
    }
    return Response.json({ synced })
  } catch {
    return Response.json({ error: 'sync_unavailable' }, { status: 503 })
  }
}

export default POST
