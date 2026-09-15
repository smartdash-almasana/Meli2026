import { useEffect, useState, type ReactNode } from 'react'
import { completeDiscoveryInterview, listDiscoveryInterviews, saveDiscoveryDraft } from '../../lib/storage/discovery.repository'
import type { CapturedBy } from '../../types/contact'
import type { DiscoveryDraft, DiscoveryInterview } from '../../types/discovery'
import { SURVEY_SCREENS, isCompleteInterview } from './survey-contract'

interface DiscoverySurveyProps { onExit: () => void; operator: CapturedBy; resume?: boolean; publicMode?: boolean }
type Option = { value: string; label: string }
type MultiField = 'channels' | 'current_tools' | 'manual_tasks' | 'problems' | 'priorities'

const channelModeOptions: Option[] = [
  { value: 'meli_only', label: 'Sólo por Mercado Libre' },
  { value: 'multi_channel', label: 'Mercado Libre y otros canales' },
]
const channelOptions: Option[] = [
  { value: 'tiendanube', label: 'Tiendanube' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'social', label: 'Instagram / redes sociales' },
  { value: 'physical_store', label: 'Tienda física' },
  { value: 'own_web', label: 'Web propia' },
  { value: 'other_marketplaces', label: 'Otros marketplaces' },
  { value: 'other', label: 'Otro' },
]
const tenureOptions: Option[] = [
  { value: 'less_6_months', label: 'menos de 6 meses' },
  { value: '6_12_months', label: '6–12 meses' },
  { value: '1_3_years', label: '1–3 años' },
  { value: 'more_3_years', label: 'más de 3 años' },
]
const scaleOptions: Option[] = [
  { value: '1_10', label: '1–10' },
  { value: '11_50', label: '11–50' },
  { value: '51_200', label: '51–200' },
  { value: '201_1000', label: '201–1.000' },
  { value: 'more_1000', label: 'más de 1.000' },
  { value: 'unknown', label: 'No sé' },
]
const ordersOptions: Option[] = [
  { value: '0_10', label: '0–10' },
  { value: '11_50', label: '11–50' },
  { value: '51_200', label: '51–200' },
  { value: '201_500', label: '201–500' },
  { value: 'more_500', label: 'más de 500' },
  { value: 'unknown', label: 'No sé' },
]
const operationModeOptions: Option[] = [
  { value: 'manual', label: 'La mayor parte la hago manualmente' },
  { value: 'systems', label: 'Uso herramientas o sistemas' },
]
const toolOptions: Option[] = [
  { value: 'spreadsheets', label: 'Excel / Google Sheets' },
  { value: 'stock', label: 'Sistema de stock' },
  { value: 'invoicing', label: 'Facturación' },
  { value: 'management', label: 'Sistema de gestión' },
  { value: 'multichannel', label: 'Herramienta multicanal' },
  { value: 'pricing', label: 'Software de precios' },
  { value: 'listings', label: 'Software de publicaciones' },
  { value: 'crm', label: 'CRM' },
  { value: 'other', label: 'Otro' },
]
const manualTaskOptions: Option[] = [
  { value: 'prices', label: 'Actualizar precios' },
  { value: 'stock', label: 'Controlar stock' },
  { value: 'listings', label: 'Publicaciones' },
  { value: 'invoicing', label: 'Facturación' },
  { value: 'collections', label: 'Conciliación de cobros' },
  { value: 'claims', label: 'Reclamos' },
  { value: 'returns', label: 'Devoluciones' },
  { value: 'costs', label: 'Revisar costos' },
  { value: 'reports', label: 'Reportes' },
  { value: 'other', label: 'Otro' },
]
const concernOptions: Option[] = [
  { value: 'time', label: 'Estoy perdiendo demasiado tiempo' },
  { value: 'profit', label: 'No tengo claro si estoy ganando lo suficiente' },
]
const problemOptions: Option[] = [
  { value: 'prices', label: 'Actualizar precios' },
  { value: 'profit_per_product', label: 'Saber cuánto gano por producto' },
  { value: 'cost_changes', label: 'Cambios de costos' },
  { value: 'meli_fees', label: 'Cargos de Mercado Libre' },
  { value: 'stock', label: 'Stock' },
  { value: 'invoicing', label: 'Facturación' },
  { value: 'collections', label: 'Conciliación' },
  { value: 'listings', label: 'Publicaciones' },
  { value: 'shipping', label: 'Envíos' },
  { value: 'claims_returns', label: 'Reclamos/devoluciones' },
  { value: 'manual_work', label: 'Demasiadas tareas manuales' },
  { value: 'multichannel', label: 'Multicanal' },
  { value: 'other', label: 'Otro' },
]
const marginClarityOptions: Option[] = [
  { value: 'clear', label: 'Sí, bastante claro' },
  { value: 'unclear', label: 'No del todo' },
]
const costSourceOptions: Option[] = [
  { value: 'spreadsheet', label: 'Excel / Google Sheets' },
  { value: 'management', label: 'Sistema de gestión' },
  { value: 'supplier', label: 'Sistema del proveedor' },
  { value: 'other_tool', label: 'Otra herramienta' },
  { value: 'manual', label: 'Lo llevo manualmente' },
  { value: 'outdated', label: 'No tengo el costo actualizado' },
  { value: 'other', label: 'Otro' },
]
const frequencyOptions: Option[] = [
  { value: 'daily', label: 'Todos los días' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensualmente' },
  { value: 'supplier_change', label: 'Cuando cambia el proveedor' },
  { value: 'problem', label: 'Cuando aparece un problema' },
  { value: 'rarely', label: 'Casi nunca' },
]
const targetMarginOptions: Option[] = [
  { value: 'general', label: 'Sí, uno general' },
  { value: 'by_product', label: 'Sí, cambia según producto' },
  { value: 'roughly', label: 'Más o menos' },
  { value: 'none', label: 'No' },
]
const focusModeOptions: Option[] = [
  { value: 'profitability', label: 'Rentabilidad y precios' },
  { value: 'operation', label: 'Operación y control' },
]
const priorityOptions: Option[] = [
  { value: 'profitability', label: 'Margen / rentabilidad' },
  { value: 'prices', label: 'Precios' },
  { value: 'meli_fees', label: 'Cargos Mercado Libre' },
  { value: 'listings', label: 'Publicaciones' },
  { value: 'stock', label: 'Stock' },
  { value: 'shipping', label: 'Envíos' },
  { value: 'claims_returns', label: 'Reclamos/devoluciones' },
  { value: 'collections', label: 'Cobros/conciliación' },
  { value: 'invoicing', label: 'Facturación' },
  { value: 'multichannel', label: 'Multicanal' },
  { value: 'automation', label: 'Automatización' },
  { value: 'other', label: 'Otro' },
]
const followupOptions: Option[] = [
  { value: 'pilot', label: 'Quiero que preparen una revisión piloto y puedo compartir datos adicionales' },
  { value: 'orientation', label: 'Prefiero recibir primero una orientación inicial' },
]

const emptyDraft: DiscoveryDraft = {
  operatorId: 'alejandro', eventId: 'mle-2026', currentStep: 0, status: 'in_progress', actorType: 'seller',
  stack: [], painTags: [], developerFormats: [], salesChannels: [], whatsappInterest: [], customSolutionFormats: [],
  developerCapabilityFormats: [], channels: [], current_tools: [], manual_tasks: [], problems: [], priorities: [],
  business_name: '', whatsapp: '', email: '', channel_mode: '', channels_other: '', meli_tenure: '', meli_level: '',
  sku_count_range: '', orders_month_range: '', operation_mode: '', tools_other: '', manual_tasks_other: '',
  main_manual_task: '', main_pain: '', main_concern: '', problems_other: '', margin_method: '', margin_clarity: '',
  product_cost_source: '', cost_source_other: '', cost_update_frequency: '', target_margin: '', low_margin_awareness: '', focus_mode: '',
  focus_other: '', followup_mode: '', consent_contact: false, consent_analysis: false,
}

export default function DiscoverySurvey({ onExit, operator, resume = false, publicMode = false }: DiscoverySurveyProps) {
  const [draft, setDraft] = useState<DiscoveryDraft>(() => ({ ...emptyDraft, operatorId: operator }))
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string>()
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => { const updateConnection = () => setOnline(navigator.onLine); window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection); return () => { window.removeEventListener('online', updateConnection); window.removeEventListener('offline', updateConnection) } }, [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [step, done])
  useEffect(() => { if (!resume || publicMode) return; let active = true; void listDiscoveryInterviews().then((items) => { const latest = items.find((item) => item.status === 'in_progress' && item.operatorId === operator); if (active && latest) { setDraft(latest); setStep(Math.min(5, latest.currentStep)); setSavedId(latest.id) } }); return () => { active = false } }, [operator, publicMode, resume])
  useEffect(() => { if (done) return; const timer = window.setTimeout(() => { if (draft.business_name || draft.whatsapp) void persist(step) }, 250); return () => window.clearTimeout(timer) }, [draft, step, done])

  const update = (changes: Partial<DiscoveryDraft>) => { setError(undefined); setDraft((current) => ({ ...current, ...changes })) }
  const labelsFor = (options: Option[], values: string[]) => values.map((value) => options.find((option) => option.value === value)?.label ?? value)
  const toggle = (field: MultiField, value: string, max?: number) => {
    const current = draft[field] ?? []
    if (max && !current.includes(value) && current.length >= max) { setError(`Podés elegir como máximo ${max}.`); return }
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    const changes: Partial<DiscoveryDraft> = { [field]: next }
    if (field === 'manual_tasks') changes.main_manual_task = labelsFor(manualTaskOptions, next).join('; ')
    update(changes)
  }
  const setChannelMode = (value: string) => update({ channel_mode: value, channels: value === 'meli_only' ? ['meli_only'] : [] })
  const setOperationMode = (value: string) => update({ operation_mode: value, current_tools: value === 'manual' ? ['manual'] : [] })
  const setConcern = (value: string) => update({ main_concern: value, main_pain: concernOptions.find((option) => option.value === value)?.label ?? value })
  const setMarginClarity = (value: string) => update({ margin_clarity: value, margin_method: value, low_margin_awareness: value === 'clear' ? 'yes' : 'partial' })
  const setFollowupMode = (value: string) => update({ followup_mode: value, nextStep: value })

  const persist = async (currentStep: number): Promise<DiscoveryInterview | undefined> => {
    if (publicMode) {
      const now = new Date().toISOString()
      return {
        ...draft,
        id: draft.id ?? 'public-session',
        eventId: 'mle-2026',
        actorType: 'seller' as const,
        operatorId: 'public' as const,
        startedAt: now,
        updatedAt: now,
        currentStep,
        status: 'in_progress' as const,
        stack: draft.current_tools ?? [],
        primaryPain: draft.main_pain ?? '',
        painTags: draft.priorities ?? [],
        salesChannels: draft.channels ?? [],
        developerFormats: [],
      }
    }
    setSaving(true)
    try {
      const saved = await saveDiscoveryDraft({ ...draft, id: draft.id ?? savedId, currentStep, actorType: 'seller', primaryPain: draft.main_pain ?? '', painTags: draft.priorities ?? [], stack: draft.current_tools ?? [], salesChannels: draft.channels ?? [], developerFormats: [] }, operator)
      setSavedId(saved.id); setDraft((current) => current.id ? current : { ...current, id: saved.id }); return saved
    } catch { setError('No se pudo guardar localmente'); return undefined } finally { setSaving(false) }
  }

  const validateStep = (currentStep: number) => {
    const text = (value?: string) => Boolean(value?.trim())
    if (currentStep === 0 && (!text(draft.business_name) || !text(draft.whatsapp) || !text(draft.channel_mode) || !draft.channels?.length || !text(draft.meli_tenure) || !text(draft.sku_count_range))) return 'Completá los datos básicos de tu negocio.'
    if (currentStep === 0 && draft.channel_mode === 'multi_channel' && draft.channels?.includes('other') && !text(draft.channels_other)) return 'Contanos cuál es ese otro canal.'
    if (currentStep === 1 && (!text(draft.operation_mode) || !draft.manual_tasks?.length || (draft.operation_mode === 'systems' && !draft.current_tools?.length))) return 'Elegí cómo trabajás y qué tareas seguís haciendo manualmente.'
    if (currentStep === 1 && draft.current_tools?.includes('other') && !text(draft.tools_other)) return 'Contanos cuál es esa otra herramienta.'
    if (currentStep === 1 && draft.manual_tasks?.includes('other') && !text(draft.manual_tasks_other)) return 'Contanos qué otra tarea hacés manualmente.'
    if (currentStep === 2 && (!text(draft.main_concern) || !draft.problems?.length || draft.problems.length > 3)) return 'Elegí qué te preocupa y hasta 3 problemas.'
    if (currentStep === 2 && draft.problems?.includes('other') && !text(draft.problems_other)) return 'Contanos cuál es ese otro problema.'
    if (currentStep === 3 && (!text(draft.margin_clarity) || !text(draft.product_cost_source) || !text(draft.cost_update_frequency) || !text(draft.target_margin))) return 'Completá las respuestas de margen y costos.'
    if (currentStep === 3 && draft.product_cost_source === 'other' && !text(draft.cost_source_other)) return 'Contanos cuál es esa otra herramienta de costos.'
    if (currentStep === 4 && (!text(draft.focus_mode) || !draft.priorities?.length || draft.priorities.length > 3)) return 'Elegí un foco y hasta 3 áreas para revisar.'
    if (currentStep === 4 && draft.priorities?.includes('other') && !text(draft.focus_other)) return 'Contanos cuál es esa otra área.'
    if (currentStep === 5 && (!text(draft.followup_mode) || draft.consent_contact !== true || draft.consent_analysis !== true)) return 'Elegí cómo preferís seguir y aceptá ambos consentimientos.'
    return undefined
  }
  const next = async () => { const problem = validateStep(step); if (problem) { setError(problem); return }; const saved = await persist(Math.min(5, step + 1)); if (saved) setStep((value) => Math.min(5, value + 1)) }
  const back = async () => { await persist(Math.max(0, step - 1)); setStep((value) => Math.max(0, value - 1)) }
  const complete = async () => { const problem = validateStep(5); if (problem) { setError(problem); setStep(5); return }; const current = await persist(5); if (!current || !isCompleteInterview(current)) { setError('Completá los datos requeridos antes de finalizar.'); return }; setSaving(true); try { if (publicMode) { const response = await fetch('/api/vtv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website: honeypot, draft: { business_name: current.business_name, whatsapp: current.whatsapp, email: current.email, channel_mode: current.channel_mode, channels: current.channels, channels_other: current.channels_other, meli_tenure: current.meli_tenure, sku_count_range: current.sku_count_range, orders_month_range: current.orders_month_range, operation_mode: current.operation_mode, current_tools: current.current_tools, tools_other: current.tools_other, manual_tasks: current.manual_tasks, manual_tasks_other: current.manual_tasks_other, main_concern: current.main_concern, problems: current.problems, problems_other: current.problems_other, margin_clarity: current.margin_clarity, product_cost_source: current.product_cost_source, cost_source_other: current.cost_source_other, cost_update_frequency: current.cost_update_frequency, target_margin: current.target_margin, focus_mode: current.focus_mode, priorities: current.priorities, focus_other: current.focus_other, followup_mode: current.followup_mode, consent_contact: current.consent_contact, consent_analysis: current.consent_analysis } }) }); if (!response.ok) throw new Error('public_submit_failed'); setSavedId('submitted'); setDone(true) } else { const result = await completeDiscoveryInterview({ interview: current, contact: { capturedBy: operator, actorType: 'seller', fullName: current.business_name, companyName: current.business_name, whatsapp: current.whatsapp, email: current.email, meliNickname: undefined, followupConsent: current.consent_contact === true, catalogVolumeBand: current.sku_count_range } }); setSavedId(result.contact.id); setDone(true) } } catch { setError(publicMode ? 'No se pudo enviar la información. Probá de nuevo.' : 'No se pudo completar la encuesta localmente') } finally { setSaving(false) } }

  if (done) return <main className="capture capture-success"><section className="capture-card success-card"><SurveyBrand publicMode={publicMode} /><p className="eyebrow">VTV PymIA: una revisión piloto de tu operación</p><h1>Recibimos tu información.</h1><p className="intro">Si tenemos datos suficientes, te contactamos para preparar la revisión. Si falta algo, te vamos a pedir sólo la información necesaria.</p>{!publicMode && <code className="contact-id">{savedId}</code>}<button className="primary-button" type="button" onClick={onExit}>{publicMode ? 'Volver a PymIA' : 'Volver al inicio'}</button></section></main>

  const title = SURVEY_SCREENS[step].title
  return <main className="capture discovery-survey" aria-labelledby="survey-title"><section className="capture-card"><SurveyBrand publicMode={publicMode} /><header className="capture-header"><button className="back-link" type="button" onClick={() => { if (step === 0) onExit(); else void back() }}>← {step === 0 ? (publicMode ? 'Volver a PymIA' : 'Salir') : 'Atrás'}</button><p className="step-count">Paso {step + 1} de {SURVEY_SCREENS.length}</p><div className="progress" role="progressbar" aria-label="Progreso de la revisión" aria-valuemin={1} aria-valuemax={SURVEY_SCREENS.length} aria-valuenow={step + 1}><span style={{ width: `${((step + 1) / SURVEY_SCREENS.length) * 100}%` }} /></div></header><div className="capture-content"><p className="eyebrow">VTV PymIA: una revisión piloto de tu operación</p>{step === 0 && <><h1 id="survey-title">Veamos dónde se te está yendo tiempo, margen o control.</h1><p className="intro">Son 4–6 minutos. Con tus respuestas armamos una revisión piloto de tu operación en Mercado Libre y te mostramos hasta 3 puntos concretos para revisar.</p><p className="clarification">No es una certificación oficial de Mercado Libre ni una auditoría contable o fiscal.</p></>}{step > 0 && <h1 id="survey-title">{title}</h1>}<p className={`survey-status ${online ? 'is-online' : 'is-offline'}`} role="status"><span aria-hidden="true">{online ? '●' : '○'}</span>{saving ? 'Guardando en este dispositivo…' : savedId ? 'Guardado en este dispositivo' : online ? 'Lista para guardar automáticamente' : 'Sin conexión · guardado local activo'}</p>
    {step === 0 && <Step><Field required label="Nombre del negocio" value={draft.business_name} onChange={(value) => update({ business_name: value })} maxLength={120} /><Field required label="WhatsApp" value={draft.whatsapp} onChange={(value) => update({ whatsapp: value })} maxLength={40} inputMode="tel" /><Field label="Correo electrónico (opcional)" type="email" value={draft.email} onChange={(value) => update({ email: value })} maxLength={160} />{publicMode && <label className="honeypot" aria-hidden="true">Dejá este campo vacío<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>}<ChoiceGroup required label="¿Dónde vendés hoy?" options={channelModeOptions} value={draft.channel_mode} onChange={setChannelMode} />{draft.channel_mode === 'multi_channel' && <><ChoiceGroup required label="¿En qué otros canales vendés?" options={channelOptions} values={draft.channels} onToggle={(value) => toggle('channels', value)} /><OtherField show={draft.channels?.includes('other') === true} label="¿Cuál?" value={draft.channels_other} onChange={(value) => update({ channels_other: value })} /></>}<ChoiceGroup required label="¿Hace cuánto vendés en Mercado Libre?" options={tenureOptions} value={draft.meli_tenure} onChange={(value) => update({ meli_tenure: value })} /><ChoiceGroup required label="¿Cuántos productos/publicaciones manejás?" options={scaleOptions} value={draft.sku_count_range} onChange={(value) => update({ sku_count_range: value })} /><ChoiceGroup required label="¿Cuántas ventas/pedidos tenés por mes?" options={ordersOptions} value={draft.orders_month_range} onChange={(value) => update({ orders_month_range: value })} /></Step>}
    {step === 1 && <Step><ChoiceGroup required label="¿Cómo manejás hoy tu operación?" options={operationModeOptions} value={draft.operation_mode} onChange={setOperationMode} />{draft.operation_mode === 'systems' && <><ChoiceGroup required label="¿Qué herramientas o sistemas usás?" options={toolOptions} values={draft.current_tools} onToggle={(value) => toggle('current_tools', value)} /><OtherField show={draft.current_tools?.includes('other') === true} label="¿Cuál?" value={draft.tools_other} onChange={(value) => update({ tools_other: value })} /></>}<ChoiceGroup required label="¿Qué cosas seguís haciendo manualmente?" options={manualTaskOptions} values={draft.manual_tasks} onToggle={(value) => toggle('manual_tasks', value)} /><OtherField show={draft.manual_tasks?.includes('other') === true} label="¿Cuál?" value={draft.manual_tasks_other} onChange={(value) => update({ manual_tasks_other: value })} /></Step>}
    {step === 2 && <Step><ChoiceGroup required label="Hoy, ¿qué te preocupa más?" options={concernOptions} value={draft.main_concern} onChange={setConcern} /><ChoiceGroup required label="Elegí hasta 3 problemas" options={problemOptions} values={draft.problems} onToggle={(value) => toggle('problems', value, 3)} /><OtherField show={draft.problems?.includes('other') === true} label="¿Cuál?" value={draft.problems_other} onChange={(value) => update({ problems_other: value })} /></Step>}
    {step === 3 && <Step><p className="step-help">Queremos entender si hoy podés saber cuánto te queda después de vender.</p><ChoiceGroup required label="¿Sabés aproximadamente cuánto ganás por cada producto?" options={marginClarityOptions} value={draft.margin_clarity} onChange={setMarginClarity} /><ChoiceGroup required label="¿Dónde tenés el costo de tus productos?" options={costSourceOptions} value={draft.product_cost_source} onChange={(value) => update({ product_cost_source: value })} /><OtherField show={draft.product_cost_source === 'other'} label="¿Cuál?" value={draft.cost_source_other} onChange={(value) => update({ cost_source_other: value })} /><ChoiceGroup required label="¿Cada cuánto cambia o actualizás ese costo?" options={frequencyOptions} value={draft.cost_update_frequency} onChange={(value) => update({ cost_update_frequency: value })} /><ChoiceGroup required label="¿Usás un margen objetivo?" options={targetMarginOptions} value={draft.target_margin} onChange={(value) => update({ target_margin: value })} /></Step>}
    {step === 4 && <Step><ChoiceGroup required label="¿Dónde querés que pongamos el foco?" options={focusModeOptions} value={draft.focus_mode} onChange={(value) => update({ focus_mode: value })} /><ChoiceGroup required label="Elegí hasta 3 áreas" options={priorityOptions} values={draft.priorities} onToggle={(value) => toggle('priorities', value, 3)} /><OtherField show={draft.priorities?.includes('other') === true} label="¿Cuál?" value={draft.focus_other} onChange={(value) => update({ focus_other: value })} /><p className="step-help">Si necesitamos completar la revisión, después podremos pedirte algunos datos adicionales.</p></Step>}
    {step === 5 && <Step><ChoiceGroup required label="¿Cómo preferís seguir?" options={followupOptions} value={draft.followup_mode} onChange={setFollowupMode} /><p className="step-help">Podemos pedirte algunos datos adicionales para completar el análisis.</p><label className="check-row"><input type="checkbox" checked={draft.consent_contact ?? false} onChange={(event) => update({ consent_contact: event.target.checked })} /> Acepto que PymIA me contacte sobre esta revisión piloto. *</label><label className="check-row"><input type="checkbox" checked={draft.consent_analysis ?? false} onChange={(event) => update({ consent_analysis: event.target.checked })} /> Acepto que PymIA analice la información que comparta para preparar la revisión. *</label></Step>}
    {error && <p className="error-message" role="alert">{error}</p>}</div><footer className="capture-actions"><button className="primary-button" type="button" onClick={() => void (step === 5 ? complete() : next())} disabled={saving}>{saving ? 'Guardando…' : step === 0 ? 'Empezar revisión' : step === 5 ? 'Enviar mi información' : 'Continuar'}</button></footer></section></main>
}

function SurveyBrand({ publicMode = false }: { publicMode?: boolean }) { return <a className="survey-brand" href={publicMode ? '/' : 'http://127.0.0.1:5174/'} aria-label="PymIA, volver a la presentación"><img src="/logopymia2.jpg" width="48" height="48" alt="" /><span><strong>PymIA</strong><small>Diagnóstico de operaciones</small></span></a> }
function Step({ children }: { children: ReactNode }) { return <div className="step-body">{children}</div> }
function OtherField({ show, label, value, onChange }: { show: boolean; label: string; value?: string; onChange: (value: string) => void }) { return show ? <Field required label={label} value={value} onChange={onChange} maxLength={120} /> : null }
function Field({ label, value, onChange, multiline, required, type = 'text', maxLength, inputMode }: { label: string; value?: string; onChange: (value: string) => void; multiline?: boolean; required?: boolean; type?: string; maxLength?: number; inputMode?: 'text' | 'tel' | 'email' }) {
  const fieldName = `field-${label.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
  const autocomplete = type === 'email' ? 'email' : inputMode === 'tel' ? 'tel' : 'off'
  return <div className="field full-width"><label htmlFor={fieldName}>{label}{required ? ' *' : ''}</label>{multiline ? <textarea id={fieldName} name={fieldName} autoComplete="off" rows={4} required={required} maxLength={maxLength} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /> : <input id={fieldName} name={fieldName} autoComplete={autocomplete} type={type} inputMode={inputMode} required={required} maxLength={maxLength} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />}</div>
}
function ChoiceGroup({ label, options, value, values, onChange, onToggle, required }: { label?: string; options: Option[]; value?: string; values?: string[]; onChange?: (value: string) => void; onToggle?: (value: string) => void; required?: boolean }) { return <fieldset className="choice-section"><legend>{label}{required ? ' *' : ''}</legend><div className="chip-grid">{options.map((option) => { const selected = values ? values.includes(option.value) : value === option.value; return <button aria-pressed={selected} className={`choice chip ${selected ? 'selected' : ''}`} type="button" key={option.value} onClick={() => values ? onToggle?.(option.value) : onChange?.(option.value)}><span translate="no">{option.label}</span></button> })}</div></fieldset> }
