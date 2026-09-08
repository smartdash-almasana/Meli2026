import { buildAuthorizationUrl } from '../../../src/lib/meli/oauth/oauth-client'
import { issueOAuthState } from '../../../src/lib/meli/oauth/state'
import { getServerOAuthConfig, getStateTtlMs, oauthStateStore } from './runtime'

export async function GET(): Promise<Response> {
  try {
    const config = getServerOAuthConfig()
    const { record, pkce } = await issueOAuthState(oauthStateStore, config.redirectUri, getStateTtlMs())
    return Response.redirect(buildAuthorizationUrl(config, record.state, pkce.codeChallenge), 302)
  } catch {
    return Response.json({ error: 'oauth_configuration' }, { status: 500 })
  }
}

export default GET

