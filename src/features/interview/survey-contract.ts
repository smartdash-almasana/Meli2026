import type { ActorType } from '../../types/contact'
import type { DiscoveryInterview } from '../../types/discovery'

export const SURVEY_SCREENS = [
  { id: 'ACTOR_TYPE', title: 'Tu actividad' },
  { id: 'PROFILE_AND_SCALE', title: 'Cómo es tu operación' },
  { id: 'CURRENT_STACK', title: 'Herramientas actuales' },
  { id: 'PRIMARY_PAIN', title: 'Problema principal' },
  { id: 'PAIN_TAGS', title: 'Temas relacionados' },
  { id: 'CURRENT_SOLUTION', title: 'Cómo lo resolvés' },
  { id: 'LAST_CONCRETE_INCIDENT', title: 'Qué pasó la última vez' },
  { id: 'ECOSYSTEM_COMPLEXITY', title: 'Cómo trabajan tus sistemas' },
  { id: 'WHATSAPP_DISCOVERY', title: 'WhatsApp en tu operación' },
  { id: 'CUSTOM_SOLUTION_DISCOVERY', title: 'Qué solución tendría sentido' },
  { id: 'COMMERCIAL_SIGNAL', title: 'Urgencia e impacto' },
  { id: 'CONTACT_AND_NEXT_STEP', title: 'Contacto y próximo paso' },
] as const

export const REQUIRED_FIELDS = ['actorType', 'stack', 'primaryPain', 'currentSolution', 'lastIncident', 'toolChoiceEase', 'systemCountBand', 'urgencyScore', 'impactScore', 'fullName', 'followupConsent', 'nextStep'] as const

export function isDeveloperBranch(actor?: ActorType): boolean { return actor === 'developer' || actor === 'software_house' }
export function whatsappFollowupEnabled(values?: string[]): boolean { return Boolean(values?.some((value) => ['alerts', 'queries', 'both'].includes(value))) }
export function isCompleteInterview(interview: DiscoveryInterview): boolean {
  const sellerProfile = interview.actorType !== 'seller' || Boolean(interview.publicationRange && interview.salesRange && interview.teamSize && interview.meliChannelRole)
  return Boolean(interview.actorType && sellerProfile && interview.stack.length && interview.primaryPain.trim() && interview.currentSolution && interview.lastIncident?.trim() && interview.toolChoiceEase && interview.systemCountBand && interview.urgencyScore && interview.impactScore && interview.fullName?.trim() && interview.followupConsent && interview.nextStep)
}
