import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MeliItemPreview } from '../../lib/meli/items/item-types'

interface LiveMeliItemsProps {
  userId?: string
  onExit: () => void
}

type ScreenState = 'connecting' | 'loading' | 'success' | 'empty' | 'error' | 'unauthorized'

interface Identity {
  id: string
  nickname: string
  siteId?: string
}

const MAX_ITEMS = 50
const PAGE_SIZE = 20

const friendlyError = (code: string | null) => ({
  items_search_failed: 'No se pudo consultar el catálogo.',
  item_details_failed: 'No se pudieron leer las publicaciones.',
  request_failed: 'No se pudo completar la consulta.',
}[code ?? ''] ?? 'Probá de nuevo en unos segundos.')

export default function LiveMeliItems({ userId, onExit }: LiveMeliItemsProps) {
  const [state, setState] = useState<ScreenState>(userId ? 'loading' : 'connecting')
  const [items, setItems] = useState<MeliItemPreview[]>([])
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [nextOffset, setNextOffset] = useState(0)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const requestPage = useCallback(async (offset: number, append: boolean) => {
    if (!userId) return
    if (append) setLoadingMore(true)
    else setState('loading')
    setErrorCode(null)
    try {
      const searchUrl = `/api/meli/items/search?userId=${encodeURIComponent(userId)}&limit=${Math.min(PAGE_SIZE, MAX_ITEMS - offset)}&offset=${offset}`
      const searchResponse = await fetch(searchUrl)
      const searchPayload = await searchResponse.json().catch(() => ({})) as { identity?: Identity; search?: { itemIds?: string[]; total?: number | null }; error?: string }
      if (searchResponse.status === 401 || searchPayload.error === 'Unauthorized') {
        setState('unauthorized')
        return
      }
      if (!searchResponse.ok || !searchPayload.search || !searchPayload.identity) throw new Error(searchPayload.error ?? 'items_search_failed')
      const ids = Array.isArray(searchPayload.search.itemIds) ? searchPayload.search.itemIds : []
      setNextOffset(offset + ids.length)
      setIdentity(searchPayload.identity)
      setTotal(typeof searchPayload.search.total === 'number' ? searchPayload.search.total : null)
      if (ids.length === 0) {
        if (!append) setItems([])
        setState(append ? 'success' : 'empty')
        return
      }
      const detailsResponse = await fetch(`/api/meli/items/details?userId=${encodeURIComponent(userId)}&ids=${ids.map(encodeURIComponent).join(',')}`)
      const detailsPayload = await detailsResponse.json().catch(() => ({})) as { items?: MeliItemPreview[]; error?: string }
      if (detailsResponse.status === 401) {
        setState('unauthorized')
        return
      }
      if (!detailsResponse.ok) throw new Error(detailsPayload.error ?? 'item_details_failed')
      const nextItems = Array.isArray(detailsPayload.items) ? detailsPayload.items : []
      setItems((current) => append ? [...current, ...nextItems].slice(0, MAX_ITEMS) : nextItems.slice(0, MAX_ITEMS))
      setState(nextItems.length === 0 && !append ? 'empty' : 'success')
    } catch (error) {
      setErrorCode(error instanceof Error ? error.message : 'request_failed')
      setState('error')
    } finally {
      setLoadingMore(false)
    }
  }, [userId])

  useEffect(() => {
    setItems([])
    setIdentity(null)
    setTotal(null)
    setNextOffset(0)
    setErrorCode(null)
    if (!userId) {
      setState('connecting')
      return
    }
    void requestPage(0, false)
  }, [requestPage, userId])

  const hasMore = useMemo(() => items.length < MAX_ITEMS && (total === null || nextOffset < total), [items.length, nextOffset, total])
  const loadMore = () => {
    if (!loadingMore && hasMore) void requestPage(nextOffset, true)
  }

  const price = (item: MeliItemPreview) => item.price === null ? 'Precio no disponible' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: item.currencyId ?? 'ARS' }).format(item.price)

  return (
    <main className="live-items" aria-labelledby="live-items-title">
      <section className="live-items-card">
        <button type="button" className="back-button" onClick={onExit}>Atrás</button>
        <header className="live-header">
          <p className="eyebrow">Vista de solo lectura</p>
          <h1 id="live-items-title">Publicaciones de Mercado Libre</h1>
          {identity ? <p className="live-identity">{identity.nickname} · Vendedor {identity.id}</p> : null}
          {total !== null ? <p className="live-total">{total} publicaciones encontradas</p> : null}
        </header>

        {state === 'connecting' ? <div className="live-state"><h2>Conectá Mercado Libre primero</h2><p>Iniciá sesión para ver el catálogo del vendedor.</p></div> : null}
        {state === 'loading' ? <div className="live-state" role="status"><h2>Cargando catálogo…</h2><p>Leemos tus publicaciones de forma segura.</p></div> : null}
        {state === 'unauthorized' ? <div className="live-state"><h2>La sesión necesita atención</h2><p>Volvé a conectar Mercado Libre para continuar.</p></div> : null}
        {state === 'error' ? <div className="live-state"><h2>No se pudieron cargar las publicaciones</h2><p>{friendlyError(errorCode)}</p><button type="button" className="live-retry" onClick={() => void requestPage(nextOffset, items.length > 0)}>Reintentar</button></div> : null}
        {state === 'empty' ? <div className="live-state"><h2>No encontramos publicaciones</h2><p>Este vendedor no tiene publicaciones activas para mostrar.</p></div> : null}

        {items.length > 0 ? <div className="live-item-list" aria-label="Publicaciones del vendedor">
          {items.map((item) => <article className="live-item-card" key={item.id}>
            {item.thumbnail ? <img className="live-item-thumb" src={item.thumbnail} alt="" loading="lazy" /> : <div className="live-item-thumb live-item-thumb-placeholder" aria-hidden="true">ML</div>}
            <div className="live-item-content">
              <h2>{item.title || 'Publicación sin título'}</h2>
              <p className="live-item-price">{price(item)}</p>
              <p className="live-item-meta">Existencias: {item.availableQuantity ?? '—'} · {item.status ?? 'Estado no disponible'}</p>
            </div>
          </article>)}
        </div> : null}

        {state === 'success' && hasMore ? <button type="button" className="live-load-more" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Cargando…' : 'Cargar más publicaciones'}</button> : null}
      </section>
    </main>
  )
}
