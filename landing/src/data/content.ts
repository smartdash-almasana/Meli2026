export const SURVEY_URL =
  import.meta.env.DEV && import.meta.env.VITE_SURVEY_URL ? import.meta.env.VITE_SURVEY_URL : "/vtv";

export const WHATSAPP_MESSAGE = "Hola, quiero contarles qué proceso de mi empresa quiero mejorar con PymIA.";
export const WHATSAPP_URL = "https://wa.me/541157577039?text=" + encodeURIComponent(WHATSAPP_MESSAGE);

export const howSteps = [
  ["Lo que ya usás", "Tus sistemas, planillas, canales y conversaciones."],
  ["PymIA conecta", "Integramos las piezas que hoy viven separadas."],
  ["Entiende contexto", "Ordenamos datos alrededor del problema concreto."],
  ["Aplica reglas", "Controles claros donde no se puede improvisar."],
  ["Automatiza / alerta / explica", "La información llega cuando sirve."],
  ["La persona decide", "El control humano queda donde corresponde."],
] as const;

export const commerceCards = [
  { eyebrow: "Mercado Libre", title: "Una operación que podés leer.", copy: "Operación, datos, publicaciones, precios, stock, Full / Flex, reclamos, devoluciones, conciliaciones y automatizaciones. Mercado Experience es nuestro contexto de entrada, no el límite de PymIA.", items: ["Operación", "Rentabilidad", "Stock", "Cargos", "Publicaciones", "Reclamos"], status: "PILOTO" },
  { eyebrow: "Rentabilidad", title: "Entendé qué queda realmente.", copy: "Cruzamos costos, comisiones, envíos e impuestos para encontrar dónde se escapa el margen.", items: ["Costos", "Comisiones", "Margen", "Conciliación"], status: "DISPONIBLE" },
  { eyebrow: "Otros marketplaces", title: "Más canales, una operación.", copy: "Conectamos lo que ya tenés con otros canales mediante integraciones a medida, pilotos y próximos adaptadores.", items: ["Tiendanube", "Shopify", "Marketplaces futuros"], status: "EN DESARROLLO" },
  { eyebrow: "Stock y publicaciones", title: "Detectá diferencias antes.", copy: "Conectamos fuentes de stock y publicaciones para reducir cancelaciones y tareas manuales.", items: ["Stock", "Publicaciones", "Alertas", "Full / Flex"], status: "PILOTO" },
  { eyebrow: "Reclamos y devoluciones", title: "Una señal que no se pierde.", copy: "Ordenamos reclamos, devoluciones y excepciones para que puedas priorizar qué revisar.", items: ["Reclamos", "Devoluciones", "Excepciones"], status: "PRÓXIMAMENTE" },
  { eyebrow: "Sobre lo que ya tenés", title: "No necesitás empezar de cero.", copy: "ERP, Excel, stock, facturación, CRM o sistemas propios: PymIA se integra alrededor de tu operación actual.", items: ["ERP", "Excel", "Facturación", "CRM"], status: "DISPONIBLE" },
] as const;

export const commerceCases = ["Un precio que no contempla todos los cargos", "Stock físico que no coincide con publicaciones", "Una devolución que requiere seguimiento", "Datos repartidos entre Excel y el sistema de gestión"] as const;

export const smbCards = [
  ["Excel e inteligencia", "Ventas, costos, márgenes, rentabilidad, validaciones, inconsistencias y reportes.", "DISPONIBLE"],
  ["Conciliaciones", "Ventas, cobros, cuentas, diferencias y evidencias para cerrar mejor.", "PILOTO"],
  ["Administración y contabilidad", "Documentación, facturación, cierres e integración con estudios.", "EN DESARROLLO"],
  ["Costos y márgenes", "Reglas claras para saber qué cambia y qué decisión habilita.", "PILOTO"],
  ["Comercial y cobranza", "CRM, presupuestos, pedidos, seguimiento y cobranza.", "DISPONIBLE"],
  ["Inventario y operaciones", "Compras, entregas, órdenes de trabajo y turnos.", "EN DESARROLLO"],
  ["Automatizaciones y documentos", "Carga repetitiva, seguimiento, alertas, reportes y workflows.", "PILOTO"],
  ["Integraciones", "Excel, ERP, sistema contable, WhatsApp, Mercado Pago y software propio.", "DISPONIBLE"],
] as const;
export const smbCases = ["Un estudio contable que necesita ordenar documentación", "Una distribuidora que concilia ventas y cobros", "Un comercio que duplica carga entre Excel y su sistema", "Una empresa de servicios que pierde seguimientos"] as const;

export const devModules = ["Atención", "CRM", "Follow-up", "Agenda", "Catálogo", "Presupuestos", "Pedidos", "Cobranza", "Documentos", "Orden de trabajo", "Posventa", "Inventario", "Conciliaciones", "Radar", "PymIA Intelligence", "Mercado Libre", "Facturación"] as const;
export const verticalPacks = ["Taller mecánico", "Lubricentro", "Odontología", "Consultorio", "Estudio contable", "Distribuidora", "Seller Mercado Libre", "Comercio", "Servicio técnico"] as const;
export const adapters = ["WhatsApp", "Mercado Libre", "Mercado Pago", "Excel", "Google Calendar", "ARCA", "n8n", "Make", "CRM", "ERP"] as const;
export const devAudiences = ["Agencias", "Freelancers", "Implementadores IA", "Developers", "Software factories pequeñas"] as const;

export const questions = [
  ["¿Tengo que cambiar mi sistema?", "No necesariamente. Primero buscamos integrar o extender lo que ya usás."],
  ["¿Pueden trabajar con mi Excel actual?", "Sí. Excel puede seguir siendo parte de tu operación mientras resolvemos el problema concreto."],
  ["¿Qué está disponible hoy?", "Definimos el alcance con evidencia. Algunas piezas están disponibles, otras son piloto o están en desarrollo."],
  ["¿Cómo empezamos?", "Contanos qué querés resolver. Primero entendemos el problema y después vemos qué pieza tiene sentido."],
] as const;
