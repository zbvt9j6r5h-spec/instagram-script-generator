import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-admin'
import MindmapClient, { type DataPayload } from './MindmapClient'

type PageProps = { params: Promise<{ date: string }> }

async function getData(date: string): Promise<DataPayload | null> {
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
      description: 'Instagram×ビジネス×AIの最新情報を毎日図解でお届け',
      type: 'article',
    },
  }
}

export default async function DailyPage({ params }: PageProps) {
  const { date } = await params
  const data = await getData(date)
  const label = formatDateLabel(date)

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-5xl">📚</p>
          <h1 className="text-white font-bold text-xl">準備中です</h1>
          <p className="text-[#555] text-sm">{label}のコンテンツはまだ届いていません</p>
          <p className="text-[#444] text-xs">毎朝6時に更新されます</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ヘッダー：最重要タスク */}
      <div className="bg-black border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-6">
          <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] mb-1">DAILY KNOWLEDGE — {label}</p>
          <h1 className="text-xl font-black text-white mb-5">今日の学び 📚</h1>

          {data.key_task && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 60%, #1a0a3e 100%)',
                border: '1.5px solid rgba(139,92,246,0.5)',
              }}
            >
              <p className="text-[11px] text-[#a78bfa] uppercase tracking-[0.18em] font-bold mb-3">
                ✅ 今日これだけやればOK
              </p>
              <p className="text-xl font-black text-white leading-snug">{data.key_task}</p>
            </div>
          )}
        </div>
      </div>

      {/* マインドマップ本体 */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <MindmapClient data={data} label={label} />

        {/* 今日の一言 */}
        {data.quote && (
          <div className="max-w-2xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden px-8 py-10"
              style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #111 100%)', border: '1px solid #2a2a2a' }}
            >
              <span
                className="absolute top-0 left-4 leading-none select-none pointer-events-none"
                style={{ fontSize: '120px', color: 'rgba(99,102,241,0.18)', lineHeight: 1, fontFamily: 'Georgia, serif' }}
              >
                &ldquo;
              </span>
              <span
                className="absolute bottom-0 right-4 leading-none select-none pointer-events-none"
                style={{ fontSize: '120px', color: 'rgba(99,102,241,0.18)', lineHeight: 1, fontFamily: 'Georgia, serif' }}
              >
                &rdquo;
              </span>
              <div className="relative z-10 space-y-5">
                <p className="text-[10px] text-[#444] uppercase tracking-[0.2em]">— 今日の一言</p>
                <blockquote className="text-xl font-bold text-white leading-relaxed">{data.quote}</blockquote>
                {data.quote_author && (
                  <p className="text-right text-sm font-medium" style={{ color: '#6366F1' }}>
                    ― {data.quote_author}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="text-center pb-8 space-y-2 max-w-2xl mx-auto">
          <p className="text-[10px] text-[#333] uppercase tracking-widest">Powered by InstaScript AI</p>
          <a
            href="https://instagram-script-generator-tau.vercel.app"
            className="text-xs text-[#6366F1] hover:text-[#818cf8] underline underline-offset-2 transition-colors"
          >
            台本を生成してみる →
          </a>
        </footer>
      </div>
    </div>
  )
}
