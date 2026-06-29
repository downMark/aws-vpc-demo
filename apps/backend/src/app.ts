import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorMiddleware } from './middleware/error.js'
import { tokensRouter } from './routes/tokens.js'
import { githubRouter } from './routes/github.js'
import { testNotesRouter } from './routes/test-notes.js'

export const app = new Hono()

app.use('*', cors())
app.use('*', errorMiddleware)

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api/tokens', tokensRouter)
app.route('/api/github', githubRouter)
app.route('/api/test-notes', testNotesRouter)
