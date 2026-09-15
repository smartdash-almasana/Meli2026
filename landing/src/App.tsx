import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  adapters,
  audienceCards,
  commerceCards,
  devModules,
  howSteps,
  questions,
  smbCards,
  SURVEY_URL,
  verticalPacks,
  WHATSAPP_URL,
} from "./data/content";

function Contact({ label = "Contanos qué querés resolver" }: { label?: string }) {
  return <a className="button" href={WHATSAPP_URL}>{label} <span aria-hidden="true">↗</span></a>;
}

function Status({ children }: { children: string }) {
  return <span className="status-badge">{children}</span>;
}

function AudienceDoorways() {
  return (
    <section className="doorways shell" id="audiences" aria-label="Elegí tu camino">
      <div className="doorways-intro"><p className="eyebrow">Una marca, tres caminos</p><p>Elegí la conversación que más se parece a tu operación.</p></div>
      <div className="doorway-grid">
        {audienceCards.map((card) => <a className={`doorway doorway-${card.id}`} href={card.href} key={card.id}><span className="doorway-kicker">{card.eyebrow}</span><strong>{card.title}</strong><span>{card.copy}</span><span className="doorway-arrow" aria-hidden="true">↓</span></a>)}
      </div>
    </section>
  );
}

function CommercialQr() {
  const [qr, setQr] = useState("");
  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(SURVEY_URL, { width: 640, margin: 4, errorCorrectionLevel: "M", color: { dark: "#162b29", light: "#ffffff" } }).then((value) => { if (active) setQr(value); }).catch(() => { if (active) setQr(""); });
    return () => { active = false; };
  }, []);
  return <a className="qr-link" href={SURVEY_URL} aria-label="Abrir la VTV gratuita de PymIA">{qr && <img src={qr} width="240" height="240" alt="Código QR para abrir la VTV gratuita de PymIA" />}<span>Escaneá o tocá para completar la VTV gratuita ↗</span></a>;
}

function CommerceSection() {
  return <section className="audience-section section-commerce" id="commerce"><div className="shell section-inner">
    <div className="section-head"><div><p className="eyebrow">E-commerce</p><h2>Vendé online con menos fricción y más control.</h2></div><p>Conectamos tus marketplaces, sistemas y datos para entender rentabilidad, operación y problemas reales sin reemplazar todo lo que ya usás.</p></div>
    <div className="card-grid commerce-grid">{commerceCards.map((card) => <article className="info-card" key={card.eyebrow}><div className="card-top"><span className="card-kicker">{card.eyebrow}</span><Status>{card.status}</Status></div><h3>{card.title}</h3><p>{card.copy}</p><ul className="tag-list">{card.items.map((item) => <li key={item}>{item}</li>)}</ul>{card.eyebrow === "Mercado Libre" && <a className="text-link" href={SURVEY_URL}>Quiero revisar mi operación ↗</a>}</article>)}</div>
    <div className="feature-callout"><div><p className="eyebrow">Acceso secundario</p><h3>Quiero mi VTV gratuita.</h3><p>Una revisión piloto para detectar hasta tres puntos concretos de tu operación en Mercado Libre.</p></div><a className="button button-secondary" href={SURVEY_URL}>Abrir VTV ↗</a></div>
  </div></section>;
}

function SmbSection() {
  return <section className="audience-section section-smb" id="smb"><div className="shell section-inner">
    <div className="section-head"><div><p className="eyebrow">PyMEs</p><h2>Menos trabajo manual. Más control del negocio.</h2></div><p>Conectamos administración, datos y procesos para hacer visibles los problemas que hoy quedan escondidos entre Excel, sistemas y personas.</p></div>
    <div className="smb-grid">{smbCards.map(([title, copy]) => <article className="compact-card" key={title}><span className="card-marker" aria-hidden="true">+</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    <a className="button" href={WHATSAPP_URL}>Contanos qué proceso querés mejorar ↗</a>
  </div></section>;
}

function DevsSection() {
  return <section className="audience-section section-devs" id="devs"><div className="shell section-inner">
    <div className="section-head"><div><p className="eyebrow">Devs / implementadores</p><h2>No construyas cada solución desde cero.</h2></div><p>Módulos empresariales, conocimiento vertical e integraciones reutilizables para agencias, freelancers, implementadores IA y equipos de desarrollo.</p></div>
    <div className="dev-layers">
      <article className="layer-card"><div className="layer-heading"><span className="layer-index">01</span><div><p className="card-kicker">Capa base</p><h3>Módulos</h3></div></div><div className="pill-cloud">{devModules.map((item) => <span key={item}>{item}</span>)}</div></article>
      <article className="layer-card"><div className="layer-heading"><span className="layer-index">02</span><div><p className="card-kicker">Contexto de rubro</p><h3>Vertical Packs</h3></div></div><p>El módulo resuelve el proceso. El Vertical Pack aporta lenguaje, reglas, objetos y contexto del rubro.</p><div className="pill-cloud">{verticalPacks.map((item) => <span key={item}>{item}</span>)}</div></article>
      <article className="layer-card"><div className="layer-heading"><span className="layer-index">03</span><div><p className="card-kicker">Conexiones</p><h3>Adaptadores</h3></div></div><div className="pill-cloud">{adapters.map((item) => <span key={item}>{item}</span>)}</div></article>
    </div>
    <div className="solution-formula" aria-label="Módulo más vertical más adaptador igual solución"><span>Módulo</span><b>+</b><span>Vertical</span><b>+</b><span>Adapter</span><b>=</b><strong>Solución</strong><small>Presupuestos + Taller mecánico + WhatsApp</small></div>
    <a className="button button-dev" href={WHATSAPP_URL}>Quiero construir con PymIA ↗</a>
  </div></section>;
}

function HowSection() {
  return <section className="how-section shell section" id="how"><div className="section-head"><div><p className="eyebrow">Cómo trabaja PymIA</p><h2>Conectar primero. Decidir mejor.</h2></div><p>Evidencia, trazabilidad y control humano: la tecnología ayuda a entender y ejecutar; la persona decide cuando corresponde.</p></div><div className="process-rail">{howSteps.map(([title, copy], index) => <article key={title}><span className="rail-dot" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="status-row"><Status>DISPONIBLE</Status><Status>PILOTO</Status><Status>EN DESARROLLO</Status><Status>PRÓXIMAMENTE</Status><span>El alcance se define con evidencia.</span></div></section>;
}

function App() {
  return <div className="page" id="top">
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <header className="site-header shell"><a className="brand" href="#top" aria-label="PymIA, volver al inicio"><img src="/logopymia2.jpg" width="56" height="56" alt="Logo de PymIA" fetchPriority="high" /><span><strong>PymIA</strong><small>Operaciones conectadas</small></span></a><nav aria-label="Navegación principal"><a href="#commerce">E-commerce</a><a href="#smb">PyMEs</a><a href="#devs">Devs</a><a href="#how">Cómo trabajamos</a><a href="#contacto">Contacto</a><a className="nav-cta" href={SURVEY_URL}>Quiero mi VTV ↗</a></nav></header>
    <main id="main-content">
      <section className="hero shell"><div className="hero-copy"><p className="eyebrow">PymIA / operaciones conectadas</p><h1>Tu empresa ya tiene herramientas.<br /><em>PymIA hace que trabajen juntas.</em></h1><p className="hero-lede">Conectamos e-commerce, Excel, sistemas, automatizaciones e IA para reducir trabajo manual, entender lo que está pasando y construir soluciones sobre lo que ya usás.</p><div className="actions"><Contact /><a className="button button-secondary" href="#audiences">Ver soluciones ↓</a></div></div><div className="hero-aside"><div className="aside-line"><span>01</span><span>Conectar antes que reemplazar</span></div><div className="aside-line"><span>02</span><span>Reglas claras donde importan</span></div><div className="aside-line"><span>03</span><span>Personas con el control</span></div></div></section>
      <AudienceDoorways />
      <HowSection />
      <CommerceSection />
      <SmbSection />
      <DevsSection />
      <section className="trust-section shell section"><div className="trust-copy"><p className="eyebrow">Una forma de trabajar</p><h2>La IA ayuda a entender. PymIA controla lo que tiene que ser exacto.</h2></div><div className="trust-list"><p><strong>Evidencia.</strong> No afirmamos lo que no podemos revisar.</p><p><strong>Trazabilidad.</strong> Cada proceso deja una historia que se puede seguir.</p><p><strong>Integración.</strong> Empezamos por lo que ya existe.</p></div></section>
      <section className="faq-section shell section" id="faq"><div><p className="eyebrow">Preguntas frecuentes</p><h2>Antes de empezar.</h2></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
      <section className="final-section" id="contacto"><div className="shell final-grid"><div><p className="eyebrow">La conversación empieza acá</p><h2>Contanos qué querés resolver.</h2><p>Vemos qué parte de tu operación conviene conectar, ordenar o construir.</p><div className="actions"><Contact /><a className="button button-secondary" href={SURVEY_URL}>Quiero mi VTV ↗</a></div></div><CommercialQr /></div></section>
    </main>
    <footer className="shell site-footer"><span>PymIA — Buenos Aires, Argentina.</span><nav aria-label="Navegación del pie"><a href="#commerce">E-commerce</a><a href="#smb">PyMEs</a><a href="#devs">Devs</a><a href={SURVEY_URL}>VTV</a><a href="#contacto">Contacto</a></nav><a href="#top">Volver arriba ↑</a></footer>
    <a className="event-dock" href={WHATSAPP_URL}>Contanos qué querés resolver ↗</a>
  </div>;
}

export default App;
