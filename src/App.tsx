import { lazy, Suspense, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { CapturedBy } from './types/contact'
import { listDiscoveryInterviews } from './lib/storage/discovery.repository'
import { listSyncableOutbox } from './lib/storage/outbox.repository'
import { getOperatorProfile, signOutOperator, supabase } from './lib/supabase/auth'
import OperatorLogin from './features/auth/OperatorLogin'
import { syncPendingOutbox } from './lib/sync/sync-engine'
import type { SyncOutboxEntry } from './types/sync'
import { getInterviewAudio, markInterviewAudioStatus } from './lib/storage/audio.repository'

const SellerCapture = lazy(() => import('./features/capture/SellerCapture'))
const LiveMeliItems = lazy(() => import('./features/demo/LiveMeliItems'))
const DiscoverySurvey = lazy(() => import('./features/interview/DiscoverySurvey'))

const loadingView = <main className="shell"><section className="shell-card"><p>Cargando…</p></section></main>

function App() {
  const [view, setView] = useState<'home' | 'capture' | 'demo' | 'interview'>('home')
  const [interviewResume, setInterviewResume] = useState(false)
  const [operator, setOperator] = useState<CapturedBy>('alejandro')
  const [counts, setCounts] = useState({ total: 0, complete: 0, incomplete: 0, pending: 0 })
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<{ display_name: string; active: boolean } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  useEffect(() => {
    let mounted = true
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session) { try { setProfile(await getOperatorProfile(data.session.user.id)) } catch { setProfile(null) } }
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return
      setSession(next)
      if (!next) { setProfile(null); setAuthLoading(false); return }
      void getOperatorProfile(next.user.id).then(setProfile).catch(() => setProfile(null)).finally(() => setAuthLoading(false))
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    if (view !== 'home') return
    void Promise.all([listDiscoveryInterviews(), listSyncableOutbox()]).then(([interviews, pending]) => setCounts({ total: interviews.length, complete: interviews.filter((item) => item.status === 'completed').length, incomplete: interviews.filter((item) => item.status === 'in_progress').length, pending: pending.length }))
  }, [view])
  const runSync = async () => {
    if (!session || syncing) return
    setSyncing(true); setSyncMessage('')
    try {
      const summary = await syncPendingOutbox({ upsert: async (entry: SyncOutboxEntry) => {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (!token) throw new Error('Se necesita iniciar sesión')
        if (entry.entityType === 'interview_audio') {
          const audio = await getInterviewAudio(entry.entityId)
          if (!audio) throw new Error('No se encontró el audio local')
          const form = new FormData()
          const extension = audio.mimeType.includes('ogg') ? 'ogg' : audio.mimeType.includes('mp4') ? 'm4a' : 'webm'
          form.append('file', audio.blob, `entrevista.${extension}`)
          form.append('audio_id', audio.id); form.append('interview_id', audio.interviewId); form.append('event_id', audio.eventId); form.append('operator', audio.operatorId); form.append('recorded_at', audio.recordedAt); form.append('mime_type', audio.mimeType); form.append('duration_seconds', String(audio.durationSeconds))
          const audioResponse = await fetch('/api/supabase/audio', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
          if (!audioResponse.ok) throw new Error('No se pudo sincronizar el audio')
          const audioPayload = await audioResponse.json() as { storagePath?: string }
          await markInterviewAudioStatus(audio.id, 'synced', audioPayload.storagePath)
          return
        }
        const response = await fetch('/api/supabase/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ entries: [entry] }) })
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Se necesita iniciar sesión' : 'Sincronización no disponible')
      } })
      setSyncMessage(summary.failed ? `${summary.synced} sincronizados, ${summary.failed} pendientes para reintentar` : `${summary.synced} sincronizados`)
    } finally { setSyncing(false); const [interviews, pending] = await Promise.all([listDiscoveryInterviews(), listSyncableOutbox()]); setCounts({ total: interviews.length, complete: interviews.filter((item) => item.status === 'completed').length, incomplete: interviews.filter((item) => item.status === 'in_progress').length, pending: pending.length }) }
  }

  if (authLoading) return <main className="shell"><section className="shell-card"><p>Cargando la sesión…</p></section></main>
  if (!session) return <OperatorLogin />
  if (!profile?.active) return <main className="shell"><section className="shell-card"><p className="eyebrow">Meli2026</p><h1>Acceso pendiente</h1><p className="intro">Tu cuenta no está habilitada como entrevistador del evento.</p><button className="secondary-button" type="button" onClick={() => void signOutOperator()}>Cerrar sesión</button></section></main>
  if (view === 'capture') {
    return <Suspense fallback={loadingView}><SellerCapture onExit={() => setView('home')} /></Suspense>
  }

  if (view === 'demo') {
    const userId = new URLSearchParams(window.location.search).get('userId') ?? undefined
    return <Suspense fallback={loadingView}><LiveMeliItems userId={userId} onExit={() => setView('home')} /></Suspense>
  }

  if (view === 'interview') return <Suspense fallback={loadingView}><DiscoverySurvey operator={operator} resume={interviewResume} onExit={() => setView('home')} /></Suspense>

  return (
    <main className="shell" aria-labelledby="app-title" data-interview-total={counts.total}>
      <section className="shell-card home-card">
        <a className="survey-brand" href="http://127.0.0.1:5174/" aria-label="PymIA, volver a la presentación"><img src="/logopymia2.jpg" width="48" height="48" alt="" /><span><strong>PymIA</strong><small>Diagnóstico de operaciones</small></span></a>
        <p className="eyebrow">Herramienta para el evento</p>
        <h1 id="app-title">Entrevistas PymIA</h1>
        <p className="intro">Capturá cada conversación con tranquilidad. Las respuestas se guardan primero en este dispositivo.</p>
        <div className="session-bar"><span>{profile.display_name}</span><button className="text-button" type="button" onClick={() => void signOutOperator()}>Cerrar sesión</button></div>
        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          <span>En línea · guardado local activo</span>
        </div>

        <div className="operator-picker" aria-label="Entrevistador">
          <span>Entrevistador</span>
          {(['alejandro', 'fede'] as CapturedBy[]).map((value) => <button type="button" className={operator === value ? 'selected' : ''} key={value} onClick={() => setOperator(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
        </div>

        <button className="primary-button home-cta" type="button" onClick={() => { setInterviewResume(false); setView('interview') }}>Nueva entrevista</button>
        {counts.incomplete > 0 && <button className="secondary-button" type="button" onClick={() => { setInterviewResume(true); setView('interview') }}>Continuar entrevista guardada</button>}
        <button className="secondary-button" type="button" onClick={() => void runSync()} disabled={syncing}>{syncing ? 'Sincronizando…' : 'Sincronizar pendientes'}</button>
        {syncMessage && <p className="sync-message" role="status">{syncMessage}</p>}
        {counts.pending > 0 && <p className="home-note">Hay información esperando conexión. Podés seguir entrevistando y sincronizar después.</p>}
      </section>
    </main>
  )
}

export default App
