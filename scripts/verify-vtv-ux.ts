import 'fake-indexeddb/auto'
import { db } from '../src/lib/storage/db'
import { completeDiscoveryInterview, getDiscoveryInterview, saveDiscoveryDraft } from '../src/lib/storage/discovery.repository'
import { isCompleteInterview } from '../src/features/interview/survey-contract'
import type { DiscoveryDraft } from '../src/types/discovery'

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

await db.delete(); await db.open()
const draft: DiscoveryDraft = {
  actorType: 'seller', operatorId: 'alejandro', eventId: 'mle-2026', currentStep: 5, status: 'in_progress',
  stack: ['spreadsheets'], painTags: ['profitability'], developerFormats: [], primaryPain: 'No tengo claro si estoy ganando lo suficiente',
  business_name: 'TEST_ONLY VTV UX', whatsapp: '+54 9 11 5555 0000', channel_mode: 'multi_channel',
  channels: ['tiendanube', 'shopify', 'other'], channels_other: 'Feria local', meli_tenure: '6_12_months',
  sku_count_range: '11_50', orders_month_range: '11_50', operation_mode: 'systems', current_tools: ['spreadsheets', 'other'],
  tools_other: 'Herramienta propia', manual_tasks: ['prices', 'stock', 'other'], manual_tasks_other: 'Reportes',
  main_manual_task: 'Actualizar precios; Controlar stock; Otro', main_concern: 'profit', main_pain: 'No tengo claro si estoy ganando lo suficiente',
  problems: ['prices', 'profit_per_product', 'other'], problems_other: 'Cambios de proveedor', margin_clarity: 'unclear',
  margin_method: 'unclear', product_cost_source: 'other', cost_source_other: 'Planilla del proveedor', cost_update_frequency: 'supplier_change',
  target_margin: 'by_product', supply_models: ['wholesale_resale', 'direct_import'], primary_supply_model: 'wholesale_resale', priorities: ['profitability', 'prices', 'other'], focus_mode: 'profitability', focus_other: 'Automatización de reportes',
  followup_mode: 'pilot', nextStep: 'pilot', consent_contact: true, consent_analysis: true,
}
const saved = await saveDiscoveryDraft(draft, 'alejandro')
const recovered = await getDiscoveryInterview(saved.id)
ensure(recovered, 'modern VTV draft recovery failed')
ensure(recovered?.channels?.length === 3 && recovered.channels_other === 'Feria local', 'channel multiselect/other persistence failed')
ensure(recovered?.manual_tasks?.length === 3 && recovered.manual_tasks_other === 'Reportes', 'manual task multiselect/other persistence failed')
ensure(recovered?.problems?.length === 3 && recovered.priorities?.length === 3, 'three-item selection persistence failed')
ensure(recovered?.supply_models?.length === 2 && recovered.primary_supply_model === 'wholesale_resale', 'supply model persistence failed')
ensure(isCompleteInterview(recovered), 'modern VTV completion contract failed')
ensure(!isCompleteInterview({ ...recovered, problems: ['a', 'b', 'c', 'd'] }), 'problem max-three contract failed')
ensure(!isCompleteInterview({ ...recovered, priorities: ['a', 'b', 'c', 'd'] }), 'priority max-three contract failed')
const completed = await completeDiscoveryInterview({ interview: recovered, contact: { capturedBy: 'alejandro', actorType: 'seller', fullName: recovered.business_name, companyName: recovered.business_name, whatsapp: recovered.whatsapp, followupConsent: true, catalogVolumeBand: recovered.sku_count_range } })
ensure(completed.interview.status === 'completed' && completed.outbox.length >= 5, 'modern VTV submit/outbox failed')
console.log(JSON.stringify({ channelsMultiselect: 'PASS', otherConditionalPayload: 'PASS', problemMax3: 'PASS', priorityMax3: 'PASS', contract: 'PASS', submit: 'PASS', outbox: completed.outbox.length }))
