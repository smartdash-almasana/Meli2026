import { MeliOAuthError } from '../oauth/errors'

export const MELI_API_BASE_URL = 'https://api.mercadolibre.com'

export type MeliApiErrorCode = 'Unauthorized' | 'Forbidden' | 'NotFound' | 'RateLimited' | 'UpstreamUnavailable' | 'InvalidResponse'

export class MeliApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly code: MeliApiErrorCode = mapStatusToCode(status)) {
    super(message)
    this.name = 'MeliApiError'
  }
}

function mapStatusToCode(status: number): MeliApiErrorCode {
  if (status === 401) return 'Unauthorized'
  if (status === 403) return 'Forbidden'
  if (status === 404) return 'NotFound'
  if (status === 429) return 'RateLimited'
  if (status >= 500) return 'UpstreamUnavailable'
  return 'InvalidResponse'
}

export async function meliGet<T>(path: string, accessToken: string, fetchFn: typeof fetch = fetch, timeoutMs = 10_000): Promise<T> {
  if (!path.startsWith('/') || path.includes('://')) throw new MeliOAuthError('configuration', 'Meli client only accepts relative GET paths')
  if (!accessToken) throw new MeliOAuthError('token_missing', 'Access token is missing')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchFn(`${MELI_API_BASE_URL}${path}`, {
      method: 'GET',
      headers: { authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
    if (!response.ok) throw new MeliApiError(response.status, `Meli API returned HTTP ${response.status}`)
    try {
      return await response.json() as T
    } catch {
      throw new MeliApiError(response.status, 'Meli API response was invalid', 'InvalidResponse')
    }
  } catch (error) {
    if (error instanceof MeliApiError || error instanceof MeliOAuthError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') throw new MeliOAuthError('timeout', 'Meli API request timed out')
    throw new MeliOAuthError('upstream_http', 'Meli API request failed')
  } finally {
    clearTimeout(timer)
  }
}
