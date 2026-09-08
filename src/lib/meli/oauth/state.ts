import { MeliOAuthError } from './errors'
import { createPkcePair, randomBase64Url, type PkcePair } from './pkce'

export interface OAuthStateRecord {
  state: string
  codeVerifier: string
  redirectUri: string
  createdAt: string
  expiresAt: string
}

export interface OAuthStateStore {
  issue(input: Omit<OAuthStateRecord, 'state' | 'createdAt' | 'expiresAt'> & { ttlMs: number }): Promise<OAuthStateRecord>
  consume(state: string, now?: Date): Promise<OAuthStateRecord>
}

export class InMemoryOAuthStateStore implements OAuthStateStore {
  private readonly records = new Map<string, OAuthStateRecord>()
  private readonly consumed = new Set<string>()

  async issue(input: Omit<OAuthStateRecord, 'state' | 'createdAt' | 'expiresAt'> & { ttlMs: number }): Promise<OAuthStateRecord> {
    const createdAt = new Date()
    const record: OAuthStateRecord = {
      state: randomBase64Url(32),
      codeVerifier: input.codeVerifier,
      redirectUri: input.redirectUri,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + input.ttlMs).toISOString(),
    }
    this.records.set(record.state, record)
    return record
  }

  async consume(state: string, now = new Date()): Promise<OAuthStateRecord> {
    const record = this.records.get(state)
    if (!record) {
      if (this.consumed.has(state)) throw new MeliOAuthError('state_reused', 'OAuth state was already used')
      throw new MeliOAuthError('invalid_state', 'OAuth state is invalid')
    }
    this.records.delete(state)
    this.consumed.add(state)
    if (new Date(record.expiresAt).getTime() <= now.getTime()) throw new MeliOAuthError('expired_state', 'OAuth state expired')
    return record
  }
}

export async function issueOAuthState(store: OAuthStateStore, redirectUri: string, ttlMs: number): Promise<{ record: OAuthStateRecord; pkce: PkcePair }> {
  const pkce = await createPkcePair()
  const record = await store.issue({ codeVerifier: pkce.codeVerifier, redirectUri, ttlMs })
  return { record, pkce }
}
