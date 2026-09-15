import { buildPublicRows, POST, validatePublicIntake, type PublicIntakePayload } from '../api/vtv'

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const valid: PublicIntakePayload = {
  business_name: 'TEST_ONLY Public VTV', whatsapp: '+54 9 11 5555 0101', email: 'seller@example.com',
  channel_mode: 'multi_channel', channels: ['shopify', 'other'], channels_other: 'Feria local',
  meli_tenure: '6_12_months', sku_count_range: '11_50', orders_month_range: '11_50', operation_mode: 'systems',
  current_tools: ['spreadsheets', 'other'], tools_other: 'Planilla propia', manual_tasks: ['prices', 'stock'],
  main_concern: 'profit', problems: ['profit_per_product', 'meli_fees'], margin_clarity: 'unclear',
  product_cost_source: 'spreadsheet', cost_update_frequency: 'monthly', target_margin: 'by_product',
  focus_mode: 'profitability', priorities: ['profitability', 'prices'], followup_mode: 'orientation',
  consent_contact: true, consent_analysis: true,
}

const normalized = validatePublicIntake({ website: '', draft: valid })
ensure(normalized.business_name === valid.business_name && normalized.priorities.length === 2, 'valid payload normalization failed')
ensure(buildPublicRows(normalized).tables.event_contacts[0] && buildPublicRows(normalized).tables.discovery_interviews[0], 'server row construction failed')
const rows = buildPublicRows(normalized)
const contact = rows.tables.event_contacts[0] as Record<string, unknown>
const interview = rows.tables.discovery_interviews[0] as Record<string, unknown>
ensure(typeof contact.id === 'string' && contact.captured_by === 'public_vtv_intake', 'server-owned contact identity failed')
ensure(typeof interview.id === 'string' && interview.operator_id === 'public_vtv_intake', 'server-owned operator identity failed')

const invalidCases: Array<[string, unknown]> = [
  ['consent', { draft: { ...valid, consent_analysis: false } }],
  ['forbidden-field', { draft: { ...valid, operator_id: 'alejandro' } }],
  ['too-many-priorities', { draft: { ...valid, priorities: ['prices', 'stock', 'shipping', 'other'] } }],
  ['honeypot', { website: 'bot', draft: valid }],
]
for (const [label, input] of invalidCases) {
  let rejected = false
  try { validatePublicIntake(input) } catch { rejected = true }
  ensure(rejected, `${label} was accepted`)
}

const originalFetch = globalThis.fetch
const previous = { url: process.env.SUPABASE_URL, service: process.env.SUPABASE_SERVICE_ROLE_KEY, publishable: process.env.VITE_SUPABASE_PUBLISHABLE_KEY }
process.env.SUPABASE_URL = 'https://test.supabase.local'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'TEST_ONLY_SERVICE_ROLE'
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'TEST_ONLY_PUBLISHABLE'
const requests: Request[] = []
globalThis.fetch = async (input, init) => {
  requests.push(new Request(input, init))
  return new Response(null, { status: 201 })
}
try {
  const response = await POST(new Request('http://localhost/api/vtv', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ website: '', draft: valid }) }))
  ensure(response.status === 201, `public POST expected 201, got ${response.status}`)
  ensure(requests.length === 5 && requests.every((request) => request.method === 'POST'), 'public POST escaped create-only adapter')
  ensure(requests.every((request) => request.url.includes('/rest/v1/')), 'public POST used an unexpected remote path')
} finally {
  globalThis.fetch = originalFetch
  if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url
  if (previous.service === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.service
  if (previous.publishable === undefined) delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY; else process.env.VITE_SUPABASE_PUBLISHABLE_KEY = previous.publishable
}

console.log(JSON.stringify({ validPayload: 'PASS', serverOwnedIds: 'PASS', invalidPayloads: 'PASS', createOnlyWrites: 'PASS' }))
