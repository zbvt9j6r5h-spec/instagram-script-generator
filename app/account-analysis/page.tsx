'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type MonthlyWeek = {
  week: number
  theme: string
  rationale: string
}

type HashtagStrategy = {
  primary: string[]
  secondary: string[]
  niche: string[]
}

type AnalysisResult = {
  strengths: string[]
  weaknesses: string[]
  contentDirection: string[]
  differentiation: string[]
  monthlyStrategy: MonthlyWeek[]
  hashtagStrategy: HashtagStrategy
}

export default function AccountAnalysisPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accountUrl, setAccountUrl] = useState('')
  const [genre, setGenre] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [postingStyle, setPostingStyle] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleAnalyze = async () => {
    setError('')
    if (!genre || !targetAudience || !postingStyle) {
      setError('ジャンル・ターゲット層・投稿スタイルを入力してください')
      return
    }

    setAnalyzing(true)
    setResult(null)

    try {
      const res = await fetch('/api/analyze-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountUrl, genre, targetAudience, postingStyle }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '分析失敗')

      setResult(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'エラーが発生しました'
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">撮影台本ジェネレーター</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-2">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            台本生成
          </button>
          <button
            onClick={() => router.push('/analyze')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            ベンチマーク分析
          </button>
          <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
            アカウント分析
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-1">アカウントを分析する</h2>
          <p className="text-xs text-gray-500 mb-4">
            アカウント情報を入力すると、AIが強み・弱みや今後の投稿戦略を分析します
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                アカウントURL <span className="text-gray-400">（任意）</span>
              </label>
              <input
                type="text"
                value={accountUrl}
                onChange={(e) => setAccountUrl(e.target.value)}
                placeholder="例：@username または https://www.instagram.com/username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                ジャンル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="例：料理、コーチング、美容サロン、フィットネス"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                ターゲット層 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="例：30代の主婦、副業したい会社員、美容に興味のある10〜20代女性"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                投稿スタイル <span className="text-red-400">*</span>
              </label>
              <textarea
                value={postingStyle}
                onChange={(e) => setPostingStyle(e.target.value)}
                placeholder="例：週3回投稿、料理の手順を縦動画で紹介。BGMあり、テロップ多め。カジュアルなトーン。フォロワー数は約1,000人"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40"
            >
              {analyzing ? '分析中...（20〜30秒かかります）' : 'アカウントを分析する'}
            </button>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">強み</div>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">弱み・改善点</div>
              <ul className="space-y-1">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-red-400 shrink-0">△</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">伸びるコンテンツの方向性</div>
              <ul className="space-y-1">
                {result.contentDirection.map((c, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-blue-500 shrink-0">→</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">競合との差別化ポイント</div>
              <ul className="space-y-1">
                {result.differentiation.map((d, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-purple-500 shrink-0">★</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">今後1ヶ月の投稿戦略</div>
              <div className="space-y-3">
                {result.monthlyStrategy.map((week) => (
                  <div key={week.week} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                        {week.week}
                      </span>
                      <span className="text-sm font-medium">{week.theme}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-8">{week.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">おすすめのハッシュタグ戦略</div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">メインタグ（投稿数が多め・認知拡大）</p>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtagStrategy.primary.map((h, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs rounded px-2 py-0.5">
                        #{h.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">サブタグ（中規模・エンゲージメント向け）</p>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtagStrategy.secondary.map((h, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs rounded px-2 py-0.5">
                        #{h.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ニッチタグ（小規模・濃いファン獲得）</p>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtagStrategy.niche.map((h, i) => (
                      <span key={i} className="bg-purple-50 text-purple-700 text-xs rounded px-2 py-0.5">
                        #{h.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const firstTheme = result.monthlyStrategy[0]?.theme ?? ''
                router.push(
                  `/dashboard?genre=${encodeURIComponent(genre)}&target=${encodeURIComponent(targetAudience)}&theme=${encodeURIComponent(firstTheme)}`
                )
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              この分析をもとに台本を生成する →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
