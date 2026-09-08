import type { CapturedBy } from '../../types/contact'
import type { InterviewAudio } from '../../types/audio'
import type { SyncOutboxEntry } from '../../types/sync'
import { createLocalId, db, nowIso } from './db'

const EVENT_ID = 'meli2026'

export interface SaveInterviewAudioInput {
  interviewId: string
  operatorId: CapturedBy
  mimeType: string
  durationSeconds: number
  blob: Blob
  eventId?: string
}

export async function saveInterviewAudio(input: SaveInterviewAudioInput): Promise<InterviewAudio> {
  const now = nowIso()
  const existing = await db.interviewAudio.where('interviewId').equals(input.interviewId).first()
  const audio: InterviewAudio = {
    id: existing?.id ?? createLocalId(),
    interviewId: input.interviewId,
    eventId: input.eventId ?? EVENT_ID,
    operatorId: input.operatorId,
    recordedAt: now,
    mimeType: input.mimeType,
    durationSeconds: Math.max(0, Math.round(input.durationSeconds)),
    blob: input.blob,
    storagePath: existing?.storagePath,
    status: 'pending',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  const payload = {
    audioId: audio.id,
    interviewId: audio.interviewId,
    eventId: audio.eventId,
    operatorId: audio.operatorId,
    recordedAt: audio.recordedAt,
    mimeType: audio.mimeType,
    durationSeconds: audio.durationSeconds,
  }
  const outbox: SyncOutboxEntry = {
    id: createLocalId(),
    entityType: 'interview_audio',
    entityId: audio.id,
    operation: 'create',
    payload,
    status: 'pending',
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  await db.transaction('rw', [db.interviewAudio, db.syncOutbox], async () => {
    await db.interviewAudio.put(audio)
    await db.syncOutbox.where('entityType').equals('interview_audio').filter((entry) => entry.entityId === audio.id).delete()
    await db.syncOutbox.add(outbox)
  })
  return audio
}

export function getInterviewAudio(interviewId: string): Promise<InterviewAudio | undefined> {
  return db.interviewAudio.where('interviewId').equals(interviewId).first()
}

export async function markInterviewAudioStatus(id: string, status: InterviewAudio['status'], storagePath?: string, lastError?: string): Promise<void> {
  const audio = await db.interviewAudio.get(id)
  if (!audio) return
  await db.interviewAudio.put({ ...audio, status, storagePath: storagePath ?? audio.storagePath, lastError, updatedAt: nowIso() })
}

export async function deleteInterviewAudio(interviewId: string): Promise<void> {
  const audio = await getInterviewAudio(interviewId)
  if (!audio) return
  await db.transaction('rw', [db.interviewAudio, db.syncOutbox], async () => {
    await db.interviewAudio.delete(audio.id)
    await db.syncOutbox.where('entityType').equals('interview_audio').filter((entry) => entry.entityId === audio.id).delete()
  })
}
