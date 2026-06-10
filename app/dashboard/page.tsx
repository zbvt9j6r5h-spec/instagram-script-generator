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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  const durations = ['15秒', '30秒', '60秒']
  const moods = ['カジュアル', 'プロフェッショナル', '感情的・共感系', '教育的']

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
          <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
            台本生成
          </button>
          <button
            onClick={() => router.push('/analyze')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            ベンチマーク分析
          </button>
          <button
            onClick={() => router.push('/account-analysis')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            アカウント分析
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">アカウントのジャンル</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="例：料理、コーチング、美容サロン"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ターゲット</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="例：30代の主婦、副業したい会社員"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">今週伝えたいテーマ</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例：簡単に作れる朝食レシピ"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">動画の長さ</label>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      duration === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">雰囲気</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      mood === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {remainingUsage !== null && (
              <p className="text-xs text-gray-400 text-right">今月の残り回数：{remainingUsage} / 3回</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || remainingUsage === 0}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40"
            >
              {generating ? '生成中...' : '台本を生成する'}
            </button>

            {remainingUsage === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-3">
                今月の無料枠を使い切りました
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4 mb-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">つかみ</div>
              <div className="text-lg font-bold">&ldquo;{result.hook}&rdquo;</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">動画構成</div>
              {result.structure.map((s, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr_1fr] gap-2 text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500">{s.time}</span>
                  <span className="text-gray-700">{s.action}</span>
                  <span>{s.line}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">カメラ指示</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">アングル：</span>{result.camera.angle}</div>
                <div><span className="text-gray-500">位置・距離：</span>{result.camera.position}</div>
                <div><span className="text-gray-500">動き：</span>{result.camera.movement}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">セッティング</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">背景：</span>{result.staging.background}</div>
                <div><span className="text-gray-500">照明：</span>{result.staging.lighting}</div>
                <div><span className="text-gray-500">小道具：</span>{result.staging.props}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">キャプション</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.caption}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {result.hashtags.map((h, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5">
                    #{h.replace('#', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">過去の台本</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setResult(h.result)
                    setSelectedHistory(h)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`w-full text-left bg-white border rounded-xl p-4 hover:border-gray-400 transition ${
                    selectedHistory?.id === h.id ? 'border-gray-900' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{h.theme}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(h.created_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {h.genre} ・ {h.target} ・ {h.duration} ・ {h.mood}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function DashboardWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">読み込み中...</p></div>}>
      <DashboardPage />
    </Suspense>
  )
}