import type { ActorType, CapturedBy } from './contact'

export type SurveyStatus = 'in_progress' | 'completed'
export type YesNoUnknown = 'yes' | 'no' | 'unknown'

/** Durable payload for the transactional survey and VTV Seller Intake. */
export interface DiscoveryInterview {
  id: string
  contactId?: string
  eventId: string
  actorType: ActorType
  operatorId: CapturedBy
  startedAt: string
  updatedAt: string
  completedAt?: string
  currentStep: number
  status: SurveyStatus

  // VTV Seller Intake v0.1 fields (kept in the existing JSON payload).
  business_name?: string
  whatsapp?: string
  email?: string
  meli_tenure?: string
  meli_level?: string
  sku_count_range?: string
  orders_month_range?: string
  channels?: string[]
  channels_other?: string
  channel_mode?: string
  current_tools?: string[]
  operation_mode?: string
  tools_other?: string
  manual_tasks?: string[]
  manual_tasks_other?: string
  operator_count?: string
  main_manual_task?: string
  main_pain?: string
  main_concern?: string
  problems?: string[]
  problems_other?: string
  margin_method?: string
  margin_clarity?: string
  product_cost_source?: string
  cost_source_other?: string
  cost_update_frequency?: string
  target_margin?: string
  last_price_trigger?: string
  low_margin_awareness?: string
  priorities?: string[]
  focus_mode?: string
  focus_other?: string
  one_problem_to_remove?: string
  sample_sku_willingness?: string
  product_cost_available?: string
  order_sample_willingness?: string
  consent_contact?: boolean
  consent_analysis?: boolean
  followup_mode?: string

  // Legacy fields retained for local records and qualification compatibility.
  publicationRange?: string
  salesRange?: string
  teamSize?: string
  salesChannels?: string[]
  meliChannelRole?: string
  operatorContext?: string
  clientsRange?: string
  hasOwnMeliIntegration?: boolean
  integrationModel?: string
  stack: string[]
  stackOther?: string
  primaryPain: string
  painTags: string[]
  painOther?: string
  currentSolution?: string
  currentSolutionOther?: string
  lastIncident?: string
  toolClarityScore?: number
  paysUnusedFeatures?: YesNoUnknown
  conflictingSystems?: 'yes' | 'no' | 'sometimes'
  toolChoiceEase?: string
  systemCountBand?: string
  unusedFeaturesBand?: string
  inconsistentInfoFrequency?: string
  discardedToolReason?: string
  abandonedDueComplexity?: 'yes' | 'no' | 'unknown'
  abandonedNeed?: string
  whatsappAlertWish?: string
  whatsappQuestionWish?: string
  whatsappAvoid?: string
  whatsappMode?: string
  whatsappInterest?: string[]
  customSolutionInterest?: string
  customSolutionFormats?: string[]
  solutionPreference?: string
  developerRequestedCapability?: string
  developerCapabilityInterest?: string
  developerFormats: string[]
  developerCapabilityFormats?: string[]
  urgencyScore?: number
  impactScore?: number
  interestScore?: number
  nextStep?: string
  followupDate?: string
  operatorNotes?: string
  fullName?: string
  companyName?: string
  meliNickname?: string
  followupConsent?: boolean
}

export type SurveyResponse = {
  id: string
  interviewId: string
  questionKey: string
  value: unknown
  updatedAt: string
}

export type DiscoveryDraft = Omit<DiscoveryInterview, 'id' | 'startedAt' | 'updatedAt' | 'stack' | 'painTags' | 'developerFormats' | 'primaryPain' | 'actorType'> & {
  id?: string
  actorType?: ActorType
  primaryPain?: string
  stack?: string[]
  painTags?: string[]
  developerFormats?: string[]
  fullName?: string
  companyName?: string
  whatsapp?: string
  email?: string
  meliNickname?: string
  followupConsent?: boolean
}
