export type CapturedBy = 'alejandro' | 'fede'

export type ActorType = 'seller' | 'developer' | 'software_house' | 'partner' | 'meli' | 'agency' | 'other'

export type ContactSyncStatus = 'local' | 'pending' | 'synced' | 'error'

export interface EventContact {
  id: string
  createdAt: string
  updatedAt: string
  capturedBy: CapturedBy
  actorType: ActorType
  fullName?: string
  companyName?: string
  whatsapp?: string
  email?: string
  roleTitle?: string
  meliNickname?: string
  catalogVolumeBand?: string
  quickNotes?: string
  followupConsent?: boolean
  syncStatus: ContactSyncStatus
}

export type NewContact = Omit<EventContact, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
