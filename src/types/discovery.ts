import type { ActorType, CapturedBy } from './contact'

export type SurveyStatus = 'in_progress' | 'completed'
export type YesNoUnknown = 'yes' | 'no' | 'unknown'

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
  whatsapp?: string
  email?: string
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
