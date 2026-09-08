import type { EventContact, NewContact } from '../../types/contact'
import type { EventTimeline } from '../../types/event'
import type { SyncOutboxEntry } from '../../types/sync'
import { createLocalId, db, nowIso } from './db'

export async function createContact(input: NewContact): Promise<EventContact> {
  const id = createLocalId()
  const now = nowIso()
  const contact: EventContact = { ...input, id, createdAt: now, updatedAt: now, syncStatus: 'local' }
  const timelineEvent: EventTimeline = {
    id: createLocalId(),
    contactId: id,
    operatorId: input.capturedBy,
    eventType: 'contact_created',
    occurredAt: now,
  }
  const outboxEntry: SyncOutboxEntry = {
    id: createLocalId(),
    entityType: 'event_contacts',
    entityId: id,
    operation: 'create',
    payload: contact,
    status: 'pending',
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  }

  await db.transaction('rw', [db.eventContacts, db.eventTimeline, db.syncOutbox], async () => {
    await db.eventContacts.add(contact)
    await db.eventTimeline.add(timelineEvent)
    await db.syncOutbox.add(outboxEntry)
  })

  return contact
}

export function getContact(id: string): Promise<EventContact | undefined> {
  return db.eventContacts.get(id)
}

export function listContacts(): Promise<EventContact[]> {
  return db.eventContacts.orderBy('createdAt').toArray()
}

export async function updateContact(id: string, changes: Partial<Omit<EventContact, 'id' | 'createdAt'>>): Promise<EventContact> {
  const current = await getContact(id)
  if (!current) throw new Error(`Contact not found: ${id}`)
  const updated: EventContact = { ...current, ...changes, id, updatedAt: nowIso() }
  await db.eventContacts.put(updated)
  return updated
}

export function deleteContact(id: string): Promise<void> {
  return db.eventContacts.delete(id)
}

