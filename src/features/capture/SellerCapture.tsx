import { useState, type Dispatch, type SetStateAction } from 'react'
import { persistSellerCapture } from '../../lib/storage/seller-capture.repository'
import type { CapturedBy } from '../../types/contact'
import type {
  CatalogVolumeBand,
  CurrentSolution,
  Logistics,
  PainCode,
  PilotIntent,
  SolutionInterest,
} from '../../types/seller'
import {
  EMPTY_SELLER_CAPTURE_DRAFT,
  PAIN_LABELS,
  markPrimaryPain,
  togglePain,
  type SellerCaptureDraft,
} from './sellerCapture.types'

interface SellerCaptureProps {
  onExit: () => void
}

const steps = ['Tipo de contacto', 'Identidad', 'Perfil operativo', 'Dolores', 'Intención', 'Resumen']
const catalogOptions: Array<{ value: CatalogVolumeBand; label: string }> = [
  { value: 'lt_50', label: '< 50' },
  { value: '50_200', label: '50–200' },
  { value: '200_1000', label: '200–1,000' },
  { value: '1000_5000', label: '1,000–5,000' },
  { value: 'gt_5000', label: '> 5,000' },
  { value: 'unknown', label: 'No sé' },
]
const logisticsOptions: Array<{ value: Logistics; label: string }> = [
  { value: 'full', label: 'Completa' },
  { value: 'flex', label: 'Flex' },
  { value: 'colecta', label: 'Colecta' },
  { value: 'propia', label: 'Propia' },
  { value: 'otra', label: 'Otra' },
  { value: 'unknown', label: 'No sé' },
]
const solutionOptions: Array<{ value: CurrentSolution; label: string }> = [
  { value: 'meli_manual', label: 'Mercado Libre manual' },
  { value: 'excel_sheets', label: 'Excel u hojas de cálculo' },
  { value: 'erp', label: 'Sistema de gestión' },
  { value: 'saas', label: 'SaaS' },
  { value: 'custom_dev', label: 'Desarrollo a medida' },
  { value: 'agency', label: 'Agencia' },
  { value: 'other', label: 'Otra' },
]
const interestOptions: Array<{ value: SolutionInterest; label: string }> = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'none', label: 'Ninguna' },
]
const intentOptions: Array<{ value: PilotIntent; label: string }> = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'later', label: 'Más adelante' },
  { value: 'maybe', label: 'Tal vez' },
  { value: 'no', label: 'No' },
]
const painCodes = Object.keys(PAIN_LABELS) as PainCode[]

export default function SellerCapture({ onExit }: SellerCaptureProps) {
  const [draft, setDraft] = useState<SellerCaptureDraft>(() => ({
    ...EMPTY_SELLER_CAPTURE_DRAFT,
    contact: {},
    painCodes: [],
  }))
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>()
  const [saved, setSaved] = useState<{ contactId: string; quick: boolean }>()

  const updateContact = (field: keyof SellerCaptureDraft['contact'], value: string) => {
    setDraft((current) => ({ ...current, contact: { ...current.contact, [field]: value || undefined } }))
  }

  const save = async (quick: boolean) => {
    if (!draft.capturedBy || saving) return
    setSaving(true)
    setSaveError(undefined)
    try {
      const result = await persistSellerCapture({
        contact: { ...draft.contact, capturedBy: draft.capturedBy, actorType: 'seller' },
        catalogVolumeBand: draft.catalogVolumeBand,
        logistics: draft.logistics,
        currentSolution: draft.currentSolution,
        pains: draft.painCodes.map((painCode) => ({ painCode, isPrimary: painCode === draft.primaryPainCode })),
        solutionInterest: draft.solutionInterest,
        pilotIntent: draft.pilotIntent,
      })
      setSaved({ contactId: result.contact.id, quick })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar localmente')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <main className="capture capture-success" aria-labelledby="capture-success-title">
        <section className="capture-card success-card">
          <p className="eyebrow">Guardado local</p>
          <h1 id="capture-success-title">Contacto listo</h1>
          <p className="intro">El contacto y sus eventos offline quedaron guardados en este dispositivo.</p>
          <p className="save-receipt" role="status">
            {saved.quick ? 'Guardado rápido completado.' : 'Captura del vendedor completada.'}
          </p>
          <code className="contact-id">{saved.contactId}</code>
          <button className="primary-button" type="button" onClick={onExit}>Volver al inicio</button>
        </section>
      </main>
    )
  }

  const canContinue = step !== 0 || Boolean(draft.capturedBy)

  return (
    <main className="capture" aria-labelledby="capture-title">
      <section className="capture-card">
        <header className="capture-header">
          <button className="back-link" type="button" onClick={step === 0 ? onExit : () => setStep((current) => current - 1)}>
            ← {step === 0 ? 'Inicio' : 'Atrás'}
          </button>
          <p className="step-count">Step {step + 1} of {steps.length}</p>
          <div className="progress" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        </header>

        <div className="capture-content">
          <p className="eyebrow">Captura de vendedor</p>
          <h1 id="capture-title">{steps[step]}</h1>
          {step === 0 && <ContactTypeStep draft={draft} setDraft={setDraft} />}
          {step === 1 && <IdentityStep draft={draft} updateContact={updateContact} onQuickSave={() => void save(true)} saving={saving} />}
          {step === 2 && <ProfileStep draft={draft} setDraft={setDraft} />}
          {step === 3 && <PainsStep draft={draft} setDraft={setDraft} />}
          {step === 4 && <IntentStep draft={draft} setDraft={setDraft} />}
          {step === 5 && <ReviewStep draft={draft} />}
          {saveError && <p className="error-message" role="alert">{saveError}</p>}
        </div>

        <footer className="capture-actions">
          {step < steps.length - 1 ? (
            <button className="primary-button" type="button" disabled={!canContinue || saving} onClick={() => setStep((current) => current + 1)}>
              Continuar
            </button>
          ) : (
            <button className="primary-button" type="button" disabled={saving} onClick={() => void save(false)}>
              {saving ? 'Guardando localmente…' : 'Guardar vendedor'}
            </button>
          )}
        </footer>
      </section>
    </main>
  )
}

function ContactTypeStep({ draft, setDraft }: { draft: SellerCaptureDraft; setDraft: Dispatch<SetStateAction<SellerCaptureDraft>> }) {
  return (
    <div className="step-body">
      <p className="step-help">Elegí quién está registrando este vendedor. El tipo de contacto queda fijo como vendedor en este flujo.</p>
      <div className="choice-grid two-up">
        {(['alejandro', 'fede'] as CapturedBy[]).map((operator) => (
          <button className={`choice ${draft.capturedBy === operator ? 'selected' : ''}`} type="button" key={operator} onClick={() => setDraft((current) => ({ ...current, capturedBy: operator }))}>
            {operator[0].toUpperCase() + operator.slice(1)}
          </button>
        ))}
      </div>
      <div className="fixed-choice"><span>Tipo de contacto</span><strong>Vendedor</strong></div>
    </div>
  )
}

function IdentityStep({ draft, updateContact, onQuickSave, saving }: { draft: SellerCaptureDraft; updateContact: (field: keyof SellerCaptureDraft['contact'], value: string) => void; onQuickSave: () => void; saving: boolean }) {
  const fields: Array<{ key: keyof SellerCaptureDraft['contact']; label: string; type?: string }> = [
    { key: 'fullName', label: 'Nombre completo' },
    { key: 'companyName', label: 'Empresa' },
    { key: 'whatsapp', label: 'WhatsApp', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'roleTitle', label: 'Rol' },
    { key: 'meliNickname', label: 'Nombre de usuario de Mercado Libre' },
    { key: 'quickNotes', label: 'Notas rápidas' },
  ]
  return (
    <div className="step-body">
      <p className="step-help">Registrá lo que comparta el vendedor. Todos los campos son opcionales.</p>
      <div className="form-grid">
        {fields.map((field) => (
          <label className={field.key === 'quickNotes' ? 'field full-width' : 'field'} key={field.key}>
            <span>{field.label}</span>
            {field.key === 'quickNotes' ? (
              <textarea rows={3} value={String(draft.contact[field.key] ?? '')} onChange={(event) => updateContact(field.key, event.target.value)} />
            ) : (
              <input type={field.type ?? 'text'} value={String(draft.contact[field.key] ?? '')} onChange={(event) => updateContact(field.key, event.target.value)} />
            )}
          </label>
        ))}
      </div>
      <button className="secondary-button" type="button" disabled={!draft.capturedBy || saving} onClick={onQuickSave}>Guardar rápido</button>
    </div>
  )
}

function ProfileStep({ draft, setDraft }: { draft: SellerCaptureDraft; setDraft: Dispatch<SetStateAction<SellerCaptureDraft>> }) {
  return (
    <div className="step-body">
      <p className="step-help">Contexto operativo opcional. Dejá en blanco lo que no sepas.</p>
      <ChoiceGroup label="Volumen de catálogo" options={catalogOptions} value={draft.catalogVolumeBand} onChange={(value) => setDraft((current) => ({ ...current, catalogVolumeBand: value as CatalogVolumeBand }))} />
      <ChoiceGroup label="Logística" options={logisticsOptions} value={draft.logistics} onChange={(value) => setDraft((current) => ({ ...current, logistics: value as Logistics }))} />
      <ChoiceGroup label="Solución actual" options={solutionOptions} value={draft.currentSolution} onChange={(value) => setDraft((current) => ({ ...current, currentSolution: value as CurrentSolution }))} />
    </div>
  )
}

function PainsStep({ draft, setDraft }: { draft: SellerCaptureDraft; setDraft: Dispatch<SetStateAction<SellerCaptureDraft>> }) {
  return (
    <div className="step-body">
      <p className="step-help">Seleccioná todos los dolores que mencione el vendedor. Podés marcar uno como principal.</p>
      <div className="chip-grid">
        {painCodes.map((painCode) => {
          const selected = draft.painCodes.includes(painCode)
          return <button className={`choice chip ${selected ? 'selected' : ''}`} type="button" key={painCode} onClick={() => setDraft((current) => togglePain(current, painCode))}>{PAIN_LABELS[painCode]}</button>
        })}
      </div>
      {draft.painCodes.length > 0 && <div className="primary-list"><p className="subheading">Dolor principal (opcional)</p>{draft.painCodes.map((painCode) => <label className="radio-row" key={painCode}><input type="radio" name="primary-pain" checked={draft.primaryPainCode === painCode} onChange={() => setDraft((current) => markPrimaryPain(current, painCode))} />{PAIN_LABELS[painCode]}</label>)}</div>}
    </div>
  )
}

function IntentStep({ draft, setDraft }: { draft: SellerCaptureDraft; setDraft: Dispatch<SetStateAction<SellerCaptureDraft>> }) {
  return (
    <div className="step-body">
      <p className="step-help">Registrá el interés declarado por el vendedor sin inferir urgencia ni importancia.</p>
      <ChoiceGroup label="Interés en la solución" options={interestOptions} value={draft.solutionInterest} onChange={(value) => setDraft((current) => ({ ...current, solutionInterest: value as SolutionInterest }))} />
      <ChoiceGroup label="Intención de piloto" options={intentOptions} value={draft.pilotIntent} onChange={(value) => setDraft((current) => ({ ...current, pilotIntent: value as PilotIntent }))} />
    </div>
  )
}

function ReviewStep({ draft }: { draft: SellerCaptureDraft }) {
  const contactValues = Object.entries(draft.contact).filter(([, value]) => value)
  return (
    <div className="step-body">
      <p className="step-help">Confirmá sólo lo que se registró explícitamente. No se infiere nada.</p>
      <dl className="summary-list">
        <SummaryRow label="Entrevistador" value={draft.capturedBy ?? 'Sin seleccionar'} />
        <SummaryRow label="Tipo de contacto" value="Vendedor" />
        {contactValues.map(([label, value]) => <SummaryRow key={label} label={label} value={String(value)} />)}
        <SummaryRow label="Volumen de catálogo" value={draft.catalogVolumeBand ?? 'Sin registrar'} />
        <SummaryRow label="Logística" value={draft.logistics ?? 'Sin registrar'} />
        <SummaryRow label="Solución actual" value={draft.currentSolution ?? 'Sin registrar'} />
        <SummaryRow label="Dolores" value={draft.painCodes.length ? draft.painCodes.map((pain) => PAIN_LABELS[pain]).join(', ') : 'Ninguno registrado'} />
        <SummaryRow label="Dolor principal" value={draft.primaryPainCode ? PAIN_LABELS[draft.primaryPainCode] : 'Ninguno seleccionado'} />
        <SummaryRow label="Interés en la solución" value={draft.solutionInterest ?? 'Sin registrar'} />
        <SummaryRow label="Intención de piloto" value={draft.pilotIntent ?? 'Sin registrar'} />
      </dl>
    </div>
  )
}

function ChoiceGroup({ label, options, value, onChange }: { label: string; options: Array<{ value: string; label: string }>; value?: string; onChange: (value: string) => void }) {
  return <fieldset className="choice-section"><legend>{label}</legend><div className="chip-grid">{options.map((option) => <button className={`choice chip ${value === option.value ? 'selected' : ''}`} type="button" key={option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div></fieldset>
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="summary-row"><dt>{label}</dt><dd>{value}</dd></div>
}
