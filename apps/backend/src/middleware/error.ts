import type { Context, Next } from 'hono'
import { GitHubApiError } from '../types/index.js'

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return c.json({ error: err.message }, err.statusCode as 400 | 401 | 403 | 404 | 422 | 500 | 502 | 504)
    }
    if (err instanceof Error) {
      return c.json({ error: err.message }, 500)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
}
