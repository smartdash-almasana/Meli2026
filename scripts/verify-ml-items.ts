import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getCurrentMeliUser } from '../src/lib/meli/identity/get-current-user'
import { MeliApiError, meliGet } from '../src/lib/meli/client/meli-client'
import { fetchItemDetailsBulk } from '../src/lib/meli/items/item-details'
import { normalizeItems } from '../src/lib/meli/items/normalize-item'
import { clampItemLimit, searchSellerItemIds } from '../src/lib/meli/items/seller-items'
import type { MeliBulkItemResult } from '../src/lib/meli/items/item-types'
import { MeliOAuthError } from '../src/lib/meli/oauth/errors'

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const identity = await getCurrentMeliUser('token', async (url) => {
  ensure(String(url) === 'https://api.mercadolibre.com/users/me', 'identity endpoint invalid')
  return new Response(JSON.stringify({ id: 123, nickname: 'seller-demo', site_id: 'MLA' }), { status: 200 })
})
ensure(identity.id === '123' && identity.nickname === 'seller-demo', 'seller identity failed')

let searchUrl = ''
const search = await searchSellerItemIds('token', identity.id, { limit: 20, offset: 0 }, async (url) => {
  searchUrl = String(url)
  return new Response(JSON.stringify({ seller_id: 123, results: ['MLA-1', 'MLA-2'], paging: { total: 35, limit: 20, offset: 0 } }), { status: 200 })
})
ensure(searchUrl.includes('/users/123/items/search?limit=20&offset=0'), 'seller items search endpoint invalid')
ensure(search.itemIds.length === 2 && search.total === 35 && search.limit === 20, 'seller items search failed')

let bulkUrl = ''
const raw = await fetchItemDetailsBulk('token', ['MLA-1', 'MLA-2'], async (url) => {
  bulkUrl = String(url)
  return new Response(JSON.stringify([
    { code: 200, body: { id: 'MLA-1', title: 'Widget', price: 1200, currency_id: 'ARS', available_quantity: 3, status: 'active' } },
    { code: 404, body: { id: 'MLA-2' } },
  ]), { status: 200 })
})
ensure(bulkUrl.includes('/items/bulk?ids=MLA-1,MLA-2'), 'bulk endpoint invalid')
const normalized = normalizeItems(raw)
ensure(normalized.length === 1 && normalized[0]?.title === 'Widget' && normalized[0]?.availableQuantity === 3, 'item normalization failed')

let batchCalls = 0
await fetchItemDetailsBulk('token', Array.from({ length: 21 }, (_, index) => `MLA-${index}`), async (url) => {
  batchCalls += 1
  const ids = new URL(String(url)).searchParams.get('ids')?.split(',') ?? []
  ensure(ids.length <= 20, 'bulk request exceeded 20 ids')
  return new Response(JSON.stringify([]), { status: 200 })
})
ensure(batchCalls === 2, 'bulk batching failed')
ensure(clampItemLimit(20) === 20 && clampItemLimit(99) === 50 && clampItemLimit(0) === 1, 'item limits invalid')

for (const [status, code] of [[401, 'Unauthorized'], [403, 'Forbidden'], [429, 'RateLimited']] as const) {
  await meliGet('/users/me', 'token', async () => new Response('{}', { status })).then(() => {
    throw new Error(`Expected status ${status}`)
  }).catch((error: unknown) => ensure(error instanceof MeliApiError && error.code === code, `status ${status} mapping failed`))
}

await meliGet('/users/me', 'token', async (_url, init) => new Promise((_resolve, reject) => {
  init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
}), 5).then(() => { throw new Error('Expected timeout') }).catch((error: unknown) => ensure(error instanceof MeliOAuthError && error.code === 'timeout', 'timeout handling failed'))

const sourceFiles = [
  'src/lib/meli/client/meli-client.ts',
  'src/lib/meli/items/item-types.ts',
  'src/lib/meli/items/seller-items.ts',
  'src/lib/meli/items/item-details.ts',
  'src/lib/meli/items/normalize-item.ts',
].map((path) => readFileSync(path, 'utf8')).join('\n')
ensure(!/method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i.test(sourceFiles), 'write method present in read-only client')
ensure(!/console\.(log|warn|error)\s*\(/.test(sourceFiles), 'token leak log found')
const partial: MeliBulkItemResult[] = [{ code: 500 }, { code: 200, body: { id: 'MLA-ok', title: 'Safe' } }]
ensure(normalizeItems(partial).length === 1, 'partial response did not degrade safely')

let secretInFrontend = 0
if (existsSync('dist')) {
  for (const file of readdirSync('dist', { recursive: true })) {
    const full = join('dist', String(file))
    if (!full.endsWith('.js') && !full.endsWith('.html')) continue
    const content = readFileSync(full, 'utf8')
    if (/MELI_CLIENT_SECRET|refresh_token|access_token/i.test(content)) secretInFrontend += 1
  }
}
ensure(secretInFrontend === 0, 'secret marker found in frontend bundle')

console.log(JSON.stringify({
  sellerIdentity: 'PASS', sellerItemsSearch: 'PASS', itemDetails: 'PASS', normalization: 'PASS',
  initialLimit: 20, maxLimit: 50, bulkEndpoint: 'PASS', deprecatedEndpoint: 'NOT_USED',
  errors401: 'PASS', errors403: 'PASS', errors429: 'PASS', timeout: 'PASS', partialResponse: 'PASS',
  readOnlyWrites: 'PASS', tokenLeakLogs: 0, secretInFrontend,
}))
