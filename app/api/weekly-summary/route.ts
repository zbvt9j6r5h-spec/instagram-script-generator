import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { LEARNING_DB_ID } from '@/lib/notion-learning'

const LINE_USER_ID = 'U3ec2ceaf46873f225d09848605779388'

async function pushLineMessage(text: string): Promise<void> {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: LINE_USER_ID,
      messages: [{ type: 'text', text }],
    }),
  })
}

async function fetchLastWeekLogs(): Promise<string> {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - 7)
  const sunday = new Date(now)
  sunday.setUTCDate(now.getUTCDate() - 1)

  const startDate = monday.toISOString().slice(0, 10)
  const endDate = sunday.toISOString().slice(0, 10)

  const res = await fetch(`https://api.notion.com/v1/databases/${LEARNING_DB_ID}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: '日付', date: { on_or_after: startDate } },
          { property: '日付', date: { on_or_before: endDate } },
        ],
      },
      sorts: [{ property: '日付', direction: 'ascending' }],
    }),
  })

  const data = await res.json()
  if (!data.results?.length) return ''

  const lines: string[] = []
  for (const page of data.results) {
    const p = page.properties
    const date = p['日付']?.date?.start ?? ''
    const cat = p['カテゴリ']?.select?.name ?? ''
    const points = p['今日のポイント']?.rich_text?.[0]?.text?.content ?? ''
    const action = p['今すぐできること']?.rich_text?.[0]?.text?.content ?? ''
    const done = p['実践したか']?.checkbox ? '✅' : '❌'
    if (points) lines.push(`[${date}][${cat}] ${points} | アクション:${action} | 実践:${done}`)
  }

  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const logs = await fetchLastWeekLogs()
  if (!logs) {
    console.log('[weekly-summary] 先週のログなし')
    return NextResponse.json({ ok: true, skipped: true })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const weekLabel = `${now.getUTCFullYear()}年${String(now.getUTCMonth() + 1).padStart(2, '0')}月第${Math.ceil(now.getUTCDate() / 7)}週`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `以下は先週1週間の学習ログです。このデータをもとに週次サマリーを生成してください。

【学習ログ】
${logs}

以下のフォーマットで出力してください（合計1800文字以内）：

【今週の学びサマリー】📊 ${weekLabel}

━━━━━━━━━━━━━━━
🏆 今週の重要ポイントTOP5
1.（ポイント）
2.（ポイント）
3.（ポイント）
4.（ポイント）
5.（ポイント）

━━━━━━━━━━━━━━━
📱 Instagram・SNS まとめ
（今週学んだことの要約）

💼 ビジネス・起業 まとめ
（今週学んだことの要約）

🎓 講座・コンサル まとめ
（今週学んだことの要約）

🤖 AI・テクノロジー まとめ
（今週学んだことの要約）

📣 マーケティング まとめ
（今週学んだことの要約）

🧠 マインドセット まとめ
（今週学んだことの要約）

━━━━━━━━━━━━━━━
🎯 来週意識すること
→（具体的なアクション）

━━━━━━━━━━━━━━━
✅ 今週の実践チェック
実践できた：（✅のログから）
もっとやれた：（❌のログから）`,
    }],
  })

  const summary = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  await pushLineMessage(summary)
  console.log(`[weekly-summary] 送信完了 ${weekLabel}`)

  return NextResponse.json({ ok: true, week: weekLabel })
}
