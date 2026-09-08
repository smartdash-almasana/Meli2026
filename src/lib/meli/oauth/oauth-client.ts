import { MeliOAuthError, isAbortError } from './errors'
import type { MeliOAuthConfig } from './config'
import type { OAuthTokenSet } from './token-types'

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id?: string | number
  scope?: string
  token_type?: string
}

const DEFAULT_TIMEOUT_MS = 10_000

export function buildAuthorizationUrl(config: MeliOAuthConfig, state: string, codeChallenge: string): string {
  const url = new URL(config.authorizationEndpoint)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    ...(config.scopes ? { scope: config.scopes } : {}),
  }).toString()
  return url.toString()
}

export async function exchangeAuthorizationCode(config: MeliOAuthConfig, clientSecret: string, code: string, codeVerifier: string, fetchFn: typeof fetch = fetch, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<OAuthTokenSet> {
  return requestToken(config, clientSecret, new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: config.redirectUri, client_id: config.clientId, client_secret: clientSecret, code_verifier: codeVerifier }), fetchFn, timeoutMs)
}

export async function exchangeRefreshToken(config: MeliOAuthConfig, clientSecret: string, refreshToken: string, fetchFn: typeof fetch = fetch, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<OAuthTokenSet> {
  return requestToken(config, clientSecret, new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: config.clientId, client_secret: clientSecret }), fetchFn, timeoutMs)
}

async function requestToken(config: MeliOAuthConfig, clientSecret: string, body: URLSearchParams, fetchFn: typeof fetch, timeoutMs: number): Promise<OAuthTokenSet> {
  if (!clientSecret) throw new MeliOAuthError('configuration', 'Meli OAuth client secret is missing')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchFn(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })
    if (!response.ok) throw new MeliOAuthError('token_exchange', `Meli token endpoint returned HTTP ${response.status}`)
    const data = await response.json() as Partial<TokenResponse>
    if (!data.access_token || !data.refresh_token || typeof data.expires_in !== 'number') throw new MeliOAuthError('token_exchange', 'Meli token response is incomplete')
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      ...(data.user_id !== undefined ? { userId: String(data.user_id) } : {}),
      ...(data.scope ? { scope: data.scope } : {}),
      ...(data.token_type ? { tokenType: data.token_type } : {}),
    }
  } catch (error) {
    if (isAbortError(error)) throw new MeliOAuthError('timeout', 'Meli token request timed out')
    if (error instanceof MeliOAuthError) throw error
    throw new MeliOAuthError('token_exchange', 'Meli token request failed')
  } finally {
    clearTimeout(timer)
  }
}

