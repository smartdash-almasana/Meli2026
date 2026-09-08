export type PainSeverity = 1 | 2 | 3 | 4 | 5

export interface PainObservation {
  id: string
  contactId: string
  painCode: string
  isPrimary: boolean
  severity?: PainSeverity
  quote?: string
  createdAt: string
}

export type NewPainObservation = Omit<PainObservation, 'id' | 'createdAt'>

