import type { NewPainObservation, PainObservation } from '../../types/pain'
import { createLocalId, db, nowIso } from './db'

export async function createPainObservation(input: NewPainObservation): Promise<string> {
  const observation: PainObservation = { ...input, id: createLocalId(), createdAt: nowIso() }
  await db.painObservations.add(observation)
  return observation.id
}

export function getPainObservation(id: string): Promise<PainObservation | undefined> {
  return db.painObservations.get(id)
}

export function listPainObservations(contactId: string): Promise<PainObservation[]> {
  return db.painObservations.where('contactId').equals(contactId).sortBy('createdAt')
}

export function deletePainObservation(id: string): Promise<void> {
  return db.painObservations.delete(id)
}

