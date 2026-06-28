import { GitHubApiError, GitHubProfile, UpdateProfileInput } from '../types/index.js'

const GITHUB_API = 'https://api.github.com'
const TIMEOUT_MS = 8000

function buildHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'aws-vpc-demo/1.0',
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new GitHubApiError('GitHub API request timed out', 504)
    }
    throw err
  } finally {
    clearTimeout(timerId)
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  let message = `GitHub API error: ${response.status}`
  try {
    const body = (await response.json()) as { message?: string }
    if (body.message) {
      message = body.message
    }
  } catch {
    // ignore JSON parse error, keep default message
  }

  throw new GitHubApiError(message, response.status)
}

export class GitHubService {
  async getProfile(token: string): Promise<GitHubProfile> {
    const response = await fetchWithTimeout(
      `${GITHUB_API}/user`,
      {
        method: 'GET',
        headers: buildHeaders(token),
      },
      TIMEOUT_MS
    )

    return handleResponse<GitHubProfile>(response)
  }

  async updateProfile(token: string, data: UpdateProfileInput): Promise<GitHubProfile> {
    // Filter out undefined fields so only provided fields are sent
    const body: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        body[key] = value
      }
    }

    const response = await fetchWithTimeout(
      `${GITHUB_API}/user`,
      {
        method: 'PATCH',
        headers: {
          ...buildHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      TIMEOUT_MS
    )

    return handleResponse<GitHubProfile>(response)
  }
}
