export type OAuthErrorCode =
  | 'configuration'
  | 'invalid_state'
  | 'expired_state'
  | 'state_reused'
  | 'token_exchange'
  | 'token_refresh_reuse'
  | 'token_concurrency'
  | 'token_missing'
  | 'upstream_http'
  | 'timeout'

export class MeliOAuthError extends Error {
  constructor(public readonly code: OAuthErrorCode, message: string) {
    super(message)
    this.name = 'MeliOAuthError'
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

