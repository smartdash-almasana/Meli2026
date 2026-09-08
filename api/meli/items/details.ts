import { MeliApiError } from '../../../src/lib/meli/client/meli-client'
import { fetchItemDetailsBulk } from '../../../src/lib/meli/items/item-details'
import { normalizeItems } from '../../../src/lib/meli/items/normalize-item'
import { getServerOAuthConfig, oauthTokenStore } from '../oauth/runtime'

function errorResponse(error: unknown): Response {
  if (error instanceof MeliApiError) {
    const status = error.code === 'Unauthorized' ? 401 : error.code === 'Forbidden' ? 403 : error.code === 'NotFound' ? 404 : error.code === 'RateLimited' ? 429 : 502
    return Response.json({ error: error.code }, { status })
  }
  if (error instanceof Error && error.message.includes('timed out')) return Response.json({ error: 'timeout' }, { status: 504 })
  return Response.json({ error: 'item_details_failed' }, { status: 502 })
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const userId = params.get('userId')
  if (!userId) return Response.json({ error: 'user_id_required' }, { status: 400 })

  try {
    getServerOAuthConfig()
    const tokens = await oauthTokenStore.read(userId)
    if (!tokens) return Response.json({ error: 'not_connected' }, { status: 404 })

    const ids = (params.get('ids') ?? '').split(',').map((id) => id.trim()).filter(Boolean).slice(0, 50)
    if (ids.length === 0) return Response.json({ items: [], requestedCount: 0, returnedCount: 0 })
    const raw = await fetchItemDetailsBulk(tokens.accessToken, ids)
    const items = normalizeItems(raw)
    return Response.json({ items, requestedCount: ids.length, returnedCount: items.length })
  } catch (error) {
    return errorResponse(error)
  }
}

export default GET
