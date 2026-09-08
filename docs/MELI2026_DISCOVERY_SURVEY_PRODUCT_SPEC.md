# Meli2026 — Discovery Survey Product Specification

**Status:** Product specification (no implementation)  
**Audience:** Alejandro and Fede, Mercado Libre Experience 2026  
**Target duration:** 90–120 seconds for a complete seller path; up to 150 seconds for a developer/integrator path.

## 1. Objective

Capture comparable evidence about how people operate in the Mercado Libre ecosystem, without validating or invalidating a hypothesis during the interview. The survey separates:

- **Open evidence:** the person's own words and concrete incident.
- **Structured data:** actor, scale, stack, ratings and selected needs.
- **Commercial signal:** urgency, impact and willingness to continue the conversation.
- **Post-interview inference:** qualification rules applied after saving, never presented as facts during capture.

The survey must identify real pain, current context, evidence of a recent incident, possible WhatsApp utility, developer opportunities and custom-solution opportunities while preserving a usable contact and next step.

## 2. Profiles and paths

| Profile | Required path | Conditional questions |
|---|---|---|
| Seller | Actor, scale, stack, pain, current solution, incident, ecosystem, WhatsApp, custom solution, commercial, contact, next step | Seller profile and seller custom-solution questions |
| Developer / Integrador | Actor, role/context, stack, pain, current solution, incident, ecosystem, WhatsApp, developer opportunity, commercial, contact, next step | Repeated capability and delivery-format questions |
| ERP / Software House | Same as developer/integrator | Same developer branch |
| Partner / Consultor | Actor, context, pain, current solution, incident, ecosystem, WhatsApp, commercial, contact, next step | Optional custom-solution question |
| Otro | Actor, context, pain, current solution, incident, ecosystem, WhatsApp, commercial, contact, next step | Optional free-text context |

## 3. Flow summary

**12 screens, 14 required questions, 10 optional questions.** A screen may contain a short group of fields only when they represent one decision. Contact and commercial fields are deliberately grouped to keep the event interaction under two minutes.

1. Actor type
2. Profile and scale (branch)
3. Current stack
4. Primary pain — open answer
5. Pain tags
6. Current solution
7. Last concrete incident
8. Ecosystem complexity
9. WhatsApp discovery
10. Custom-solution / developer opportunity (branch)
11. Commercial signal
12. Contact and next step

## 4. Questions

### Q01 — ACTOR_TYPE

- **Actor:** all
- **Exact text:** “¿Cuál describe mejor tu rol hoy?”
- **Response type:** single choice
- **Options:** `Seller`; `Developer / Integrador`; `ERP / Software House`; `Partner / Consultor`; `Otro`
- **Required:** yes
- **Condition:** always
- **Structured field:** `actorType`
- **Purpose:** route the interview without assuming a problem.
- **Free text / max:** only when `Otro`, 60 characters
- **Otro:** yes. **No sé:** no (the interviewer can select `Otro`).
- **Bias risk:** labels may feel limiting; keep “Otro” visible and neutral.
- **Later use:** selects branch and qualification rules.

### Q02 — SELLER_PROFILE

- **Actor:** Seller
- **Exact text:** “Para ubicar tu operación, ¿qué escala se parece más a la actual?”
- **Response type:** four single-choice questions on one screen
- **Options:**
  - `Publicaciones`: `menos de 50`; `50–200`; `201–1.000`; `1.001–5.000`; `más de 5.000`; `no sé`
  - `Ventas u operaciones mensuales`: `menos de 50`; `50–200`; `201–1.000`; `1.001–5.000`; `más de 5.000`; `no sé`
  - `Personas que participan en la operación`: `1`; `2–3`; `4–10`; `más de 10`; `no sé`
  - `Canales además de Mercado Libre`: `ninguno`; `tienda propia`; `redes sociales`; `otros marketplaces`; `venta mayorista`; `otro`; `no sé`
- **Required:** publications, monthly operations and team size yes; channels optional
- **Condition:** `actorType = seller`
- **Structured fields:** `catalogVolumeBand`, `monthlyOperationsBand`, `teamSizeBand`, `salesChannels[]`
- **Purpose:** characterize scale only where it changes interpretation of a pain.
- **Free text / max:** channel “otro”, 40 characters
- **Otro:** channels yes. **No sé:** yes for every numeric range.
- **Bias risk:** ranges can be perceived as a ranking; explain that there is no “better” answer.
- **Later use:** segment evidence; never infer seller importance or tier.

### Q03 — SELLER_MELI_ROLE

- **Actor:** Seller
- **Exact text:** “¿Qué lugar ocupa Mercado Libre hoy en tu operación?”
- **Response type:** single choice
- **Options:** `es el canal principal`; `es uno de varios canales`; `es un canal secundario`; `estoy empezando`; `no sé`
- **Required:** yes
- **Condition:** `actorType = seller`
- **Structured field:** `meliChannelRole`
- **Purpose:** understand context before interpreting impact.
- **Free text / max:** none. **Otro:** no. **No sé:** yes.
- **Bias risk:** none significant; avoid celebrating any option.
- **Later use:** contextualizes impact and next step.

### Q04 — NON_SELLER_CONTEXT

- **Actor:** Developer, ERP/Software House, Partner/Consultor, Otro
- **Exact text:** “¿En qué tipo de operación o cliente estás trabajando principalmente?”
- **Response type:** short free text
- **Options:** optional quick chips `clientes sellers`; `integraciones`; `software/ERP`; `consultoría/partnership`; `otro`
- **Required:** no
- **Condition:** actor is not Seller
- **Structured field:** `operatorContext`
- **Purpose:** anchor the conversation in the respondent’s actual context.
- **Free text / max:** 120 characters
- **Otro:** yes. **No sé:** yes (empty is allowed).
- **Bias risk:** chips must not imply that one context is preferred.
- **Later use:** interprets developer opportunity and follow-up owner.

### Q05 — CURRENT_STACK

- **Actor:** all
- **Exact text:** “¿Qué herramientas o formas de trabajo usás hoy para esta operación?”
- **Response type:** multi-select, minimum one option or `ninguna`
- **Options:** `herramientas nativas de Mercado Libre`; `Excel / Google Sheets`; `Real Trends`; `Producteca`; `Contabilium`; `Tango`; `ERP propio`; `desarrollo propio`; `agencia / consultor`; `otras`; `ninguna`; `no sé`
- **Required:** yes
- **Condition:** always
- **Structured field:** `currentStack[]`
- **Purpose:** record the current system landscape in the respondent’s terms.
- **Free text / max:** “otras”, 60 characters
- **Otro:** represented by `otras`. **No sé:** yes.
- **Bias risk:** named tools can prime comparison; display alphabetically or rotate order and never criticize options.
- **Later use:** complexity signal and compatibility context.

### Q06 — PRIMARY_PAIN_OPEN

- **Actor:** all
- **Exact text:** “¿Qué problema tenés hoy en Mercado Libre que te cuesta resolver bien?”
- **Response type:** short open text
- **Required:** yes
- **Condition:** always; this answer is collected before tags
- **Structured field:** `primaryPain` (verbatim)
- **Purpose:** obtain the respondent’s own framing before offering categories.
- **Free text / max:** 240 characters; one concrete problem, not a diagnosis
- **Otro:** not applicable. **No sé:** allow `no tengo uno claro` as an explicit answer.
- **Bias risk:** “problema” may over-focus on difficulty; keep the exact wording and do not add examples.
- **Later use:** evidence, quote and qualitative review; never overwritten by tags.

### Q07 — PAIN_TAGS

- **Actor:** all
- **Exact text:** “¿En qué temas se relaciona principalmente?”
- **Response type:** multi-select; optional after Q06
- **Options:** `precios / margen`; `costos`; `stock`; `logística`; `publicaciones / catálogo`; `preguntas`; `reclamos`; `facturación`; `reportes / información`; `integraciones`; `operación manual`; `otro`; `no sé`
- **Required:** no
- **Condition:** after Q06
- **Structured field:** `painTags[]`
- **Purpose:** make answers comparable without replacing the open response.
- **Free text / max:** “otro”, 60 characters
- **Otro:** yes. **No sé:** yes.
- **Bias risk:** categories can constrain recall; keep the open answer first and allow multiple/none.
- **Later use:** aggregation and routing only; never treated as proof of severity.

### Q08 — CURRENT_SOLUTION

- **Actor:** all
- **Exact text:** “¿Cómo lo resolvés hoy?”
- **Response type:** single choice plus optional note
- **Options:** `manual`; `Excel / Sheets`; `una persona del equipo`; `software`; `agencia / tercero`; `integración propia`; `no está resuelto`; `otro`; `no sé`
- **Required:** yes
- **Condition:** after Q06
- **Structured field:** `currentSolution`
- **Free text / max:** “otro” or note, 100 characters
- **Otro:** yes. **No sé:** yes.
- **Purpose:** identify current behavior, not to label it as inadequate.
- **Bias risk:** “no está resuelto” may feel negative; present it as one neutral option among others.
- **Later use:** solution gap and opportunity review.

### Q09 — LAST_CONCRETE_INCIDENT

- **Actor:** all
- **Exact text:** “¿Qué pasó la última vez que este tema apareció en tu operación?”
- **Response type:** short open text
- **Required:** yes
- **Condition:** after Q06
- **Structured field:** `lastIncident`
- **Free text / max:** 240 characters; prompt for event, consequence and timing without asking for confidential data
- **Otro:** not applicable. **No sé:** allow `no recuerdo`.
- **Purpose:** turn a broad pain into observable evidence.
- **Bias risk:** “última vez” can exclude recurring background issues; allow `no recuerdo` and do not demand an incident if none exists.
- **Later use:** evidence quality and impact review.

### Q10 — ECOSYSTEM_COMPLEXITY

- **Actor:** all
- **Exact text:** “Pensando en las herramientas que usás, ¿cómo describirías estas situaciones?”
- **Response type:** four independent single-choice ratings
- **Options:**
  - `Elegir una herramienta para una necesidad`: `muy fácil`; `fácil`; `ni fácil ni difícil`; `difícil`; `muy difícil`; `no sé`
  - `Cantidad de sistemas que participan`: `uno`; `dos`; `tres`; `cuatro o más`; `no sé`
  - `Funciones contratadas que usás poco o nada`: `ninguna`; `alguna`; `varias`; `no sé`
  - `Información que no coincide entre sistemas`: `nunca`; `a veces`; `seguido`; `no sé`
- **Required:** first and second yes; last two optional
- **Condition:** always
- **Structured fields:** `toolChoiceEase`, `systemCountBand`, `unusedFeaturesBand`, `inconsistentInfoFrequency`
- **Purpose:** measure complexity without presupposing that complexity exists.
- **Free text / max:** none. **Otro:** no. **No sé:** yes.
- **Bias risk:** negatively loaded wording in the last two items; keep balanced options and read them neutrally.
- **Later use:** descriptive complexity signal, never a diagnosis.

### Q11 — DISCARDED_TOOL

- **Actor:** all
- **Exact text:** “¿Dejaste de usar alguna herramienta o forma de trabajo? Si sí, ¿por qué motivo principal?”
- **Response type:** conditional single choice + optional text
- **Options:** `no`; `sí, por precio`; `sí, por complejidad`; `sí, porque quedó chica`; `sí, por otro motivo`; `no sé`
- **Required:** no
- **Condition:** show as optional expansion from Q10
- **Structured field:** `discardedToolReason`
- **Free text / max:** 100 characters when `otro` or to name the tool
- **Otro:** yes. **No sé:** yes.
- **Purpose:** identify adoption friction without assuming failure.
- **Bias risk:** options can imply the tool was at fault; include `no` first and do not ask for a brand unless volunteered.
- **Later use:** ecosystem learning and product research.

### Q12 — WHATSAPP_ALERTS

- **Actor:** all
- **Exact text:** “Si pudieras recibir por WhatsApp sólo avisos importantes de tu operación, ¿qué te gustaría que te avise?”
- **Response type:** multi-select plus open text
- **Options:** `alertas`; `consultas`; `ambas`; `no me interesa`; `no sé`
- **Required:** no
- **Condition:** always
- **Structured field:** `whatsappInterest[]`
- **Free text / max:** 160 characters, “¿qué aviso?”
- **Otro:** free text covers other needs. **No sé:** yes.
- **Purpose:** explore desired utility rather than sell a channel.
- **Bias risk:** the premise may overemphasize WhatsApp; always include `no me interesa` and do not promise delivery.
- **Later use:** WhatsApp opportunity rule.

### Q13 — WHATSAPP_QUESTIONS

- **Actor:** all
- **Exact text:** “¿Qué le preguntarías hoy a un asistente que conociera realmente tu tienda u operación?”
- **Response type:** short open text
- **Required:** no
- **Condition:** if Q12 does not select `no me interesa`
- **Structured field:** `whatsappQuestionWish`
- **Free text / max:** 180 characters
- **Otro / No sé:** not applicable; empty is allowed.
- **Purpose:** discover useful questions in the respondent’s language.
- **Bias risk:** “asistente” may imply AI; do not explain capabilities or suggest examples.
- **Later use:** WhatsApp opportunity evidence.

### Q14 — WHATSAPP_AVOID

- **Actor:** all
- **Exact text:** “¿Qué no querrías recibir por WhatsApp?”
- **Response type:** short open text
- **Required:** no
- **Condition:** if Q12 does not select `no me interesa`
- **Structured field:** `whatsappAvoid`
- **Free text / max:** 160 characters
- **Otro / No sé:** empty is allowed.
- **Purpose:** capture boundaries and avoid unwanted messaging.
- **Bias risk:** none significant; do not defend the channel.
- **Later use:** negative requirements and consent-safe design.

### Q15 — SELLER_CUSTOM_SOLUTION

- **Actor:** Seller
- **Exact text:** “Si ninguna herramienta existente resolviera bien este problema, ¿evaluarías una solución específica para tu operación?”
- **Response type:** single choice, then optional format multi-select
- **Options:** `sí`; `tal vez`; `no`; `no sé`
- **Required:** no
- **Condition:** `actorType = seller`
- **Structured fields:** `customSolutionInterest`, `customSolutionFormats[]`
- **Follow-up exact text:** “¿Qué formato te resultaría más útil?”
- **Follow-up options:** `herramienta puntual`; `diagnóstico + solución`; `integración`; `automatización`; `otro`; `no sé`
- **Free text / max:** “otro”, 80 characters
- **Purpose:** test fit for a specific solution without pitching one.
- **Bias risk:** hypothetical wording can inflate interest; treat `sí` as a signal, not commitment.
- **Later use:** custom-solution opportunity rule.

### Q16 — DEVELOPER_OPPORTUNITY

- **Actor:** Developer / Integrador / ERP / Software House
- **Exact text:** “¿Qué funcionalidad te piden tus clientes repetidamente y no querés seguir construyendo o manteniendo?”
- **Response type:** short open text
- **Required:** no
- **Condition:** developer branch
- **Structured field:** `developerRequestedCapability`
- **Free text / max:** 220 characters
- **Otro / No sé:** empty or `no sé` allowed.
- **Purpose:** uncover repeated demand and maintenance burden in the respondent’s own words.
- **Later use:** developer opportunity evidence.

### Q17 — DEVELOPER_FORMAT

- **Actor:** Developer / Integrador / ERP / Software House
- **Exact text:** “¿En qué formato tendría más sentido recibir esa capacidad?”
- **Response type:** multi-select
- **Options:** `API`; `SDK`; `webhook`; `white-label`; `módulo embebible`; `WhatsApp`; `desarrollo específico`; `otro`; `no sé`
- **Required:** no
- **Condition:** after Q16
- **Structured field:** `developerCapabilityFormats[]`
- **Free text / max:** “otro”, 80 characters
- **Otro:** yes. **No sé:** yes.
- **Purpose:** identify integration expectations without promising a roadmap.
- **Later use:** developer opportunity routing.

### Q18 — COMMERCIAL_SIGNAL

- **Actor:** all
- **Exact text:** “Para entender qué conviene priorizar, indicá una valoración rápida.”
- **Response type:** three independent 1–5 ratings, each with anchors
- **Exact rating labels:**
  - `Urgencia: ¿qué tan pronto necesitás resolverlo?` — `1 ahora no es prioridad` … `5 necesito resolverlo esta semana`
  - `Impacto: si sigue igual, ¿cuánto afecta tu operación?` — `1 impacto bajo` … `5 impacto muy alto`
  - `Interés en conversar: ¿te interesa seguir conversando sobre este tema?` — `1 no por ahora` … `5 sí, coordinemos`
- **Required:** urgency and impact yes; conversation interest optional
- **Condition:** always
- **Structured fields:** `urgencyScore`, `impactScore`, `interestScore`
- **Free text / max:** none. **Otro:** no. **No sé:** not offered; interviewer may leave optional interest blank.
- **Purpose:** capture comparable signal without asking willingness-to-pay as the primary metric.
- **Bias risk:** 1–5 scales invite interviewer interpretation; show anchors on every screen and read verbatim.
- **Later use:** lead qualification; never equate a high score with purchase intent.

### Q19 — CONTACT

- **Actor:** all
- **Exact text:** “¿Cómo podemos contactarte si tiene sentido continuar esta conversación?”
- **Response type:** short fields + consent checkbox
- **Fields and exact labels:** `Nombre` (required, 100 chars); `Empresa` (optional, 120); `WhatsApp` (required for WhatsApp follow-up, 40); `Email` (optional, 160); `Nickname de Mercado Libre` (optional, 80)
- **Consent exact text:** “Acepto que me contacten sobre esta conversación.”
- **Required:** name and consent yes; at least one contact channel recommended, not hard-blocked for saving
- **Condition:** always
- **Structured fields:** `fullName`, `companyName`, `whatsapp`, `email`, `meliNickname`, `followupConsent`
- **Purpose:** preserve a usable, consented follow-up path.
- **Free text / max:** as above. **Otro:** no. **No sé:** not applicable.
- **Bias risk:** asking contact before trust is built can reduce answers; keep it last and allow “sin seguimiento”.
- **Later use:** contact and consent, not qualification by itself.

### Q20 — NEXT_STEP

- **Actor:** all
- **Exact text:** “¿Qué próximo paso preferís, si alguno?”
- **Response type:** single choice
- **Options:** `diagnóstico`; `llamada`; `propuesta`; `conversación técnica con Fede`; `partnership`; `contacto por WhatsApp`; `sin seguimiento`; `otro`; `no sé`
- **Required:** yes
- **Condition:** always
- **Structured field:** `nextStep`
- **Free text / max:** “otro”, 100 characters
- **Otro:** yes. **No sé:** yes.
- **Purpose:** let the respondent choose a proportionate next action.
- **Bias risk:** “propuesta” may be premature; keep `sin seguimiento` first-class and do not interpret choice as acceptance.
- **Later use:** operational routing and follow-up queue.

## 5. Branching and completion

### Branching rules

1. Q01 is the only initial gate.
2. Seller → Q02, Q03, then common flow.
3. Developer/Integrator, ERP/Software House, Partner/Consultor and Otro → Q04, then common flow.
4. Q13 and Q14 appear only when WhatsApp interest is not `no me interesa`.
5. Q15 appears only for Seller.
6. Q16 and Q17 appear only for Developer/Integrator or ERP/Software House.
7. Q11 is an optional expansion from ecosystem complexity; it never blocks completion.
8. Back navigation restores every previous answer. Autosave creates/updates a local partial record before leaving a screen.

### Complete survey criterion

A survey is **complete** when Q01, Q05, Q06, Q08, Q09, Q10’s first two ratings, Q18’s urgency and impact, Q19 name + consent, and Q20 are present. Optional answers may remain empty. Saving a partial survey is always allowed.

## 6. Qualification rules (post-capture inference)

These rules are applied after persistence and are not shown as conclusions to the respondent.

### Seller lead qualified

Mark `seller_lead_candidate = true` when:

- complete survey;
- at least one contact channel or explicit consented follow-up path;
- `urgencyScore >= 3` and `impactScore >= 3`;
- `primaryPain` is not empty and `lastIncident` is not `no recuerdo`/empty;
- `nextStep != sin seguimiento`.

This is a candidate for human review, not a diagnosis or guaranteed lead.

### Developer opportunity

Mark `developer_opportunity_candidate = true` when:

- actor is Developer/Integrator or ERP/Software House;
- `developerRequestedCapability` has substantive text;
- the capability is requested repeatedly or has a maintenance concern in the text;
- at least one format is selected or the respondent chooses a technical next step.

### WhatsApp opportunity

Mark `whatsapp_opportunity_candidate = true` when:

- respondent did not choose `no me interesa`;
- at least one alert/consultation need or a substantive answer to Q13 exists;
- `whatsappAvoid` is retained as a constraint;
- follow-up consent is explicit before any outreach.

### Custom-solution opportunity

Mark `custom_solution_opportunity_candidate = true` when:

- Seller selected `sí` or `tal vez` in Q15, or a non-seller described a repeated capability with `desarrollo específico`;
- a concrete pain and incident are present;
- urgency or impact is at least 3;
- next step is not `sin seguimiento`.

## 7. Bias review

**BIAS_REVIEW: PASS**

Controls applied:

- open pain and incident precede category tags;
- every negative framing has balanced alternatives (`no`, `no sé`, neutral ratings);
- no seller tier, importance or purchasing capacity is inferred;
- WhatsApp is presented as an exploration with `no me interesa` and an avoidance question;
- tool names are options, not recommendations;
- high ratings are signals only and never become diagnoses;
- optional fields cannot block a valid local save;
- follow-up consent is explicit and separate from interest ratings.

Residual risks: event pressure may shorten open answers; interviewer tone may influence 1–5 ratings; named tools may anchor recall. Mitigation is verbatim reading, one decision per screen, visible anchors and periodic review of raw quotes.

## 8. Questions removed for lack of decision value

- Exact monthly revenue: removed; a range of operations and impact is sufficient for this event slice.
- Exact SKU count: removed; publication bands provide comparable scale with less friction.
- Seller “tier” or “importance”: removed; it would bias treatment and has no capture decision.
- Direct “¿cuánto pagarías?”: removed; it overstates hypothetical willingness-to-pay and is not the primary commercial signal.
- Full tool satisfaction score: removed; the open pain, incident and current solution provide more actionable evidence.
- Detailed feature inventory for every tool: removed; it exceeds the 90–120 second target.
- Mandatory company, email or nickname: removed; optional contact fields protect completion and trust.
- Technical architecture questions for sellers: removed; they belong only in the developer branch.
- Product pitch or preferred solution selection: removed; it would contaminate discovery.

## 9. Owner decisions before implementation

1. Confirm the event identifier and whether “WhatsApp” means personal or business number in the consent copy.
2. Confirm whether `teamSizeBand` should include external agencies as part of the team.
3. Confirm the human owner for each next-step option (`Alejandro`, `Fede` or shared queue).
4. Confirm retention period and export policy for raw quotes and contact data.

