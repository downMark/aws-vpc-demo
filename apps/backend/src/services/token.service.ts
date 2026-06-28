import { db } from '../db/index.js'
import { tokens } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { MaskedToken } from '../types/index.js'

function maskToken(token: string): string {
  return token.slice(0, 4) + '****'
}

function toMaskedToken(row: {
  id: string
  name: string
  token: string
  githubLogin: string | null
  createdAt: Date
}): MaskedToken {
  return {
    id: row.id,
    name: row.name,
    maskedToken: maskToken(row.token),
    githubLogin: row.githubLogin,
    createdAt: row.createdAt,
  }
}

export class TokenService {
  /**
   * 创建 token：验证 GitHub token 有效性，获取 githubLogin，存入 DB，返回脱敏结果
   */
  async create(data: { name: string; token: string }): Promise<MaskedToken> {
    // 调用 GitHub API 验证 token 并获取 githubLogin
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${data.token}`,
        'User-Agent': 'github-profile-crud',
        Accept: 'application/vnd.github+json',
      },
    })

    if (!response.ok) {
      throw new Error('Invalid GitHub token')
    }

    const githubUser = (await response.json()) as { login: string }
    const githubLogin = githubUser.login

    const [row] = await db
      .insert(tokens)
      .values({
        name: data.name,
        token: data.token,
        githubLogin,
      })
      .returning()

    return toMaskedToken(row)
  }

  /**
   * 列出所有 token（脱敏：只返回前4位 + '****'）
   */
  async list(): Promise<MaskedToken[]> {
    const rows = await db.select().from(tokens).orderBy(tokens.createdAt)
    return rows.map(toMaskedToken)
  }

  /**
   * 删除 token
   */
  async delete(id: string): Promise<void> {
    await db.delete(tokens).where(eq(tokens.id, id))
  }

  /**
   * 内部方法：根据 tokenId 获取完整 token（供路由层传给 GitHubService）
   */
  async getFullToken(id: string): Promise<string> {
    const [row] = await db
      .select({ token: tokens.token })
      .from(tokens)
      .where(eq(tokens.id, id))

    if (!row) {
      throw new Error(`Token not found: ${id}`)
    }

    return row.token
  }
}
