export interface MeliItemPreview {
  id: string
  title: string
  price: number | null
  currencyId: string | null
  availableQuantity: number | null
  soldQuantity?: number | null
  status: string | null
  permalink?: string | null
  thumbnail?: string | null
  listingTypeId?: string | null
  categoryId?: string | null
  catalogProductId?: string | null
}

export interface SellerItemsSearchResult {
  sellerId: string
  itemIds: string[]
  total: number | null
  limit: number
  offset: number
}

export interface MeliBulkItemResult {
  id?: string
  status_code?: number
  code?: number
  body?: Record<string, unknown>
}

