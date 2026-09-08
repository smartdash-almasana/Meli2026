import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
}
const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
if (!url || !serviceKey || !publishableKey) throw new Error('Missing Supabase test configuration')

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const created: string[] = []
const remoteTestIds: string[] = []
const suffix = randomBytes(6).toString('hex')
const credentials = async (label: string) => {
  const email = `test-operator-${label}-${suffix}@example.com`
  const password = `T3st-${randomBytes(18).toString('base64url')}!`
  const response = await fetch(`${url}/auth/v1/admin/users`, { method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, email_confirm: true }) })
  if (!response.ok) throw new Error(`admin user create failed: ${response.status}`)
  const user = await response.json() as { id: string }
  created.push(user.id)
  return { email, password, id: user.id, client: createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } }) }
}
const active = await credentials('active')
const inactive = await credentials('inactive')
const unknown = await credentials('unknown')
try {
  for (const item of [active, inactive]) {
    const { error } = await admin.from('operator_profiles').insert({ user_id: item.id, display_name: item === active ? 'Test Active Operator' : 'Test Inactive Operator', active: item === active })
    if (error) throw new Error(`operator profile insert failed: ${error.message}`)
  }
  const signIn = async (item: typeof active) => {
    const { data, error } = await item.client.auth.signInWithPassword({ email: item.email, password: item.password })
    if (error || !data.session) throw new Error('test sign in failed')
    return data.session.access_token
  }
  const callSync = async (token?: string, id = `test-auth-${suffix}`) => {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (token) headers.authorization = `Bearer ${token}`
    const request = new Request('http://localhost/api/supabase/sync', { method: 'POST', headers, body: JSON.stringify({ entries: [{ id: `outbox-${id}`, entityType: 'event_contacts', entityId: id, operation: 'create', payload: { id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), actorType: 'seller', fullName: 'TEST_ONLY auth contact' } }] }) })
    const { POST } = await import('../api/supabase/sync')
    return POST(request)
  }
  const anonymous = await callSync()
  if (anonymous.status !== 401) throw new Error(`anonymous expected 401, got ${anonymous.status}`)
  const unknownToken = await signIn(unknown)
  const unknownResponse = await callSync(unknownToken, `test-auth-unknown-${suffix}`)
  if (unknownResponse.status !== 403) throw new Error(`unknown expected 403, got ${unknownResponse.status}`)
  const inactiveToken = await signIn(inactive)
  const inactiveResponse = await callSync(inactiveToken, `test-auth-inactive-${suffix}`)
  if (inactiveResponse.status !== 403) throw new Error(`inactive expected 403, got ${inactiveResponse.status}`)
  const activeToken = await signIn(active)
  const id = crypto.randomUUID()
  remoteTestIds.push(id)
  const first = await callSync(activeToken, id)
  const second = await callSync(activeToken, id)
  if (first.status !== 200 || second.status !== 200) throw new Error(`active sync expected 200, got ${first.status}/${second.status}: ${await first.text()} / ${await second.text()}`)
  const { data: rows, error: readError } = await admin.from('event_contacts').select('id').eq('id', id)
  if (readError || rows?.length !== 1) throw new Error(`idempotent remote row check failed: ${readError?.message ?? rows?.length}`)
  const { data: activeRows } = await active.client.from('event_contacts').select('id').eq('id', id)
  const { data: unknownRows } = await unknown.client.from('event_contacts').select('id').eq('id', id)
  if (activeRows?.length !== 1 || unknownRows?.length) throw new Error('RLS select check failed')
  await active.client.auth.signOut()
  const loggedOut = await callSync(undefined, `test-auth-logout-${suffix}`)
  if (loggedOut.status !== 401) throw new Error(`logout expected 401, got ${loggedOut.status}`)
  const restored = await signIn(active)
  if (!restored) throw new Error('session restore/login check failed')
  console.log(JSON.stringify({ anonymous: 'DENIED', unknown: 'DENIED', inactive: 'DENIED', active: 'PASS', activeSelect: 'PASS', idempotent: 'PASS', logout: 'DENIED', sessionRestore: 'PASS' }))
} finally {
  for (const id of remoteTestIds) await admin.from('event_contacts').delete().eq('id', id)
  for (const id of created) await fetch(`${url}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
}
