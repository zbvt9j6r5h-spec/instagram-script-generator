import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { LEARNING_DB_ID } from '@/lib/notion-learning'

const LINE_USER_ID = 'U3ec2ceaf46873f225d09848605779388'
const NOTION_PAGE_ID = 'a0709720e775456d94725b3f5b64f8f2'

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

async function fetchLastMonthLogs(): Promise<{ logs: string; monthLabel: string; count: number }> {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() // 現在月（0-indexed）

  const prevYear = month === 0 ? year - 1 : year
  const prevMonth = month === 0 ? 12 : month
  const startDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const monthLabel = `${prevYear}年${prevMonth}月`

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
          { property: '日付', date: { before: endDate } },
        ],
      },
      sorts: [{ property: 'カテゴリ', direction: 'ascending' }],
      page_size: 100,
    }),
  })

  const data = await res.json()
  if (!data.results?.length) return { logs: '', monthLabel, count: 0 }

  const lines: string[] = []
  for (const page of data.results) {
    const p = page.properties
    const cat = p['カテゴリ']?.select?.name ?? ''
    const trend = p['世界のトレンド']?.rich_text?.[0]?.text?.content ?? ''
    const points = p['今日のポイント']?.rich_text?.[0]?.text?.content ?? ''
    const action = p['今すぐできること']?.rich_text?.[0]?.text?.content ?? ''
    lines.push(`[${cat}] トレンド:${trend} | ポイント:${points} | アクション:${action}`)
  }

  return { logs: lines.join('\n'), monthLabel, count: data.results.length }
}

async function saveMindmapToNotion(title: string, markdownContent: string): Promise<string> {
  const blocks = markdownContent.split('\n').map(line => {
    if (line.startsWith('# ')) return { object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] } }
    if (line.startsWith('## ')) return { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] } }
    if (line.startsWith('### ')) return { object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] } }
    if (line.startsWith('- ')) return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] } }
    if (line.startsWith('  - ')) return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] } }
    if (line.trim() === '') return { object: 'block', type: 'paragraph', paragraph: { rich_text: [] } }
    return { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: line } }] } }
  })

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: NOTION_PAGE_ID },
      icon: { emoji: '🗺️' },
      properties: { title: [{ type: 'text', text: { content: title } }] },
      children: blocks.slice(0, 100),
    }),
  })

  const page = await res.json()
  if (page.object === 'error') throw new Error(page.message)
  return page.url
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { logs, monthLabel, count } = await fetchLastMonthLogs()
  if (!logs) {
    console.log('[monthly-mindmap] 先月のログなし')
    return NextResponse.json({ ok: true, skipped: true })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `以下は${monthLabel}の学習ログ（${count}件）です。このデータをもとに知識マップをMarkdown形式で生成してください。

【学習ログ】
${logs}

以下のフォーマットで出力してください：

# ${monthLabel}の知識マップ

## 中心テーマ：Instagram×AI自動化ビジネス

### 📱 Instagram・SNS
- アルゴリズム
  - （今月の主要な知見）
- コンテンツ戦略
  - （今月の主要な知見）

### 💼 ビジネス・起業
- （カテゴリ名）
  - （今月の主要な知見）

### 🎓 講座・コンサル
- （カテゴリ名）
  - （今月の主要な知見）

### 🤖 AI・テクノロジー
- （カテゴリ名）
  - （今月の主要な知見）

### 📣 マーケティング
- （カテゴリ名）
  - （今月の主要な知見）

### 🧠 マインドセット
- （カテゴリ名）
  - （今月の主要な知見）

## 今月の気づき・つながり
（カテゴリを横断した洞察・共通パターン）

## 来月に活かすこと
- （具体的なアクション1）
- （具体的なアクション2）
- （具体的なアクション3）`,
    }],
  })

  const mindmap = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  const pageTitle = `🗺️ ${monthLabel} 知識マップ`
  const notionUrl = await saveMindmapToNotion(pageTitle, mindmap)
  console.log(`[monthly-mindmap] Notion保存完了: ${notionUrl}`)

  const lineMsg = `🗺️ ${monthLabel}の知識マップを作成しました！

${count}件の学習ログから知識を体系化しました。

📖 Notionで確認
${notionUrl}

来月もインプット→アウトプットを継続しましょう💪`

  await pushLineMessage(lineMsg)
  console.log(`[monthly-mindmap] LINE送信完了 ${monthLabel}`)

  return NextResponse.json({ ok: true, month: monthLabel, count, notionUrl })
}
