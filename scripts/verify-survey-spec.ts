import { SURVEY_SCREENS, isCompleteInterview, isDeveloperBranch, whatsappFollowupEnabled } from '../src/features/interview/survey-contract'
import { qualifyInterview } from '../src/lib/qualification'
import type { DiscoveryInterview } from '../src/types/discovery'

const ensure = (condition: unknown, message: string) => { if (!condition) throw new Error(message) }
ensure(SURVEY_SCREENS.length === 8, 'screen count mismatch')
ensure(SURVEY_SCREENS.findIndex((screen) => screen.id === 'TRUST') < SURVEY_SCREENS.findIndex((screen) => screen.id === 'NEXT_STEP'), 'trust step must precede consent')
ensure(isDeveloperBranch('developer') && isDeveloperBranch('software_house') && !isDeveloperBranch('partner'), 'developer branch mismatch')
ensure(!whatsappFollowupEnabled(['no_interest']) && whatsappFollowupEnabled(['alerts']), 'WhatsApp branch mismatch')
const base = { id: 'test', eventId: 'mle-2026', actorType: 'seller' as const, operatorId: 'alejandro' as const, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), currentStep: 7, status: 'completed' as const, stack: ['meli_native'], painTags: [], primaryPain: 'A concrete issue', currentSolution: 'manual', lastIncident: 'Yesterday', toolChoiceEase: 'difficult', systemCountBand: 'two', publicationRange: '50_200', salesRange: '50_200', teamSize: 'one', meliChannelRole: 'primary', urgencyScore: 4, impactScore: 4, fullName: 'Test seller', followupConsent: true, nextStep: 'diagnosis', developerFormats: [], whatsappInterest: ['alerts'], whatsappAlertWish: 'stock alerts', customSolutionInterest: 'maybe', business_name: 'Test seller', whatsapp: '+54 9 11 5555 0000', channel_mode: 'meli_only', channels: ['meli_only'], meli_tenure: '1_3_years', sku_count_range: '50_200', orders_month_range: '51_200', operation_mode: 'systems', current_tools: ['spreadsheets'], manual_tasks: ['stock'], main_concern: 'profit', problems: ['stock'], margin_clarity: 'unclear', product_cost_source: 'spreadsheet', cost_update_frequency: 'monthly', target_margin: 'roughly', supply_models: ['wholesale_resale'], primary_supply_model: 'wholesale_resale', focus_mode: 'operation', priorities: ['stock'], followup_mode: 'orientation', consent_contact: true, consent_analysis: true } satisfies DiscoveryInterview
ensure(isCompleteInterview(base), 'required fields mismatch')
const qualified = qualifyInterview(base)
ensure(qualified.sellerLeadCandidate && qualified.whatsappOpportunityCandidate && qualified.customSolutionOpportunityCandidate, 'qualification mismatch')
ensure(!qualifyInterview({ ...base, painTags: [] }).developerOpportunityCandidate, 'auto developer qualification')
console.log(JSON.stringify({ questionOrder: 'PASS', sellerBranch: 'PASS', developerBranch: 'PASS', whatsappNoInterest: 'PASS', requiredOptional: 'PASS', qualification: 'PASS', autoPainTagging: 'NO' }))
