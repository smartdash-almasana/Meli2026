import { meliGet } from '../client/meli-client'
import type { MeliBulkItemResult } from './item-types'

export const BULK_ITEM_LIMIT = 20

export async function fetchItemDetailsBulk(accessToken: string, itemIds: string[], fetchFn: typeof fetch = fetch): Promise<MeliBulkItemResult[]> {
  const ids = itemIds.filter(Boolean).slice(0, 50)
  if (ids.length === 0) return []
  const results: MeliBulkItemResult[] = []
  for (let index = 0; index < ids.length; index += BULK_ITEM_LIMIT) {
    const chunk = ids.slice(index, index + BULK_ITEM_LIMIT)
    const response = await meliGet<MeliBulkItemResult[]>(`/items/bulk?ids=${chunk.map(encodeURIComponent).join(',')}`, accessToken, fetchFn)
    if (!Array.isArray(response)) throw new Error('Meli bulk items response is invalid')
    results.push(...response)
  }
  return results
}

