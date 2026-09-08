export const SURVEY_URL = import.meta.env.VITE_SURVEY_URL || '/survey';

export const operationalNodes = [
  ['Mercado Libre', 'donde vendés'],
  ['Excel', 'donde registrás'],
  ['Sistema de gestión', 'donde operás'],
  ['WhatsApp', 'donde preguntás'],
  ['PymIA', 'pieza que falta'],
] as const;

export const audienceDoors = [
  { label: 'VENDO EN MERCADO LIBRE', href: '#sellers', note: 'Margen, existencias y operación' },
  { label: 'DESARROLLO O INTEGRO SISTEMAS', href: '#developers', note: 'La capacidad que tu producto necesita' },
  { label: 'TRABAJO CON EXCEL', href: '#excel', note: 'Encontrar lo que la planilla no cuenta' },
] as const;

export const sellerPainPoints = ['margen', 'existencias', 'precios', 'publicaciones', 'facturación', 'sistema de gestión', 'Excel', 'tareas manuales', 'información desconectada'];
export const developerCapabilities = ['conexiones entre sistemas', 'módulos reutilizables', 'soluciones con tu marca', 'automatizaciones', 'integraciones', 'WhatsApp'];
export const excelSignals = ['celdas fuera del rango', 'fórmulas que dejaron de calcular bien', 'números escritos dentro de fórmulas', 'referencias rotas', 'unidades mezcladas', 'datos sin actualizar', 'reglas que nadie recuerda'];
