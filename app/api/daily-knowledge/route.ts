import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const LINE_USER_ID = 'U3ec2ceaf46873f225d09848605779388'

async function pushLineMessages(texts: string[]): Promise<void> {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: LINE_USER_ID,
      messages: texts.map(text => ({ type: 'text', text })),
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LINE push failed: ${res.status} ${body}`)
  }
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')
}

function splitMessages(full: string): [string, string, string] {
  const parts = full.split('===SPLIT===')
  return [
    (parts[0] ?? full).trim(),
    (parts[1] ?? '').trim(),
    (parts[2] ?? '').trim(),
  ]
}

export async function GET(request: NextRequest) {
  // Vercel cronはAuthorizationヘッダーでCRON_SECRETを送る
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const dateLabel = `${jstDate.getUTCFullYear()}年${String(jstDate.getUTCMonth() + 1).padStart(2, '0')}月${String(jstDate.getUTCDate()).padStart(2, '0')}日`

  const prompt = `あなたは世界中の最新情報をリサーチして、日本の起業家・Instagramクリエイターに毎日学びを届けるAIアシスタントです。

今日（${dateLabel}）の最新トレンドをウェブ検索でリサーチしてから、以下のフォーマットで学習コンテンツを生成してください。

【重要ルール】
- 各領域で実際にウェブ検索を行い、最新の具体的な情報を取得する
- 日本と海外（英語圏）の両方をリサーチする
- 具体的な数字・データを必ず入れる
- 「海外では〇〇、日本ではまだ〇〇」という比較視点を入れる
- 今すぐ実践できるアクションを入れる
- 文字数を守る（全体で約4500文字以内）

【検索クエリ（実際に検索すること）】
- "Instagram Reels algorithm update 2026"
- "インスタグラム リール 最新アルゴリズム 2026"
- "high ticket coaching program strategy 2026"
- "AI tools marketing 2026 latest"
- "online course business model 2026"
- "副業 起業 成功事例 最新 2026"

---

以下のフォーマットで出力してください。===SPLIT===は必ずそのまま出力してください。

【今日の学び】📚 ${dateLabel}

━━━━━━━━━━━━━━━
📱 Instagram・SNS
【世界のトレンド】
・（海外の最新情報）
【日本での応用】
・（日本市場での活用方法）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （具体的な統計）
【今すぐできること】
→ （具体的なアクション）

━━━━━━━━━━━━━━━
💼 ビジネス・起業
【世界のトレンド】
・（海外の最新情報）
【日本での応用】
・（日本市場での活用方法）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （具体的な統計）
【今すぐできること】
→ （具体的なアクション）

===SPLIT===

━━━━━━━━━━━━━━━
🎓 講座・コンサル
【世界のトレンド】
・（海外の最新情報）
【日本での応用】
・（日本市場での活用方法）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （具体的な統計）
【今すぐできること】
→ （具体的なアクション）

━━━━━━━━━━━━━━━
🤖 AI・テクノロジー
【世界のトレンド】
・（海外の最新情報）
【日本での応用】
・（日本市場での活用方法）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （具体的な統計）
【今すぐできること】
→ （具体的なアクション）

━━━━━━━━━━━━━━━
📣 マーケティング
【世界のトレンド】
・（海外の最新情報）
【日本での応用】
・（日本市場での活用方法）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （具体的な統計）
【今すぐできること】
→ （具体的なアクション）

===SPLIT===

━━━━━━━━━━━━━━━
🧠 マインドセット
【世界のトレンド】
・（海外の最新情報）
【日本での応用】
・（日本市場での活用方法）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （具体的な統計）
【今すぐできること】
→ （具体的なアクション）

━━━━━━━━━━━━━━━
✅ 今日の最重要タスク
→ （全領域を踏まえた今日やるべき1つのアクション）

💬 今日の一言
「（英語原文）」
「（日本語訳）」
― （人物名・肩書き）`

  const response = await anthropic.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      tools: [
        {
          type: 'web_search_20250305' as 'web_search_20250305',
          name: 'web_search',
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: { 'anthropic-beta': 'web-search-2025-03-05' },
    }
  )

  const fullText = extractText(response.content)
  if (!fullText) {
    throw new Error('Claude からテキストが取得できませんでした')
  }

  const [msg1, msg2, msg3] = splitMessages(fullText)

  const messages = [msg1, msg2, msg3].filter(m => m.length > 0)
  await pushLineMessages(messages)

  console.log(`[daily-knowledge] 送信完了 ${dateLabel} / ${messages.length}件`)
  return NextResponse.json({ ok: true, date: dateLabel, parts: messages.length })
}
