import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'rikicoco0709@gmail.com'

function topN(values: (string | null)[], n: number) {
  const counts: Record<string, number> = {}
  values.forEach((v) => {
    if (v) counts[v] = (counts[v] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }))
}

export async function GET(request: NextRequest) {
  // 1. サービスロールクライアントを生成
  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (e) {
    const message = e instanceof Error ? e.message : 'サービスロールキーの設定エラー'
    console.error('[admin/stats]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // 2. トークンからユーザーを取得して管理者チェック
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { data: { user } } = await admin.auth.getUser(token)
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })
  }

  // 3. データ取得
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [allScriptsResult, monthlyCountResult, recentScriptsResult] = await Promise.all([
    admin.from('scripts').select('genre, target, theme, user_id'),
    admin.from('scripts').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    admin.from('scripts').select('genre, target, theme, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  // エラーがあれば詳細を返す
  if (allScriptsResult.error) {
    console.error('[admin/stats] scripts fetch error:', allScriptsResult.error)
    return NextResponse.json({ error: `データ取得エラー: ${allScriptsResult.error.message}` }, { status: 500 })
  }

  const scripts = allScriptsResult.data ?? []
  const totalUsers = new Set(scripts.map((s) => s.user_id)).size

  return NextResponse.json({
    totalUsers,
    totalScripts: scripts.length,
    monthlyScripts: monthlyCountResult.count ?? 0,
    topGenres: topN(scripts.map((s) => s.genre), 5),
    topTargets: topN(scripts.map((s) => s.target), 5),
    topThemes: topN(scripts.map((s) => s.theme), 5),
    recentScripts: recentScriptsResult.data ?? [],
  })
}
