export interface MaskedToken {
  id: string
  name: string
  maskedToken: string // 前4位 + '****'
  githubLogin: string | null
  createdAt: Date
}

export interface GitHubProfile {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  email: string | null
  avatar_url: string
}

export interface UpdateProfileInput {
  name?: string
  bio?: string
  company?: string
  location?: string
  blog?: string
  twitter_username?: string
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'GitHubApiError'
  }
}
