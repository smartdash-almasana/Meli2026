import { useEffect, useRef, useState } from 'react'
import { getInterviewAudio } from '../../lib/storage/audio.repository'

type RecorderState = 'idle' | 'recording' | 'paused' | 'saved' | 'error'

interface InterviewAudioRecorderProps {
  interviewId?: string
  onSave: (blob: Blob, mimeType: string, durationSeconds: number) => Promise<void>
  onDelete: () => Promise<void>
}

function supportedMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  return candidates.find((candidate) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) ?? ''
}

export default function InterviewAudioRecorder({ interviewId, onSave, onDelete }: InterviewAudioRecorderProps) {
  const [consent, setConsent] = useState<boolean | undefined>()
  const [state, setState] = useState<RecorderState>('idle')
  const [message, setMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState<string>()
  const [duration, setDuration] = useState(0)
  const [statusText, setStatusText] = useState('Audio pendiente de sincronización')
  const recorderRef = useRef<MediaRecorder | undefined>(undefined)
  const streamRef = useRef<MediaStream | undefined>(undefined)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const elapsedRef = useRef(0)

  useEffect(() => () => {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  useEffect(() => {
    if (!interviewId) return
    let active = true
    void getInterviewAudio(interviewId).then((saved) => {
      if (!active || !saved) return
      setDuration(saved.durationSeconds)
      setAudioUrl(URL.createObjectURL(saved.blob))
      setState('saved')
      setStatusText(saved.status === 'synced' ? 'Audio sincronizado' : 'Audio pendiente de sincronización')
      setMessage(saved.status === 'synced' ? 'Audio sincronizado.' : 'Audio guardado localmente y pendiente de sincronización.')
    })
    return () => { active = false }
  }, [interviewId])

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setState('error'); setMessage('La grabación de audio no está disponible en este navegador.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = supportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      streamRef.current = stream
      recorderRef.current = recorder
      elapsedRef.current = 0
      startedAtRef.current = Date.now()
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data) }
      recorder.onerror = () => { setState('error'); setMessage('No se pudo grabar el audio. Probá de nuevo.') }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        const seconds = Math.max(1, Math.round(elapsedRef.current || (Date.now() - startedAtRef.current) / 1000))
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' })
        try {
          await onSave(blob, blob.type, seconds)
          setDuration(seconds)
          setStatusText('Audio pendiente de sincronización')
          setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(blob) })
          setState('saved')
          setMessage('Audio guardado localmente y pendiente de sincronización.')
        } catch {
          setState('error')
          setMessage('No se pudo guardar el audio localmente.')
        }
      }
      recorder.start()
      setMessage('')
      setState('recording')
    } catch {
      setState('error')
      setMessage('No se pudo acceder al micrófono. Revisá el permiso del navegador.')
    }
  }

  const pause = () => {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') {
      elapsedRef.current += (Date.now() - startedAtRef.current) / 1000
      recorder.pause()
      setState('paused')
    } else if (recorder.state === 'paused') {
      startedAtRef.current = Date.now()
      recorder.resume()
      setState('recording')
    }
  }

  const stop = () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    if (recorder.state === 'recording') elapsedRef.current += (Date.now() - startedAtRef.current) / 1000
    recorder.stop()
  }

  if (consent === undefined) return <section className="audio-panel" aria-labelledby="audio-title"><h2 id="audio-title">Grabar el relato completo</h2><p>¿La persona acepta que grabemos esta parte de la conversación?</p><div className="audio-actions"><button className="secondary-button" type="button" onClick={() => setConsent(true)}>Sí, acepta</button><button className="text-button" type="button" onClick={() => { setConsent(false); setMessage('Sin grabación de audio.') }}>No grabar</button></div></section>
  if (consent === false) return <section className="audio-panel audio-muted" aria-live="polite"><strong>Sin grabación de audio.</strong><span>La entrevista continúa normalmente.</span></section>

  return <section className="audio-panel" aria-labelledby="audio-title"><div className="audio-heading"><h2 id="audio-title">Grabar el relato completo</h2><span className={`audio-status audio-status-${state}`}>{state === 'recording' ? 'Grabando…' : state === 'paused' ? 'En pausa' : state === 'saved' ? 'Audio guardado' : 'Listo para grabar'}</span></div>{state === 'recording' || state === 'paused' ? <div className="audio-actions"><button className="secondary-button" type="button" onClick={pause}>{state === 'recording' ? 'Pausar' : 'Continuar'}</button><button className="primary-button" type="button" onClick={stop}>Finalizar grabación</button></div> : state === 'saved' && audioUrl ? <div className="audio-saved"><span>Escuchar grabación · {duration}s · {statusText}</span><audio controls src={audioUrl} /><div className="audio-actions"><button className="text-button" type="button" onClick={() => { setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return undefined }); setState('idle'); setMessage('') }}>Volver a grabar</button><button className="text-button" type="button" onClick={() => void onDelete().then(() => { setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return undefined }); setState('idle'); setMessage('Audio eliminado.') })}>Eliminar audio</button></div></div> : <button className="secondary-button" type="button" onClick={() => void start()}>Grabar audio</button>}{message && <p className="audio-message" role="status">{message}</p>}</section>
}
