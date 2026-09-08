import type { CapturedBy } from './contact'

export type InterviewAudioStatus = 'pending' | 'uploading' | 'synced' | 'error'

export interface InterviewAudio {
  id: string
  interviewId: string
  eventId: string
  operatorId: CapturedBy
  recordedAt: string
  mimeType: string
  durationSeconds: number
  blob: Blob
  storagePath?: string
  status: InterviewAudioStatus
  lastError?: string
  createdAt: string
  updatedAt: string
}
