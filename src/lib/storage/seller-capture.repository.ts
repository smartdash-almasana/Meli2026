import type { EventContact } from '../../types/contact'
import type { EventTimeline } from '../../types/event'
import type { PainObservation } from '../../types/pain'
import type { SyncOutboxEntry } from '../../types/sync'
import type { CurrentSolution, Logistics, PainCode, PilotIntent, SolutionInterest } from '../../types/seller'
import { createLocalId, db, nowIso } from './db'

export interface SellerCapturePersistenceInput {
  contact: Omit<EventContact, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
  catalogVolumeBand?: string
  logistics?: Logistics
  currentSolution?: CurrentSolution
  pains: Array<{ painCode: PainCode; isPrimary: boolean }>
  solutionInterest?: SolutionInterest
  pilotIntent?: PilotIntent
}

export interface SellerCapturePersistenceResult {
  contact: EventContact
  pains: PainObservation[]
  timeline: EventTimeline[]
  outbox: SyncOutboxEntry[]
}

export async function persistSellerCapture(input: SellerCapturePersistenceInput): Promise<SellerCapturePersistenceResult> {
  const now = nowIso()
  const contactId = createLocalId()
  const contact: EventContact = {
    ...input.contact,
    id: contactId,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'local',
    ...(input.catalogVolumeBand ? { catalogVolumeBand: input.catalogVolumeBand } : {}),
  }
  const timeline: EventTimeline[] = [
    {
      id: createLocalId(),
      contactId,
      operatorId: input.contact.capturedBy,
      eventType: 'contact_created',
      occurredAt: now,
    },
  ]
  const pains: PainObservation[] = input.pains.map((pain) => ({
    id: createLocalId(),
    contactId,
    painCode: pain.painCode,
    isPrimary: pain.isPrimary,
    createdAt: now,
  }))
  const profileMetadata = compactMetadata({
    catalogVolumeBand: input.catalogVolumeBand,
    logistics: input.logistics,
    currentSolution: input.currentSolution,
  })
  if (Object.keys(profileMetadata).length > 0) {
    timeline.push({
      id: createLocalId(),
      contactId,
      operatorId: input.contact.capturedBy,
      eventType: 'seller_profile_captured',
      occurredAt: now,
      metadata: profileMetadata,
    })
  }
  for (const pain of pains) {
    timeline.push({
      id: createLocalId(),
      contactId,
      operatorId: input.contact.capturedBy,
      eventType: 'pain_observed',
      occurredAt: now,
      metadata: { painCode: pain.painCode, isPrimary: pain.isPrimary },
    })
  }
  const intentMetadata = compactMetadata({
    solutionInterest: input.solutionInterest,
    pilotIntent: input.pilotIntent,
  })
  if (Object.keys(intentMetadata).length > 0) {
    timeline.push({
      id: createLocalId(),
      contactId,
      operatorId: input.contact.capturedBy,
      eventType: 'seller_intent_captured',
      occurredAt: now,
      metadata: intentMetadata,
    })
  }

  const outbox = [
    createOutbox('event_contacts', contactId, contact, now),
    ...pains.map((pain) => createOutbox('pain_observations', pain.id, pain, now)),
    ...timeline.slice(1).map((event) => createOutbox('event_timeline', event.id, event, now)),
  ]

  await db.transaction('rw', [db.eventContacts, db.painObservations, db.eventTimeline, db.syncOutbox], async () => {
    await db.eventContacts.add(contact)
    await db.painObservations.bulkAdd(pains)
    await db.eventTimeline.bulkAdd(timeline)
    await db.syncOutbox.bulkAdd(outbox)
  })

  return { contact, pains, timeline, outbox }
}

function createOutbox(entityType: string, entityId: string, payload: unknown, now: string): SyncOutboxEntry {
  return {
    id: createLocalId(),
    entityType,
    entityId,
    operation: 'create',
    payload,
    status: 'pending',
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function compactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined))
}
