import 'fake-indexeddb/auto'
import { db } from '../src/lib/storage/db'
import { completeDiscoveryInterview, getDiscoveryInterview, saveDiscoveryDraft } from '../src/lib/storage/discovery.repository'
import { qualifyInterview } from '../src/lib/qualification'

const ensure = (condition: unknown, message: string) => { if (!condition) throw new Error(message) }
await db.delete(); await db.open()
const sellerDraft = await saveDiscoveryDraft({ actorType: 'seller', operatorId: 'alejandro', eventId: 'mle-2026', currentStep: 2, status: 'in_progress', stack: ['meli_native', 'spreadsheets'], painTags: ['stock', 'pricing_margin'], developerFormats: [], primaryPain: 'El stock queda desactualizado', publicationRange: '50_200', salesRange: '50_200', teamSize: '2_3', meliChannelRole: 'primary', toolChoiceEase: 'difficult', systemCountBand: 'two', urgencyScore: 4, impactScore: 4, fullName: 'TEST_ONLY Seller', followupConsent: true, nextStep: 'diagnosis', lastIncident: 'Ayer se vendió un producto sin stock' }, 'alejandro')
const recovered = await getDiscoveryInterview(sellerDraft.id); ensure(recovered?.currentStep === 2, 'interruption recovery failed')
const seller = await completeDiscoveryInterview({ interview: { ...recovered!, currentStep: 11, status: 'in_progress' }, contact: { capturedBy: 'alejandro', actorType: 'seller', fullName: 'TEST_ONLY Seller', followupConsent: true, catalogVolumeBand: '50_200' } })
const sellerQualification = qualifyInterview(seller.interview); ensure(seller.pains.length === 2 && seller.pains.filter((pain) => pain.isPrimary).length === 1 && sellerQualification.sellerLeadCandidate, 'seller qualification or pain invariant failed')
const developer = await completeDiscoveryInterview({ interview: { ...seller.interview, id: crypto.randomUUID(), actorType: 'developer', operatorId: 'fede', fullName: 'TEST_ONLY Developer', primaryPain: 'Clientes piden sincronizar stock', lastIncident: 'Esta semana repetí la integración', developerRequestedCapability: 'Sincronización recurrente', developerFormats: ['api'], currentStep: 11 }, contact: { capturedBy: 'fede', actorType: 'developer', fullName: 'TEST_ONLY Developer', followupConsent: true } })
const developerQualification = qualifyInterview(developer.interview); ensure(developerQualification.developerOpportunityCandidate, 'developer qualification failed')
ensure(seller.timeline.some((event) => event.eventType === 'interview_completed'), 'seller timeline missing')
console.log(JSON.stringify({ sellerTest: 'PASS', developerTest: 'PASS', interruptionRecovery: 'PASS', localOutbox: seller.outbox.length + developer.outbox.length, sellerQualification, developerQualification }))
