'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MindmapClient, { type DataPayload } from '@/app/daily/[date]/MindmapClient'

type LogEntry = {
  id: string
  date: string
  key_task: string | null
  practiced_today: boolean
}

function getJSTDate(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

// 実践率を計算
function calcRate(logs: LogEntry[]): string {
  if (logs.length === 0) return '0'
  const done = logs.filter(l => l.practiced_today).length
  return Math.round((done / logs.length) * 100).toString()
}

export default function LearningPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [todayData, setTodayData] = useState<DataPayload | null>(null)
  const [practiced, setPracticed] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [savingPractice, setSavingPractice] = useState(false)

  const today = getJSTDate()
  const todayLabel = formatDate(today)

  const init = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [todayRes, logsRes] = await Promise.all([
      fetch(`/api/daily-visual?date=${today}`),
      fetch('/api/daily-knowledge/logs'),
    ])

    const todayJson = await todayRes.json()
    const logsJson = await logsRes.json()

    if (todayJson) {
      setTodayData(todayJson)
      setPracticed(todayJson.practiced_today ?? false)
    }
    if (Array.isArray(logsJson)) setLogs(logsJson)

    setLoading(false)
  }, [router, today])

  useEffect(() => { init() }, [init])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handlePracticeToggle = async () => {
    const newValue = !practiced
    setPracticed(newValue)
    setSavingPractice(true)
    try {
      await fetch('/api/daily-knowledge/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, practiced: newValue }),
      })
      setLogs(prev =>
        prev.map(l => l.date === today ? { ...l, practiced_today: newValue } : l)
      )
    } finally {
      setSavingPractice(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-[#555]">読み込み中...</p>
      </div>
    )
  }

  const rate = calcRate(logs)
  const doneCount = logs.filter(l => l.practiced_today).length

  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* ヘッダー */}
      <header className="bg-black border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">撮影台本ジェネレーター</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-[#666] hover:text-white py-2 px-2 min-h-[44px] flex items-center transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* タブナビ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
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
          <button
            onClick={() => router.push('/account-analysis')}
            className="px-4 py-3 text-sm text-[#666] hover:text-white shrink-0 whitespace-nowrap min-h-[44px] transition-colors"
          >
            アカウント分析
          </button>
          <button className="px-4 py-3 text-sm font-bold text-white border-b-2 border-white shrink-0 whitespace-nowrap min-h-[44px]">
            学びログ
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* 実践率サマリー */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 text-center">
            <p className="text-3xl font-black text-white">{rate}<span className="text-lg">%</span></p>
            <p className="text-[10px] text-[#555] mt-1 uppercase tracking-wider">実践率（30日）</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 text-center">
            <p className="text-3xl font-black text-[#22C55E]">{doneCount}</p>
            <p className="text-[10px] text-[#555] mt-1 uppercase tracking-wider">実践済み日数</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 text-center">
            <p className="text-3xl font-black text-white">{logs.length}</p>
            <p className="text-[10px] text-[#555] mt-1 uppercase tracking-wider">総ログ数</p>
          </div>
        </div>

        {/* ① 今日のマインドマップ */}
        <section>
          <h2 className="text-base font-bold text-white mb-4">
            📅 今日の学び
            <span className="ml-2 text-sm font-normal text-[#555]">{todayLabel}</span>
          </h2>
          {todayData ? (
            <MindmapClient data={todayData} label={todayLabel} />
          ) : (
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-10 text-center">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-white font-bold text-lg">本日のコンテンツは毎朝6時に配信されます</p>
              <p className="text-[#555] text-sm mt-2">LINEに届いたリンクから確認することもできます</p>
            </div>
          )}
        </section>

        {/* ② 実践チェック */}
        {todayData && (
          <section className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-5">
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-4">今日の実践チェック</p>
            <button
              onClick={handlePracticeToggle}
              disabled={savingPractice}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                practiced
                  ? 'bg-[#052e16] border-[#22C55E]'
                  : 'bg-[#111] border-[#2a2a2a] hover:border-[#444]'
              }`}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                practiced ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#555]'
              }`}>
                {practiced && <span className="text-white text-sm font-black">✓</span>}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className={`font-bold text-base leading-tight ${practiced ? 'text-[#86EFAC]' : 'text-white'}`}>
                  今日のタスクを実践した ✅
                </p>
                {todayData.key_task && (
                  <p className="text-xs text-[#555] mt-1 line-clamp-2 leading-snug">{todayData.key_task}</p>
                )}
              </div>
              {savingPractice && (
                <span className="shrink-0 text-xs text-[#555]">保存中...</span>
              )}
            </button>
          </section>
        )}

        {/* ③ 過去のログ一覧 */}
        <section>
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-4">過去30日のログ</p>
          {logs.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-8 text-center">
              <p className="text-[#555] text-sm">まだログがありません</p>
              <p className="text-[#444] text-xs mt-1">毎朝6時に自動で追加されます</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {logs.map(log => (
                <button
                  key={log.id}
                  onClick={() => router.push(`/daily/${log.date}`)}
                  className="group bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-4 text-left transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">
                        {formatDate(log.date)}
                      </p>
                      {log.key_task ? (
                        <p className="text-xs text-[#555] mt-1 line-clamp-2 leading-relaxed">{log.key_task}</p>
                      ) : (
                        <p className="text-xs text-[#333] mt-1">タスクなし</p>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {log.practiced_today ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E] bg-[#052e16] px-2 py-1 rounded-full">
                          ✓ 実践済
                        </span>
                      ) : (
                        <span className="text-xs text-[#3a3a3a] bg-[#111] px-2 py-1 rounded-full border border-[#2a2a2a]">
                          未実践
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
