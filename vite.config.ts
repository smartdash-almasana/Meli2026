import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { POST as syncPost } from './api/supabase/sync'
import { POST as audioPost } from './api/supabase/audio'

async function handleApiRequest(req: import('http').IncomingMessage, res: import('http').ServerResponse, handler: (request: Request) => Promise<Response>) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  const request = new Request(`http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`, {
    method: req.method,
    headers: Object.fromEntries(Object.entries(req.headers).filter(([key, value]) => typeof value === 'string' && key !== 'content-length') as Array<[string, string]>),
    body: new Uint8Array(Buffer.concat(chunks)),
  })
  const response = await handler(request)
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(await response.text())
}

function localSyncMiddleware(mode: string): Plugin {
  return {
    name: 'meli2026-local-sync-api',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '')
      Object.assign(process.env, env)
      server.middlewares.use('/api/supabase/sync', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        await handleApiRequest(req, res, syncPost)
      })
      server.middlewares.use('/api/supabase/audio', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        await handleApiRequest(req, res, audioPost)
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localSyncMiddleware(mode)],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          storage: ['dexie'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
}))
