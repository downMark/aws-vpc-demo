import { FormEvent, useEffect, useState } from 'react'
import { createTestNote, fetchTestNotes } from '../api/client'
import type { TestNote } from '../types'

export function LinkTest() {
  const [notes, setNotes] = useState<TestNote[]>([])
  const [title, setTitle] = useState('端到端测试')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadNotes() {
    setLoading(true)
    setError(null)
    try {
      setNotes(await fetchTestNotes())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const created = await createTestNote(title, content)
      setNotes((prev) => [created, ...prev])
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">链路测试</h2>
        <p className="text-sm text-gray-500">写入一条备注来验证前端、Lambda 和 RDS 是否全部打通。</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="note-title">
            标题
          </label>
          <input
            id="note-title"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="note-content">
            内容
          </label>
          <textarea
            id="note-content"
            className="w-full min-h-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入这次测试看到的结果"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? '提交中...' : '提交测试备注'}
          </button>
          <button
            type="button"
            onClick={loadNotes}
            className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50"
          >
            刷新列表
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">最近测试记录</h3>
        {loading && <p className="text-sm text-gray-500">加载中...</p>}
        {!loading && notes.length === 0 && <p className="text-sm text-gray-500">暂无记录</p>}
        {!loading && notes.map((note) => (
          <article key={note.id} className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-semibold text-gray-900">{note.title}</h4>
              <time className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(note.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
