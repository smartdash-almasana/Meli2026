import type { DiscoveryInterview } from '../types/discovery'

export interface QualificationResult {
  sellerLeadCandidate: boolean
  developerOpportunityCandidate: boolean
  whatsappOpportunityCandidate: boolean
  customSolutionOpportunityCandidate: boolean
}

const substantive = (value?: string) => Boolean(value?.trim())
const noEvidence = (value?: string) => !substantive(value) || value?.trim().toLowerCase() === 'no recuerdo'

export function qualifyInterview(interview: DiscoveryInterview): QualificationResult {
  const seller = interview.actorType === 'seller'
  const developer = interview.actorType === 'developer' || interview.actorType === 'software_house'
  const completeEvidence = substantive(interview.primaryPain) && !noEvidence(interview.lastIncident)
  const sellerLeadCandidate = seller && completeEvidence && (interview.urgencyScore ?? 0) >= 3 && (interview.impactScore ?? 0) >= 3 && interview.nextStep !== 'no_followup' && substantive(interview.fullName)
  const developerOpportunityCandidate = developer && substantive(interview.developerRequestedCapability) && (interview.developerFormats?.length ?? 0) > 0
  const whatsappInterested = (interview.whatsappInterest ?? []).some((value) => value === 'alerts' || value === 'queries' || value === 'both')
  const whatsappOpportunityCandidate = whatsappInterested && (substantive(interview.whatsappQuestionWish) || substantive(interview.whatsappAlertWish)) && interview.followupConsent === true
  const customSolutionOpportunityCandidate = completeEvidence && (interview.urgencyScore ?? 0) >= 3 && (interview.impactScore ?? 0) >= 3 && interview.nextStep !== 'no_followup' && ((seller && (interview.customSolutionInterest === 'yes' || interview.customSolutionInterest === 'maybe')) || (developer && interview.developerFormats?.includes('custom_development')))
  return { sellerLeadCandidate, developerOpportunityCandidate, whatsappOpportunityCandidate, customSolutionOpportunityCandidate }
}
