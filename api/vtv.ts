import { getSupabaseRuntimeConfig } from './supabase/runtime.js'

const EVENT_ID = 'mle-2026'
const PUBLIC_CAPTURED_BY = 'public_vtv_intake'
const MAX_BODY_BYTES = 64 * 1024
const MAX_ARRAY_ITEMS = 12

const channelModes = new Set(['meli_only', 'multi_channel'])
const channels = new Set(['meli_only', 'tiendanube', 'woocommerce', 'shopify', 'social', 'physical_store', 'own_web', 'other_marketplaces', 'other'])
const tenures = new Set(['less_6_months', '6_12_months', '1_3_years', 'more_3_years'])
const scales = new Set(['1_10', '11_50', '51_200', '201_1000', 'more_1000', 'unknown'])
const orders = new Set(['0_10', '11_50', '51_200', '201_500', 'more_500', 'unknown'])
const operationModes = new Set(['manual', 'systems'])
const tools = new Set(['spreadsheets', 'stock', 'invoicing', 'management', 'multichannel', 'pricing', 'listings', 'crm', 'other'])
const manualTasks = new Set(['prices', 'stock', 'listings', 'invoicing', 'collections', 'claims', 'returns', 'costs', 'reports', 'other'])
const concerns = new Set(['time', 'profit'])
const problems = new Set(['prices', 'profit_per_product', 'cost_changes', 'meli_fees', 'stock', 'invoicing', 'collections', 'listings', 'shipping', 'claims_returns', 'manual_work', 'multichannel', 'other'])
const marginClarity = new Set(['clear', 'unclear'])
const costSources = new Set(['spreadsheet', 'management', 'supplier', 'other_tool', 'manual', 'outdated', 'other'])
const frequencies = new Set(['daily', 'weekly', 'monthly', 'supplier_change', 'problem', 'rarely'])
const targetMargins = new Set(['general', 'by_product', 'roughly', 'none'])
const focusModes = new Set(['profitability', 'operation'])
const priorities = new Set(['profitability', 'prices', 'meli_fees', 'listings', 'stock', 'shipping', 'claims_returns', 'collections', 'invoicing', 'multichannel', 'automation', 'other'])
const followupModes = new Set(['pilot', 'orientation'])
const businessTypes = new Set(['seller', 'distributor', 'service', 'mixed'])
const businessCategories = new Set(['retail', 'technical_service', 'professional', 'industrial', 'other'])
const teamSizes = new Set(['one', '2_3', '4_10', 'more_10'])
const ownerRoles = new Set(['owner', 'team', 'shared'])
const controlHours = new Set(['less_2', '2_5', '6_10', 'more_10'])
const growthDifficulties = new Set(['stock', 'margin', 'attention', 'billing', 'reconciliation', 'logistics', 'advertising', 'team', 'personal_time', 'control', 'other'])
const marginComponents = new Set(['meli_fees', 'shipping', 'promotions', 'ads', 'returns', 'external_costs'])
const stockOwners = new Set(['owner', 'team', 'system', 'shared'])
const stockSyncModes = new Set(['yes', 'partial', 'no', 'unknown'])
const stockoutFrequencies = new Set(['never', 'sometimes', 'often', 'unknown'])
const supplierLeadTimes = new Set(['same_week', '1_3_weeks', 'more_3_weeks', 'unknown'])
const supplierCounts = new Set(['one', '2_5', 'more_5', 'unknown'])
const yesNoUnknown = new Set(['yes', 'no', 'unknown'])
const adsManagers = new Set(['owner', 'team', 'agency', 'shared'])
const adsBudgetMethods = new Set(['fixed', 'sales', 'performance', 'intuition', 'unknown'])
const postSaleSignals = new Set(['returns', 'claims', 'questions', 'manual', 'recurring', 'none'])
const forbiddenKeys = new Set(['id', 'contactId', 'contact_id', 'operator', 'operatorId', 'operator_id', 'capturedBy', 'captured_by', 'eventId', 'event_id', 'status', 'completedAt', 'completed_at', 'tenantId', 'tenant_id', 'admin'])

export interface PublicIntakePayload {
  business_name: string
  business_type?: string
  business_category?: string
  team_size?: string
  whatsapp: string
  email?: string
  channel_mode: 'meli_only' | 'multi_channel'
  channels: string[]
  channels_other?: string
  meli_tenure: string
  sku_count_range: string
  orders_month_range: string
  operation_mode: 'manual' | 'systems'
  owner_role?: string
  owner_manual_tasks?: string
  manual_control_hours?: string
  critical_info_search?: string
  current_tools: string[]
  tools_other?: string
  manual_tasks: string[]
  manual_tasks_other?: string
  main_concern: string
  problems: string[]
  problems_other?: string
  growth_difficulties?: string[]
  growth_difficulties_other?: string
  margin_clarity: string
  product_cost_source: string
  cost_source_other?: string
  cost_update_frequency: string
  target_margin: string
  margin_components?: string[]
  stock_owner?: string
  stock_sync?: string
  stockout_frequency?: string
  supplier_lead_time?: string
  supplier_count?: string
  uses_full?: string
  ads_usage?: string
  ads_manager?: string
  ads_budget_method?: string
  ads_profitability?: string
  post_sale_channels?: string[]
  recurring_postsale_issue?: string
  open_problem?: string
  missing_data?: string
  focus_mode: string
  priorities: string[]
  focus_other?: string
  followup_mode: string
  consent_contact: true
  consent_analysis: true
}

type RecordValue = Record<string, unknown>

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, field: string, maxLength: number, required = true): string | undefined {
  if (value === undefined && !required) return undefined
  if (typeof value !== 'string') throw new Error(`invalid_${field}`)
  const normalized = value.trim()
  if (required && !normalized) throw new Error(`missing_${field}`)
  if (normalized.length > maxLength) throw new Error(`too_long_${field}`)
  return normalized || undefined
}

function choice(value: unknown, field: string, allowed: Set<string>): string {
  const normalized = text(value, field, 80)
  if (!normalized || !allowed.has(normalized)) throw new Error(`invalid_${field}`)
  return normalized
}

function optionalChoice(value: unknown, field: string, allowed: Set<string>): string | undefined {
  const normalized = text(value, field, 120, false)
  if (!normalized) return undefined
  if (!allowed.has(normalized)) throw new Error(`invalid_${field}`)
  return normalized
}

function list(value: unknown, field: string, allowed: Set<string>, maxItems = MAX_ARRAY_ITEMS): string[] {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error(`invalid_${field}`)
  const normalized = value.map((item) => text(item, field, 80)).filter((item): item is string => Boolean(item))
  if (normalized.length !== value.length || new Set(normalized).size !== normalized.length || normalized.some((item) => !allowed.has(item))) throw new Error(`invalid_${field}`)
  return normalized
}

function optionalList(value: unknown, field: string, allowed: Set<string>, maxItems = MAX_ARRAY_ITEMS): string[] | undefined {
  if (value === undefined || value === null) return undefined
  return list(value, field, allowed, maxItems)
}

export function validatePublicIntake(input: unknown): PublicIntakePayload {
  if (!isRecord(input)) throw new Error('invalid_payload')
  if (typeof input.website === 'string' && input.website.trim()) throw new Error('honeypot_triggered')
  const draft = isRecord(input.draft) ? input.draft : input
  if (Object.keys(draft).some((key) => forbiddenKeys.has(key))) throw new Error('forbidden_field')

  const channelMode = choice(draft.channel_mode, 'channel_mode', channelModes) as PublicIntakePayload['channel_mode']
  const selectedChannels = list(draft.channels, 'channels', channels)
  if (channelMode === 'meli_only' && (selectedChannels.length !== 1 || selectedChannels[0] !== 'meli_only')) throw new Error('invalid_channels')
  if (channelMode === 'multi_channel' && selectedChannels.length === 0) throw new Error('invalid_channels')
  if (selectedChannels.includes('other') && !text(draft.channels_other, 'channels_other', 120)) throw new Error('missing_channels_other')

  const operationMode = choice(draft.operation_mode, 'operation_mode', operationModes) as PublicIntakePayload['operation_mode']
  const selectedTools = operationMode === 'manual' ? [] : list(draft.current_tools, 'current_tools', tools)
  if (operationMode === 'systems' && selectedTools.length === 0) throw new Error('invalid_current_tools')
  if (selectedTools.includes('other') && !text(draft.tools_other, 'tools_other', 120)) throw new Error('missing_tools_other')
  const selectedManualTasks = list(draft.manual_tasks, 'manual_tasks', manualTasks)
  if (selectedManualTasks.length === 0) throw new Error('invalid_manual_tasks')
  if (selectedManualTasks.includes('other') && !text(draft.manual_tasks_other, 'manual_tasks_other', 120)) throw new Error('missing_manual_tasks_other')

  const selectedProblems = list(draft.problems, 'problems', problems, 3)
  if (selectedProblems.length === 0) throw new Error('invalid_problems')
  if (selectedProblems.includes('other') && !text(draft.problems_other, 'problems_other', 120)) throw new Error('missing_problems_other')
  const selectedPriorities = list(draft.priorities, 'priorities', priorities, 3)
  if (selectedPriorities.length === 0) throw new Error('invalid_priorities')
  if (selectedPriorities.includes('other') && !text(draft.focus_other, 'focus_other', 120)) throw new Error('missing_focus_other')
  if (draft.product_cost_source === 'other' && !text(draft.cost_source_other, 'cost_source_other', 120)) throw new Error('missing_cost_source_other')

  const selectedGrowthDifficulties = optionalList(draft.growth_difficulties, 'growth_difficulties', growthDifficulties)
  if (selectedGrowthDifficulties?.includes('other') && !text(draft.growth_difficulties_other, 'growth_difficulties_other', 120)) throw new Error('missing_growth_difficulties_other')
  const selectedMarginComponents = optionalList(draft.margin_components, 'margin_components', marginComponents)
  const selectedPostSaleSignals = optionalList(draft.post_sale_channels, 'post_sale_channels', postSaleSignals)

  return {
    business_name: text(draft.business_name, 'business_name', 120)!,
    business_type: optionalChoice(draft.business_type, 'business_type', businessTypes),
    business_category: optionalChoice(draft.business_category, 'business_category', businessCategories),
    team_size: optionalChoice(draft.team_size, 'team_size', teamSizes),
    whatsapp: text(draft.whatsapp, 'whatsapp', 40)!,
    email: text(draft.email, 'email', 160, false),
    channel_mode: channelMode,
    channels: selectedChannels,
    channels_other: text(draft.channels_other, 'channels_other', 120, false),
    meli_tenure: choice(draft.meli_tenure, 'meli_tenure', tenures),
    sku_count_range: choice(draft.sku_count_range, 'sku_count_range', scales),
    orders_month_range: choice(draft.orders_month_range, 'orders_month_range', orders),
    operation_mode: operationMode,
    owner_role: optionalChoice(draft.owner_role, 'owner_role', ownerRoles),
    owner_manual_tasks: text(draft.owner_manual_tasks, 'owner_manual_tasks', 240, false),
    manual_control_hours: optionalChoice(draft.manual_control_hours, 'manual_control_hours', controlHours),
    critical_info_search: text(draft.critical_info_search, 'critical_info_search', 400, false),
    current_tools: selectedTools,
    tools_other: text(draft.tools_other, 'tools_other', 120, false),
    manual_tasks: selectedManualTasks,
    manual_tasks_other: text(draft.manual_tasks_other, 'manual_tasks_other', 120, false),
    main_concern: choice(draft.main_concern, 'main_concern', concerns),
    problems: selectedProblems,
    problems_other: text(draft.problems_other, 'problems_other', 120, false),
    growth_difficulties: selectedGrowthDifficulties,
    growth_difficulties_other: text(draft.growth_difficulties_other, 'growth_difficulties_other', 120, false),
    margin_clarity: choice(draft.margin_clarity, 'margin_clarity', marginClarity),
    product_cost_source: choice(draft.product_cost_source, 'product_cost_source', costSources),
    cost_source_other: text(draft.cost_source_other, 'cost_source_other', 120, false),
    cost_update_frequency: choice(draft.cost_update_frequency, 'cost_update_frequency', frequencies),
    target_margin: choice(draft.target_margin, 'target_margin', targetMargins),
    margin_components: selectedMarginComponents,
    stock_owner: optionalChoice(draft.stock_owner, 'stock_owner', stockOwners),
    stock_sync: optionalChoice(draft.stock_sync, 'stock_sync', stockSyncModes),
    stockout_frequency: optionalChoice(draft.stockout_frequency, 'stockout_frequency', stockoutFrequencies),
    supplier_lead_time: optionalChoice(draft.supplier_lead_time, 'supplier_lead_time', supplierLeadTimes),
    supplier_count: optionalChoice(draft.supplier_count, 'supplier_count', supplierCounts),
    uses_full: optionalChoice(draft.uses_full, 'uses_full', yesNoUnknown),
    ads_usage: optionalChoice(draft.ads_usage, 'ads_usage', yesNoUnknown),
    ads_manager: optionalChoice(draft.ads_manager, 'ads_manager', adsManagers),
    ads_budget_method: optionalChoice(draft.ads_budget_method, 'ads_budget_method', adsBudgetMethods),
    ads_profitability: optionalChoice(draft.ads_profitability, 'ads_profitability', yesNoUnknown),
    post_sale_channels: selectedPostSaleSignals,
    recurring_postsale_issue: text(draft.recurring_postsale_issue, 'recurring_postsale_issue', 240, false),
    open_problem: text(draft.open_problem, 'open_problem', 400, false),
    missing_data: text(draft.missing_data, 'missing_data', 400, false),
    focus_mode: choice(draft.focus_mode, 'focus_mode', focusModes),
    priorities: selectedPriorities,
    focus_other: text(draft.focus_other, 'focus_other', 120, false),
    followup_mode: choice(draft.followup_mode, 'followup_mode', followupModes),
    consent_contact: draft.consent_contact === true ? true : (() => { throw new Error('consent_contact_required') })(),
    consent_analysis: draft.consent_analysis === true ? true : (() => { throw new Error('consent_analysis_required') })(),
  }
}

interface PublicRows {
  contactId: string
  tables: Record<string, unknown[]>
}

export function buildPublicRows(payload: PublicIntakePayload, now = new Date().toISOString()): PublicRows {
  const contactId = crypto.randomUUID()
  const interviewId = crypto.randomUUID()
  const contact = {
    id: contactId, created_at: now, updated_at: now, captured_by: PUBLIC_CAPTURED_BY, actor_type: 'seller',
    full_name: payload.business_name, company_name: payload.business_name, whatsapp: payload.whatsapp,
    email: payload.email, followup_consent: payload.consent_contact,
  }
  const interview = {
    id: interviewId, contact_id: contactId, event_id: EVENT_ID, actor_type: 'seller', operator_id: PUBLIC_CAPTURED_BY,
    started_at: now, updated_at: now, completed_at: now, current_step: 7, status: 'completed', payload,
  }
  const painRows = payload.priorities.map((tag, index) => ({
    id: crypto.randomUUID(), interview_id: interviewId, contact_id: contactId, tag, text: payload.main_concern,
    is_primary: index === 0, created_at: now,
  }))
  const timelineRows = [
    { id: crypto.randomUUID(), entity_type: 'event_contacts', entity_id: contactId, contact_id: contactId, event_type: 'contact_created', payload: { source: 'public_vtv' }, occurred_at: now },
    { id: crypto.randomUUID(), entity_type: 'discovery_interviews', entity_id: interviewId, contact_id: contactId, event_type: 'interview_completed', payload: { source: 'public_vtv', actor_type: 'seller' }, occurred_at: now },
  ]
  return { contactId, tables: { event_contacts: [contact], discovery_interviews: [interview], pain_observations: painRows, event_timeline: timelineRows } }
}

async function insertRows(url: string, serviceRoleKey: string, table: string, rows: unknown[]): Promise<void> {
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!response.ok) throw new Error(`insert_failed_${table}`)
}

export async function POST(request: Request): Promise<Response> {
  try {
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return Response.json({ error: 'payload_too_large' }, { status: 413 })
    const payload = validatePublicIntake(JSON.parse(raw))
    const config = getSupabaseRuntimeConfig()
    const rows = buildPublicRows(payload)
    for (const [table, values] of Object.entries(rows.tables)) {
      if (table === 'pain_observations') {
        for (const value of values) await insertRows(config.url, config.serviceRoleKey, table, [value])
      } else {
        await insertRows(config.url, config.serviceRoleKey, table, values)
      }
    }
    return Response.json({ submitted: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof SyntaxError ? 'invalid_json' : error instanceof Error ? error.message : 'public_submit_failed'
    const status = message.startsWith('invalid_') || message.startsWith('missing_') || message.startsWith('too_long_') || message.startsWith('forbidden_') || message.startsWith('honeypot_') || message.startsWith('consent_') ? 400 : 502
    return Response.json({ error: status === 400 ? message : 'public_submit_failed' }, { status })
  }
}
