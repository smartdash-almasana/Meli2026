export type OperatorId = 'alejandro' | 'fede'

export interface EventTimeline {
  id: string
  contactId?: string
  entityType?: string
  entityId?: string
  operatorId: OperatorId
  eventType: string
  occurredAt: string
  metadata?: Record<string, unknown>
}

export type NewTimelineEvent = Omit<EventTimeline, 'id' | 'occurredAt'>
