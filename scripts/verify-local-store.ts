import 'fake-indexeddb/auto'
import { db } from '../src/lib/storage/db'
import { listPendingOutbox } from '../src/lib/storage/outbox.repository'
import { listTimeline } from '../src/lib/storage/timeline.repository'
import { DB_VERSION } from '../src/lib/storage/schema'
import { persistSellerCapture } from '../src/lib/storage/seller-capture.repository'

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

await db.delete()
await db.open()
ensure(db.verno === DB_VERSION, 'database version mismatch')

const fullCapture = await persistSellerCapture({
  contact: {
    capturedBy: 'fede',
    actorType: 'seller',
    fullName: 'Full verification seller',
  },
  catalogVolumeBand: '200_1000',
  logistics: 'flex',
  currentSolution: 'erp',
  pains: [
    { painCode: 'pricing', isPrimary: false },
    { painCode: 'stock', isPrimary: true },
    { painCode: 'shipping', isPrimary: false },
  ],
  solutionInterest: 'high',
  pilotIntent: 'this_week',
})
const quickCapture = await persistSellerCapture({
  contact: { capturedBy: 'alejandro', actorType: 'seller', fullName: 'Quick verification seller' },
  pains: [],
})
const readBack = await db.eventContacts.get(fullCapture.contact.id)
const timeline = await listTimeline(fullCapture.contact.id)
const pains = await db.painObservations.where('contactId').equals(fullCapture.contact.id).toArray()
const outbox = (await listPendingOutbox()).filter((entry) => entry.entityId === fullCapture.contact.id)

ensure(readBack?.id === fullCapture.contact.id, 'contact read-back failed')
ensure(timeline.some((event) => event.eventType === 'contact_created' && event.contactId === fullCapture.contact.id), 'timeline event missing')
ensure(pains.length === 3, 'pain observations missing')
ensure(pains.filter((pain) => pain.isPrimary).length === 1, 'primary pain invariant failed')
ensure(outbox.length > 0 && outbox.every((entry) => entry.status === 'pending'), 'pending outbox entries missing')
ensure(quickCapture.contact.id.length > 0 && quickCapture.contact.actorType === 'seller', 'quick capture contact invalid')

console.log(JSON.stringify({
  dbVersion: db.verno,
  contactId: fullCapture.contact.id,
  contactReadBack: readBack?.id === fullCapture.contact.id,
  painsPersisted: pains.length,
  primaryPainCount: pains.filter((pain) => pain.isPrimary).length,
  timelineCreated: timeline.some((event) => event.eventType === 'contact_created'),
  outboxCreated: outbox.length > 0 && outbox.every((entry) => entry.status === 'pending'),
  quickSaveContactValid: quickCapture.contact.actorType === 'seller',
}))

db.close()
