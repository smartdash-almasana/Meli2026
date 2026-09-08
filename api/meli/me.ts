import { getCurrentMeliUser } from '../../src/lib/meli/identity/get-current-user'
import { getServerOAuthConfig, oauthTokenStore } from './oauth/runtime'

export async function GET(request: Request): Promise<Response> {
  const userId = new URL(request.url).searchParams.get('userId')
  if (!userId) return Response.json({ error: 'user_id_required' }, { status: 400 })
  try {
    getServerOAuthConfig()
    const tokens = await oauthTokenStore.read(userId)
    if (!tokens) return Response.json({ error: 'not_connected' }, { status: 404 })
    return Response.json({ user: await getCurrentMeliUser(tokens.accessToken) })
  } catch {
    return Response.json({ error: 'identity_lookup_failed' }, { status: 400 })
  }
}

export default GET

