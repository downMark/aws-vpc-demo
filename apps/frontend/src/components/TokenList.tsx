import type { MaskedToken } from '../types'

interface TokenListProps {
  tokens: MaskedToken[]
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  selectedId: string | null
}

export default function TokenList({ tokens, onDelete, onSelect, selectedId }: TokenListProps) {
  if (tokens.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 text-sm">
        暂无 Token，请添加
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {tokens.map((t) => {
          const isSelected = t.id === selectedId
          return (
            <li
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'border-l-4 border-blue-500 bg-blue-50' : 'border-l-4 border-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{t.maskedToken}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.githubLogin ?? '未知'} &middot;{' '}
                  {new Date(t.createdAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(t.id)
                }}
                className="ml-4 shrink-0 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                删除
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
