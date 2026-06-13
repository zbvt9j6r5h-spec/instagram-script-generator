'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'rikicoco0709@gmail.com'

type Stats = {
  totalUsers: number
  totalScripts: number
  monthlyScripts: number
  topGenres: { name: string; count: number }[]
  topTargets: { name: string; count: number }[]
  topThemes: { name: string; count: number }[]
  recentScripts: { genre: string; target: string; theme: string; created_at: string }[]
}
export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      if (user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || `データの取得に失敗しました (HTTP ${res.status})`)
        setLoading(false)
        return
      }
      setStats(await res.json())
      setLoading(false)
    }
    init()
  }, [router])

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-lg w-full">
          <p className="text-sm font-bold text-red-600 mb-2">エラーが発生しました</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-gray-500 underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">管理者ダッシュボード</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← アプリへ戻る
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-xs text-gray-500 mb-1">総ユーザー数</p>
            <p className="text-3xl font-bold">{stats!.totalUsers}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-xs text-gray-500 mb-1">総台本生成数</p>
            <p className="text-3xl font-bold">{stats!.totalScripts}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-xs text-gray-500 mb-1">今月の生成数</p>
            <p className="text-3xl font-bold">{stats!.monthlyScripts}</p>
          </div>
        </div>

        {/* TOP5 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RankingCard title="ジャンル TOP5" items={stats!.topGenres} />
          <RankingCard title="ターゲット TOP5" items={stats!.topTargets} />
          <RankingCard title="テーマ TOP5" items={stats!.topThemes} />
        </div>

        {/* 直近20件 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">直近20件の生成履歴</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 pb-2 pr-4">ジャンル</th>
                  <th className="text-left text-xs text-gray-500 pb-2 pr-4">ターゲット</th>
                  <th className="text-left text-xs text-gray-500 pb-2 pr-4">テーマ</th>
                  <th className="text-left text-xs text-gray-500 pb-2">日時</th>
                </tr>
              </thead>
              <tbody>
                {stats!.recentScripts.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-4 text-gray-700 max-w-[100px] truncate">{s.genre}</td>
                    <td className="py-2 pr-4 text-gray-700 max-w-[120px] truncate">{s.target}</td>
                    <td className="py-2 pr-4 text-gray-600 max-w-[150px] truncate">{s.theme}</td>
                    <td className="py-2 text-gray-400 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats!.recentScripts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">データがありません</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function RankingCard({ title, items }: { title: string; items: { name: string; count: number }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-sm font-bold text-gray-700 mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">データがありません</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-xs flex items-center justify-center text-gray-500 shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700 truncate flex-1">{item.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{item.count}回</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
