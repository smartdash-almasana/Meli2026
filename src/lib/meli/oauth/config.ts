export interface MeliOAuthConfig {
  authorizationEndpoint: string
  tokenEndpoint: string
  clientId: string
  redirectUri: string
  scopes?: string
}

export function createMeliOAuthConfig(env: Record<string, string | undefined>): MeliOAuthConfig {
  const clientId = env.MELI_CLIENT_ID
  const redirectUri = env.MELI_REDIRECT_URI
  if (!clientId || !redirectUri) throw new Error('Meli OAuth configuration is incomplete')
  return {
    authorizationEndpoint: 'https://auth.mercadolibre.com.ar/authorization',
    tokenEndpoint: 'https://api.mercadolibre.com/oauth/token',
    clientId,
    redirectUri,
    scopes: env.MELI_SCOPES,
  }
}

