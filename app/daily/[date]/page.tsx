import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-admin'
import type { CategoryData } from '@/lib/parse-knowledge'

type PageProps = { params: Promise<{ date: string }> }

type DailyRow = {
  date: string
  instagram: CategoryData | null
  business: CategoryData | null
  course: CategoryData | null
  ai_tech: CategoryData | null
  marketing: CategoryData | null
  mindset: CategoryData | null
  key_task: string | null
  quote: string | null
  quote_author: string | null
}

const CATEGORIES = [
  { key: 'instagram' as const, label: 'Instagram・SNS', emoji: '📱', border: '#E1306C', bg: 'rgba(225,48,108,0.08)' },
  { key: 'business' as const, label: 'ビジネス・起業', emoji: '💼', border: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  { key: 'course' as const, label: '講座・コンサル', emoji: '🎓', border: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { key: 'ai_tech' as const, label: 'AI・テクノロジー', emoji: '🤖', border: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
  { key: 'marketing' as const, label: 'マーケティング', emoji: '📣', border: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  { key: 'mindset' as const, label: 'マインドセット', emoji: '🧠', border: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
]

async function getData(date: string): Promise<DailyRow | null> {
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('daily_knowledge').select('*').eq('date', date).maybeSingle()
    return data
  } catch {
    return null
  }
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params
  const label = formatDateLabel(date)
  return {
    title: `今日の学び ${label} | InstaScript AI`,
    description: `${label}のInstagram・ビジネス・AI・マーケティングの最新トレンドを図解でお届け`,
    openGraph: {
      title: `📚 今日の学び ${label}`,
      description: 'Instagram×ビジネス×AIの最新情報を毎日お届け',
      type: 'article',
    },
  }
}

function CategoryCard({ cat, data }: { cat: typeof CATEGORIES[0]; data: CategoryData }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ border: `1.5px solid ${cat.border}`, background: cat.bg }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{cat.emoji}</span>
        <h3 className="text-sm font-bold text-white">{cat.label}</h3>
      </div>

      {data.worldTrend && (
        <div>
          <p className="text-[10px] text-[#666] uppercase tracking-widest mb-1">世界のトレンド</p>
          <p className="text-xs text-[#ccc] leading-relaxed line-clamp-2">{data.worldTrend}</p>
        </div>
      )}

      {data.japanApply && (
        <div>
          <p className="text-[10px] text-[#666] uppercase tracking-widest mb-1">日本での応用</p>
          <p className="text-xs text-[#ccc] leading-relaxed line-clamp-2">{data.japanApply}</p>
        </div>
      )}

      {data.points.length > 0 && (
        <div>
          <p className="text-[10px] text-[#666] uppercase tracking-widest mb-1">今日のポイント</p>
          <ul className="space-y-1">
            {data.points.map((p, i) => (
              <li key={i} className="text-xs text-white flex gap-1.5">
                <span style={{ color: cat.border }}>▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.data && (
        <div
          className="rounded-lg px-3 py-2 text-xs font-bold"
          style={{ background: `${cat.border}22`, color: cat.border }}
        >
          📊 {data.data}
        </div>
      )}

      {data.action && (
        <div className="mt-auto pt-2 border-t border-[#2a2a2a]">
          <p className="text-[10px] text-[#666] mb-1">今すぐできること</p>
          <p className="text-xs text-white font-medium">→ {data.action}</p>
        </div>
      )}
    </div>
  )
}

function ConnectionsMap() {
  const positions = [
    { x: 200, y: 60, label: '📱 SNS', color: '#E1306C' },
    { x: 340, y: 140, label: '💼 ビジネス', color: '#F59E0B' },
    { x: 340, y: 260, label: '🎓 講座', color: '#10B981' },
    { x: 200, y: 340, label: '🤖 AI', color: '#6366F1' },
    { x: 60, y: 260, label: '📣 MKT', color: '#3B82F6' },
    { x: 60, y: 140, label: '🧠 マインド', color: '#8B5CF6' },
  ]
  const center = { x: 200, y: 200 }

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-xs mx-auto" aria-label="カテゴリのつながり図">
      {positions.map((p, i) => (
        <line key={i} x1={center.x} y1={center.y} x2={p.x} y2={p.y}
          stroke={p.color} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 3" />
      ))}
      {positions.map((a, i) =>
        positions.slice(i + 1).map((b, j) => (
          <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#333" strokeWidth="1" strokeOpacity="0.3" />
        ))
      )}
      <circle cx={center.x} cy={center.y} r="28" fill="#1a1a1a" stroke="#444" strokeWidth="1.5" />
      <text x={center.x} y={center.y - 6} textAnchor="middle" fill="#aaa" fontSize="9">知識</text>
      <text x={center.x} y={center.y + 8} textAnchor="middle" fill="#aaa" fontSize="9">つながり</text>
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="36" fill="#111" stroke={p.color} strokeWidth="1.5" />
          <text x={p.x} y={p.y - 6} textAnchor="middle" fill={p.color} fontSize="14">{p.label.split(' ')[0]}</text>
          <text x={p.x} y={p.y + 10} textAnchor="middle" fill="#aaa" fontSize="8">{p.label.split(' ')[1]}</text>
        </g>
      ))}
    </svg>
  )
}

export default async function DailyPage({ params }: PageProps) {
  const { date } = await params
  const data = await getData(date)
  const label = formatDateLabel(date)

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-4xl mb-4">📚</p>
          <h1 className="text-white font-bold text-lg mb-2">本日のコンテンツは準備中です</h1>
          <p className="text-[#555] text-sm">{label}の学習コンテンツはまだ届いていません</p>
          <p className="text-[#444] text-xs mt-2">毎朝6時に更新されます</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* ヘッダー */}
      <header className="bg-black border-b border-[#1a1a1a] px-4 py-4 text-center">
        <p className="text-xs text-[#555] mb-1">DAILY KNOWLEDGE</p>
        <h1 className="text-lg font-bold text-white">今日の学び 📚 {label}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ① ヒーローカード */}
        {data.key_task && (
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl border border-[#6366F1]/40 p-6 text-center">
            <p className="text-xs text-[#6366F1] uppercase tracking-widest mb-2">今日の最重要タスク</p>
            <p className="text-xl font-bold text-white leading-relaxed">✅ {data.key_task}</p>
          </div>
        )}

        {/* ② 6カテゴリカード */}
        <div>
          <h2 className="text-xs text-[#555] uppercase tracking-widest mb-3">今日の学び</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const catData = data[cat.key]
              if (!catData) return null
              return <CategoryCard key={cat.key} cat={cat} data={catData} />
            })}
          </div>
        </div>

        {/* ③ つながり図 */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-5">
          <h2 className="text-xs text-[#555] uppercase tracking-widest mb-4 text-center">知識のつながり</h2>
          <ConnectionsMap />
        </div>

        {/* ④ 今日の一言 */}
        {data.quote && (
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 text-center space-y-3">
            <p className="text-xs text-[#555] uppercase tracking-widest">今日の一言</p>
            <blockquote className="text-base font-medium text-white leading-relaxed">
              &ldquo;{data.quote}&rdquo;
            </blockquote>
            {data.quote_author && (
              <p className="text-xs text-[#666]">― {data.quote_author}</p>
            )}
          </div>
        )}

        {/* ⑤ フッター */}
        <footer className="text-center pb-8">
          <p className="text-xs text-[#444] mb-2">台本生成AIツール</p>
          <a
            href="https://instagram-script-generator-tau.vercel.app"
            className="text-sm text-[#6366F1] hover:text-[#818cf8] underline underline-offset-2 transition-colors"
          >
            InstaScript AI を使ってみる →
          </a>
        </footer>
      </div>
    </div>
  )
}
