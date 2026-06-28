import { useEffect, useState } from 'react'
import type { MaskedToken } from '../types'
import { fetchTokens, deleteToken } from '../api/client'
import TokenForm from '../components/TokenForm'
import TokenList from '../components/TokenList'

const STORAGE_KEY = 'selectedTokenId'

export default function TokenManager() {
  const [tokens, setTokens] = useState<MaskedToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  )

  async function loadTokens() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTokens()
      setTokens(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tokens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTokens()
  }, [])

  function handleSelect(id: string) {
    setSelectedTokenId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  async function handleDelete(id: string) {
    try {
      await deleteToken(id)
      setTokens((prev) => prev.filter((t) => t.id !== id))
      if (selectedTokenId === id) {
        setSelectedTokenId(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Request failed')
    }
  }

  const selectedToken = tokens.find((t) => t.id === selectedTokenId) ?? null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Token 管理</h2>

      <TokenForm onSuccess={loadTokens} />

      {selectedToken && (
        <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-sm text-blue-800">
          已选择 Token: <span className="font-semibold">{selectedToken.githubLogin ?? '未知'}</span>
          ，切换到 Profile 编辑页
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-500 text-center py-4">加载中...</p>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center py-4">{error}</p>
      )}

      {!loading && !error && (
        <TokenList
          tokens={tokens}
          onDelete={handleDelete}
          onSelect={handleSelect}
          selectedId={selectedTokenId}
        />
      )}
    </div>
  )
}
