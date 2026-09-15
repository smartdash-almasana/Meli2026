// Production navigation stays on the canonical public host. A local override
// is useful when running the two Vite apps side by side during verification.
export const SURVEY_URL =
  import.meta.env.DEV && import.meta.env.VITE_SURVEY_URL
    ? import.meta.env.VITE_SURVEY_URL
    : "/vtv";

export const WHATSAPP_MESSAGE =
  "Hola, quiero contarles qué proceso de mi empresa quiero mejorar con PymIA.";
export const WHATSAPP_URL =
  "https://wa.me/541157577039?text=" + encodeURIComponent(WHATSAPP_MESSAGE);

export const audienceCards = [
  { id: "commerce", eyebrow: "E-commerce", title: "Vendo online", copy: "Más control sobre ventas, stock y rentabilidad sin tirar abajo lo que ya funciona.", href: "#commerce" },
  { id: "smb", eyebrow: "PyMEs", title: "Tengo una PyME", copy: "Menos doble carga y más claridad para decidir sobre la operación real.", href: "#smb" },
  { id: "devs", eyebrow: "Devs / implementadores", title: "Construyo soluciones", copy: "Módulos, verticales y adaptadores para entregar mejor sin empezar de cero.", href: "#devs" },
] as const;

export const howSteps = [
  ["Lo que ya usás", "Tus sistemas, planillas, canales y conversaciones."],
  ["PymIA conecta", "Integramos las piezas que hoy viven separadas."],
  ["Entiende contexto", "Ordenamos datos alrededor del problema concreto."],
  ["Aplica reglas", "Controles claros donde no se puede improvisar."],
  ["Automatiza / alerta / explica", "La información llega cuando sirve."],
  ["La persona decide", "El control humano queda donde corresponde."],
] as const;

export const commerceCards = [
  { eyebrow: "Mercado Libre", title: "Una operación que podés leer.", copy: "VTV, cargos, publicaciones, stock, Full / Flex, reclamos, devoluciones, conciliaciones y automatizaciones. La experiencia Mercado Libre 2026 es nuestro contexto de entrada, no el límite de PymIA.", items: ["Operación", "Rentabilidad", "Stock", "Cargos", "Publicaciones", "Reclamos"], status: "PILOTO" },
  { eyebrow: "Otros marketplaces", title: "Más canales, una operación.", copy: "Conectamos la operación que ya tenés con otros canales de venta mediante integraciones a medida, pilotos y próximos adaptadores.", items: ["Tiendanube", "Shopify", "Marketplaces futuros"], status: "EN DESARROLLO" },
  { eyebrow: "Sobre lo que ya tenés", title: "No necesitás empezar de cero.", copy: "ERP, Excel, stock, facturación, CRM o sistemas propios: PymIA puede integrarse alrededor de tu operación actual.", items: ["Integrar", "Extender", "Automatizar"], status: "DISPONIBLE" },
] as const;

export const smbCards = [
  ["Excel e inteligencia", "Ventas, costos, márgenes, validaciones, inconsistencias y reportes."],
  ["Conciliaciones", "Ventas, cobros, cuentas, diferencias y evidencias para cerrar mejor."],
  ["Contabilidad y administración", "Documentación, facturación, cierres e integración con estudios."],
  ["Automatizaciones", "Carga repetitiva, seguimiento, documentos, alertas y workflows."],
  ["Comercial", "CRM, presupuestos, pedidos, seguimiento y cobranza."],
  ["Operaciones", "Inventario, compras, entregas, órdenes de trabajo y turnos."],
  ["Integraciones", "Excel, ERP, sistema contable, WhatsApp, Mercado Pago y software propio."],
] as const;

export const devModules = ["Atención", "CRM", "Follow-up", "Agenda", "Catálogo", "Presupuestos", "Pedidos", "Cobranza", "Documentos", "Orden de trabajo", "Posventa", "Inventario", "Conciliaciones", "Radar", "PymIA Intelligence", "Mercado Libre", "Facturación"] as const;
export const verticalPacks = ["Taller mecánico", "Lubricentro", "Odontología", "Consultorios", "Estudios contables", "Distribuidoras", "Sellers Mercado Libre", "Comercio minorista", "Servicio técnico"] as const;
export const adapters = ["WhatsApp", "Mercado Libre", "Mercado Pago", "Excel", "Google Calendar", "ARCA", "n8n", "Make", "CRM", "ERP"] as const;

export const questions = [
  ["¿Tengo que cambiar mi sistema?", "No necesariamente. Primero buscamos integrar o extender lo que ya usás."],
  ["¿Pueden trabajar con mi Excel actual?", "Sí. Excel puede seguir siendo parte de tu operación mientras resolvemos el problema concreto."],
  ["¿Qué está disponible hoy?", "Definimos el alcance con evidencia. Algunas piezas están disponibles, otras son piloto o están en desarrollo."],
  ["¿Cómo empezamos?", "Contanos qué querés resolver. Primero entendemos el problema y después vemos qué pieza tiene sentido."],
] as const;
