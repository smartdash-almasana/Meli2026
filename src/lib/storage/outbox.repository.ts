import type { NewOutboxEntry, SyncOutboxEntry, SyncOutboxStatus } from '../../types/sync'
import { createLocalId, db, nowIso } from './db'

export async function createOutboxEntry(input: NewOutboxEntry): Promise<SyncOutboxEntry> {
  const now = nowIso()
  const entry: SyncOutboxEntry = {
    ...input,
    id: createLocalId(),
    status: 'pending',
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  await db.syncOutbox.add(entry)
  return entry
}

export function getOutboxEntry(id: string): Promise<SyncOutboxEntry | undefined> {
  return db.syncOutbox.get(id)
}

export function listPendingOutbox(): Promise<SyncOutboxEntry[]> {
  return db.syncOutbox.where('status').equals('pending').sortBy('createdAt')
}

export function listSyncableOutbox(): Promise<SyncOutboxEntry[]> {
  return db.syncOutbox.filter((entry) => entry.status === 'pending' || entry.status === 'error').sortBy('createdAt')
}

export async function updateOutboxStatus(id: string, status: SyncOutboxStatus, lastError?: string): Promise<SyncOutboxEntry> {
  const entry = await getOutboxEntry(id)
  if (!entry) throw new Error(`Outbox entry not found: ${id}`)
  const updated: SyncOutboxEntry = { ...entry, status, lastError, updatedAt: nowIso() }
  await db.syncOutbox.put(updated)
  return updated
}

export function deleteOutboxEntry(id: string): Promise<void> {
  return db.syncOutbox.delete(id)
}
