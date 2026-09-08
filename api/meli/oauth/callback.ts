import { getCurrentMeliUser } from '../../../src/lib/meli/identity/get-current-user'
import { exchangeAuthorizationCode } from '../../../src/lib/meli/oauth/oauth-client'
import { MeliOAuthError } from '../../../src/lib/meli/oauth/errors'
import { getClientSecret, getServerOAuthConfig, oauthStateStore, oauthTokenStore } from './runtime'

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const state = params.get('state')
  const code = params.get('code')
  if (!state || !code) return Response.json({ error: 'invalid_callback' }, { status: 400 })
  try {
    const config = getServerOAuthConfig()
    const stateRecord = await oauthStateStore.consume(state)
    if (stateRecord.redirectUri !== config.redirectUri) throw new MeliOAuthError('invalid_state', 'OAuth redirect mismatch')
    const tokens = await exchangeAuthorizationCode(config, getClientSecret(), code, stateRecord.codeVerifier)
    const user = await getCurrentMeliUser(tokens.accessToken)
    await oauthTokenStore.write(user.id, { ...tokens, userId: user.id })
    return Response.json({ ok: true, user })
  } catch (error) {
    if (error instanceof MeliOAuthError && error.code === 'expired_state') return Response.json({ error: 'expired_state' }, { status: 400 })
    return Response.json({ error: 'oauth_callback_failed' }, { status: 400 })
  }
}

export default GET

