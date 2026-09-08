import Dexie, { type Table } from 'dexie'
import type { EventContact } from '../../types/contact'
import type { PainObservation } from '../../types/pain'
import type { EventTimeline } from '../../types/event'
import type { SyncOutboxEntry } from '../../types/sync'
import type { DiscoveryInterview, SurveyResponse } from '../../types/discovery'
import type { InterviewAudio } from '../../types/audio'
import { DB_NAME, DB_SCHEMA, DB_VERSION } from './schema'

export class Meli2026Database extends Dexie {
  eventContacts!: Table<EventContact, string>
  painObservations!: Table<PainObservation, string>
  eventTimeline!: Table<EventTimeline, string>
  syncOutbox!: Table<SyncOutboxEntry, string>
  discoveryInterviews!: Table<DiscoveryInterview, string>
  surveyResponses!: Table<SurveyResponse, string>
  interviewAudio!: Table<InterviewAudio, string>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores(DB_SCHEMA)
    this.eventContacts = this.table('event_contacts')
    this.painObservations = this.table('pain_observations')
    this.eventTimeline = this.table('event_timeline')
    this.syncOutbox = this.table('sync_outbox')
    this.discoveryInterviews = this.table('discovery_interviews')
    this.surveyResponses = this.table('survey_responses')
    this.interviewAudio = this.table('interview_audio')
  }
}

export const db = new Meli2026Database()

export const createLocalId = (): string => crypto.randomUUID()
export const nowIso = (): string => new Date().toISOString()
