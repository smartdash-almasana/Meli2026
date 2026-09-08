import { meliGet } from '../client/meli-client'

export interface MeliUserIdentity {
  id: string
  nickname: string
  siteId?: string
}

interface MeliUserResponse {
  id: string | number
  nickname: string
  site_id?: string
}

export async function getCurrentMeliUser(accessToken: string, fetchFn: typeof fetch = fetch): Promise<MeliUserIdentity> {
  const user = await meliGet<MeliUserResponse>('/users/me', accessToken, fetchFn)
  if (user.id === undefined || !user.nickname) throw new Error('Meli user response is incomplete')
  return { id: String(user.id), nickname: user.nickname, ...(user.site_id ? { siteId: user.site_id } : {}) }
}

