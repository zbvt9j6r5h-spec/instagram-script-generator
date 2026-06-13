#!/usr/bin/env node
const fs = require('fs'), path = require('path')
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const Anthropic = require('@anthropic-ai/sdk').default
const { createClient } = require('@supabase/supabase-js')

const LINE_USER_ID = 'U3ec2ceaf46873f225d09848605779388'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ===================== LINE送信 =====================
async function pushLineMessages(texts) {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    body: JSON.stringify({ to: LINE_USER_ID, messages: texts.map(text => ({ type: 'text', text })) }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`LINE push failed: ${res.status} ${JSON.stringify(body)}`)
  console.log('✅ LINE送信成功')
}

// ===================== テキスト解析 =====================
function extractSection(catText, header) {
  const next = ['【世界のトレンド】','【日本での応用】','【今日のポイント】','【データ・数字】','【今すぐできること】','━━━'].filter(h => h !== header)
  const start = catText.indexOf(header)
  if (start === -1) return ''
  const cs = start + header.length
  let end = catText.length
  for (const n of next) { const i = catText.indexOf(n, cs); if (i !== -1 && i < end) end = i }
  return catText.slice(cs, end).trim()
}

function parsePoints(raw) {
  return raw.split('\n').map(l => l.replace(/^[・•\-\s]+/, '').trim()).filter(l => l.length > 0).slice(0, 3)
}

function parseKnowledge(fullText, dateStr) {
  const CATS = [
    { marker: '📱 Instagram・SNS', field: 'instagram' },
    { marker: '💼 ビジネス・起業', field: 'business' },
    { marker: '🎓 講座・コンサル', field: 'course' },
    { marker: '🤖 AI・テクノロジー', field: 'ai_tech' },
    { marker: '📣 マーケティング', field: 'marketing' },
    { marker: '🧠 マインドセット', field: 'mindset' },
  ]
  const result = { date: dateStr }
  const positions = CATS.map(k => ({ ...k, index: fullText.indexOf(k.marker) })).filter(k => k.index !== -1)
  for (let i = 0; i < positions.length; i++) {
    const { field, index } = positions[i]
    const nextIndex = positions[i + 1]?.index ?? -1
    const catText = nextIndex === -1 ? fullText.slice(index) : fullText.slice(index, nextIndex)
    result[field] = {
      worldTrend: extractSection(catText, '【世界のトレンド】'),
      japanApply: extractSection(catText, '【日本での応用】'),
      points: parsePoints(extractSection(catText, '【今日のポイント】')),
      data: extractSection(catText, '【データ・数字】').replace(/^→\s*/, ''),
      action: extractSection(catText, '【今すぐできること】').replace(/^→\s*/, ''),
    }
  }
  const taskSection = fullText.slice(fullText.indexOf('✅ 今日の最重要タスク') === -1 ? fullText.length : fullText.indexOf('✅ 今日の最重要タスク'))
  const taskEnd = taskSection.indexOf('💬 今日の一言')
  result.key_task = taskSection.slice(taskSection.indexOf('\n'), taskEnd === -1 ? undefined : taskEnd).replace(/^→\s*/mg, '').trim()
  const quoteSection = fullText.indexOf('💬 今日の一言') === -1 ? '' : fullText.slice(fullText.indexOf('💬 今日の一言'))
  result.quote = (quoteSection.match(/「([^」]+)」/) ?? [])[1] ?? ''
  result.quote_author = ((quoteSection.match(/―\s*(.+)/) ?? [])[1] ?? '').trim()
  return result
}

// ===================== メイン =====================
;(async () => {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const isoDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`
  const dateLabel = `${now.getUTCFullYear()}年${String(now.getUTCMonth()+1).padStart(2,'0')}月${String(now.getUTCDate()).padStart(2,'0')}日`
  const visualUrl = `https://instagram-script-generator-tau.vercel.app/daily/${isoDate}`

  console.log(`\n🔍 ${dateLabel} の学習コンテンツを生成中...\n`)

  const prompt = `あなたは世界中の最新情報をリサーチして、日本の起業家・Instagramクリエイターに毎日学びを届けるAIアシスタントです。

今日（${dateLabel}）の最新トレンドをウェブ検索でリサーチしてから、以下のフォーマットで学習コンテンツを生成してください。

【重要ルール】
- 各領域で実際にウェブ検索を行い、最新の具体的な情報を取得する
- 日本と海外（英語圏）の両方をリサーチする
- 具体的な数字・データを必ず入れる
- 「海外では〇〇、日本ではまだ〇〇」という比較視点を入れる
- ===SPLIT===は必ず2回出力すること（3分割するため）

【検索クエリ（実際に検索すること）】
- "Instagram Reels algorithm update 2026"
- "インスタグラム リール 最新アルゴリズム 2026"
- "high ticket coaching program strategy 2026"
- "AI tools marketing 2026 latest"
- "online course business model 2026"
- "副業 起業 成功事例 最新 2026"

---
出力フォーマット（===SPLIT===を必ず2箇所に入れること）：

【今日の学び】📚 ${dateLabel}

━━━━━━━━━━━━━━━
📱 Instagram・SNS
【世界のトレンド】
・（内容）
【日本での応用】
・（内容）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （数字）
【今すぐできること】
→ （アクション）

━━━━━━━━━━━━━━━
💼 ビジネス・起業
【世界のトレンド】
・（内容）
【日本での応用】
・（内容）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （数字）
【今すぐできること】
→ （アクション）

===SPLIT===

━━━━━━━━━━━━━━━
🎓 講座・コンサル
【世界のトレンド】
・（内容）
【日本での応用】
・（内容）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （数字）
【今すぐできること】
→ （アクション）

━━━━━━━━━━━━━━━
🤖 AI・テクノロジー
【世界のトレンド】
・（内容）
【日本での応用】
・（内容）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （数字）
【今すぐできること】
→ （アクション）

━━━━━━━━━━━━━━━
📣 マーケティング
【世界のトレンド】
・（内容）
【日本での応用】
・（内容）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （数字）
【今すぐできること】
→ （アクション）

===SPLIT===

━━━━━━━━━━━━━━━
🧠 マインドセット
【世界のトレンド】
・（内容）
【日本での応用】
・（内容）
【今日のポイント】
・（ポイント1）
・（ポイント2）
・（ポイント3）
【データ・数字】
→ （数字）
【今すぐできること】
→ （アクション）

━━━━━━━━━━━━━━━
✅ 今日の最重要タスク
→ （今日やるべき1つのアクション）

💬 今日の一言
「（英語原文）」
「（日本語訳）」
― （人物名・肩書き）`

  const response = await anthropic.messages.create(
    { model: 'claude-sonnet-4-6', max_tokens: 4000, tools: [{ type: 'web_search_20250305', name: 'web_search' }], messages: [{ role: 'user', content: prompt }] },
    { headers: { 'anthropic-beta': 'web-search-2025-03-05' } }
  )

  const rawText = response.content.filter(b => b.type === 'text').map(b => b.text).join('')
  const fullText = rawText.includes('【今日の学び】') ? rawText.slice(rawText.indexOf('【今日の学び】')) : rawText

  const parts = fullText.split('===SPLIT===')
  const msgs = parts.map(p => p.trim()).filter(p => p.length > 0)

  console.log(`📝 ${msgs.length}件のメッセージを生成\n`)
  msgs.forEach((m, i) => {
    console.log(`--- メッセージ ${i+1} (${m.length}文字) ---`)
    console.log(m.slice(0, 150) + (m.length > 150 ? '...' : ''))
    console.log()
  })

  // 最後のメッセージにURLを追記
  if (msgs.length > 0) msgs[msgs.length - 1] += `\n\n↓ 図解で見る\n${visualUrl}`

  console.log('📤 LINEに送信中...')
  await pushLineMessages(msgs)

  // Supabaseに保存
  console.log('💾 Supabaseに保存中...')
  const parsed = parseKnowledge(fullText, isoDate)
  const { error } = await admin.from('daily_knowledge').upsert(parsed, { onConflict: 'date' })
  if (error) console.error('❌ Supabase保存エラー:', error.message)
  else console.log(`✅ Supabase保存完了 → ${visualUrl}`)

})().catch(e => { console.error('❌', e.message); process.exit(1) })
