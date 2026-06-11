'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type ScriptResult = {
  hook: string
  structure: { time: string; action: string; line: string }[]
  camera: { angle: string; position: string; movement: string }
  staging: { background: string; lighting: string; props: string }
  caption: string
  hashtags: string[]
}

type ScriptHistory = {
  id: string
  genre: string
  target: string
  theme: string
  duration: string
  mood: string
  result: ScriptResult
  created_at: string
}

function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [genre, setGenre] = useState('')
  const [target, setTarget] = useState('')
  const [theme, setTheme] = useState('')
  const [duration, setDuration] = useState('15秒')
  const [mood, setMood] = useState('カジュアル')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<ScriptResult | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<ScriptHistory[]>([])
  const [selectedHistory, setSelectedHistory] = useState<ScriptHistory | null>(null)
  const [remainingUsage, setRemainingUsage] = useState<number | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('feature', 'generate-script')
        .gte('created_at', startOfMonth.toISOString())
      setRemainingUsage(3 - (count ?? 0))

      const { data: scripts } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (scripts) setHistory(scripts)
    }
    checkUser()
  }, [router])

  useEffect(() => {
    const g = searchParams.get('genre')
    const t = searchParams.get('target')
    const th = searchParams.get('theme')
    if (g) setGenre(g)
    if (t) setTarget(t)
    if (th) setTheme(th)
  }, [searchParams])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleGenerate = async () => {
    setError('')
    if (!genre || !target || !theme) {
      setError('ジャンル・ターゲット・テーマを入力してください')
      return
    }

    setGenerating(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ genre, target, theme, duration, mood }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '生成失敗')

      setResult(data)
      setRemainingUsage((prev) => (prev !== null ? Math.max(0, prev - 1) : null))

      if (user) {
        await supabase.from('scripts').insert({
          user_id: user.id,
          genre,
          target,
          theme,
          duration,
          mood,
          result: data,
        })

        const { data: scripts } = await supabase
          .from('scripts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (scripts) setHistory(scripts)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'エラーが発生しました'
      setError(message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-[#555]">読み込み中...</p>
      </div>
    )
  }

  const durations = ['15秒', '30秒', '60秒']
  const moods = ['カジュアル', 'プロフェッショナル', '感情的・共感系', '教育的']

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2 bg-[#0f0f0f]">
        <div className="flex border-b border-[#2a2a2a] overflow-x-auto">
          <button className="px-4 py-3 text-sm font-bold text-white border-b-2 border-white shrink-0 whitespace-nowrap min-h-[44px]">
            台本生成
          </button>
          <button
            onClick={() => router.push('/analyze')}
            className="px-4 py-3 text-sm text-[#666] hover:text-white shrink-0 whitespace-nowrap min-h-[44px] transition-colors"
          >
            ベンチマーク分析
          </button>
          <button
            onClick={() => router.push('/account-analysis')}
            className="px-4 py-3 text-sm text-[#666] hover:text-white shrink-0 whitespace-nowrap min-h-[44px] transition-colors"
          >
            アカウント分析
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#999] mb-1">アカウントのジャンル</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="例：料理、コーチング、美容サロン"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1">ターゲット</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="例：30代の主婦、副業したい会社員"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1">今週伝えたいテーマ</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例：簡単に作れる朝食レシピ"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#444]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-2">動画の長さ</label>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      duration === d
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#444] hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-2">雰囲気</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      mood === m
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#444] hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {remainingUsage !== null && (
              <p className="text-xs text-[#555] text-right">今月の残り回数：{remainingUsage} / 3回</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || remainingUsage === 0}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              {generating ? '生成中...' : '台本を生成する'}
            </button>

            {remainingUsage === 0 && <UsageLimitCard />}

            {error && (
              <div className="bg-[#1f0000] border border-[#3a0000] text-red-400 text-sm rounded-lg p-3">{error}</div>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4 mb-12">
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-2">つかみ</div>
              <div className="text-lg font-bold text-white">&ldquo;{result.hook}&rdquo;</div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">動画構成</div>
              {result.structure.map((s, i) => (
                <div key={i} className="flex flex-col sm:grid sm:grid-cols-[80px_1fr_1fr] gap-0.5 sm:gap-2 text-sm py-2 border-b border-[#2a2a2a] last:border-0">
                  <span className="text-[#555] text-xs sm:text-sm">{s.time}</span>
                  <span className="text-[#aaa]">{s.action}</span>
                  <span className="text-white">{s.line}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">カメラ指示</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-[#666]">アングル：</span><span className="text-white">{result.camera.angle}</span></div>
                <div><span className="text-[#666]">位置・距離：</span><span className="text-white">{result.camera.position}</span></div>
                <div><span className="text-[#666]">動き：</span><span className="text-white">{result.camera.movement}</span></div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">セッティング</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-[#666]">背景：</span><span className="text-white">{result.staging.background}</span></div>
                <div><span className="text-[#666]">照明：</span><span className="text-white">{result.staging.lighting}</span></div>
                <div><span className="text-[#666]">小道具：</span><span className="text-white">{result.staging.props}</span></div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#555] uppercase tracking-wider mb-3">キャプション</div>
              <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{result.caption}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {result.hashtags.map((h, i) => (
                  <span key={i} className="bg-[#2a2a2a] text-[#aaa] text-xs rounded px-2 py-0.5">
                    #{h.replace('#', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#666] mb-3">過去の台本</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setResult(h.result)
                    setSelectedHistory(h)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`w-full text-left bg-[#1a1a1a] border rounded-xl p-4 transition-colors ${
                    selectedHistory?.id === h.id ? 'border-white' : 'border-[#2a2a2a] hover:border-[#444]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-medium text-sm text-white truncate">{h.theme}</span>
                    <span className="text-xs text-[#555] shrink-0">
                      {new Date(h.created_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-[#666]">
                    {h.genre} ・ {h.target} ・ {h.duration} ・ {h.mood}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 pb-6 text-center">
          <button
            onClick={() => router.push('/feedback')}
            className="text-xs text-[#444] hover:text-[#888] underline underline-offset-2 transition-colors"
          >
            フィードバックを送る
          </button>
        </footer>
      </main>
    </div>
  )
}

function UsageLimitCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3 ${className}`}>
      <p className="text-sm font-semibold text-white">今月の無料枠（3回）を使い切りました 😢</p>
      <div className="text-sm text-[#888] leading-relaxed">
        <p className="font-medium text-[#aaa] mb-1">➕ もっと使いたい方へ</p>
        <p>LINEに登録して「追加希望」と送ると</p>
        <p>月3回 → <span className="text-white font-semibold">5回</span>に無料で増やします 🎁</p>
      </div>
      <a
        href="https://lin.ee/WhGkd90"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        <span>💬</span>
        LINE登録はこちら
      </a>
    </div>
  )
}

export default function DashboardWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><p className="text-[#555]">読み込み中...</p></div>}>
      <DashboardPage />
    </Suspense>
  )
}
