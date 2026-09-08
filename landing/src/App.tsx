import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { audienceDoors, developerCapabilities, excelSignals, operationalNodes, sellerPainPoints, SURVEY_URL } from './data/content';

interface HeaderProps { readonly surveyUrl: string }
interface HeroProps { readonly surveyUrl: string }
interface StoryBandProps { readonly id: string; readonly index: string; readonly eyebrow: string; readonly title: string; readonly copy: string; readonly items: readonly string[]; readonly cta: string; readonly href: string; readonly tone?: 'light' | 'paper' | 'ink' }
interface ResponsibilityProps { readonly id: string }
interface FinalCtaProps { readonly surveyUrl: string }

function useSurveyQr(surveyUrl: string, width = 560) {
  const [qr, setQr] = useState('');
  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(surveyUrl, {
      width,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: { dark: '#17202a', light: '#fffaf6' },
    }).then((value) => { if (active) setQr(value); });
    return () => { active = false; };
  }, [surveyUrl, width]);
  return qr;
}

function BrandMark() {
  return <span className="brand-lockup">
    <img src="/logopymia2.jpg" width="64" height="64" alt="" fetchPriority="high" />
    <span><strong>PymIA</strong><small>Operaciones conectadas</small></span>
  </span>;
}

function Header({ surveyUrl }: HeaderProps) {
  return <header className="site-header shell">
    <a className="brand" href="#top" aria-label="PymIA, volver al inicio">
      <BrandMark />
    </a>
    <div className="header-meta"><span>Experiencia Mercado Libre 2026</span><a href={surveyUrl}>Abrir encuesta ↗</a></div>
  </header>;
}

function OperationalRail() {
  return <div className="operational-rail" aria-label="Cómo se conecta PymIA con tu operación">
    {operationalNodes.map(([name, note], index) => <div className="rail-node" key={name}>
      <span className="rail-dot" aria-hidden="true" />
      <div><strong>{name}</strong><small>{note}</small></div>
      {index < operationalNodes.length - 1 && <span className="rail-line" aria-hidden="true" />}
    </div>)}
  </div>;
}

function Hero({ surveyUrl }: HeroProps) {
  const qr = useSurveyQr(surveyUrl, 220);
  return <section className="hero shell" id="top">
    <div className="hero-copy">
      <p className="eyebrow">PymIA / Experiencia Mercado Libre 2026</p>
      <h1>No te pedimos que cambies todo tu sistema.</h1>
      <p className="hero-lede">Encontramos el cuello de botella, nos conectamos con lo que ya tenés y construimos la pieza que hoy te falta.</p>
      <div className="hero-actions"><a className="button button-primary" href={surveyUrl}>Contanos qué problema te está frenando <span aria-hidden="true">↗</span></a><a className="text-link" href="#how">Conocé cómo trabajamos <span aria-hidden="true">↓</span></a></div>
    </div>
    <div className="hero-system"><p className="system-label">Una operación real no vive en un solo lugar</p><OperationalRail />
      <a className="hero-qr" href={surveyUrl} aria-label="Abrir la encuesta de diagnóstico">
        {qr && <img src={qr} width="112" height="112" alt="" />}
        <span><strong>¿Estás en el evento?</strong><small>Escaneá o tocá para contarnos tu problema.</small></span>
      </a>
    </div>
  </section>;
}

function AudienceDoors() {
  return <section className="audience shell" aria-labelledby="audience-title">
    <div className="section-intro"><p className="eyebrow">Elegí tu puerta de entrada</p><h2 id="audience-title">El problema cambia.<br />La forma de abordarlo también.</h2></div>
    <nav className="doorway-list" aria-label="Entradas por audiencia">{audienceDoors.map((door, index) => <a className={`doorway doorway-${index + 1}`} href={door.href} key={door.label}><span className="doorway-label">{door.label}</span><span className="doorway-note">{door.note}</span><span className="doorway-arrow" aria-hidden="true">↗</span></a>)}</nav>
  </section>;
}

function ConcreteProof() {
  return <section className="proof shell" aria-labelledby="proof-title">
    <div><p className="eyebrow">Un caso concreto</p><h2 id="proof-title">Vendés en Mercado Libre. Controlás existencias en Excel. Facturás en tu sistema de gestión.</h2></div>
    <div className="proof-flow" aria-label="Ejemplo de una operación conectada"><span>Mercado Libre</span><i aria-hidden="true">+</i><span>Excel</span><i aria-hidden="true">+</i><span>Sistema de gestión</span><b aria-hidden="true">→</b><strong>PymIA conecta el flujo sin reemplazarlo.</strong></div>
  </section>;
}

function StoryBand({ id, index, eyebrow, title, copy, items, cta, href, tone = 'light' }: StoryBandProps) {
  return <section className={`story-band shell ${tone}`} id={id}>
    <div className="band-index" aria-hidden="true">{index}</div>
    <div className="band-content"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="band-copy">{copy}</p><a className="button button-outline" href={href}>{cta} <span aria-hidden="true">↗</span></a></div>
    <ul className="evidence-list">{items.map(item => <li key={item}><span aria-hidden="true">—</span>{item}</li>)}</ul>
  </section>;
}

function Responsibility({ id }: ResponsibilityProps) {
  return <section className="responsibility shell" id={id}>
    <div className="section-intro"><p className="eyebrow">Lo exacto y lo que ayuda a entender</p><h2>Precisión donde importa.<br />IA donde aporta.</h2></div>
    <div className="responsibility-grid">
      <article><p className="role-label">CÁLCULO Y REGLAS</p><h3>El programa controla lo que no puede fallar.</h3><ul><li>cálculos</li><li>reglas</li><li>controles</li><li>resultados comprobables</li><li>mismo resultado cada vez</li></ul></article>
      <div className="boundary"><span>PymIA coordina</span><i aria-hidden="true" /></div>
      <article><p className="role-label">IA CONVERSACIONAL</p><h3>La IA ayuda a entender lo que está pasando.</h3><ul><li>comprensión</li><li>contexto</li><li>conversación</li><li>explicaciones claras</li></ul></article>
    </div>
    <p className="responsibility-note">La IA ayuda a entender. El programa controla lo que tiene que ser exacto.</p>
  </section>;
}

function IntegrationMap() {
  const systems = ['Mercado Libre', 'Excel', 'Sistema de gestión', 'Sistema actual', 'WhatsApp', 'Otras herramientas'];
  return <section className="integration shell" id="how"><div className="integration-copy"><p className="eyebrow">Una pieza, no una mudanza</p><h2>Primero integramos.<br />Migrar es la última opción.</h2><p>Tu operación puede seguir siendo tu operación. PymIA se conecta donde hoy se corta el flujo y construye la capacidad que falta.</p></div><div className="map" aria-label="Mapa de sistemas que conviven con PymIA"><div className="map-center">PymIA<span>pieza que falta</span></div>{systems.map((system, index) => <div className={`map-node node-${index + 1}`} key={system}><span className="map-connector" aria-hidden="true" /><strong>{system}</strong></div>)}</div></section>;
}

function WhatsAppSection() {
  const moments = ['qué requiere atención', 'alertas relevantes', 'consultas', 'explicación de excepciones', 'información sin abrir cinco sistemas'];
  return <section className="whatsapp shell"><div><p className="eyebrow">Cuando la operación te busca</p><h2>Tu negocio también puede hablarte por WhatsApp.</h2><p>Sin respuestas automáticas genéricas. Sólo el contexto necesario para decidir qué mirar y qué hacer.</p></div><ul className="moment-list">{moments.map((moment, i) => <li key={moment}><span>{String(i + 1).padStart(2, '0')}</span><strong>{moment}</strong><em>→</em></li>)}</ul></section>;
}

function FinalCta({ surveyUrl }: FinalCtaProps) {
  const qr = useSurveyQr(surveyUrl);
  return <section className="final-cta shell" id="survey"><div className="final-copy"><p className="eyebrow">La conversación empieza acá</p><h2>¿Qué problema te está frenando hoy?</h2><p>Escaneá y contanos tu caso.</p><a className="button button-primary" href={surveyUrl}>Contanos tu problema <span aria-hidden="true">↗</span></a><span className="short-url">{surveyUrl}</span></div><div className="qr-frame"><div className="qr-quiet-zone">{qr ? <img src={qr} width="320" height="320" alt={`Código para abrir la encuesta: ${surveyUrl}`} /> : <span className="qr-placeholder">ESCANEÁ PARA ABRIR LA ENCUESTA</span>}</div><span className="qr-caption">ESCANEÁ PARA ABRIR LA ENCUESTA</span></div></section>;
}

function App() {
  return <div className="page"><a className="skip-link" href="#main-content">Saltar al contenido</a><Header surveyUrl={SURVEY_URL} /><main id="main-content">
    <Hero surveyUrl={SURVEY_URL} /><AudienceDoors /><ConcreteProof />
    <StoryBand id="sellers" index="01" eyebrow="Para quienes venden en Mercado Libre" title="Tu negocio no termina en Mercado Libre." copy="Cuando margen, existencias, precios o facturación dependen de demasiados pasos manuales, el problema no es tu esfuerzo: es el cuello de botella." items={sellerPainPoints} cta="Quiero resolver un problema de mi operación" href={SURVEY_URL} tone="paper" />
    <StoryBand id="developers" index="02" eyebrow="Para desarrolladores e integradores" title="¿Tus clientes te piden cosas que no querés volver a construir?" copy="Vos mantenés tu producto. Nosotros podemos construir la pieza especializada y dejarla lista para integrarse." items={developerCapabilities} cta="Quiero hablar de una integración" href={SURVEY_URL} tone="ink" />
    <StoryBand id="excel" index="03" eyebrow="Para equipos que trabajan con Excel" title="Tu Excel sabe mucho de tu negocio. También puede estar escondiendo problemas." copy="PymIA revisa cálculos, referencias y datos para encontrar errores difíciles de ver y explicar qué está pasando en lenguaje claro." items={excelSignals} cta="Quiero revisar cómo trabajo con Excel" href={SURVEY_URL} tone="paper" />
    <Responsibility id="responsibility" /><IntegrationMap /><WhatsAppSection /><FinalCta surveyUrl={SURVEY_URL} />
  </main><footer className="site-footer shell"><span>Alejandro + Fede / PymIA</span><span>Experiencia Mercado Libre 2026</span><a href="#top">Volver arriba ↑</a></footer><a className="event-dock" href={SURVEY_URL}>Abrir encuesta <span aria-hidden="true">↗</span></a></div>;
}

export default App;
