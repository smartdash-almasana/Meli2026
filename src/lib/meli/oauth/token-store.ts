import type { OAuthTokenSet, OAuthTokenStore } from './token-types'

export class InMemoryOAuthTokenStore implements OAuthTokenStore {
  private readonly tokens = new Map<string, OAuthTokenSet>()

  async read(userId: string): Promise<OAuthTokenSet | null> {
    return this.tokens.get(userId) ?? null
  }

  async write(userId: string, tokens: OAuthTokenSet): Promise<void> {
    this.tokens.set(userId, { ...tokens })
  }

  async compareAndSwap(userId: string, expectedRefreshToken: string, nextTokens: OAuthTokenSet): Promise<boolean> {
    const current = this.tokens.get(userId)
    if (!current || current.refreshToken !== expectedRefreshToken) return false
    this.tokens.set(userId, { ...nextTokens })
    return true
  }
}

