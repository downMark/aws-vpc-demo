import { Hono } from 'hono'
import { TokenService } from '../services/token.service.js'

const router = new Hono()
const tokenService = new TokenService()

router.get('/', async (c) => {
  const tokens = await tokenService.list()
  return c.json(tokens)
})

router.post('/', async (c) => {
  const body = await c.req.json<{ name: string; token: string }>()
  if (!body.name || !body.token) {
    return c.json({ error: 'name and token are required' }, 400)
  }
  const created = await tokenService.create({ name: body.name, token: body.token })
  return c.json(created, 201)
})

router.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await tokenService.delete(id)
  return c.json({ success: true })
})

export { router as tokensRouter }
