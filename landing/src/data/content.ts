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
