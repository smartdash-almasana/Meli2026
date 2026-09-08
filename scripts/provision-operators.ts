import { readFileSync } from 'node:fs'
import { createClient, type User } from '@supabase/supabase-js'

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (match) process.env[match[1]] = match[2]
}

const required = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'OPERATOR_ALEJANDRO_EMAIL', 'OPERATOR_ALEJANDRO_PASSWORD', 'OPERATOR_ALEJANDRO_DISPLAY_NAME',
  'OPERATOR_FEDE_EMAIL', 'OPERATOR_FEDE_PASSWORD', 'OPERATOR_FEDE_DISPLAY_NAME',
] as const
const missing = required.filter((name) => !process.env[name]?.trim())
if (missing.length) throw new Error(`BLOCKED_MISSING_OPERATOR_ENV: ${missing.join(',')}`)

const url = process.env.SUPABASE_URL!.replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
if (!publishableKey) throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY for login verification')
const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })

async function findUser(email: string): Promise<User | undefined> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw new Error('Unable to inspect existing Auth users')
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
}

type Operator = { key: 'alejandro' | 'fede'; email: string; password: string; displayName: string }
type Provisioned = Operator & { user: User; existing: boolean }

async function provision(operator: Operator): Promise<Provisioned> {
  const existing = await findUser(operator.email)
  let user = existing
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({ email: operator.email, password: operator.password, email_confirm: true })
    if (error || !data.user) throw new Error(`${operator.key} Auth provisioning failed`)
    user = data.user
  }
  const { error: profileError } = await admin.from('operator_profiles').upsert({ user_id: user.id, display_name: operator.displayName, active: true }, { onConflict: 'user_id' })
  if (profileError) throw new Error(`${operator.key} profile provisioning failed`)
  const { data: profile, error: verifyError } = await admin.from('operator_profiles').select('active').eq('user_id', user.id).maybeSingle()
  if (verifyError || !profile?.active) throw new Error(`${operator.key} active profile verification failed`)
  return { ...operator, user, existing: Boolean(existing) }
}

async function verifyAccess(operator: Provisioned): Promise<{ login: boolean; rls: boolean; sync: boolean; emailConfirmed: boolean }> {
  const client = createClient(url, publishableKey!, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.auth.signInWithPassword({ email: operator.email, password: operator.password })
  if (error || !data.session) {
    if (operator.existing) throw new Error(`BLOCKED_EXISTING_AUTH_USER: ${operator.key} password verification failed`)
    throw new Error(`${operator.key} login verification failed`)
  }
  const emailConfirmed = Boolean(data.user.email_confirmed_at)
  const testId = crypto.randomUUID()
  const now = new Date().toISOString()
  const { POST } = await import('../api/supabase/sync')
  const response = await POST(new Request('http://localhost/api/supabase/sync', {
    method: 'POST',
    headers: { authorization: `Bearer ${data.session.access_token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ entries: [{ id: crypto.randomUUID(), entityType: 'event_contacts', entityId: testId, operation: 'create', status: 'pending', retryCount: 0, createdAt: now, updatedAt: now, payload: { id: testId, createdAt: now, updatedAt: now, capturedBy: operator.key, actorType: 'seller', fullName: '[TEST_ONLY] operator provisioning' } }] }),
  }))
  if (!response.ok) throw new Error(`${operator.key} sync verification failed`)
  const { data: selected, error: selectError } = await client.from('event_contacts').select('id').eq('id', testId)
  const rls = !selectError && selected?.length === 1
  const anonymous = createClient(url, publishableKey!, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: anonRows } = await anonymous.from('event_contacts').select('id').eq('id', testId)
  if (anonRows?.length) throw new Error('ANON_RLS_BYPASS')
  await admin.from('event_contacts').delete().eq('id', testId)
  return { login: true, rls, sync: response.ok, emailConfirmed }
}

const alejandro = await provision({ key: 'alejandro', email: process.env.OPERATOR_ALEJANDRO_EMAIL!, password: process.env.OPERATOR_ALEJANDRO_PASSWORD!, displayName: process.env.OPERATOR_ALEJANDRO_DISPLAY_NAME! })
const fede = await provision({ key: 'fede', email: process.env.OPERATOR_FEDE_EMAIL!, password: process.env.OPERATOR_FEDE_PASSWORD!, displayName: process.env.OPERATOR_FEDE_DISPLAY_NAME! })
const [alejandroAccess, fedeAccess] = await Promise.all([verifyAccess(alejandro), verifyAccess(fede)])
console.log(JSON.stringify({ alejandro: { authUser: true, existingUserReused: alejandro.existing, ...alejandroAccess }, fede: { authUser: true, existingUserReused: fede.existing, ...fedeAccess }, passwordsLogged: false }))
