export interface MaskedToken {
  id: string
  name: string
  maskedToken: string
  githubLogin: string | null
  createdAt: string
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

export interface TestNote {
  id: string
  title: string
  content: string
  createdAt: string
}
