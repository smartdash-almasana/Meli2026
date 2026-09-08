import { FormEvent, useState } from 'react'
import { signInOperator } from '../../lib/supabase/auth'

export default function OperatorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await signInOperator(email.trim(), password) } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión') } finally { setBusy(false) }
  }
  return <main className="shell" aria-labelledby="login-title"><section className="shell-card login-card"><a className="survey-brand" href="http://127.0.0.1:5174/" aria-label="PymIA, volver a la presentación"><img src="/logopymia2.jpg" width="48" height="48" alt="" /><span><strong>PymIA</strong><small>Diagnóstico de operaciones</small></span></a><p className="eyebrow">Acceso para entrevistadores</p><h1 id="login-title">Iniciar sesión</h1><p className="intro">Usá la cuenta que te asignamos para el evento.</p><form onSubmit={submit} className="login-form"><label>Correo electrónico<input name="email" type="email" inputMode="email" autoComplete="username" spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button></form></section></main>
}
