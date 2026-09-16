import { useEffect, useState, type ReactNode } from 'react'
import { completeDiscoveryInterview, listDiscoveryInterviews, saveDiscoveryDraft } from '../../lib/storage/discovery.repository'
import type { CapturedBy } from '../../types/contact'
import type { DiscoveryDraft, DiscoveryInterview } from '../../types/discovery'
import { SURVEY_SCREENS, isCompleteInterview } from './survey-contract'

interface DiscoverySurveyProps { onExit: () => void; operator: CapturedBy; resume?: boolean; publicMode?: boolean }
type Option = { value: string; label: string }
type MultiField = 'channels' | 'current_tools' | 'manual_tasks' | 'problems' | 'priorities' | 'growth_difficulties' | 'margin_components' | 'supply_models' | 'post_sale_channels'

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
const businessTypeOptions: Option[] = [
  { value: 'seller', label: 'Vendo productos' },
  { value: 'distributor', label: 'Distribuyo productos' },
  { value: 'service', label: 'Brindo servicios' },
  { value: 'mixed', label: 'Productos y servicios' },
]
const businessCategoryOptions: Option[] = [
  { value: 'retail', label: 'Comercio / retail' },
  { value: 'technical_service', label: 'Servicio técnico' },
  { value: 'professional', label: 'Profesional / consultorio' },
  { value: 'industrial', label: 'Industrial / taller' },
  { value: 'other', label: 'Otro rubro' },
]
const teamSizeOptions: Option[] = [
  { value: 'one', label: 'Sólo yo' },
  { value: '2_3', label: '2–3 personas' },
  { value: '4_10', label: '4–10 personas' },
  { value: 'more_10', label: 'Más de 10' },
]
const operationModeOptions: Option[] = [
  { value: 'manual', label: 'La mayor parte la hago manualmente' },
  { value: 'systems', label: 'Uso herramientas o sistemas' },
]
const ownerRoleOptions: Option[] = [
  { value: 'owner', label: 'Yo administro Mercado Libre' },
  { value: 'team', label: 'Lo administra mi equipo' },
  { value: 'shared', label: 'Lo hacemos entre varios' },
]
const hoursOptions: Option[] = [
  { value: 'less_2', label: 'Menos de 2 horas' },
  { value: '2_5', label: '2–5 horas' },
  { value: '6_10', label: '6–10 horas' },
  { value: 'more_10', label: 'Más de 10 horas' },
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
const marginComponentOptions: Option[] = [
  { value: 'meli_fees', label: 'Comisiones y cargos' },
  { value: 'shipping', label: 'Envíos y logística' },
  { value: 'promotions', label: 'Promociones' },
  { value: 'ads', label: 'Publicidad / Ads' },
  { value: 'returns', label: 'Devoluciones' },
  { value: 'external_costs', label: 'Costos externos' },
]
const stockOwnerOptions: Option[] = [
  { value: 'owner', label: 'Lo controlo yo' },
  { value: 'team', label: 'Lo controla mi equipo' },
  { value: 'system', label: 'Lo informa un sistema' },
  { value: 'shared', label: 'Entre sistema y revisión manual' },
]
const stockSyncOptions: Option[] = [
  { value: 'yes', label: 'Sí, se sincroniza' },
  { value: 'partial', label: 'A veces / parcialmente' },
  { value: 'no', label: 'No, lo actualizamos manualmente' },
  { value: 'unknown', label: 'No estoy seguro' },
]
const stockoutOptions: Option[] = [
  { value: 'never', label: 'Casi nunca' },
  { value: 'sometimes', label: 'A veces' },
  { value: 'often', label: 'Seguido' },
  { value: 'unknown', label: 'No lo medimos' },
]
const supplierLeadTimeOptions: Option[] = [
  { value: 'same_week', label: 'Menos de una semana' },
  { value: '1_3_weeks', label: '1–3 semanas' },
  { value: 'more_3_weeks', label: 'Más de 3 semanas' },
  { value: 'unknown', label: 'No lo tenemos claro' },
]
const supplierCountOptions: Option[] = [
  { value: 'one', label: '1 proveedor principal' },
  { value: '2_5', label: '2–5 proveedores' },
  { value: 'more_5', label: 'Más de 5' },
  { value: 'unknown', label: 'No lo sé' },
]
const yesNoUnknownOptions: Option[] = [
  { value: 'yes', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'No estoy seguro' },
]
const adsManagerOptions: Option[] = [
  { value: 'owner', label: 'Yo' },
  { value: 'team', label: 'Mi equipo' },
  { value: 'agency', label: 'Una agencia' },
  { value: 'shared', label: 'Entre varios' },
]
const adsBudgetOptions: Option[] = [
  { value: 'fixed', label: 'Monto fijo' },
  { value: 'sales', label: 'Según ventas' },
  { value: 'performance', label: 'Según rentabilidad' },
  { value: 'intuition', label: 'Por experiencia / intuición' },
  { value: 'unknown', label: 'No tenemos un criterio fijo' },
]
const supplyModelOptions: Option[] = [
  { value: 'own_manufacturing', label: 'Fabrico productos propios' },
  { value: 'direct_import', label: 'Importo directamente' },
  { value: 'wholesale_resale', label: 'Revendo productos comprados a distribuidores o mayoristas' },
  { value: 'local_manufacturing', label: 'Compro a fabricantes locales' },
  { value: 'private_label', label: 'Trabajo con marca propia fabricada por terceros' },
  { value: 'combined', label: 'Combino varias de estas modalidades' },
  { value: 'other', label: 'Otro' },
]
const growthDifficultyOptions: Option[] = [
  { value: 'stock', label: 'Stock' },
  { value: 'margin', label: 'Margen' },
  { value: 'attention', label: 'Atención' },
  { value: 'billing', label: 'Facturación' },
  { value: 'reconciliation', label: 'Conciliación' },
  { value: 'logistics', label: 'Logística' },
  { value: 'advertising', label: 'Publicidad' },
  { value: 'team', label: 'Equipo' },
  { value: 'personal_time', label: 'Mi tiempo' },
  { value: 'control', label: 'Control general' },
  { value: 'other', label: 'Otro' },
]
const postSaleOptions: Option[] = [
  { value: 'returns', label: 'Devoluciones' },
  { value: 'claims', label: 'Reclamos' },
  { value: 'questions', label: 'Preguntas' },
  { value: 'manual', label: 'Seguimiento manual' },
  { value: 'recurring', label: 'Problemas recurrentes' },
  { value: 'none', label: 'No es un problema hoy' },
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

const stepTrust = [
  { title: 'Antes de pedirte datos', body: 'Primero necesitamos entender cómo funciona tu negocio. Usamos esta información para ordenar la revisión y no vamos a cambiar nada de tu cuenta.' },
  { title: 'Leemos antes de actuar', body: 'Queremos saber qué herramientas ya usás y qué seguís haciendo manualmente. PymIA trabaja sobre tu operación actual; no busca reemplazarla.' },
  { title: 'No completamos huecos', body: 'Estas respuestas nos ayudan a ubicar señales que conviene investigar. No son diagnósticos automáticos ni afirmaciones sobre lo que todavía no podemos verificar.' },
  { title: 'Mercado Libre no cuenta toda la historia', body: 'Además de lo que podés ver en Mercado Libre, preguntamos por costos y criterios propios del negocio. Sólo pedimos lo que no podamos obtener de forma confiable.' },
  { title: 'Stock y publicidad, en contexto', body: 'Relacionamos tus respuestas para buscar contradicciones importantes. Un cambio puede ser una señal para revisar, no una conclusión cerrada.' },
  { title: 'Postventa y prioridades', body: 'Queremos entender qué te impacta después de vender y qué te gustaría resolver primero. Vos elegís el foco de la revisión.' },
  { title: 'Cómo vamos a revisar', body: 'En esta revisión no conectamos tu cuenta ni pedimos tu contraseña. Si en el futuro autorizás una lectura, no permitirá cambiar precios, stock o publicaciones.' },
  { title: 'Antes de enviar', body: 'Si falta información importante, la vamos a marcar como no verificada. No vamos a inventar datos ni prometer una certificación oficial.' },
]

const emptyDraft: DiscoveryDraft = {
  operatorId: 'alejandro', eventId: 'mle-2026', currentStep: 0, status: 'in_progress', actorType: 'seller',
  stack: [], painTags: [], developerFormats: [], salesChannels: [], whatsappInterest: [], customSolutionFormats: [],
  developerCapabilityFormats: [], channels: [], current_tools: [], manual_tasks: [], problems: [], priorities: [],
  business_name: '', business_type: '', business_category: '', team_size: '', whatsapp: '', email: '', channel_mode: '', channels_other: '', meli_tenure: '', meli_level: '',
  sku_count_range: '', orders_month_range: '', operation_mode: '', owner_role: '', owner_manual_tasks: '', manual_control_hours: '', critical_info_search: '', tools_other: '', manual_tasks_other: '',
  main_manual_task: '', main_pain: '', main_concern: '', problems_other: '', growth_difficulties: [], growth_difficulties_other: '', margin_method: '', margin_clarity: '',
  product_cost_source: '', cost_source_other: '', cost_update_frequency: '', target_margin: '', margin_components: [], low_margin_awareness: '', focus_mode: '',
  stock_owner: '', stock_sync: '', stockout_frequency: '', supplier_lead_time: '', supplier_count: '', uses_full: '', ads_usage: '', ads_manager: '', ads_budget_method: '', ads_profitability: '', supply_models: [], primary_supply_model: '', supply_model_other: '', post_sale_channels: [], recurring_postsale_issue: '', open_problem: '', missing_data: '',
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
  useEffect(() => { if (!resume || publicMode) return; let active = true; void listDiscoveryInterviews().then((items) => { const latest = items.find((item) => item.status === 'in_progress' && item.operatorId === operator); if (active && latest) { setDraft(latest); setStep(Math.min(SURVEY_SCREENS.length - 1, latest.currentStep)); setSavedId(latest.id) } }); return () => { active = false } }, [operator, publicMode, resume])
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
  const setSupplyModels = (value: string) => {
    const current = draft.supply_models ?? []
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    const primary = next.length > 1 && current.length > 1 && next.includes(draft.primary_supply_model ?? '') ? draft.primary_supply_model : ''
    update({ supply_models: next, primary_supply_model: primary, ...(next.includes('other') ? {} : { supply_model_other: '' }) })
  }
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
    if (currentStep === 4 && (!draft.supply_models?.length || (draft.supply_models.length > 1 && !text(draft.primary_supply_model)))) return 'Elegí al menos una modalidad de abastecimiento y, si elegís varias, cuál representa la mayor parte.'
    if (currentStep === 4 && draft.supply_models?.includes('other') && !text(draft.supply_model_other)) return 'Contanos cuál es esa otra modalidad de abastecimiento.'
    if (currentStep === 5 && (!text(draft.focus_mode) || !draft.priorities?.length || draft.priorities.length > 3)) return 'Elegí un foco y hasta 3 áreas para revisar.'
    if (currentStep === 5 && draft.priorities?.includes('other') && !text(draft.focus_other)) return 'Contanos cuál es esa otra área.'
    if (currentStep === 7 && (!text(draft.followup_mode) || draft.consent_contact !== true || draft.consent_analysis !== true)) return 'Elegí cómo preferís seguir y aceptá ambos consentimientos.'
    return undefined
  }
  const next = async () => { const problem = validateStep(step); if (problem) { setError(problem); return }; const lastStep = SURVEY_SCREENS.length - 1; const saved = await persist(Math.min(lastStep, step + 1)); if (saved) setStep((value) => Math.min(lastStep, value + 1)) }
  const back = async () => { await persist(Math.max(0, step - 1)); setStep((value) => Math.max(0, value - 1)) }
  const complete = async () => { const lastStep = SURVEY_SCREENS.length - 1; const problem = validateStep(lastStep); if (problem) { setError(problem); setStep(lastStep); return }; const current = await persist(lastStep); if (!current || !isCompleteInterview(current)) { setError('Completá los datos requeridos antes de finalizar.'); return }; setSaving(true); try { if (publicMode) { const { id, contactId, operatorId, eventId, actorType, currentStep, status, startedAt, updatedAt, completedAt, stack, painTags, primaryPain, salesChannels, developerFormats, ...publicDraft } = current; void id; void contactId; void operatorId; void eventId; void actorType; void currentStep; void status; void startedAt; void updatedAt; void completedAt; void stack; void painTags; void primaryPain; void salesChannels; void developerFormats; const response = await fetch('/api/vtv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website: honeypot, draft: publicDraft }) }); if (!response.ok) throw new Error('public_submit_failed'); setSavedId('submitted'); setDone(true) } else { const result = await completeDiscoveryInterview({ interview: current, contact: { capturedBy: operator, actorType: 'seller', fullName: current.business_name, companyName: current.business_name, whatsapp: current.whatsapp, email: current.email, meliNickname: undefined, followupConsent: current.consent_contact === true, catalogVolumeBand: current.sku_count_range } }); setSavedId(result.contact.id); setDone(true) } } catch { setError(publicMode ? 'No se pudo enviar la información. Probá de nuevo.' : 'No se pudo completar la encuesta localmente') } finally { setSaving(false) } }

  if (done) return <main className="capture capture-success"><section className="capture-card success-card"><SurveyBrand publicMode={publicMode} /><p className="eyebrow">VTV PymIA: una revisión piloto de tu operación</p><h1>Recibimos tu información.</h1><p className="intro">Si tenemos datos suficientes, te contactamos para preparar la revisión. Si falta algo, te vamos a pedir sólo la información necesaria.</p>{!publicMode && <code className="contact-id">{savedId}</code>}<button className="primary-button" type="button" onClick={onExit}>{publicMode ? 'Volver a PymIA' : 'Volver al inicio'}</button></section></main>

  const title = SURVEY_SCREENS[step].title
  const lastStep = SURVEY_SCREENS.length - 1
  return <main className="capture discovery-survey" aria-labelledby="survey-title"><section className="capture-card"><SurveyBrand publicMode={publicMode} /><header className="capture-header"><button className="back-link" type="button" onClick={() => { if (step === 0) onExit(); else void back() }}>← {step === 0 ? (publicMode ? 'Volver a PymIA' : 'Salir') : 'Atrás'}</button><p className="step-count">Paso {step + 1} de {SURVEY_SCREENS.length}</p><div className="progress" role="progressbar" aria-label="Progreso de la revisión" aria-valuemin={1} aria-valuemax={SURVEY_SCREENS.length} aria-valuenow={step + 1}><span style={{ width: ((step + 1) / SURVEY_SCREENS.length) * 100 + '%' }} /></div></header><div className="capture-content"><p className="eyebrow">VTV PymIA: una revisión guiada de tu operación</p>{step === 0 && <><h1 id="survey-title">Veamos dónde se te está yendo tiempo, margen o control.</h1><p className="intro">Son 4–6 minutos. Con tus respuestas armamos una revisión guiada de tu operación en Mercado Libre y te mostramos hasta 3 señales concretas para investigar.</p><p className="clarification">No es una certificación oficial de Mercado Libre ni una auditoría contable o fiscal.</p></>}{step > 0 && <h1 id="survey-title">{title}</h1>}<p className={'survey-status ' + (online ? 'is-online' : 'is-offline')} role="status"><span aria-hidden="true">{online ? '●' : '○'}</span>{saving ? 'Guardando en este dispositivo…' : savedId ? 'Guardado en este dispositivo' : online ? 'Lista para guardar automáticamente' : 'Sin conexión · guardado local activo'}</p><aside className="trust-callout" aria-label={'Información sobre el paso ' + (step + 1)}><strong>{stepTrust[step].title}</strong><p>{stepTrust[step].body}</p></aside>
    {step === 0 && <Step><Field required label="Nombre del negocio" value={draft.business_name} onChange={(value) => update({ business_name: value })} maxLength={120} /><ChoiceGroup label="¿Qué tipo de negocio tenés?" options={businessTypeOptions} value={draft.business_type} onChange={(value) => update({ business_type: value })} /><ChoiceGroup label="¿En qué rubro trabajás?" options={businessCategoryOptions} value={draft.business_category} onChange={(value) => update({ business_category: value })} /><ChoiceGroup label="¿Cuántas personas participan?" options={teamSizeOptions} value={draft.team_size} onChange={(value) => update({ team_size: value })} /><Field required label="WhatsApp" value={draft.whatsapp} onChange={(value) => update({ whatsapp: value })} maxLength={40} inputMode="tel" /><Field label="Correo electrónico (opcional)" type="email" value={draft.email} onChange={(value) => update({ email: value })} maxLength={160} />{publicMode && <label className="honeypot" aria-hidden="true">Dejá este campo vacío<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>}<ChoiceGroup required label="¿Dónde vendés hoy?" options={channelModeOptions} value={draft.channel_mode} onChange={setChannelMode} />{draft.channel_mode === 'multi_channel' && <><ChoiceGroup required label="¿En qué otros canales vendés?" options={channelOptions} values={draft.channels} onToggle={(value) => toggle('channels', value)} /><OtherField show={draft.channels?.includes('other') === true} label="¿Cuál?" value={draft.channels_other} onChange={(value) => update({ channels_other: value })} /></>}<ChoiceGroup required label="¿Hace cuánto vendés en Mercado Libre?" options={tenureOptions} value={draft.meli_tenure} onChange={(value) => update({ meli_tenure: value })} /><ChoiceGroup required label="¿Cuántos productos/publicaciones manejás?" options={scaleOptions} value={draft.sku_count_range} onChange={(value) => update({ sku_count_range: value })} /><ChoiceGroup required label="¿Cuántas ventas/pedidos tenés por mes?" options={ordersOptions} value={draft.orders_month_range} onChange={(value) => update({ orders_month_range: value })} /></Step>}
    {step === 1 && <Step><ChoiceGroup required label="¿Cómo manejás hoy tu operación?" options={operationModeOptions} value={draft.operation_mode} onChange={setOperationMode} /><ChoiceGroup label="¿Quién administra Mercado Libre?" options={ownerRoleOptions} value={draft.owner_role} onChange={(value) => update({ owner_role: value })} />{draft.operation_mode === 'systems' && <><ChoiceGroup required label="¿Qué herramientas o sistemas usás?" options={toolOptions} values={draft.current_tools} onToggle={(value) => toggle('current_tools', value)} /><OtherField show={draft.current_tools?.includes('other') === true} label="¿Cuál?" value={draft.tools_other} onChange={(value) => update({ tools_other: value })} /></>}<ChoiceGroup required label="¿Qué cosas seguís haciendo manualmente?" options={manualTaskOptions} values={draft.manual_tasks} onToggle={(value) => toggle('manual_tasks', value)} /><OtherField show={draft.manual_tasks?.includes('other') === true} label="¿Cuál?" value={draft.manual_tasks_other} onChange={(value) => update({ manual_tasks_other: value })} /><Field label="¿Qué tarea todavía hacés vos?" value={draft.owner_manual_tasks} onChange={(value) => update({ owner_manual_tasks: value })} maxLength={240} /><ChoiceGroup label="¿Cuántas horas por semana dedicás a controles?" options={hoursOptions} value={draft.manual_control_hours} onChange={(value) => update({ manual_control_hours: value })} /><Field label="¿Qué información tenés que buscar en más de un sistema para entender qué está pasando?" value={draft.critical_info_search} onChange={(value) => update({ critical_info_search: value })} multiline maxLength={400} /></Step>}
    {step === 2 && <Step><ChoiceGroup required label="Hoy, ¿qué te preocupa más?" options={concernOptions} value={draft.main_concern} onChange={setConcern} /><ChoiceGroup required label="Elegí hasta 3 problemas" options={problemOptions} values={draft.problems} onToggle={(value) => toggle('problems', value, 3)} /><OtherField show={draft.problems?.includes('other') === true} label="¿Cuál?" value={draft.problems_other} onChange={(value) => update({ problems_other: value })} /><ChoiceGroup label="¿Qué se vuelve más difícil cuando aumentan tus ventas?" options={growthDifficultyOptions} values={draft.growth_difficulties} onToggle={(value) => toggle('growth_difficulties', value)} /><OtherField show={draft.growth_difficulties?.includes('other') === true} label="¿Qué otra cosa?" value={draft.growth_difficulties_other} onChange={(value) => update({ growth_difficulties_other: value })} /></Step>}
    {step === 3 && <Step><p className="step-help">Queremos entender si hoy podés saber cuánto te queda después de vender. No necesitamos una contabilidad completa.</p><ChoiceGroup required label="¿Sabés aproximadamente cuánto ganás por cada producto?" options={marginClarityOptions} value={draft.margin_clarity} onChange={setMarginClarity} /><ChoiceGroup required label="¿Dónde tenés el costo de tus productos?" options={costSourceOptions} value={draft.product_cost_source} onChange={(value) => update({ product_cost_source: value })} /><OtherField show={draft.product_cost_source === 'other'} label="¿Cuál?" value={draft.cost_source_other} onChange={(value) => update({ cost_source_other: value })} /><ChoiceGroup required label="¿Cada cuánto cambia o actualizás ese costo?" options={frequencyOptions} value={draft.cost_update_frequency} onChange={(value) => update({ cost_update_frequency: value })} /><ChoiceGroup required label="¿Usás un margen objetivo?" options={targetMarginOptions} value={draft.target_margin} onChange={(value) => update({ target_margin: value })} /><ChoiceGroup label="¿Qué costos incluís cuando calculás margen?" options={marginComponentOptions} values={draft.margin_components} onToggle={(value) => toggle('margin_components', value)} /></Step>}
    {step === 4 && <Step><p className="step-help supply-model-help">Esto cambia mucho cómo se interpreta tu stock y tu margen. Un fabricante, un importador y un revendedor pueden vender lo mismo en Mercado Libre, pero tener tiempos de reposición, costos y riesgos muy distintos.</p><ChoiceGroup required label="¿Cómo obtenés principalmente los productos que vendés?" options={supplyModelOptions} values={draft.supply_models} onToggle={setSupplyModels} /><OtherField show={draft.supply_models?.includes('other') === true} label="¿Cuál es esa otra modalidad?" value={draft.supply_model_other} onChange={(value) => update({ supply_model_other: value })} />{(draft.supply_models?.length ?? 0) > 1 && <ChoiceGroup required label="¿Cuál representa hoy la mayor parte de tu negocio?" options={supplyModelOptions.filter((option) => draft.supply_models?.includes(option.value))} value={draft.primary_supply_model} onChange={(value) => update({ primary_supply_model: value })} />}<ChoiceGroup label="¿Quién controla el stock?" options={stockOwnerOptions} value={draft.stock_owner} onChange={(value) => update({ stock_owner: value })} /><ChoiceGroup label="¿El stock se sincroniza entre canales?" options={stockSyncOptions} value={draft.stock_sync} onChange={(value) => update({ stock_sync: value })} /><ChoiceGroup label="¿Con qué frecuencia te quedás sin stock?" options={stockoutOptions} value={draft.stockout_frequency} onChange={(value) => update({ stockout_frequency: value })} /><ChoiceGroup label="¿Cuánto tarda aproximadamente reponer?" options={supplierLeadTimeOptions} value={draft.supplier_lead_time} onChange={(value) => update({ supplier_lead_time: value })} /><ChoiceGroup label="¿Cuántos proveedores relevantes tenés?" options={supplierCountOptions} value={draft.supplier_count} onChange={(value) => update({ supplier_count: value })} /><ChoiceGroup label="¿Usás Full?" options={yesNoUnknownOptions} value={draft.uses_full} onChange={(value) => update({ uses_full: value })} /><ChoiceGroup label="¿Usás Mercado Ads?" options={yesNoUnknownOptions} value={draft.ads_usage} onChange={(value) => update({ ads_usage: value })} />{draft.ads_usage === 'yes' && <><ChoiceGroup label="¿Quién lo administra?" options={adsManagerOptions} value={draft.ads_manager} onChange={(value) => update({ ads_manager: value })} /><ChoiceGroup label="¿Cómo definís el presupuesto?" options={adsBudgetOptions} value={draft.ads_budget_method} onChange={(value) => update({ ads_budget_method: value })} /><ChoiceGroup label="¿Podés saber la rentabilidad después de publicidad?" options={yesNoUnknownOptions} value={draft.ads_profitability} onChange={(value) => update({ ads_profitability: value })} /></>}</Step>}
    {step === 5 && <Step><ChoiceGroup label="¿Qué situaciones de postventa aparecen?" options={postSaleOptions} values={draft.post_sale_channels} onToggle={(value) => toggle('post_sale_channels', value)} /><Field label="¿Qué problema recurrente de postventa te gustaría revisar?" value={draft.recurring_postsale_issue} onChange={(value) => update({ recurring_postsale_issue: value })} maxLength={240} /><ChoiceGroup required label="¿Dónde querés que pongamos el foco?" options={focusModeOptions} value={draft.focus_mode} onChange={(value) => update({ focus_mode: value })} /><ChoiceGroup required label="Elegí hasta 3 áreas" options={priorityOptions} values={draft.priorities} onToggle={(value) => toggle('priorities', value, 3)} /><OtherField show={draft.priorities?.includes('other') === true} label="¿Cuál?" value={draft.focus_other} onChange={(value) => update({ focus_other: value })} /><Field label="Si pudiéramos resolverte una sola cosa hoy, ¿cuál elegirías?" value={draft.open_problem} onChange={(value) => update({ open_problem: value })} multiline maxLength={400} /><Field label="¿Qué información sentís que todavía falta para entender bien el problema?" value={draft.missing_data} onChange={(value) => update({ missing_data: value })} multiline maxLength={400} /></Step>}
    {step === 6 && <Step><div className="review-map"><p className="step-help">La revisión sigue este recorrido:</p><ol><li><strong>Entendemos el contexto</strong><span>negocio, herramientas y tareas manuales</span></li><li><strong>Vemos qué información está disponible</strong><span>sin prometer cobertura completa</span></li><li><strong>Pedimos sólo lo que falta</strong><span>costos reales, reposición o procesos internos</span></li><li><strong>Cruzamos señales y mostramos evidencia</strong><span>dato → relación → impacto</span></li><li><strong>Priorizamos con vos</strong><span>no mostramos 50 alertas ni decidimos por tu cuenta</span></li></ol><p className="trust-inline">PymIA observa, cruza datos, detecta señales y prioriza. Vos decidís qué hacer.</p></div></Step>}
    {step === 7 && <Step><ChoiceGroup required label="¿Cómo preferís seguir?" options={followupOptions} value={draft.followup_mode} onChange={setFollowupMode} /><p className="step-help">Podemos pedirte algunos datos adicionales para completar la revisión, siempre explicando para qué sirven.</p><label className="check-row"><input type="checkbox" checked={draft.consent_contact ?? false} onChange={(event) => update({ consent_contact: event.target.checked })} /> Acepto que PymIA me contacte sobre esta revisión piloto. *</label><label className="check-row"><input type="checkbox" checked={draft.consent_analysis ?? false} onChange={(event) => update({ consent_analysis: event.target.checked })} /> Acepto que PymIA analice la información que comparta para preparar la revisión. *</label></Step>}
    {error && <p className="error-message" role="alert">{error}</p>}</div><footer className="capture-actions"><button className="primary-button" type="button" onClick={() => void (step === lastStep ? complete() : next())} disabled={saving}>{saving ? 'Guardando…' : step === 0 ? 'Empezar revisión' : step === lastStep ? 'Enviar mi información' : 'Continuar'}</button></footer></section></main>

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
