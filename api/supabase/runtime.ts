export interface SupabaseRuntimeConfig { url: string; serviceRoleKey: string; publishableKey: string }

export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !serviceRoleKey || !publishableKey) throw new Error('Supabase server configuration is incomplete')
  return { url: url.replace(/\/$/, ''), serviceRoleKey, publishableKey }
}
