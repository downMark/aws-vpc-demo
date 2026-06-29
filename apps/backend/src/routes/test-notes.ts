import { desc } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/index.js'
import { testNotes } from '../db/schema.js'

const router = new Hono()

router.get('/', async (c) => {
  const notes = await db.select().from(testNotes).orderBy(desc(testNotes.createdAt)).limit(20)
  return c.json(notes)
})

router.post('/', async (c) => {
  const body = await c.req.json<{ title?: string; content?: string }>()
  const title = body.title?.trim()
  const content = body.content?.trim()

  if (!title || !content) {
    return c.json({ error: 'title and content are required' }, 400)
  }

  const [created] = await db
    .insert(testNotes)
    .values({ title, content })
    .returning()

  return c.json(created, 201)
})

export { router as testNotesRouter }
