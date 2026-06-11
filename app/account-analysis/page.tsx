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
  const [remainingUsage, setRemainingUsage] = useState<number | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('feature', 'analyze-account')
        .gte('created_at', startOfMonth.toISOString())
      setRemainingUsage(3 - (count ?? 0))

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
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analyze-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ accountUrl, genre, targetAudience, postingStyle }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '分析失敗')

      setResult(data)
      setRemainingUsage((prev) => (prev !== null ? Math.max(0, prev - 1) : null))
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-[#555]">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-black border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">撮影台本ジェネレーター</h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm text-[#555] hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-[#666] hover:text-white py-2 px-2 min-h-[44px] flex items-center transition-colors">
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex border-b border-[#2a2a2a] overflow-x-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-3 text-sm text-[#666] hover:text-white shrink-0 whitespace-nowrap min-h-[44px] transition-colors"
          >
            台本生成
          </button>
          <button
            onClick={() => router.push('/analyze')}
            className="px-4 py-3 text-sm text-[#666] hover:text-white shrink-0 whitespace-nowrap min-h-[44px] transition-colors"
          >
            ベンチマーク分析
          </button>
          <button className="px-4 py-3 text-sm font-bold text-white border-b-2 border-white shrink-0 whitespace-nowrap min-h-[44px]">
            アカウント分析
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-6">
          <h2 className="text-sm font-bold text-white mb-1">アカウントを分析する</h2>
          <p className="text-xs text-[#666] mb-4">
            アカウント情報を入力すると、AIが強み・弱みや今後の投稿戦略を分析します
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#999] mb-1">
                アカウントURL <span className="text-[#555]">（任意）</span>
              </label>
              <input
                type="text"
                value={accountUrl}
                onChange={(e) => setAccountUrl(e.target.value)}
                placeholder="例：@username または https://www.instagram.com/username"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1">
                ジャンル <span className="text-[#666]">*</span>
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="例：料理、コーチング、美容サロン、フィットネス"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1">
                ターゲット層 <span className="text-[#666]">*</span>
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="例：30代の主婦、副業したい会社員、美容に興味のある10〜20代女性"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1">
                投稿スタイル <span className="text-[#666]">*</span>
              </label>
              <textarea
                value={postingStyle}
                onChange={(e) => setPostingStyle(e.target.value)}
                placeholder="例：週3回投稿、料理の手順を縦動画で紹介。BGMあり、テロップ多め。カジュアルなトーン。フォロワー数は約1,000人"
                rows={3}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444] resize-none"
              />
            </div>

            {remainingUsage !== null && (
              <p className="text-xs text-[#555] text-right">今月の残り回数：{remainingUsage} / 3回</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || remainingUsage === 0}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              {analyzing ? '分析中...（20〜30秒かかります）' : 'アカウントを分析する'}
            </button>

            {remainingUsage === 0 && (
              <div className="bg-[#1f1a00] border border-[#3a3000] text-[#aa9900] text-sm rounded-lg p-3">
                今月の無料枠を使い切りました
              </div>
            )}

            {error && (
              <div className="bg-[#1f0000] border border-[#3a0000] text-red-400 text-sm rounded-lg p-3">{error}</div>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">強み</div>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex gap-2 text-white">
                    <span className="text-[#aaa] shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">弱み・改善点</div>
              <ul className="space-y-1">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm flex gap-2 text-white">
                    <span className="text-[#666] shrink-0">△</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">伸びるコンテンツの方向性</div>
              <ul className="space-y-1">
                {result.contentDirection.map((c, i) => (
                  <li key={i} className="text-sm flex gap-2 text-white">
                    <span className="text-[#888] shrink-0">→</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">競合との差別化ポイント</div>
              <ul className="space-y-1">
                {result.differentiation.map((d, i) => (
                  <li key={i} className="text-sm flex gap-2 text-white">
                    <span className="text-[#888] shrink-0">★</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">今後1ヶ月の投稿戦略</div>
              <div className="space-y-3">
                {result.monthlyStrategy.map((week) => (
                  <div key={week.week} className="border border-[#2a2a2a] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white text-black text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold">
                        {week.week}
                      </span>
                      <span className="text-sm font-medium text-white">{week.theme}</span>
                    </div>
                    <p className="text-xs text-[#666] ml-8">{week.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">おすすめのハッシュタグ戦略</div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#666] mb-1">メインタグ（投稿数が多め・認知拡大）</p>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtagStrategy.primary.map((h, i) => (
                      <span key={i} className="bg-[#2a2a2a] text-[#ccc] text-xs rounded px-2 py-0.5">
                        #{h.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#666] mb-1">サブタグ（中規模・エンゲージメント向け）</p>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtagStrategy.secondary.map((h, i) => (
                      <span key={i} className="bg-[#222] text-[#aaa] text-xs rounded px-2 py-0.5 border border-[#333]">
                        #{h.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#666] mb-1">ニッチタグ（小規模・濃いファン獲得）</p>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtagStrategy.niche.map((h, i) => (
                      <span key={i} className="bg-[#1a1a1a] text-[#888] text-xs rounded px-2 py-0.5 border border-[#2a2a2a]">
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
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              この分析をもとに台本を生成する →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
