import { MeliOAuthError } from './errors'
import type { OAuthTokenSet, OAuthTokenStore } from './token-types'

export type RefreshExchange = (refreshToken: string) => Promise<OAuthTokenSet>

export class RefreshCoordinator {
  private readonly inFlight = new Map<string, Promise<OAuthTokenSet>>()

  constructor(private readonly store: OAuthTokenStore) {}

  refresh(userId: string, exchange: RefreshExchange): Promise<OAuthTokenSet> {
    const running = this.inFlight.get(userId)
    if (running) return running
    const operation = this.performRefresh(userId, exchange).finally(() => this.inFlight.delete(userId))
    this.inFlight.set(userId, operation)
    return operation
  }

  private async performRefresh(userId: string, exchange: RefreshExchange): Promise<OAuthTokenSet> {
    const current = await this.store.read(userId)
    if (!current) throw new MeliOAuthError('token_missing', 'No token set for user')
    const next = await exchange(current.refreshToken)
    if (!next.refreshToken || next.refreshToken === current.refreshToken) {
      throw new MeliOAuthError('token_refresh_reuse', 'Refresh token rotation was not accepted')
    }
    const swapped = this.store.compareAndSwap
      ? await this.store.compareAndSwap(userId, current.refreshToken, next)
      : (await this.store.write(userId, next), true)
    if (!swapped) throw new MeliOAuthError('token_concurrency', 'Token changed during refresh')
    return next
  }
}

