import { MeliOAuthError } from './errors'

export interface PkcePair {
  codeVerifier: string
  codeChallenge: string
  method: 'S256'
}

export function randomBase64Url(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength)
  globalThis.crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

export async function createPkcePair(): Promise<PkcePair> {
  const codeVerifier = randomBase64Url(64)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  return { codeVerifier, codeChallenge: toBase64Url(new Uint8Array(digest)), method: 'S256' }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  if (typeof btoa !== 'function') throw new MeliOAuthError('configuration', 'Base64 encoder is unavailable')
  const base64 = btoa(binary)
  return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

export function assertPkceVerifier(codeVerifier: string): void {
  if (codeVerifier.length < 43 || codeVerifier.length > 128) throw new MeliOAuthError('configuration', 'Invalid PKCE verifier length')
}
