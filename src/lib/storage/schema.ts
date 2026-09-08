export const DB_NAME = 'meli2026'
export const DB_VERSION = 3

export const DB_SCHEMA = {
  event_contacts: 'id, createdAt, updatedAt, syncStatus',
  pain_observations: 'id, contactId, createdAt',
  event_timeline: 'id, contactId, occurredAt, eventType',
  sync_outbox: 'id, entityType, entityId, status, createdAt, updatedAt',
  discovery_interviews: 'id, contactId, eventId, actorType, operatorId, status, currentStep, updatedAt',
  survey_responses: 'id, interviewId, questionKey, updatedAt',
  interview_audio: 'id, interviewId, status, createdAt, updatedAt',
} as const
