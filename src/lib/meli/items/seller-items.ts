import { meliGet } from '../client/meli-client'
import type { SellerItemsSearchResult } from './item-types'

export const INITIAL_ITEM_LIMIT = 20
export const MAX_ITEM_LIMIT = 50

export function clampItemLimit(limit: number): number {
  return Math.min(MAX_ITEM_LIMIT, Math.max(1, Math.floor(limit)))
}

export async function searchSellerItemIds(accessToken: string, sellerId: string, options: { limit?: number; offset?: number; status?: string } = {}, fetchFn: typeof fetch = fetch): Promise<SellerItemsSearchResult> {
  const limit = clampItemLimit(options.limit ?? INITIAL_ITEM_LIMIT)
  const offset = Math.max(0, Math.floor(options.offset ?? 0))
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (options.status) params.set('status', options.status)
  const result = await meliGet<{ seller_id?: string | number; results?: string[]; paging?: { total?: number; limit?: number; offset?: number } }>(`/users/${encodeURIComponent(sellerId)}/items/search?${params}`, accessToken, fetchFn)
  if (!Array.isArray(result.results) || !result.paging) throw new Error('Meli seller items response is incomplete')
  return {
    sellerId: String(result.seller_id ?? sellerId),
    itemIds: result.results.filter((id): id is string => typeof id === 'string'),
    total: typeof result.paging.total === 'number' ? result.paging.total : null,
    limit,
    offset,
  }
}

