import type { ActorType } from '../../types/contact'
import type { DiscoveryInterview } from '../../types/discovery'

export const SURVEY_SCREENS = [
  { id: 'PROFILE', title: 'Tu negocio' },
  { id: 'OPERATION', title: 'Cómo trabajás hoy' },
  { id: 'CONCERNS', title: 'Qué te está complicando' },
  { id: 'MARGIN', title: 'Margen y costos' },
  { id: 'FOCUS', title: 'Qué querés que revisemos' },
  { id: 'NEXT_STEP', title: 'Siguiente paso' },
]

export const REQUIRED_FIELDS = [
  'business_name', 'whatsapp', 'channel_mode', 'channels', 'meli_tenure', 'sku_count_range',
  'operation_mode', 'current_tools', 'manual_tasks', 'main_concern', 'problems', 'margin_clarity',
  'product_cost_source', 'cost_update_frequency', 'target_margin', 'focus_mode', 'priorities',
  'followup_mode', 'consent_contact', 'consent_analysis',
] as const

export function isDeveloperBranch(actor?: ActorType): boolean { return actor === 'developer' || actor === 'software_house' }
export function whatsappFollowupEnabled(values?: string[]): boolean { return Boolean(values?.some((value) => ['alerts', 'queries', 'both'].includes(value))) }

export function isCompleteInterview(interview: DiscoveryInterview): boolean {
  const text = (value?: string) => Boolean(value?.trim())
  const priorities = interview.priorities ?? []
  const legacyComplete = Boolean(
    text(interview.business_name) && text(interview.whatsapp) && text(interview.meli_tenure) &&
    text(interview.sku_count_range) && text(interview.orders_month_range) && (interview.current_tools?.length ?? 0) > 0 &&
    text(interview.operator_count) && text(interview.main_manual_task) && text(interview.main_pain) &&
    text(interview.margin_method) && text(interview.product_cost_source) && text(interview.cost_update_frequency) &&
    text(interview.last_price_trigger) && text(interview.low_margin_awareness) && priorities.length > 0 && priorities.length <= 3 &&
    text(interview.one_problem_to_remove) && text(interview.sample_sku_willingness) && text(interview.product_cost_available) &&
    text(interview.order_sample_willingness) && interview.consent_contact === true && interview.consent_analysis === true,
  )
  const modernComplete = Boolean(
    text(interview.business_name) && text(interview.whatsapp) && text(interview.channel_mode) &&
    (interview.channels?.length ?? 0) > 0 && text(interview.meli_tenure) && text(interview.sku_count_range) &&
    text(interview.operation_mode) && (interview.current_tools?.length ?? 0) > 0 &&
    (interview.manual_tasks?.length ?? 0) > 0 && text(interview.main_concern) &&
    (interview.problems?.length ?? 0) > 0 && (interview.problems?.length ?? 0) <= 3 &&
    text(interview.margin_clarity) && text(interview.product_cost_source) &&
    text(interview.cost_update_frequency) && text(interview.target_margin) && text(interview.focus_mode) &&
    priorities.length > 0 && priorities.length <= 3 && text(interview.followup_mode) &&
    interview.consent_contact === true && interview.consent_analysis === true,
  )
  return legacyComplete || modernComplete
}
