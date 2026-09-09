import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  modules,
  sellerPainPoints,
  excelSignals,
  systems,
  questions,
  SURVEY_URL,
  WHATSAPP_URL,
} from "./data/content";
function Contact({ label = "Hablemos por WhatsApp" }: { label?: string }) {
  return (
    <a className="button" href={WHATSAPP_URL}>
      {label} <span aria-hidden="true">↗</span>
    </a>
  );
}
function CommercialQr() {
  const [qr, setQr] = useState("");
  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(WHATSAPP_URL, {
      width: 640,
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#172e2b", light: "#ffffff" },
    })
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active) setQr("");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <a
      className="qr-link"
      href={WHATSAPP_URL}
      aria-label="Abrir WhatsApp para contarnos tu problema"
    >
      {qr && (
        <img
          src={qr}
          width="240"
          height="240"
          alt="Código QR para hablar con PymIA por WhatsApp"
        />
      )}
      <span>Escaneá o tocá para hablar por WhatsApp ↗</span>
    </a>
  );
}
function App() {
  return (
    <div className="page" id="top">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <header className="site-header shell">
        <a className="brand" href="#top" aria-label="PymIA, volver al inicio">
          <img
            src="/logopymia2.jpg"
            width="56"
            height="56"
            alt="Logo de PymIA"
            fetchPriority="high"
          />
          <span>
            <strong>PymIA</strong>
            <small>Operaciones conectadas</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#modulos">Módulos</a>
          <a href={SURVEY_URL}>Contanos tu problema ↗</a>
          <a href={WHATSAPP_URL}>Hablemos ↗</a>
        </nav>
      </header>
      <main id="main-content">
        <section className="hero shell">
          <p className="eyebrow">
            Experiencia Mercado Libre 2026 / Buenos Aires
          </p>
          <h1>
            Automatizamos tu operación en Mercado Libre.
            <br />
            <em>Sin tirar a la basura lo que ya usás.</em>
          </h1>
          <div className="hero-bottom">
            <div>
              <p className="hero-lede">
                Conectamos Mercado Libre, tu sistema de gestión, Excel y
                WhatsApp. Encontramos el cuello de botella y construimos la
                pieza que te falta.
              </p>
              <p className="thesis">
                Primero integramos. Migrar es la última opción.
              </p>
            </div>
            <div>
              <div className="actions">
                <Contact />
                <a className="button button-secondary" href={SURVEY_URL}>
                  Contanos tu problema ↗
                </a>
                <a className="text-link" href="#modulos">
                  Ver módulos ↓
                </a>
              </div>
              <p className="microcopy">
                Contanos qué te está trabando. Vemos si conviene conectar lo que
                ya tenés o construir una pieza puntual.
              </p>
            </div>
          </div>
        </section>
        <section className="modules shell section" id="modulos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">La pieza que te falta</p>
              <h2>Módulos</h2>
            </div>
            <p>
              Conectamos lo que ya usás y construimos sólo la parte que te
              falta.
            </p>
          </div>
          <p className="offer-note">
            Posibilidades de desarrollo e integración. Definimos el alcance
            según tu operación.
          </p>
          <div className="module-list">
            {modules.map(([title, copy, detail], index) => (
              <article className="module" key={title}>
                <span className="module-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{title}</h3>
                <div>
                  <p>{copy}</p>
                  <p className="module-detail">{detail}</p>
                </div>
              </article>
            ))}
          </div>
          <a className="text-link module-cta" href={WHATSAPP_URL}>
            ¿No ves tu problema acá? Hablemos. ↗
          </a>
        </section>
        <section className="tint" id="sellers">
          <div className="shell section split">
            <div>
              <p className="eyebrow">¿Te suena?</p>
              <h2>
                Vendés en Mercado Libre. El problema muchas veces está entre los
                sistemas.
              </h2>
              <p>
                Mercado Libre puede funcionar bien y, aun así, tu operación
                seguir dependiendo de Excel, carga manual, tu sistema de gestión
                y controles hechos a mano.
              </p>
            </div>
            <ul className="pain-list">
              {sellerPainPoints.map((pain) => (
                <li key={pain}>“{pain}”</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="shell section" id="how">
          <p className="eyebrow">De un problema a una solución puntual</p>
          <h2>Cómo trabajamos</h2>
          <div className="steps">
            {[
              [
                "Encontramos el problema",
                "Vemos dónde se corta realmente tu operación.",
              ],
              [
                "Conectamos lo que ya tenés",
                "Mercado Libre, Excel, tu sistema de gestión, WhatsApp u otras herramientas.",
              ],
              [
                "Construimos la pieza que falta",
                "Una integración, automatización, control o módulo puntual.",
              ],
            ].map(([title, copy], i) => (
              <article key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <p className="thesis">
            Primero integramos. Migrar es la última opción.
          </p>
        </section>
        <section className="shell section split" id="whatsapp">
          <div>
            <p className="eyebrow">WhatsApp para tu negocio</p>
            <h2>Tu negocio también puede hablarte por WhatsApp.</h2>
            <p>
              No para responder mensajes genéricos. Para consultar datos reales
              de tu operación y recibir sólo lo que merece atención.
            </p>
            <Contact />
          </div>
          <div className="conversation">
            <p className="example-label">Ejemplo de lo que podemos construir</p>
            <div className="message from-owner">
              <span>VOS</span>
              <p>¿Hay algo que tenga que mirar hoy?</p>
            </div>
            <div className="message">
              <span>PYMIA</span>
              <p>
                Hay diferencias de stock que conviene revisar y algunas
                publicaciones donde deberías mirar margen y costos.
              </p>
            </div>
          </div>
        </section>
        <section className="tint" id="excel">
          <div className="shell section split">
            <div>
              <p className="eyebrow">Excel bajo control</p>
              <h2>¿Tu Excel dice que ganaste pero la plata no cierra?</h2>
              <p>
                PymIA puede revisar la lógica de tu planilla, encontrar
                inconsistencias y mostrarte dónde puede estar el problema.
              </p>
            </div>
            <ul className="signal-list">
              {excelSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="shell section" id="responsibility">
          <p className="eyebrow">Tecnología con criterio</p>
          <h2>IA donde ayuda. Reglas claras donde no se puede improvisar.</h2>
          <div className="responsibilities">
            <article>
              <h3>El programa</h3>
              <p>
                Los cálculos, controles y reglas que tienen que ser exactos no
                dependen de que una IA adivine.
              </p>
            </article>
            <article>
              <h3>La IA</h3>
              <p>
                La IA sirve para entender, conversar y explicar la información
                de una forma más natural.
              </p>
            </article>
          </div>
          <p className="thesis">
            La IA ayuda a entender. El programa controla lo que tiene que ser
            exacto.
          </p>
        </section>
        <section className="tint" id="integration">
          <div className="shell section">
            <p className="eyebrow">
              No te pedimos que cambies todo lo que ya usás
            </p>
            <h2>
              Primero integramos.
              <br />
              Migrar es la última opción.
            </h2>
            <p>
              No necesitás empezar de cero para resolver un problema puntual.
            </p>
            <ul className="systems">
              {systems.map((system) => (
                <li key={system}>{system}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="shell section developer-section" id="developers">
          <div>
            <p className="eyebrow">También trabajamos con vos</p>
            <h2>¿Desarrollás o integrás sistemas?</h2>
          </div>
          <div>
            <p>
              Si un cliente te pide una capacidad que no querés construir desde
              cero, podemos desarrollar la pieza especializada y dejarla lista
              para integrar.
            </p>
            <p className="module-detail">
              Integraciones, módulos reutilizables, automatizaciones, API,
              servicios especializados, WhatsApp conectado con datos o
              soluciones con tu marca.
            </p>
            <a className="text-link" href={WHATSAPP_URL}>
              Hablemos de esa pieza ↗
            </a>
          </div>
        </section>
        <section className="shell section split" id="faq">
          <div>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2>Antes de empezar.</h2>
            <p>
              Si no vemos una forma razonable de resolver el problema, te lo
              decimos.
            </p>
            <p className="thesis">No te obligamos a cambiar todo.</p>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="final-section" id="contacto">
          <div className="shell section final-grid">
            <div>
              <p className="eyebrow">La conversación empieza acá</p>
              <h2>Contanos qué te está trabando.</h2>
              <p>
                Vemos si conviene conectar lo que ya tenés o construir una pieza
                puntual.
              </p>
              <div className="actions">
                <Contact />
                <a className="button button-secondary" href={SURVEY_URL}>
                  Contanos tu problema ↗
                </a>
              </div>
              <p className="survey-link">
                La encuesta es el acceso secundario para dejar tu caso por escrito.
              </p>
            </div>
            <CommercialQr />
          </div>
        </section>
      </main>
      <footer className="shell site-footer">
        <span>PymIA — Buenos Aires, Argentina.</span>
        <a href="#top">Volver arriba ↑</a>
      </footer>
      <a className="event-dock" href={WHATSAPP_URL}>
        Hablemos por WhatsApp ↗
      </a>
    </div>
  );
}
export default App;
