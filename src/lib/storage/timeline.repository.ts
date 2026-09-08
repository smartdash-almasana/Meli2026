import type { EventTimeline, NewTimelineEvent } from '../../types/event'
import { createLocalId, db, nowIso } from './db'

export async function createTimelineEvent(input: NewTimelineEvent): Promise<EventTimeline> {
  const event: EventTimeline = { ...input, id: createLocalId(), occurredAt: nowIso() }
  await db.eventTimeline.add(event)
  return event
}

export function getTimelineEvent(id: string): Promise<EventTimeline | undefined> {
  return db.eventTimeline.get(id)
}

export function listTimeline(contactId?: string): Promise<EventTimeline[]> {
  const query = contactId ? db.eventTimeline.where('contactId').equals(contactId) : db.eventTimeline.toCollection()
  return query.sortBy('occurredAt')
}

export function deleteTimelineEvent(id: string): Promise<void> {
  return db.eventTimeline.delete(id)
}

