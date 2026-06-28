import { Hono } from 'hono'
import { TokenService } from '../services/token.service.js'
import { GitHubService } from '../services/github.service.js'
import { db } from '../db/index.js'
import { operationLogs } from '../db/schema.js'
import type { UpdateProfileInput } from '../types/index.js'

const router = new Hono()
const tokenService = new TokenService()
const githubService = new GitHubService()

async function logOperation(tokenId: string, action: string, success: boolean, errorMessage?: string) {
  await db.insert(operationLogs).values({ tokenId, action, success, errorMessage }).catch(() => {})
}

router.get('/profile', async (c) => {
  const tokenId = c.req.query('tokenId')
  if (!tokenId) return c.json({ error: 'tokenId is required' }, 400)

  const fullToken = await tokenService.getFullToken(tokenId)
  try {
    const profile = await githubService.getProfile(fullToken)
    await logOperation(tokenId, 'read_profile', true)
    return c.json(profile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await logOperation(tokenId, 'read_profile', false, msg)
    throw err
  }
})

router.patch('/profile', async (c) => {
  const tokenId = c.req.query('tokenId')
  if (!tokenId) return c.json({ error: 'tokenId is required' }, 400)

  const body = await c.req.json<UpdateProfileInput>()
  const fullToken = await tokenService.getFullToken(tokenId)
  try {
    const profile = await githubService.updateProfile(fullToken, body)
    await logOperation(tokenId, 'update_profile', true)
    return c.json(profile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await logOperation(tokenId, 'update_profile', false, msg)
    throw err
  }
})

export { router as githubRouter }
