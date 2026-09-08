import 'fake-indexeddb/auto'
import { db } from '../src/lib/storage/db'
import { completeDiscoveryInterview, getDiscoveryInterview, listDiscoveryInterviews, saveDiscoveryDraft } from '../src/lib/storage/discovery.repository'
import { listPendingOutbox } from '../src/lib/storage/outbox.repository'
import { listTimeline } from '../src/lib/storage/timeline.repository'
import { DB_VERSION } from '../src/lib/storage/schema'

function ensure(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }

await db.delete(); await db.open(); ensure(db.verno === DB_VERSION, 'database version mismatch')
const partial = await saveDiscoveryDraft({ actorType: 'seller', operatorId: 'alejandro', eventId: 'mle-2026', currentStep: 0, status: 'in_progress', primaryPain: '', painTags: [], stack: [], developerFormats: [], fullName: 'Offline seller' }, 'alejandro')
await saveDiscoveryDraft({ ...partial, currentStep: 3, primaryPain: 'Prices stop closing', painTags: ['Pricing', 'Stock'], stack: ['ERP'], fullName: 'Offline seller' }, 'alejandro')
const recovered = await getDiscoveryInterview(partial.id); ensure(recovered?.currentStep === 3 && recovered.primaryPain === 'Prices stop closing', 'partial recovery failed')
const result = await completeDiscoveryInterview({ interview: recovered!, contact: { capturedBy: 'alejandro', actorType: 'seller', fullName: recovered?.fullName, followupConsent: true } })
ensure(result.contact.id && result.interview.status === 'completed', 'completion failed')
const readBack = await db.eventContacts.get(result.contact.id)
const pains = await db.painObservations.where('contactId').equals(result.contact.id).toArray()
const timeline = await listTimeline(result.contact.id)
const pending = (await listPendingOutbox()).filter((entry) => [result.contact.id, result.interview.id].includes(entry.entityId))
ensure(readBack?.fullName === 'Offline seller', 'contact persistence failed')
ensure(pains.length === 2 && pains.filter((pain) => pain.isPrimary).length === 1, 'pain invariant failed')
ensure(timeline.some((event) => event.eventType === 'contact_created') && timeline.some((event) => event.eventType === 'interview_completed'), 'timeline failed')
ensure(pending.length >= 2, 'outbox failed')
ensure((await listDiscoveryInterviews()).some((item) => item.status === 'completed'), 'interview listing failed')
console.log(JSON.stringify({ dbVersion: DB_VERSION, partialRecovery: true, contactPersisted: true, answersPersisted: true, pains: pains.length, primaryPainCount: pains.filter((pain) => pain.isPrimary).length, timelineCreated: true, outboxPending: pending.length, offline: true }))
