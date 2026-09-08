import 'fake-indexeddb/auto'
import { db } from '../src/lib/storage/db'
import { completeDiscoveryInterview, saveDiscoveryDraft } from '../src/lib/storage/discovery.repository'
import { syncPendingOutbox } from '../src/lib/sync/sync-engine'
import { listPendingOutbox } from '../src/lib/storage/outbox.repository'

function ensure(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
await db.delete(); await db.open()
const draft = await saveDiscoveryDraft({ actorType: 'seller', operatorId: 'fede', eventId: 'mle-2026', currentStep: 1, status: 'in_progress', primaryPain: 'Stock mismatch', painTags: ['Stock'], stack: [], developerFormats: [], fullName: 'Sync seller' }, 'fede')
const result = await completeDiscoveryInterview({ interview: draft, contact: { capturedBy: 'fede', actorType: 'seller', fullName: 'Sync seller', followupConsent: true } })
let calls = 0
const first = await syncPendingOutbox({ upsert: async () => { calls += 1 } })
ensure(first.synced >= 1 && first.failed === 0 && calls === result.outbox.length, 'sync delivery failed')
const second = await syncPendingOutbox({ upsert: async () => { calls += 1 } })
ensure(second.synced === 0 && calls === result.outbox.length, 're-sync was not idempotent')
const failedDraft = await saveDiscoveryDraft({ actorType: 'seller', operatorId: 'fede', eventId: 'mle-2026', currentStep: 2, status: 'in_progress', primaryPain: 'Sync failure', painTags: ['Stock'], stack: [], developerFormats: [], fullName: 'Still local' }, 'fede')
await syncPendingOutbox({ upsert: async () => { throw new Error('offline') } })
ensure((await db.discoveryInterviews.get(failedDraft.id))?.fullName === 'Still local', 'local data was lost after sync failure')
const pending = await listPendingOutbox(); ensure(pending.length === 0, 'done entries remain pending')
console.log(JSON.stringify({ firstSync: 'PASS', idempotentResync: 'PASS', failureKeepsLocal: 'PASS', pendingAfterSync: pending.length }))
