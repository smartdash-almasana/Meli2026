import { listSyncableOutbox, listPendingOutbox, updateOutboxStatus } from '../storage/outbox.repository'
import type { SyncOutboxEntry } from '../../types/sync'

export interface RemoteSyncAdapter {
  upsert(entry: SyncOutboxEntry): Promise<void>
}

export interface SyncSummary { synced: number; failed: number; pending: number }

/** Runs idempotent outbox delivery through an injected, authenticated server adapter. */
export async function syncPendingOutbox(adapter: RemoteSyncAdapter): Promise<SyncSummary> {
  const pending = await listSyncableOutbox()
  let synced = 0
  let failed = 0
  for (const entry of pending) {
    await updateOutboxStatus(entry.id, 'processing')
    try {
      await adapter.upsert(entry)
      await updateOutboxStatus(entry.id, 'done')
      synced += 1
    } catch (error) {
      failed += 1
      await updateOutboxStatus(entry.id, 'error', error instanceof Error ? error.message : 'sync_failed')
    }
  }
  return { synced, failed, pending: (await listPendingOutbox()).length }
}
