import { createMeliOAuthConfig } from '../../../src/lib/meli/oauth/config'
import { RefreshCoordinator } from '../../../src/lib/meli/oauth/refresh-coordinator'
import { InMemoryOAuthStateStore } from '../../../src/lib/meli/oauth/state'
import { InMemoryOAuthTokenStore } from '../../../src/lib/meli/oauth/token-store'

export const oauthStateStore = new InMemoryOAuthStateStore()
export const oauthTokenStore = new InMemoryOAuthTokenStore()
export const refreshCoordinator = new RefreshCoordinator(oauthTokenStore)

export function getServerOAuthConfig() {
  return createMeliOAuthConfig(process.env)
}

export function getClientSecret(): string {
  const secret = process.env.MELI_CLIENT_SECRET
  if (!secret) throw new Error('Meli OAuth client secret is missing')
  return secret
}

export function getStateTtlMs(): number {
  const configured = Number(process.env.MELI_OAUTH_STATE_TTL_MS ?? 600_000)
  return Number.isFinite(configured) && configured > 0 ? configured : 600_000
}

