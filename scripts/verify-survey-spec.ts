import { SURVEY_SCREENS, isCompleteInterview, isDeveloperBranch, whatsappFollowupEnabled } from '../src/features/interview/survey-contract'
import { qualifyInterview } from '../src/lib/qualification'
import type { DiscoveryInterview } from '../src/types/discovery'

const ensure = (condition: unknown, message: string) => { if (!condition) throw new Error(message) }
ensure(SURVEY_SCREENS.length === 12, 'screen count mismatch')
ensure(SURVEY_SCREENS.findIndex((screen) => screen.id === 'PRIMARY_PAIN') < SURVEY_SCREENS.findIndex((screen) => screen.id === 'PAIN_TAGS'), 'Q06 must precede Q07')
ensure(isDeveloperBranch('developer') && isDeveloperBranch('software_house') && !isDeveloperBranch('partner'), 'developer branch mismatch')
ensure(!whatsappFollowupEnabled(['no_interest']) && whatsappFollowupEnabled(['alerts']), 'WhatsApp branch mismatch')
const base = { id: 'test', eventId: 'mle-2026', actorType: 'seller' as const, operatorId: 'alejandro' as const, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), currentStep: 11, status: 'completed' as const, stack: ['meli_native'], painTags: [], primaryPain: 'A concrete issue', currentSolution: 'manual', lastIncident: 'Yesterday', toolChoiceEase: 'difficult', systemCountBand: 'two', publicationRange: '50_200', salesRange: '50_200', teamSize: 'one', meliChannelRole: 'primary', urgencyScore: 4, impactScore: 4, fullName: 'Test seller', followupConsent: true, nextStep: 'diagnosis', developerFormats: [], whatsappInterest: ['alerts'], whatsappAlertWish: 'stock alerts', customSolutionInterest: 'maybe' } satisfies DiscoveryInterview
ensure(isCompleteInterview(base), 'required fields mismatch')
const qualified = qualifyInterview(base)
ensure(qualified.sellerLeadCandidate && qualified.whatsappOpportunityCandidate && qualified.customSolutionOpportunityCandidate, 'qualification mismatch')
ensure(!qualifyInterview({ ...base, painTags: [] }).developerOpportunityCandidate, 'auto developer qualification')
console.log(JSON.stringify({ questionOrder: 'PASS', sellerBranch: 'PASS', developerBranch: 'PASS', whatsappNoInterest: 'PASS', requiredOptional: 'PASS', qualification: 'PASS', autoPainTagging: 'NO' }))
