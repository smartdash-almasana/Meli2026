import { exchangeRefreshToken } from '../../../src/lib/meli/oauth/oauth-client'
import { MeliOAuthError } from '../../../src/lib/meli/oauth/errors'
import { getClientSecret, getServerOAuthConfig, oauthTokenStore, refreshCoordinator } from './runtime'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { userId?: string }
    if (!body.userId) return Response.json({ error: 'user_id_required' }, { status: 400 })
    const config = getServerOAuthConfig()
    const next = await refreshCoordinator.refresh(body.userId, (refreshToken) => exchangeRefreshToken(config, getClientSecret(), refreshToken))
    return Response.json({ ok: true, userId: body.userId, expiresAt: next.expiresAt })
  } catch (error) {
    if (error instanceof MeliOAuthError && error.code === 'token_refresh_reuse') return Response.json({ error: 'refresh_token_reuse' }, { status: 409 })
    return Response.json({ error: 'refresh_failed' }, { status: 400 })
  }
}

export default POST

