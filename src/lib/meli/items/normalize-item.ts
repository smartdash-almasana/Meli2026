import type { MeliItemPreview, MeliBulkItemResult } from './item-types'

export function normalizeItem(result: MeliBulkItemResult): MeliItemPreview | null {
  if ((result.status_code ?? result.code) !== 200 || !result.body) return null
  const body = result.body
  const id = typeof body.id === 'string' ? body.id : null
  if (!id) return null
  return {
    id,
    title: typeof body.title === 'string' ? body.title : '',
    price: typeof body.price === 'number' ? body.price : null,
    currencyId: typeof body.currency_id === 'string' ? body.currency_id : null,
    availableQuantity: typeof body.available_quantity === 'number' ? body.available_quantity : null,
    soldQuantity: typeof body.sold_quantity === 'number' ? body.sold_quantity : null,
    status: typeof body.status === 'string' ? body.status : null,
    permalink: typeof body.permalink === 'string' ? body.permalink : null,
    thumbnail: typeof body.thumbnail === 'string' ? body.thumbnail : null,
    listingTypeId: typeof body.listing_type_id === 'string' ? body.listing_type_id : null,
    categoryId: typeof body.category_id === 'string' ? body.category_id : null,
    catalogProductId: typeof body.catalog_product_id === 'string' ? body.catalog_product_id : null,
  }
}

export function normalizeItems(results: MeliBulkItemResult[]): MeliItemPreview[] {
  return results.flatMap((result) => {
    const normalized = normalizeItem(result)
    return normalized ? [normalized] : []
  })
}
