import { useState } from 'react'
import { createToken } from '../api/client'

interface TokenFormProps {
  onSuccess: () => void
}

export default function TokenForm({ onSuccess }: TokenFormProps) {
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createToken(name.trim(), token.trim())
      setName('')
      setToken('')
      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">添加 Token</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名称
          </label>
          <input
            type="text"
            required
            placeholder="我的 GitHub Token"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token
          </label>
          <input
            type="password"
            required
            placeholder="ghp_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
        >
          {loading ? '添加中...' : '添加 Token'}
        </button>
      </form>
    </div>
  )
}
