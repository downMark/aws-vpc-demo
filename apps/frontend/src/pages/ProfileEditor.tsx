import { useState, useEffect } from 'react'
import { ProfileForm } from '../components/ProfileForm'
import { getProfile, updateProfile } from '../api/client'
import type { GitHubProfile, UpdateProfileInput } from '../types'

export function ProfileEditor() {
  const tokenId = localStorage.getItem('selectedTokenId')

  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) return
    setLoading(true)
    setError(null)
    getProfile(tokenId)
      .then((p) => setProfile(p))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [tokenId])

  async function handleSave(data: UpdateProfileInput) {
    if (!tokenId) return
    setSuccessMsg(null)
    try {
      const updated = await updateProfile(tokenId, data)
      setProfile(updated)
      setSuccessMsg('Profile saved successfully!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile'
      alert(msg)
    }
  }

  if (!tokenId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-sm">请先在 Token 管理页面选择一个 Token</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="ml-2 text-gray-500 text-sm">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">编辑 GitHub Profile</h2>
      {successMsg && (
        <p className="text-green-600 text-sm font-medium">{successMsg}</p>
      )}
      <ProfileForm profile={profile} onSave={handleSave} />
    </div>
  )
}
