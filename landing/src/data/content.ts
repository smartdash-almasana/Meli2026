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

export const sellerProblems = [
  ["Margen real poco claro", "El precio parece bueno hasta que aparecen cargos, logística, promociones y otros costos."],
  ["Demasiado trabajo manual", "Copiar datos entre planillas y sistemas te deja menos tiempo para decidir."],
  ["Datos repartidos", "MELI, Excel, ERP e integradores cuentan partes distintas de la misma operación."],
  ["No sabés qué corregir primero", "Hay señales por todos lados, pero cuesta ordenar la prioridad que mueve el resultado."],
] as const;

export const commerceChain = ["Publicación", "Precio", "Venta", "Envío", "Cobro", "Cargos", "Reclamo / devolución", "Margen"] as const;
export const commerceChecks = ["Publicaciones", "Precios", "Órdenes", "Stock", "Full / Flex", "Cargos", "Cobros", "Reclamos", "Devoluciones", "Conciliaciones"] as const;
export const commerceValueBlocks = [
  ["Rentabilidad", "Precio + costo + cargos + logística + promociones + Ads + costos privados"],
  ["Operación", "Publicaciones + stock + órdenes + Full / Flex + envíos + reclamos + devoluciones"],
  ["Control económico", "Ventas + cargos + cobros + liquidaciones + conciliaciones + diferencias"],
  ["Integraciones", "Excel, ERP, integrador, stock, facturación y software propio"],
] as const;
export const commerceCases = ["Un seller con 3.000 publicaciones necesita detectar dónde se le escapa el margen.", "Un seller con ERP + MELI necesita una lectura común de ventas, cargos y cobros.", "Un seller multicanal necesita saber qué señal atender primero sin duplicar carga."] as const;

export const smbProblems = [
  ["La misma información se carga en varios lugares.", "La doble carga se vuelve parte del trabajo diario y nadie sabe cuál dato es el bueno."],
  ["Las herramientas no hablan entre sí.", "Excel, sistema contable, banco y WhatsApp guardan piezas que deberían poder leerse juntas."],
  ["Los reportes llegan tarde.", "La información aparece después de horas de copiar, ordenar y revisar planillas."],
  ["Las diferencias no tienen origen visible.", "Ventas, cobros, stock o costos no cierran y cuesta encontrar dónde empezó el desvío."],
] as const;
export const smbTools = ["Excel", "ERP", "Sistema contable", "Mercado Pago", "WhatsApp", "Banco", "CRM", "Software propio"] as const;
export const smbAreas = [
  ["Control económico", "Que vender y cobrar no sean dos historias distintas.", "Ventas, costos, márgenes, cobros, diferencias y conciliaciones."],
  ["Administración", "Menos copiar y pegar. Más información lista para usar.", "Carga repetida, reportes, documentación, seguimiento, cierres y control de información."],
  ["Operación", "Detectá problemas operativos antes de que se transformen en urgencias.", "Stock, compras, pedidos, entregas, órdenes de trabajo y agenda."],
  ["Automatización", "Automatizá después de entender el proceso, no antes.", "Tareas repetitivas, avisos, seguimiento, documentos y flujos entre sistemas."],
] as const;
export const smbExcel = ["Ventas", "Costos", "Márgenes", "Rentabilidad", "Inconsistencias", "Reportes"] as const;
export const smbCases = [
  ["Estudio contable", "Información de clientes repartida entre Excel, mails y sistemas."],
  ["Distribuidora", "Ventas, stock y cobranzas que no cierran entre sistemas."],
  ["Comercio", "Mercado Pago, caja, ventas y stock que requieren conciliación manual."],
  ["Empresa de servicios", "Presupuestos, agenda, órdenes de trabajo y seguimiento dispersos."],
] as const;

export const devModules = ["Atención", "CRM", "Follow-up", "Agenda", "Catálogo", "Presupuestos", "Pedidos", "Cobranza", "Documentos", "Orden de trabajo", "Posventa", "Inventario", "Conciliaciones", "Radar", "PymIA Intelligence", "Mercado Libre", "Facturación"] as const;
export const verticalPacks = ["Taller mecánico", "Lubricentro", "Odontología", "Consultorio", "Estudio contable", "Distribuidora", "Seller Mercado Libre", "Comercio", "Servicio técnico"] as const;
export const adapters = ["WhatsApp", "Mercado Libre", "Mercado Pago", "Excel", "Google Calendar", "ARCA", "n8n", "Make", "CRM", "ERP"] as const;
export const devAudiences = ["Agencias", "Freelancers", "Implementadores IA", "Developers", "Software factories pequeñas"] as const;
export const devModuleCatalog = [
  ["Atención", "DISPONIBLE"], ["CRM", "PILOTO"], ["Follow-up", "EN DESARROLLO"], ["Agenda", "DISPONIBLE"],
  ["Catálogo", "PILOTO"], ["Presupuestos", "DISPONIBLE"], ["Pedidos", "EN DESARROLLO"], ["Cobranza", "PILOTO"],
  ["Documentos", "EN DESARROLLO"], ["Orden de trabajo", "PILOTO"], ["Posventa", "PRÓXIMAMENTE"], ["Inventario", "EN DESARROLLO"],
  ["Conciliaciones", "PILOTO"], ["Radar", "EN DESARROLLO"], ["PymIA Intelligence", "PRÓXIMAMENTE"], ["Mercado Libre", "PILOTO"], ["Facturación", "EN DESARROLLO"],
] as const;
export const devVerticalCatalog = [
  ["Taller mecánico", "PILOTO"], ["Lubricentro", "CANDIDATO"], ["Odontología", "CANDIDATO"], ["Consultorio", "CANDIDATO"],
  ["Estudio contable", "CANDIDATO"], ["Distribuidora", "CANDIDATO"], ["Seller Mercado Libre", "PILOTO"], ["Comercio", "CANDIDATO"], ["Servicio técnico", "CANDIDATO"],
] as const;
export const devAdapterCatalog = [
  ["WhatsApp", "DISPONIBLE"], ["Mercado Libre", "PILOTO"], ["Mercado Pago", "EN DESARROLLO"], ["Excel", "DISPONIBLE"], ["Google Calendar", "PILOTO"],
  ["ARCA", "CANDIDATO"], ["n8n", "CANDIDATO"], ["Make", "CANDIDATO"], ["CRM", "PILOTO"], ["ERP", "CANDIDATO"],
] as const;
export const devCompositions = [
  ["Agenda + Odontología + WhatsApp", "Turnos y recordatorios"],
  ["Presupuestos + Taller mecánico + WhatsApp", "Recepción y seguimiento de trabajos"],
  ["Conciliaciones + Seller MELI + Mercado Libre", "Control económico operativo"],
  ["CRM + Distribuidora + WhatsApp", "Seguimiento comercial"],
] as const;
export const devPrinciples = ["Procesos de negocio", "Vocabulario vertical", "Reglas", "Estructuras de datos", "Integraciones", "Evidencia", "Componentes reutilizables"] as const;

export const questions = [
  ["¿Tengo que cambiar mi sistema?", "No necesariamente. Primero buscamos integrar o extender lo que ya usás."],
  ["¿Pueden trabajar con mi Excel actual?", "Sí. Excel puede seguir siendo parte de tu operación mientras resolvemos el problema concreto."],
  ["¿Qué está disponible hoy?", "Definimos el alcance con evidencia. Algunas piezas están disponibles, otras son piloto o están en desarrollo."],
  ["¿Cómo empezamos?", "Contanos qué querés resolver. Primero entendemos el problema y después vemos qué pieza tiene sentido."],
] as const;
