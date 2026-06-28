import { useState, useEffect, type FormEvent } from 'react'
import type { GitHubProfile, UpdateProfileInput } from '../types'

interface ProfileFormProps {
  profile: GitHubProfile
  onSave: (data: UpdateProfileInput) => Promise<void>
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [form, setForm] = useState<UpdateProfileInput>({
    name: profile.name ?? '',
    bio: profile.bio ?? '',
    company: profile.company ?? '',
    location: profile.location ?? '',
    blog: profile.blog ?? '',
    twitter_username: profile.twitter_username ?? '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: profile.name ?? '',
      bio: profile.bio ?? '',
      company: profile.company ?? '',
      location: profile.location ?? '',
      blog: profile.blog ?? '',
      twitter_username: profile.twitter_username ?? '',
    })
  }, [profile])

  function handleChange(field: keyof UpdateProfileInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Avatar + login */}
      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url}
          alt={profile.login}
          className="w-20 h-20 rounded-full object-cover border border-gray-200"
        />
        <span className="text-gray-500 text-sm font-medium">@{profile.login}</span>
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us a little about yourself"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Company"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Location"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">博客 URL</label>
          <input
            type="url"
            value={form.blog}
            onChange={(e) => handleChange('blog', e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
          <input
            type="text"
            value={form.twitter_username}
            onChange={(e) => handleChange('twitter_username', e.target.value)}
            placeholder="username (without @)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Read-only email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email"
            value={profile.email ?? ''}
            readOnly
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              保存中...
            </>
          ) : '保存'}
        </button>
      </div>
    </form>
  )
}
