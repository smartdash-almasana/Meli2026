import type { EventContact } from '../../types/contact'
import type { DiscoveryDraft, DiscoveryInterview, SurveyResponse } from '../../types/discovery'
import type { EventTimeline } from '../../types/event'
import type { PainObservation } from '../../types/pain'
import type { SyncOutboxEntry } from '../../types/sync'
import { createLocalId, db, nowIso } from './db'
import { qualifyInterview } from '../qualification'

const EVENT_ID = 'mle-2026'

export async function saveDiscoveryDraft(draft: DiscoveryDraft, operatorId: EventContact['capturedBy']): Promise<DiscoveryInterview> {
  const now = nowIso()
  const existing = draft.id ? await db.discoveryInterviews.get(draft.id) : undefined
  const interview: DiscoveryInterview = {
    id: existing?.id ?? draft.id ?? createLocalId(),
    contactId: existing?.contactId,
    eventId: existing?.eventId ?? EVENT_ID,
    actorType: draft.actorType ?? existing?.actorType ?? 'other',
    operatorId,
    startedAt: existing?.startedAt ?? now,
    updatedAt: now,
    completedAt: existing?.completedAt,
    currentStep: draft.currentStep ?? existing?.currentStep ?? 0,
    status: existing?.status ?? 'in_progress',
    publicationRange: draft.publicationRange ?? existing?.publicationRange,
    salesRange: draft.salesRange ?? existing?.salesRange,
    teamSize: draft.teamSize ?? existing?.teamSize,
    salesChannels: draft.salesChannels ?? existing?.salesChannels ?? [],
    meliChannelRole: draft.meliChannelRole ?? existing?.meliChannelRole,
    operatorContext: draft.operatorContext ?? existing?.operatorContext,
    clientsRange: draft.clientsRange ?? existing?.clientsRange,
    hasOwnMeliIntegration: draft.hasOwnMeliIntegration ?? existing?.hasOwnMeliIntegration,
    integrationModel: draft.integrationModel ?? existing?.integrationModel,
    stack: draft.stack ?? existing?.stack ?? [],
    stackOther: draft.stackOther ?? existing?.stackOther,
    primaryPain: draft.primaryPain ?? existing?.primaryPain ?? '',
    painTags: draft.painTags ?? existing?.painTags ?? [],
    painOther: draft.painOther ?? existing?.painOther,
    currentSolution: draft.currentSolution ?? existing?.currentSolution,
    currentSolutionOther: draft.currentSolutionOther ?? existing?.currentSolutionOther,
    lastIncident: draft.lastIncident ?? existing?.lastIncident,
    toolClarityScore: draft.toolClarityScore ?? existing?.toolClarityScore,
    paysUnusedFeatures: draft.paysUnusedFeatures ?? existing?.paysUnusedFeatures,
    conflictingSystems: draft.conflictingSystems ?? existing?.conflictingSystems,
    toolChoiceEase: draft.toolChoiceEase ?? existing?.toolChoiceEase,
    systemCountBand: draft.systemCountBand ?? existing?.systemCountBand,
    unusedFeaturesBand: draft.unusedFeaturesBand ?? existing?.unusedFeaturesBand,
    inconsistentInfoFrequency: draft.inconsistentInfoFrequency ?? existing?.inconsistentInfoFrequency,
    discardedToolReason: draft.discardedToolReason ?? existing?.discardedToolReason,
    abandonedDueComplexity: draft.abandonedDueComplexity ?? existing?.abandonedDueComplexity,
    abandonedNeed: draft.abandonedNeed ?? existing?.abandonedNeed,
    whatsappAlertWish: draft.whatsappAlertWish ?? existing?.whatsappAlertWish,
    whatsappQuestionWish: draft.whatsappQuestionWish ?? existing?.whatsappQuestionWish,
    whatsappAvoid: draft.whatsappAvoid ?? existing?.whatsappAvoid,
    whatsappMode: draft.whatsappMode ?? existing?.whatsappMode,
    whatsappInterest: draft.whatsappInterest ?? existing?.whatsappInterest ?? [],
    customSolutionInterest: draft.customSolutionInterest ?? existing?.customSolutionInterest,
    customSolutionFormats: draft.customSolutionFormats ?? existing?.customSolutionFormats ?? [],
    solutionPreference: draft.solutionPreference ?? existing?.solutionPreference,
    developerRequestedCapability: draft.developerRequestedCapability ?? existing?.developerRequestedCapability,
    developerCapabilityInterest: draft.developerCapabilityInterest ?? existing?.developerCapabilityInterest,
    developerFormats: draft.developerFormats ?? existing?.developerFormats ?? [],
    developerCapabilityFormats: draft.developerCapabilityFormats ?? existing?.developerCapabilityFormats ?? [],
    urgencyScore: draft.urgencyScore ?? existing?.urgencyScore,
    impactScore: draft.impactScore ?? existing?.impactScore,
    interestScore: draft.interestScore ?? existing?.interestScore,
    nextStep: draft.nextStep ?? existing?.nextStep,
    followupDate: draft.followupDate ?? existing?.followupDate,
    operatorNotes: draft.operatorNotes ?? existing?.operatorNotes,
    fullName: draft.fullName ?? existing?.fullName,
    companyName: draft.companyName ?? existing?.companyName,
    whatsapp: draft.whatsapp ?? existing?.whatsapp,
    email: draft.email ?? existing?.email,
    meliNickname: draft.meliNickname ?? existing?.meliNickname,
    followupConsent: draft.followupConsent ?? existing?.followupConsent,
    business_name: draft.business_name ?? existing?.business_name,
    meli_tenure: draft.meli_tenure ?? existing?.meli_tenure,
    meli_level: draft.meli_level ?? existing?.meli_level,
    sku_count_range: draft.sku_count_range ?? existing?.sku_count_range,
    orders_month_range: draft.orders_month_range ?? existing?.orders_month_range,
    channels: draft.channels ?? existing?.channels ?? [],
    channels_other: draft.channels_other ?? existing?.channels_other,
    channel_mode: draft.channel_mode ?? existing?.channel_mode,
    current_tools: draft.current_tools ?? existing?.current_tools ?? [],
    operation_mode: draft.operation_mode ?? existing?.operation_mode,
    tools_other: draft.tools_other ?? existing?.tools_other,
    manual_tasks: draft.manual_tasks ?? existing?.manual_tasks ?? [],
    manual_tasks_other: draft.manual_tasks_other ?? existing?.manual_tasks_other,
    operator_count: draft.operator_count ?? existing?.operator_count,
    main_manual_task: draft.main_manual_task ?? existing?.main_manual_task,
    main_pain: draft.main_pain ?? existing?.main_pain,
    main_concern: draft.main_concern ?? existing?.main_concern,
    problems: draft.problems ?? existing?.problems ?? [],
    problems_other: draft.problems_other ?? existing?.problems_other,
    margin_method: draft.margin_method ?? existing?.margin_method,
    margin_clarity: draft.margin_clarity ?? existing?.margin_clarity,
    product_cost_source: draft.product_cost_source ?? existing?.product_cost_source,
    cost_source_other: draft.cost_source_other ?? existing?.cost_source_other,
    cost_update_frequency: draft.cost_update_frequency ?? existing?.cost_update_frequency,
    target_margin: draft.target_margin ?? existing?.target_margin,
    last_price_trigger: draft.last_price_trigger ?? existing?.last_price_trigger,
    low_margin_awareness: draft.low_margin_awareness ?? existing?.low_margin_awareness,
    priorities: draft.priorities ?? existing?.priorities ?? [],
    focus_mode: draft.focus_mode ?? existing?.focus_mode,
    focus_other: draft.focus_other ?? existing?.focus_other,
    one_problem_to_remove: draft.one_problem_to_remove ?? existing?.one_problem_to_remove,
    sample_sku_willingness: draft.sample_sku_willingness ?? existing?.sample_sku_willingness,
    product_cost_available: draft.product_cost_available ?? existing?.product_cost_available,
    order_sample_willingness: draft.order_sample_willingness ?? existing?.order_sample_willingness,
    consent_contact: draft.consent_contact ?? existing?.consent_contact,
    consent_analysis: draft.consent_analysis ?? existing?.consent_analysis,
    followup_mode: draft.followup_mode ?? existing?.followup_mode,
  }
  await db.discoveryInterviews.put(interview)
  const response: SurveyResponse = { id: `${interview.id}:${interview.currentStep}`, interviewId: interview.id, questionKey: `step_${interview.currentStep}`, value: interview, updatedAt: now }
  await db.surveyResponses.put(response)
  return interview
}

export function getDiscoveryInterview(id: string): Promise<DiscoveryInterview | undefined> {
  return db.discoveryInterviews.get(id)
}

export function listDiscoveryInterviews(): Promise<DiscoveryInterview[]> {
  return db.discoveryInterviews.orderBy('updatedAt').reverse().toArray()
}

export interface CompleteDiscoveryInput {
  interview: DiscoveryInterview
  contact: Pick<EventContact, 'capturedBy' | 'actorType' | 'fullName' | 'companyName' | 'whatsapp' | 'email' | 'meliNickname' | 'followupConsent' | 'catalogVolumeBand'>
}

export interface CompleteDiscoveryResult {
  contact: EventContact
  interview: DiscoveryInterview
  pains: PainObservation[]
  timeline: EventTimeline[]
  outbox: SyncOutboxEntry[]
}

export async function completeDiscoveryInterview(input: CompleteDiscoveryInput): Promise<CompleteDiscoveryResult> {
  const now = nowIso()
  const contactId = createLocalId()
  const contact: EventContact = { ...input.contact, id: contactId, createdAt: now, updatedAt: now, syncStatus: 'local' }
  const interview: DiscoveryInterview = { ...input.interview, contactId, status: 'completed', completedAt: now, updatedAt: now }
  const priorities = interview.priorities?.length ? interview.priorities : interview.painTags
  const primaryPain = interview.main_pain?.trim() || interview.primaryPain
  const pains = priorities.map((tag, index) => ({ id: createLocalId(), contactId, painCode: tag, isPrimary: primaryPain.length > 0 && index === 0, quote: primaryPain || undefined, createdAt: now })) as PainObservation[]
  const timeline: EventTimeline[] = [
    { id: createLocalId(), contactId, entityType: 'event_contacts', entityId: contactId, operatorId: contact.capturedBy, eventType: 'contact_created', occurredAt: now },
    { id: createLocalId(), contactId, entityType: 'discovery_interviews', entityId: interview.id, operatorId: contact.capturedBy, eventType: 'interview_completed', occurredAt: now, metadata: { actorType: interview.actorType, nextStep: interview.nextStep, qualification: qualifyInterview(interview) } },
  ]
  const outbox = [contact, interview, ...pains, ...timeline].map((payload) => ({ id: createLocalId(), entityType: 'eventType' in payload ? 'event_timeline' : 'painCode' in payload ? 'pain_observations' : 'contactId' in payload ? 'discovery_interviews' : 'event_contacts', entityId: payload.id, operation: 'create' as const, payload, status: 'pending' as const, retryCount: 0, createdAt: now, updatedAt: now }))
  await db.transaction('rw', [db.eventContacts, db.discoveryInterviews, db.painObservations, db.eventTimeline, db.syncOutbox], async () => {
    await db.eventContacts.add(contact)
    await db.discoveryInterviews.put(interview)
    await db.painObservations.bulkAdd(pains)
    await db.eventTimeline.bulkAdd(timeline)
    await db.syncOutbox.bulkAdd(outbox)
  })
  return { contact, interview, pains, timeline, outbox }
}
