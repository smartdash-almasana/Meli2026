import { readFileSync } from 'node:fs'
import { buildAuthorizationUrl, exchangeAuthorizationCode, exchangeRefreshToken } from '../src/lib/meli/oauth/oauth-client'
import { MeliOAuthError } from '../src/lib/meli/oauth/errors'
import { createPkcePair } from '../src/lib/meli/oauth/pkce'
import { RefreshCoordinator } from '../src/lib/meli/oauth/refresh-coordinator'
import { issueOAuthState, InMemoryOAuthStateStore } from '../src/lib/meli/oauth/state'
import { InMemoryOAuthTokenStore } from '../src/lib/meli/oauth/token-store'
import type { OAuthTokenSet } from '../src/lib/meli/oauth/token-types'
import { getCurrentMeliUser } from '../src/lib/meli/identity/get-current-user'

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function expectOAuthError(action: () => Promise<unknown>, code: string): Promise<void> {
  return action().then(() => { throw new Error(`Expected OAuth error: ${code}`) }).catch((error: unknown) => {
    ensure(error instanceof MeliOAuthError && error.code === code, `Expected ${code}`)
  })
}

const config = {
  authorizationEndpoint: 'https://auth.mercadolibre.com.ar/authorization',
  tokenEndpoint: 'https://api.mercadolibre.com/oauth/token',
  clientId: 'client-id',
  redirectUri: 'https://example.test/api/meli/oauth/callback',
  scopes: 'read',
}

const pkce = await createPkcePair()
ensure(pkce.method === 'S256' && pkce.codeVerifier.length >= 43, 'PKCE verifier invalid')
const expectedDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pkce.codeVerifier))
ensure(pkce.codeChallenge === base64Url(new Uint8Array(expectedDigest)), 'PKCE challenge mismatch')

const stateStore = new InMemoryOAuthStateStore()
const { record, pkce: statePkce } = await issueOAuthState(stateStore, config.redirectUri, 60_000)
ensure(record.state.length > 20 && record.codeVerifier === statePkce.codeVerifier, 'state creation failed')
await stateStore.consume(record.state)
await expectOAuthError(() => stateStore.consume(record.state), 'state_reused')
const expired = await stateStore.issue({ codeVerifier: statePkce.codeVerifier, redirectUri: config.redirectUri, ttlMs: 1 })
await expectOAuthError(() => stateStore.consume(expired.state, new Date(Date.now() + 10_000)), 'expired_state')
await expectOAuthError(() => stateStore.consume('not-a-state'), 'invalid_state')

const authorizationUrl = new URL(buildAuthorizationUrl(config, 'state-value', 'challenge-value'))
ensure(authorizationUrl.searchParams.get('response_type') === 'code', 'authorization response_type invalid')
ensure(authorizationUrl.searchParams.get('client_id') === config.clientId, 'authorization client_id invalid')
ensure(authorizationUrl.searchParams.get('code_challenge_method') === 'S256', 'authorization PKCE method invalid')

const tokenCalls: RequestInit[] = []
const tokenFetch: typeof fetch = async (_url, init) => {
  tokenCalls.push(init ?? {})
  return new Response(JSON.stringify({ access_token: 'access-1', refresh_token: 'refresh-1', expires_in: 3600, user_id: 42 }), { status: 200 })
}
const exchanged = await exchangeAuthorizationCode(config, 'server-secret', 'authorization-code', pkce.codeVerifier, tokenFetch)
ensure(exchanged.accessToken === 'access-1' && exchanged.refreshToken === 'refresh-1', 'token exchange failed')
ensure(tokenCalls[0]?.method === 'POST' && tokenCalls[0]?.headers && (tokenCalls[0].headers as Record<string, string>)['content-type'] === 'application/x-www-form-urlencoded', 'token exchange request invalid')
ensure(tokenCalls[0]?.body instanceof URLSearchParams, 'token exchange body invalid')

const timeoutFetch: typeof fetch = async (_url, init) => new Promise((_resolve, reject) => {
  init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
})
await expectOAuthError(() => exchangeAuthorizationCode(config, 'server-secret', 'code', pkce.codeVerifier, timeoutFetch, 5), 'timeout')

const tokenStore = new InMemoryOAuthTokenStore()
const initialTokens: OAuthTokenSet = { accessToken: 'a1', refreshToken: 'r1', expiresAt: new Date().toISOString() }
await tokenStore.write('seller-1', initialTokens)
const coordinator = new RefreshCoordinator(tokenStore)
let refreshCalls = 0
const rotated = await coordinator.refresh('seller-1', async (refreshToken) => {
  refreshCalls += 1
  ensure(refreshToken === 'r1', 'old refresh token reused')
  return { accessToken: 'a2', refreshToken: 'r2', expiresAt: new Date(Date.now() + 3600_000).toISOString() }
})
ensure(refreshCalls === 1 && rotated.refreshToken === 'r2' && (await tokenStore.read('seller-1'))?.refreshToken === 'r2', 'refresh rotation failed')

const reuseStore = new InMemoryOAuthTokenStore()
await reuseStore.write('seller-reuse', initialTokens)
await expectOAuthError(() => new RefreshCoordinator(reuseStore).refresh('seller-reuse', async () => ({ ...initialTokens, accessToken: 'a2' })), 'token_refresh_reuse')

const concurrentStore = new InMemoryOAuthTokenStore()
await concurrentStore.write('seller-concurrent', initialTokens)
const concurrentCoordinator = new RefreshCoordinator(concurrentStore)
let concurrentCalls = 0
let release!: () => void
const gate = new Promise<void>((resolve) => { release = resolve })
const concurrentExchange = async () => {
  concurrentCalls += 1
  await gate
  return { accessToken: 'a3', refreshToken: 'r3', expiresAt: new Date(Date.now() + 3600_000).toISOString() }
}
const first = concurrentCoordinator.refresh('seller-concurrent', concurrentExchange)
const second = concurrentCoordinator.refresh('seller-concurrent', concurrentExchange)
release()
await Promise.all([first, second])
ensure(concurrentCalls === 1, 'same-user refresh was not coalesced')

const multiUserStore = new InMemoryOAuthTokenStore()
await multiUserStore.write('seller-a', { ...initialTokens, refreshToken: 'ra' })
await multiUserStore.write('seller-b', { ...initialTokens, refreshToken: 'rb' })
const multiCoordinator = new RefreshCoordinator(multiUserStore)
const multiCalls = new Set<string>()
await Promise.all([
  multiCoordinator.refresh('seller-a', async (refreshToken) => { multiCalls.add(refreshToken); return { accessToken: 'aa', refreshToken: 'raa', expiresAt: new Date().toISOString() } }),
  multiCoordinator.refresh('seller-b', async (refreshToken) => { multiCalls.add(refreshToken); return { accessToken: 'ab', refreshToken: 'rbb', expiresAt: new Date().toISOString() } }),
])
ensure(multiCalls.size === 2, 'different users blocked each other')

let casCalls = 0
const casStore = new InMemoryOAuthTokenStore()
await casStore.write('seller-cas', initialTokens)
const originalCas = casStore.compareAndSwap.bind(casStore)
casStore.compareAndSwap = async (...args) => { casCalls += 1; return originalCas(...args) }
await new RefreshCoordinator(casStore).refresh('seller-cas', async () => ({ accessToken: 'ac', refreshToken: 'rc', expiresAt: new Date().toISOString() }))
ensure(casCalls === 1, 'CAS hook was not exercised')

let meHeaders: HeadersInit | undefined
const meFetch: typeof fetch = async (_url, init) => {
  meHeaders = init?.headers
  return new Response(JSON.stringify({ id: 123, nickname: 'seller_nick', site_id: 'MLA' }), { status: 200 })
}
const me = await getCurrentMeliUser('access-me', meFetch)
ensure(me.id === '123' && me.nickname === 'seller_nick' && me.siteId === 'MLA', '/users/me mapping failed')
ensure((meHeaders as Record<string, string>).authorization === 'Bearer access-me', '/users/me auth header missing')

const clientSource = readFileSync(new URL('../src/lib/meli/client/meli-client.ts', import.meta.url), 'utf8')
ensure(!/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/u.test(clientSource), 'business write method found')
ensure(!/console\.(?:log|info|warn|error).*?(?:access|refresh|token|authorization)/isu.test(clientSource), 'token logging found')

console.log(JSON.stringify({
  pkce: 'PASS', stateCreation: 'PASS', stateSingleUse: 'PASS', expiredState: 'PASS', invalidState: 'PASS', authorizationUrl: 'PASS', tokenExchange: 'PASS', refreshRotation: 'PASS', refreshReuseRejected: 'PASS', concurrentSameUser: 'PASS', concurrentDifferentUsers: 'PASS', casHook: 'PASS', usersMe: 'PASS', tokenLeakLogs: 0, readOnlyGate: 'PASS',
}))

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}
