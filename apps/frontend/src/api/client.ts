import type { MaskedToken, GitHubProfile, UpdateProfileInput, TestNote } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
const BASE = `${API_BASE}/api`

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { error?: string }).error || 'Request failed')
  }
  return json as T
}

export async function fetchTokens(): Promise<MaskedToken[]> {
  return request<MaskedToken[]>('/tokens')
}

export async function createToken(name: string, token: string): Promise<MaskedToken> {
  return request<MaskedToken>('/tokens', {
    method: 'POST',
    body: JSON.stringify({ name, token }),
  })
}

export async function deleteToken(id: string): Promise<void> {
  await request<{ success: true }>(`/tokens/${id}`, { method: 'DELETE' })
}

export async function getProfile(tokenId: string): Promise<GitHubProfile> {
  return request<GitHubProfile>(`/github/profile?tokenId=${encodeURIComponent(tokenId)}`)
}

export async function updateProfile(
  tokenId: string,
  data: UpdateProfileInput,
): Promise<GitHubProfile> {
  return request<GitHubProfile>(`/github/profile?tokenId=${encodeURIComponent(tokenId)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchTestNotes(): Promise<TestNote[]> {
  return request<TestNote[]>('/test-notes')
}

export async function createTestNote(title: string, content: string): Promise<TestNote> {
  return request<TestNote>('/test-notes', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })
}
