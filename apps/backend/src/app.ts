import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ensureDatabaseReady } from './db/index.js'
import { errorMiddleware } from './middleware/error.js'
import { tokensRouter } from './routes/tokens.js'
import { githubRouter } from './routes/github.js'

export const app = new Hono()

app.use('*', cors())
app.use('*', errorMiddleware)
app.use('/api/*', async (_c, next) => {
  await ensureDatabaseReady()
  await next()
})

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api/tokens', tokensRouter)
app.route('/api/github', githubRouter)
