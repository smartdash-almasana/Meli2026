import type { Session } from '@supabase/supabase-js'
import { supabase } from './client'

export type OperatorProfile = { user_id: string; display_name: string; active: boolean }

export async function signInOperator(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) throw new Error('Correo o contraseña inválidos')
  return data.session
}

export async function signOutOperator(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error('No se pudo cerrar la sesión')
}

export async function getOperatorProfile(userId: string): Promise<OperatorProfile | null> {
  const { data, error } = await supabase.from('operator_profiles').select('user_id,display_name,active').eq('user_id', userId).maybeSingle()
  if (error) throw new Error('No se pudo cargar el perfil del entrevistador')
  return data as OperatorProfile | null
}

export { supabase }
