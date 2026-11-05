import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

/* ------------------------------------------------------------------ */
/*  Sub-router: System health                                         */
/* ------------------------------------------------------------------ */
const health = new Hono()

health.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'universal-api-server',
    version: '1.0.0',
    environment: 'cloudflare-workers',
    timestamp: new Date().toISOString(),
  })
})

/* ------------------------------------------------------------------ */
/*  Sub-router: Universal auth (placeholder)                          */
/* ------------------------------------------------------------------ */
const auth = new Hono()

auth.get('/', (c) => {
  return c.json({
    module: 'auth',
    version: 'v1',
    status: 'placeholder',
    endpoints: [
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/logout',
      'GET  /api/v1/auth/me',
    ],
  })
})

auth.post('/login', (c) => {
  return c.json({ module: 'auth', action: 'login', status: 'placeholder' })
})

auth.post('/register', (c) => {
  return c.json({ module: 'auth', action: 'register', status: 'placeholder' })
})

auth.post('/logout', (c) => {
  return c.json({ module: 'auth', action: 'logout', status: 'placeholder' })
})

auth.get('/me', (c) => {
  return c.json({ module: 'auth', action: 'me', status: 'placeholder' })
})

/* ------------------------------------------------------------------ */
/*  Sub-router: Project Alpha (sandbox)                               */
/* ------------------------------------------------------------------ */
const projectAlpha = new Hono()

projectAlpha.get('/', (c) => {
  return c.json({
    project: 'alpha',
    status: 'sandbox',
    version: 'v1',
    message: 'Project Alpha sandbox routes',
  })
})

projectAlpha.get('/items', (c) => {
  return c.json({ project: 'alpha', items: [], count: 0 })
})

projectAlpha.post('/items', async (c) => {
  const body = await c.req.json<{ name?: string }>()
  return c.json(
    { project: 'alpha', item: { id: Date.now(), name: body.name ?? 'untitled' }, created: true },
    201
  )
})

/* ------------------------------------------------------------------ */
/*  Sub-router: Project Beta (sandbox)                                */
/* ------------------------------------------------------------------ */
const projectBeta = new Hono()

projectBeta.get('/', (c) => {
  return c.json({
    project: 'beta',
    status: 'sandbox',
    version: 'v1',
    message: 'Project Beta sandbox routes',
  })
})

projectBeta.get('/items', (c) => {
  return c.json({ project: 'beta', items: [], count: 0 })
})

projectBeta.post('/items', async (c) => {
  const body = await c.req.json<{ name?: string }>()
  return c.json(
    { project: 'beta', item: { id: Date.now(), name: body.name ?? 'untitled' }, created: true },
    201
  )
})

/* ------------------------------------------------------------------ */
/*  Main app                                                          */
/* ------------------------------------------------------------------ */
const app = new Hono()

// --- Global middleware ---
app.use('*', logger())                                    // request logging
app.use('*', cors({ origin: '*' }))                       // CORS for any frontend
app.use('*', prettyJSON())                                // pretty JSON responses

// --- Global JSON error handler ---
app.onError((err, c) => {
  console.error('[API ERROR]', err)
  return c.json(
    {
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : String(err),
    },
    500
  )
})

// --- 404 handler ---
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404)
})

// --- Route mounting ---
app.route('/', health)
app.route('/api/v1/auth', auth)
app.route('/api/v1/project-alpha', projectAlpha)
app.route('/api/v1/project-beta', projectBeta)

export default app
