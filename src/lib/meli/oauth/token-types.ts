export interface OAuthTokenSet {
  accessToken: string
  refreshToken: string
  expiresAt: string
  userId?: string
  scope?: string
  tokenType?: string
}

export interface OAuthTokenStore {
  read(userId: string): Promise<OAuthTokenSet | null>
  write(userId: string, tokens: OAuthTokenSet): Promise<void>
  compareAndSwap?(userId: string, expectedRefreshToken: string, nextTokens: OAuthTokenSet): Promise<boolean>
}

