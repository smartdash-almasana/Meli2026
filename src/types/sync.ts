export type SyncOperation = 'create' | 'update'

export type SyncOutboxStatus = 'pending' | 'processing' | 'done' | 'error'

export interface SyncOutboxEntry {
  id: string
  entityType: string
  entityId: string
  operation: SyncOperation
  payload: unknown
  status: SyncOutboxStatus
  retryCount: number
  lastError?: string
  createdAt: string
  updatedAt: string
}

export type NewOutboxEntry = Pick<SyncOutboxEntry, 'entityType' | 'entityId' | 'operation' | 'payload'>

