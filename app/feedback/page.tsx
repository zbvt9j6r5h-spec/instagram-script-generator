'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const CATEGORIES = ['使いやすさ', '台本の質', '機能の要望', 'その他']

export default function FeedbackPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('メッセージを入力してください')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ rating: rating || null, category: category || null, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '送信に失敗しました')
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-lg font-bold mb-2">ありがとうございます！</h2>
          <p className="text-sm text-gray-500 mb-6">
            フィードバックを受け付けました。改善に役立てます。
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">撮影台本ジェネレーター</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-900 py-2 px-2 min-h-[44px] flex items-center"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-1">フィードバックを送る</h2>
          <p className="text-xs text-gray-500 mb-6">
            ご意見・ご要望をお聞かせください。サービス改善に活用します。
          </p>

          <div className="space-y-5">
            {/* 満足度 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                満足度 <span className="text-gray-400">（任意）</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl leading-none transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-200'}>
                      ★
                    </span>
                  </button>
                ))}
                {rating > 0 && (
                  <button
                    onClick={() => setRating(0)}
                    className="text-xs text-gray-400 hover:text-gray-600 ml-1 self-center"
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                カテゴリ <span className="text-gray-400">（任意）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(category === c ? '' : c)}
                    className={`px-4 py-2 rounded-full text-sm border min-h-[44px] ${
                      category === c
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* メッセージ */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                メッセージ <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ご意見・ご要望・バグ報告などをご記入ください"
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-gray-500 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{message.length} 文字</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !message.trim()}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 min-h-[44px]"
            >
              {submitting ? '送信中...' : 'フィードバックを送信する'}
            </button>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
