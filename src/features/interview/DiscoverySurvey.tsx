import { useEffect, useRef, useState, type ReactNode } from 'react'
import { completeDiscoveryInterview, listDiscoveryInterviews, saveDiscoveryDraft } from '../../lib/storage/discovery.repository'
import type { ActorType, CapturedBy } from '../../types/contact'
import type { DiscoveryDraft } from '../../types/discovery'
import { deleteInterviewAudio, saveInterviewAudio } from '../../lib/storage/audio.repository'
import { isDeveloperBranch, SURVEY_SCREENS, whatsappFollowupEnabled } from './survey-contract'
import InterviewAudioRecorder from './InterviewAudioRecorder'

interface DiscoverySurveyProps { onExit: () => void; operator: CapturedBy; resume?: boolean }
type Option = { value: string; label: string }

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionFactory = new () => SpeechRecognitionLike

function getSpeechRecognition(): SpeechRecognitionFactory | undefined {
  const browserWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionFactory; webkitSpeechRecognition?: SpeechRecognitionFactory }
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition
}

const actorOptions: Option[] = [
  { value: 'seller', label: 'Vendo en Mercado Libre' }, { value: 'developer', label: 'Desarrollo o integro sistemas' },
  { value: 'software_house', label: 'Trabajo en una empresa de sistemas' }, { value: 'partner', label: 'Soy socio o consultor' }, { value: 'other', label: 'Otro' },
]
const sellerScale: Option[] = ['lt_50', '50_200', '201_1000', '1001_5000', 'gt_5000', 'unknown'].map((value) => ({ value, label: ({ lt_50: 'menos de 50', '50_200': '50–200', '201_1000': '201–1.000', '1001_5000': '1.001–5.000', gt_5000: 'más de 5.000', unknown: 'no sé' } as Record<string, string>)[value] }))
const teamOptions: Option[] = ['one', '2_3', '4_10', 'gt_10', 'unknown'].map((value) => ({ value, label: ({ one: '1', '2_3': '2–3', '4_10': '4–10', gt_10: 'más de 10', unknown: 'no sé' } as Record<string, string>)[value] }))
const channelOptions: Option[] = [{ value: 'none', label: 'ninguno' }, { value: 'own_store', label: 'tienda propia' }, { value: 'social', label: 'redes sociales' }, { value: 'other_marketplaces', label: 'otros marketplaces' }, { value: 'wholesale', label: 'venta mayorista' }, { value: 'other', label: 'otro' }, { value: 'unknown', label: 'no sé' }]
const stackOptions: Option[] = [{ value: 'meli_native', label: 'herramientas de Mercado Libre' }, { value: 'spreadsheets', label: 'Excel u hojas de cálculo de Google' }, { value: 'real_trends', label: 'Real Trends' }, { value: 'producteca', label: 'Producteca' }, { value: 'contabilium', label: 'Contabilium' }, { value: 'tango', label: 'Tango' }, { value: 'own_erp', label: 'sistema de gestión propio' }, { value: 'own_development', label: 'desarrollo propio' }, { value: 'agency', label: 'agencia o consultor' }, { value: 'other', label: 'otras' }, { value: 'none', label: 'ninguna' }, { value: 'unknown', label: 'no sé' }]
const painOptions: Option[] = [{ value: 'pricing_margin', label: 'precios o margen' }, { value: 'costs', label: 'costos' }, { value: 'stock', label: 'existencias' }, { value: 'logistics', label: 'logística' }, { value: 'catalog', label: 'publicaciones o catálogo' }, { value: 'questions', label: 'preguntas' }, { value: 'claims', label: 'reclamos' }, { value: 'invoicing', label: 'facturación' }, { value: 'reporting', label: 'informes o información' }, { value: 'integrations', label: 'integraciones' }, { value: 'manual_operation', label: 'operación manual' }, { value: 'other', label: 'otro' }, { value: 'unknown', label: 'no sé' }]
const solutionOptions: Option[] = [{ value: 'manual', label: 'de forma manual' }, { value: 'spreadsheets', label: 'con Excel u hojas de cálculo' }, { value: 'team_member', label: 'lo resuelve una persona del equipo' }, { value: 'software', label: 'con un programa' }, { value: 'agency', label: 'con una agencia o proveedor' }, { value: 'own_integration', label: 'con una conexión propia' }, { value: 'unresolved', label: 'todavía no está resuelto' }, { value: 'other', label: 'de otra manera' }, { value: 'unknown', label: 'no sé' }]
const meliRoleOptions: Option[] = [{ value: 'primary', label: 'es el canal principal' }, { value: 'one_of_many', label: 'es uno de varios canales' }, { value: 'secondary', label: 'es un canal secundario' }, { value: 'starting', label: 'estoy empezando' }, { value: 'unknown', label: 'no sé' }]
const interestOptions: Option[] = [{ value: 'alerts', label: 'alertas' }, { value: 'queries', label: 'consultas' }, { value: 'both', label: 'ambas' }, { value: 'no_interest', label: 'no me interesa' }, { value: 'unknown', label: 'no sé' }]
const customInterest: Option[] = [{ value: 'yes', label: 'sí' }, { value: 'maybe', label: 'tal vez' }, { value: 'no', label: 'no' }, { value: 'unknown', label: 'no sé' }]
const customFormats: Option[] = [{ value: 'specific_tool', label: 'herramienta puntual' }, { value: 'diagnosis_solution', label: 'diagnóstico + solución' }, { value: 'integration', label: 'integración' }, { value: 'automation', label: 'automatización' }, { value: 'other', label: 'otro' }, { value: 'unknown', label: 'no sé' }]
const developerFormats: Option[] = [{ value: 'api', label: 'interfaz para conectar sistemas' }, { value: 'sdk', label: 'kit listo para desarrollar' }, { value: 'webhook', label: 'aviso automático entre sistemas' }, { value: 'white_label', label: 'solución con tu marca' }, { value: 'embeddable', label: 'módulo para incorporar' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'custom_development', label: 'desarrollo específico' }, { value: 'other', label: 'otro formato' }, { value: 'unknown', label: 'no sé' }]
const nextSteps: Option[] = [{ value: 'diagnosis', label: 'diagnóstico' }, { value: 'call', label: 'llamada' }, { value: 'proposal', label: 'propuesta' }, { value: 'technical_chat_fede', label: 'conversación técnica con Fede' }, { value: 'partnership', label: 'alianza' }, { value: 'whatsapp', label: 'contacto por WhatsApp' }, { value: 'no_followup', label: 'sin seguimiento' }, { value: 'other', label: 'otro' }, { value: 'unknown', label: 'no sé' }]

const emptyDraft: DiscoveryDraft = { operatorId: 'alejandro', eventId: 'mle-2026', currentStep: 0, status: 'in_progress', stack: [], painTags: [], developerFormats: [], salesChannels: [], whatsappInterest: [], customSolutionFormats: [], developerCapabilityFormats: [] }

const isDeveloper = (actor?: ActorType) => isDeveloperBranch(actor)
const hasWhatsAppInterest = (draft: DiscoveryDraft) => whatsappFollowupEnabled(draft.whatsappInterest)

export default function DiscoverySurvey({ onExit, operator, resume = false }: DiscoverySurveyProps) {
  const [draft, setDraft] = useState<DiscoveryDraft>(() => ({ ...emptyDraft, operatorId: operator }))
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string>()
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step, done])

  useEffect(() => {
    if (!resume) return
    let active = true
    void listDiscoveryInterviews().then((items) => {
      const latest = items.find((item) => item.status === 'in_progress' && item.operatorId === operator)
      if (active && latest) { setDraft(latest); setStep(Math.min(11, latest.currentStep)); setSavedId(latest.id) }
    })
    return () => { active = false }
  }, [operator, resume])

  useEffect(() => {
    if (done || !draft.actorType) return
    const timer = window.setTimeout(() => { void persist(step) }, 250)
    return () => window.clearTimeout(timer)
  }, [draft, step, done])

  const update = (changes: Partial<DiscoveryDraft>) => { setError(undefined); setDraft((current) => ({ ...current, ...changes })) }
  const toggle = (field: 'stack' | 'painTags' | 'salesChannels' | 'whatsappInterest' | 'customSolutionFormats' | 'developerFormats' | 'developerCapabilityFormats', value: string) => {
    const current = draft[field] ?? []
    const next = field === 'whatsappInterest' && (value === 'no_interest' || value === 'unknown')
      ? (current.includes(value) ? [] : [value])
      : field === 'whatsappInterest'
        ? [...current.filter((item) => item !== 'no_interest' && item !== 'unknown'), ...(current.includes(value) ? [] : [value])]
        : (current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    update({ [field]: next } as Partial<DiscoveryDraft>)
  }
  const persist = async (currentStep: number) => {
    if (!draft.actorType) return undefined
    setSaving(true)
    try {
      const saved = await saveDiscoveryDraft({ ...draft, id: draft.id ?? savedId, currentStep }, operator)
      setSavedId(saved.id)
      setDraft((current) => current.id ? current : { ...current, id: saved.id })
      return saved
    } catch {
      setError('No se pudo guardar localmente')
    } finally {
      setSaving(false)
    }
  }
  const validateStep = (currentStep: number) => {
    if (currentStep === 0 && !draft.actorType) return 'Elegí el tipo de contacto para continuar.'
    if (currentStep === 1 && draft.actorType === 'seller' && (!draft.publicationRange || !draft.salesRange || !draft.teamSize || !draft.meliChannelRole)) return 'Completá las respuestas requeridas.'
    if (currentStep === 2 && !(draft.stack?.length)) return 'Elegí al menos una herramienta o “ninguna”.'
    if (currentStep === 3 && !draft.primaryPain?.trim()) return 'Contá el problema con tus propias palabras.'
    if (currentStep === 5 && !draft.currentSolution) return 'Elegí cómo lo resolvés hoy.'
    if (currentStep === 6 && !draft.lastIncident?.trim()) return 'Contá qué pasó la última vez o escribí “no recuerdo”.'
    if (currentStep === 7 && (!draft.toolChoiceEase || !draft.systemCountBand)) return 'Completá las dos respuestas requeridas.'
    if (currentStep === 10 && (!draft.urgencyScore || !draft.impactScore)) return 'Elegí urgencia e impacto.'
    if (currentStep === 11 && (!draft.fullName?.trim() || !draft.followupConsent || !draft.nextStep)) return 'Completá nombre, consentimiento y próximo paso.'
    return undefined
  }
  const next = async () => { const problem = validateStep(step); if (problem) { setError(problem); return }; const saved = await persist(Math.min(11, step + 1)); if (saved) setStep((value) => Math.min(11, value + 1)) }
  const back = async () => { await persist(Math.max(0, step - 1)); setStep((value) => Math.max(0, value - 1)) }
  const complete = async () => { const problem = validateStep(11); if (problem) { setError(problem); return }; const current = await persist(11); if (!current) return; setSaving(true); try { const result = await completeDiscoveryInterview({ interview: current, contact: { capturedBy: operator, actorType: current.actorType, fullName: current.fullName, companyName: current.companyName, whatsapp: current.whatsapp, email: current.email, meliNickname: current.meliNickname, followupConsent: current.followupConsent ?? false, catalogVolumeBand: current.publicationRange } }); setSavedId(result.contact.id); setDone(true) } catch { setError('No se pudo completar la encuesta localmente') } finally { setSaving(false) } }
  const saveAudio = async (blob: Blob, mimeType: string, durationSeconds: number) => {
    const current = draft.id ? draft : await persist(step)
    if (!current?.id) throw new Error('No hay una entrevista activa para asociar el audio.')
    if (!draft.id) setDraft((value) => ({ ...value, id: current.id }))
    await saveInterviewAudio({ interviewId: current.id, operatorId: operator, mimeType, durationSeconds, blob })
  }
  const deleteAudio = async () => { if (draft.id) await deleteInterviewAudio(draft.id) }

  if (done) return <main className="capture capture-success"><section className="capture-card success-card"><SurveyBrand /><p className="eyebrow">Entrevista completada</p><h1>Todo quedó guardado.</h1><p className="intro">Las respuestas están seguras en este dispositivo y listas para sincronizar.</p><code className="contact-id">{savedId}</code><button className="primary-button" type="button" onClick={onExit}>Volver al inicio</button></section></main>

  const title = SURVEY_SCREENS[step].title
  const developerBranch = isDeveloper(draft.actorType)
  return <main className="capture discovery-survey" aria-labelledby="survey-title"><section className="capture-card"><SurveyBrand /><header className="capture-header"><button className="back-link" type="button" onClick={() => { if (step === 0) onExit(); else void back() }}>← {step === 0 ? 'Salir' : 'Atrás'}</button><p className="step-count">Paso {step + 1} de {SURVEY_SCREENS.length}</p><div className="progress" role="progressbar" aria-label="Progreso de la entrevista" aria-valuemin={1} aria-valuemax={SURVEY_SCREENS.length} aria-valuenow={step + 1}><span style={{ width: `${((step + 1) / SURVEY_SCREENS.length) * 100}%` }} /></div></header><div className="capture-content"><p className="eyebrow">Entrevista de diagnóstico</p><h1 id="survey-title">{title}</h1><p className={`survey-status ${online ? 'is-online' : 'is-offline'}`} role="status"><span aria-hidden="true">{online ? '●' : '○'}</span>{saving ? 'Guardando en este dispositivo…' : savedId ? 'Guardado en este dispositivo' : online ? 'Lista para guardar automáticamente' : 'Sin conexión · guardado local activo'}</p>
    {step === 0 && <Step><p className="step-help">¿Cuál describe mejor tu rol hoy?</p><ChoiceGroup options={actorOptions} value={draft.actorType} onChange={(value) => update({ actorType: value as ActorType })} /></Step>}
    {step === 1 && <Step>{draft.actorType === 'seller' ? <><ChoiceGroup required label="Publicaciones" options={sellerScale} value={draft.publicationRange} onChange={(value) => update({ publicationRange: value })} /><ChoiceGroup required label="Ventas u operaciones mensuales" options={sellerScale} value={draft.salesRange} onChange={(value) => update({ salesRange: value })} /><ChoiceGroup required label="Personas que participan en la operación" options={teamOptions} value={draft.teamSize} onChange={(value) => update({ teamSize: value })} /><ChoiceGroup required label="¿Qué lugar ocupa Mercado Libre hoy en tu operación?" options={meliRoleOptions} value={draft.meliChannelRole} onChange={(value) => update({ meliChannelRole: value })} /><ChoiceGroup label="Canales además de Mercado Libre" options={channelOptions} values={draft.salesChannels} onToggle={(value) => toggle('salesChannels', value)} /></> : <Field label="¿En qué tipo de operación o cliente estás trabajando principalmente?" value={draft.operatorContext} onChange={(value) => update({ operatorContext: value })} maxLength={120} multiline />}</Step>}
    {step === 2 && <Step><p className="step-help">¿Qué herramientas o formas de trabajo usás hoy para esta operación?</p><ChoiceGroup required options={stackOptions} values={draft.stack} onToggle={(value) => toggle('stack', value)} /><Field label="Detalle opcional" value={draft.stackOther} onChange={(value) => update({ stackOther: value })} maxLength={60} /></Step>}
    {step === 3 && <Step><p className="step-help">Podés escribir la respuesta, dictarla para convertirla en texto o grabar el relato completo.</p><div className="response-mode"><span className="mode-number" aria-hidden="true">01</span><Field voice required multiline label="Escribir o dictar respuesta" value={draft.primaryPain} onChange={(value) => update({ primaryPain: value })} maxLength={240} /></div><div className="response-mode"><span className="mode-number" aria-hidden="true">02</span><InterviewAudioRecorder interviewId={draft.id} onSave={saveAudio} onDelete={deleteAudio} /></div></Step>}
    {step === 4 && <Step><p className="step-help">¿En qué temas se relaciona principalmente?</p><ChoiceGroup options={painOptions} values={draft.painTags} onToggle={(value) => toggle('painTags', value)} /><Field label="Otro tema" value={draft.painOther} onChange={(value) => update({ painOther: value })} maxLength={60} /></Step>}
    {step === 5 && <Step><ChoiceGroup required label="¿Cómo lo resolvés hoy?" options={solutionOptions} value={draft.currentSolution} onChange={(value) => update({ currentSolution: value })} /><Field label="Detalle opcional" value={draft.currentSolutionOther} onChange={(value) => update({ currentSolutionOther: value })} maxLength={100} /></Step>}
    {step === 6 && <Step><Field required multiline label="¿Qué pasó la última vez que este tema apareció en tu operación?" value={draft.lastIncident} onChange={(value) => update({ lastIncident: value })} maxLength={240} /></Step>}
    {step === 7 && <Step><ChoiceGroup required label="Elegir una herramienta para una necesidad" options={['very_easy', 'easy', 'neutral', 'difficult', 'very_difficult', 'unknown'].map((value) => ({ value, label: ({ very_easy: 'muy fácil', easy: 'fácil', neutral: 'ni fácil ni difícil', difficult: 'difícil', very_difficult: 'muy difícil', unknown: 'no sé' } as Record<string, string>)[value] }))} value={draft.toolChoiceEase} onChange={(value) => update({ toolChoiceEase: value })} /><ChoiceGroup required label="Cantidad de sistemas que participan" options={['one', 'two', 'three', 'four_plus', 'unknown'].map((value) => ({ value, label: ({ one: 'uno', two: 'dos', three: 'tres', four_plus: 'cuatro o más', unknown: 'no sé' } as Record<string, string>)[value] }))} value={draft.systemCountBand} onChange={(value) => update({ systemCountBand: value })} /><ChoiceGroup label="Funciones contratadas que usás poco o nada" options={['none', 'some', 'several', 'unknown'].map((value) => ({ value, label: ({ none: 'ninguna', some: 'alguna', several: 'varias', unknown: 'no sé' } as Record<string, string>)[value] }))} value={draft.unusedFeaturesBand} onChange={(value) => update({ unusedFeaturesBand: value })} /><ChoiceGroup label="Información que no coincide entre sistemas" options={['never', 'sometimes', 'often', 'unknown'].map((value) => ({ value, label: ({ never: 'nunca', sometimes: 'a veces', often: 'seguido', unknown: 'no sé' } as Record<string, string>)[value] }))} value={draft.inconsistentInfoFrequency} onChange={(value) => update({ inconsistentInfoFrequency: value })} /><ChoiceGroup label="¿Dejaste de usar alguna herramienta o forma de trabajo?" options={['no', 'price', 'complexity', 'too_small', 'other', 'unknown'].map((value) => ({ value, label: ({ no: 'no', price: 'sí, por precio', complexity: 'sí, por complejidad', too_small: 'sí, porque quedó chica', other: 'sí, por otro motivo', unknown: 'no sé' } as Record<string, string>)[value] }))} value={draft.discardedToolReason} onChange={(value) => update({ discardedToolReason: value })} /></Step>}
    {step === 8 && <Step><Field multiline label="Si pudieras recibir por WhatsApp sólo avisos importantes de tu operación, ¿qué te gustaría que te avise?" value={draft.whatsappAlertWish} onChange={(value) => update({ whatsappAlertWish: value })} maxLength={160} /><ChoiceGroup label="Preferencia" options={interestOptions} value={draft.whatsappInterest?.[0]} onChange={(value) => update({ whatsappInterest: [value] })} />{hasWhatsAppInterest(draft) && <><Field multiline label="¿Qué le preguntarías hoy a un asistente que conociera realmente tu tienda u operación?" value={draft.whatsappQuestionWish} onChange={(value) => update({ whatsappQuestionWish: value })} maxLength={180} /><Field multiline label="¿Qué no querrías recibir por WhatsApp?" value={draft.whatsappAvoid} onChange={(value) => update({ whatsappAvoid: value })} maxLength={160} /></>}<p className="step-help">{hasWhatsAppInterest(draft) ? 'Podés responder las dos preguntas abiertas; son opcionales.' : 'Seleccioná “no me interesa” si este canal no te resulta útil.'}</p></Step>}
    {step === 9 && <Step>{draft.actorType === 'seller' ? <><ChoiceGroup label="Si ninguna herramienta existente resolviera bien este problema, ¿evaluarías una solución específica para tu operación?" options={customInterest} value={draft.customSolutionInterest} onChange={(value) => update({ customSolutionInterest: value })} /><ChoiceGroup label="¿Qué formato te resultaría más útil?" options={customFormats} values={draft.customSolutionFormats} onToggle={(value) => toggle('customSolutionFormats', value)} /></> : developerBranch ? <><Field multiline label="¿Qué funcionalidad te piden tus clientes repetidamente y no querés seguir construyendo o manteniendo?" value={draft.developerRequestedCapability} onChange={(value) => update({ developerRequestedCapability: value })} maxLength={220} /><ChoiceGroup label="¿En qué formato tendría más sentido recibir esa capacidad?" options={developerFormats} values={draft.developerFormats} onToggle={(value) => toggle('developerFormats', value)} /></> : <p className="step-help">No hay preguntas adicionales para este perfil. Podés continuar.</p>}</Step>}
    {step === 10 && <Step><ChoiceGroup required label="Urgencia: ¿qué tan pronto necesitás resolverlo?" options={['1', '2', '3', '4', '5'].map((value) => ({ value, label: value === '1' ? '1 — ahora no es prioridad' : value === '5' ? '5 — necesito resolverlo esta semana' : value }))} value={draft.urgencyScore?.toString()} onChange={(value) => update({ urgencyScore: Number(value) })} /><ChoiceGroup required label="Impacto: si sigue igual, ¿cuánto afecta tu operación?" options={['1', '2', '3', '4', '5'].map((value) => ({ value, label: value === '1' ? '1 — impacto bajo' : value === '5' ? '5 — impacto muy alto' : value }))} value={draft.impactScore?.toString()} onChange={(value) => update({ impactScore: Number(value) })} /><ChoiceGroup label="Interés en conversar: ¿te interesa seguir conversando sobre este tema?" options={['1', '2', '3', '4', '5'].map((value) => ({ value, label: value === '1' ? '1 — no por ahora' : value === '5' ? '5 — sí, coordinemos' : value }))} value={draft.interestScore?.toString()} onChange={(value) => update({ interestScore: Number(value) })} /></Step>}
    {step === 11 && <Step><Field required label="Nombre" value={draft.fullName} onChange={(value) => update({ fullName: value })} maxLength={100} /><Field label="Empresa" value={draft.companyName} onChange={(value) => update({ companyName: value })} maxLength={120} /><Field label="WhatsApp" value={draft.whatsapp} onChange={(value) => update({ whatsapp: value })} maxLength={40} inputMode="tel" /><Field label="Correo electrónico" type="email" value={draft.email} onChange={(value) => update({ email: value })} maxLength={160} /><Field label="Nombre de usuario de Mercado Libre" value={draft.meliNickname} onChange={(value) => update({ meliNickname: value })} maxLength={80} /><label className="check-row"><input type="checkbox" checked={draft.followupConsent ?? false} onChange={(event) => update({ followupConsent: event.target.checked })} /> ¿Te podemos contactar después del evento para continuar esta conversación? *</label><ChoiceGroup required label="¿Qué próximo paso preferís, si alguno?" options={nextSteps} value={draft.nextStep} onChange={(value) => update({ nextStep: value })} /></Step>}
    {error && <p className="error-message" role="alert">{error}</p>}</div><footer className="capture-actions">{step < 11 ? <button className="primary-button" type="button" onClick={() => void next()} disabled={saving || (step === 0 && !draft.actorType)}>Continuar</button> : <button className="primary-button" type="button" onClick={() => void complete()} disabled={saving}>{saving ? 'Guardando…' : 'Guardar entrevista'}</button>}</footer></section></main>
}

function SurveyBrand() { return <a className="survey-brand" href="http://127.0.0.1:5174/" aria-label="PymIA, volver a la presentación"><img src="/logopymia2.jpg" width="48" height="48" alt="" /><span><strong>PymIA</strong><small>Diagnóstico de operaciones</small></span></a> }
function Step({ children }: { children: ReactNode }) { return <div className="step-body">{children}</div> }
function Field({ label, value, onChange, multiline, required, type = 'text', maxLength, inputMode, voice }: { label: string; value?: string; onChange: (value: string) => void; multiline?: boolean; required?: boolean; type?: string; maxLength?: number; inputMode?: 'text' | 'tel' | 'email'; voice?: boolean }) {
  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | undefined>(undefined)
  const startVoice = () => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) { setVoiceError('El dictado por voz no está disponible en este navegador.'); return }
    const recognition = new Recognition()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index]?.[0]?.transcript ?? '').join(' ').trim()
      if (transcript) onChange([value?.trim(), transcript].filter(Boolean).join(' '))
    }
    recognition.onerror = () => { setListening(false); setVoiceError('No se pudo capturar el audio. Probá de nuevo.') }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    setVoiceError('')
    setListening(true)
    recognition.start()
  }
  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false) }
  const fieldName = `field-${label.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
  const autocomplete = type === 'email' ? 'email' : inputMode === 'tel' ? 'tel' : 'off'
  return <div className="field full-width"><label htmlFor={fieldName}>{label}{required ? ' *' : ''}</label><div className={voice ? 'field-input-row' : undefined}>{multiline ? <textarea id={fieldName} name={fieldName} autoComplete="off" rows={4} required={required} maxLength={maxLength} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /> : <input id={fieldName} name={fieldName} autoComplete={autocomplete} type={type} inputMode={inputMode} required={required} maxLength={maxLength} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />}{voice && <button className={`voice-button${listening ? ' listening' : ''}`} type="button" onClick={listening ? stopVoice : startVoice} aria-pressed={listening} aria-label={listening ? 'Detener dictado por voz' : 'Dictar respuesta por voz'}>{listening ? 'Detener dictado' : 'Dictar respuesta'}</button>}</div>{voiceError && <small className="voice-error" role="status">{voiceError}</small>}</div>
}
function ChoiceGroup({ label, options, value, values, onChange, onToggle, required }: { label?: string; options: Option[]; value?: string; values?: string[]; onChange?: (value: string) => void; onToggle?: (value: string) => void; required?: boolean }) { return <fieldset className="choice-section"><legend>{label}{required ? ' *' : ''}</legend><div className="chip-grid">{options.map((option) => { const selected = values ? values.includes(option.value) : value === option.value; return <button aria-pressed={selected} className={`choice chip ${selected ? 'selected' : ''}`} type="button" key={option.value} onClick={() => values ? onToggle?.(option.value) : onChange?.(option.value)}><span translate="no">{option.label}</span></button> })}</div></fieldset> }
