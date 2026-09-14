import type { ActorType } from '../../types/contact'
import type { DiscoveryInterview } from '../../types/discovery'

export const SURVEY_SCREENS = [
  { id: 'PROFILE', title: 'Tu operación en Mercado Libre' },
  { id: 'OPERATION', title: 'Cómo trabajás hoy' },
  { id: 'MARGIN', title: 'Margen y precios' },
  { id: 'PRIORITIES', title: 'Qué querés mejorar' },
  { id: 'VTV_PILOT', title: 'VTV PymIA piloto' },
  { id: 'CONFIRMATION', title: 'Listo para tu VTV' },
]

export const REQUIRED_FIELDS = [
  'business_name', 'whatsapp', 'meli_tenure', 'sku_count_range', 'orders_month_range',
  'current_tools', 'operator_count', 'main_manual_task', 'main_pain', 'margin_method',
  'product_cost_source', 'cost_update_frequency', 'last_price_trigger', 'low_margin_awareness',
  'priorities', 'one_problem_to_remove', 'sample_sku_willingness', 'product_cost_available',
  'order_sample_willingness', 'consent_contact', 'consent_analysis',
] as const

export function isDeveloperBranch(actor?: ActorType): boolean { return actor === 'developer' || actor === 'software_house' }
export function whatsappFollowupEnabled(values?: string[]): boolean { return Boolean(values?.some((value) => ['alerts', 'queries', 'both'].includes(value))) }

export function isCompleteInterview(interview: DiscoveryInterview): boolean {
  const text = (value?: string) => Boolean(value?.trim())
  const priorities = interview.priorities ?? []
  return Boolean(
    text(interview.business_name) && text(interview.whatsapp) && text(interview.meli_tenure) &&
    text(interview.sku_count_range) && text(interview.orders_month_range) && (interview.current_tools?.length ?? 0) > 0 &&
    text(interview.operator_count) && text(interview.main_manual_task) && text(interview.main_pain) &&
    text(interview.margin_method) && text(interview.product_cost_source) && text(interview.cost_update_frequency) &&
    text(interview.last_price_trigger) && text(interview.low_margin_awareness) && priorities.length > 0 && priorities.length <= 3 &&
    text(interview.one_problem_to_remove) && text(interview.sample_sku_willingness) && text(interview.product_cost_available) &&
    text(interview.order_sample_willingness) && interview.consent_contact === true && interview.consent_analysis === true,
  )
}
