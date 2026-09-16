import { buildPublicRows, POST, validatePublicIntake, type PublicIntakePayload } from '../api/vtv'

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const valid: PublicIntakePayload = {
  business_name: 'TEST_ONLY Public VTV', business_type: 'seller', business_category: 'retail', team_size: '2_3', whatsapp: '+54 9 11 5555 0101', email: 'seller@example.com',
  channel_mode: 'multi_channel', channels: ['shopify', 'other'], channels_other: 'Feria local',
  meli_tenure: '6_12_months', sku_count_range: '11_50', orders_month_range: '11_50', operation_mode: 'systems', owner_role: 'owner', owner_manual_tasks: 'Conciliar cobros', manual_control_hours: '2_5', critical_info_search: 'Ventas y cobros',
  current_tools: ['spreadsheets', 'other'], tools_other: 'Planilla propia', manual_tasks: ['prices', 'stock'],
  main_concern: 'profit', problems: ['profit_per_product', 'meli_fees'], growth_difficulties: ['margin', 'stock'], margin_clarity: 'unclear',
  product_cost_source: 'spreadsheet', cost_update_frequency: 'monthly', target_margin: 'by_product', margin_components: ['meli_fees', 'ads'], supply_models: ['direct_import', 'other'], primary_supply_model: 'direct_import', supply_model_other: 'Fabricación tercerizada', stock_owner: 'owner', stock_sync: 'partial', stockout_frequency: 'sometimes', supplier_lead_time: '1_3_weeks', supplier_count: '2_5', uses_full: 'no', ads_usage: 'yes', ads_manager: 'owner', ads_budget_method: 'performance', ads_profitability: 'unknown', post_sale_channels: ['claims'], recurring_postsale_issue: 'Seguimiento manual', open_problem: 'Controlar margen', missing_data: 'Costos externos',
  focus_mode: 'profitability', priorities: ['profitability', 'prices'], followup_mode: 'orientation',
  consent_contact: true, consent_analysis: true,
}

const normalized = validatePublicIntake({ website: '', draft: valid })
ensure(normalized.business_name === valid.business_name && normalized.priorities.length === 2 && normalized.growth_difficulties?.length === 2 && normalized.post_sale_channels?.length === 1 && normalized.supply_models.length === 2 && normalized.primary_supply_model === 'direct_import' && normalized.supply_model_other === 'Fabricación tercerizada', 'valid payload normalization failed')
const singleSupply = validatePublicIntake({ draft: { ...valid, supply_models: ['wholesale_resale'], primary_supply_model: undefined, supply_model_other: 'residual' } })
ensure(singleSupply.primary_supply_model === 'wholesale_resale' && singleSupply.supply_model_other === undefined, 'single supply normalization failed')
ensure(buildPublicRows(normalized).tables.event_contacts[0] && buildPublicRows(normalized).tables.discovery_interviews[0], 'server row construction failed')
const rows = buildPublicRows(normalized)
const contact = rows.tables.event_contacts[0] as Record<string, unknown>
const interview = rows.tables.discovery_interviews[0] as Record<string, unknown>
ensure(typeof contact.id === 'string' && contact.captured_by === 'public_vtv_intake', 'server-owned contact identity failed')
ensure(typeof interview.id === 'string' && interview.operator_id === 'public_vtv_intake', 'server-owned operator identity failed')
const persistedPayload = interview.payload as Record<string, unknown>
ensure(JSON.stringify(persistedPayload.supply_models) === JSON.stringify(['direct_import', 'other']) && persistedPayload.primary_supply_model === 'direct_import' && persistedPayload.supply_model_other === 'Fabricación tercerizada', 'supply model persistence failed')

const invalidCases: Array<[string, unknown]> = [
  ['consent', { draft: { ...valid, consent_analysis: false } }],
  ['forbidden-field', { draft: { ...valid, operator_id: 'alejandro' } }],
  ['too-many-priorities', { draft: { ...valid, priorities: ['prices', 'stock', 'shipping', 'other'] } }],
  ['missing-supply-model', { draft: { ...valid, supply_models: [] } }],
  ['missing-primary-supply-model', { draft: { ...valid, primary_supply_model: undefined } }],
  ['primary-supply-model-not-selected', { draft: { ...valid, primary_supply_model: 'wholesale_resale' } }],
  ['missing-supply-model-other', { draft: { ...valid, supply_model_other: '   ' } }],
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
