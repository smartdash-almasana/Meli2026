export const SURVEY_URL =
  import.meta.env.VITE_SURVEY_URL || "https://meli2026-encuesta.vercel.app/";
export const WHATSAPP_MESSAGE =
  "Hola, estoy en la Experiencia Mercado Libre 2026 y quiero contarles un problema de mi operación.";
export const WHATSAPP_URL =
  "https://wa.me/541157577039?text=" + encodeURIComponent(WHATSAPP_MESSAGE);
export const modules = [
  [
    "Mercado Libre + tus sistemas",
    "Conectamos ventas, precios, stock y operación con las herramientas que ya usás.",
    "Tu sistema de gestión, Excel, stock físico, facturación, otros canales y WhatsApp.",
  ],
  [
    "Precios y márgenes",
    "Podemos construir controles que crucen costos, comisiones, envíos, impuestos y tus propias reglas para que entiendas qué te queda realmente.",
    "“Tengo costos en un lugar y precios en otro.”",
  ],
  [
    "Stock y publicaciones",
    "Podemos conectar tus fuentes de stock y detectar diferencias antes de que terminen en cancelaciones, publicaciones desactualizadas o problemas operativos.",
    "Mercado Libre, depósito, local físico, sistema de gestión y Excel.",
  ],
  [
    "Facturación y operación",
    "Podemos conectar la información de la venta con tu circuito administrativo para reducir carga manual y datos repetidos.",
    "“Cargo la misma información dos veces.”",
  ],
  [
    "WhatsApp para tu negocio",
    "Consultá tu operación y recibí información importante por WhatsApp usando datos reales de tus sistemas.",
    "Ejemplos de lo que podemos construir: “¿Qué stock no coincide?” o “¿Dónde tengo un problema de margen?”",
  ],
  [
    "Automatizaciones",
    "Sacamos del medio tareas repetitivas, controles manuales y pasos que hoy dependen de una persona.",
    "Copiar datos, comparar archivos, actualizar información, revisar excepciones y generar avisos.",
  ],
  [
    "Excel bajo control",
    "Si tu Excel dice una cosa y la plata termina diciendo otra, podemos revisar fórmulas, datos, costos y reglas para encontrar dónde está el problema.",
    "Costos viejos, rangos incompletos, referencias equivocadas y controles que sólo entiende una persona.",
  ],
  [
    "Módulos a medida",
    "Si tu sistema hace casi todo pero le falta una pieza, la podemos construir sin rehacer el resto.",
    "Una integración, una alerta, un control, una consulta o una herramienta interna.",
  ],
] as const;
export const sellerPainPoints = [
  "No sé cuánto margen real me queda.",
  "Tengo costos en un lugar y precios en otro.",
  "El stock no coincide.",
  "Actualizo precios a mano.",
  "Cargo información dos veces.",
  "Tengo un Excel que sólo entiende una persona.",
  "Me entero del problema cuando ya pasó.",
  "La información está repartida.",
];
export const excelSignals = [
  "Costos desactualizados",
  "Fórmulas modificadas",
  "Rangos incompletos",
  "Valores escritos a mano",
  "Referencias equivocadas",
  "Unidades mezcladas",
  "Reglas que nadie recuerda",
];
export const systems = [
  "Mercado Libre",
  "Excel",
  "Sistema de gestión",
  "Sistemas propios",
  "Herramientas verticales",
  "WhatsApp",
  "Otros canales",
];
export const questions = [
  [
    "¿Tengo que cambiar mi sistema?",
    "No necesariamente. Primero buscamos integrar o extender lo que ya usás.",
  ],
  [
    "¿Pueden trabajar con mi Excel actual?",
    "Sí. Excel puede seguir siendo parte de tu operación mientras resolvemos el problema concreto.",
  ],
  [
    "¿Trabajan sólo con Mercado Libre?",
    "No. Mercado Libre es una de las puertas de entrada. También trabajamos sobre sistemas de gestión, Excel, WhatsApp y procesos propios.",
  ],
  [
    "¿Qué hago si mi problema no aparece en los módulos?",
    "Escribinos por WhatsApp. Primero entendemos el problema y después vemos si tiene sentido construir algo.",
  ],
] as const;
