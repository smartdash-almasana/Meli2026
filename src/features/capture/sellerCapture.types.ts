import type { CapturedBy, NewContact } from '../../types/contact'
import type {
  CatalogVolumeBand,
  CurrentSolution,
  Logistics,
  PainCode,
  PilotIntent,
  SolutionInterest,
} from '../../types/seller'
export type {
  CatalogVolumeBand,
  CurrentSolution,
  Logistics,
  PainCode,
  PilotIntent,
  SolutionInterest,
} from '../../types/seller'

export interface SellerCaptureDraft {
  capturedBy?: CapturedBy
  contact: Omit<NewContact, 'capturedBy' | 'actorType'>
  catalogVolumeBand?: CatalogVolumeBand
  logistics?: Logistics
  currentSolution?: CurrentSolution
  painCodes: PainCode[]
  primaryPainCode?: PainCode
  solutionInterest?: SolutionInterest
  pilotIntent?: PilotIntent
}

export const EMPTY_SELLER_CAPTURE_DRAFT: SellerCaptureDraft = {
  contact: {},
  painCodes: [],
}

export const PAIN_LABELS: Record<PainCode, string> = {
  pricing: 'Pricing',
  stock: 'Stock',
  catalog: 'Catalog',
  questions: 'Questions',
  claims: 'Claims',
  shipping: 'Shipping',
  invoicing: 'Invoicing',
  ads: 'Ads',
  reputation: 'Reputation',
  integrations: 'Integrations',
  other: 'Other',
}

export function togglePain(draft: SellerCaptureDraft, painCode: PainCode): SellerCaptureDraft {
  const exists = draft.painCodes.includes(painCode)
  const painCodes = exists ? draft.painCodes.filter((code) => code !== painCode) : [...draft.painCodes, painCode]
  return {
    ...draft,
    painCodes,
    primaryPainCode: draft.primaryPainCode === painCode && exists ? undefined : draft.primaryPainCode,
  }
}

export function markPrimaryPain(draft: SellerCaptureDraft, painCode: PainCode): SellerCaptureDraft {
  if (!draft.painCodes.includes(painCode)) return draft
  return { ...draft, primaryPainCode: painCode }
}
