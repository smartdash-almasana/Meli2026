import { MeliApiError } from '../../../src/lib/meli/client/meli-client'
import { getCurrentMeliUser } from '../../../src/lib/meli/identity/get-current-user'
import { searchSellerItemIds } from '../../../src/lib/meli/items/seller-items'
import { getServerOAuthConfig, oauthTokenStore } from '../oauth/runtime'

function errorResponse(error: unknown): Response {
  if (error instanceof MeliApiError) {
    const status = error.code === 'Unauthorized' ? 401 : error.code === 'Forbidden' ? 403 : error.code === 'NotFound' ? 404 : error.code === 'RateLimited' ? 429 : 502
    return Response.json({ error: error.code }, { status })
  }
  if (error instanceof Error && error.message.includes('timed out')) return Response.json({ error: 'timeout' }, { status: 504 })
  return Response.json({ error: 'items_search_failed' }, { status: 502 })
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const userId = params.get('userId')
  if (!userId) return Response.json({ error: 'user_id_required' }, { status: 400 })

  try {
    getServerOAuthConfig()
    const tokens = await oauthTokenStore.read(userId)
    if (!tokens) return Response.json({ error: 'not_connected' }, { status: 404 })

    const identity = await getCurrentMeliUser(tokens.accessToken)
    const limit = Number(params.get('limit') ?? 20)
    const offset = Number(params.get('offset') ?? 0)
    const status = params.get('status') ?? undefined
    const search = await searchSellerItemIds(tokens.accessToken, identity.id, { limit, offset, status })
    return Response.json({ identity, search })
  } catch (error) {
    return errorResponse(error)
  }
}

export default GET
