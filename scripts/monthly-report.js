#!/usr/bin/env node
/**
 * 月次レポート生成スクリプト
 * 使い方: node scripts/monthly-report.js
 * → Notionに当月レポートページを自動生成（アプリ・LINE数値は自動入力、Instagram/Xは手動入力欄を用意）
 */

const fs = require('fs')
const path = require('path')

// .env.local を読み込む
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const { createClient } = require('@supabase/supabase-js')
const NOTION_PAGE_ID = 'a0709720e775456d94725b3f5b64f8f2'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 今月の範囲
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth()
const monthLabel = `${year}年${month + 1}月`
const startOfMonth = new Date(year, month, 1).toISOString()
const prevMonthStart = new Date(year, month - 1, 1).toISOString()
const prevMonthEnd = new Date(year, month, 1).toISOString()

// 集計ヘルパー
function countBy(arr, key) {
  const map = {}
  arr.forEach(item => {
    const v = item[key] || '不明'
    map[v] = (map[v] || 0) + 1
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

async function collectData() {
  // 台本生成回数（今月）
  const { count: monthlyScripts } = await admin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('feature', 'generate-script')
    .gte('created_at', startOfMonth)

  // 台本生成回数（先月）
  const { count: prevScripts } = await admin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('feature', 'generate-script')
    .gte('created_at', prevMonthStart)
    .lt('created_at', prevMonthEnd)

  // 今月の台本データ（ジャンル・ターゲット分析用）
  const { data: scriptsThisMonth } = await admin
    .from('scripts')
    .select('genre, target, user_id')
    .gte('created_at', startOfMonth)

  // ユニークユーザー数（今月）
  const uniqueUsersThisMonth = new Set((scriptsThisMonth || []).map(s => s.user_id)).size

  // 全スクリプトのユニークユーザー（累計）
  const { data: allScripts } = await admin
    .from('scripts')
    .select('user_id')
  const totalUniqueUsers = new Set((allScripts || []).map(s => s.user_id)).size

  // 人気ジャンル TOP5
  const topGenres = countBy(scriptsThisMonth || [], 'genre').slice(0, 5)

  // 人気ターゲット TOP5
  const topTargets = countBy(scriptsThisMonth || [], 'target').slice(0, 5)

  // LINE 登録者総数
  const { count: totalLine } = await admin
    .from('line_users')
    .select('*', { count: 'exact', head: true })

  // LINE 今月の新規登録
  const { count: newLine } = await admin
    .from('line_users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)

  return {
    monthlyScripts: monthlyScripts ?? 0,
    prevScripts: prevScripts ?? 0,
    uniqueUsersThisMonth,
    totalUniqueUsers,
    topGenres,
    topTargets,
    totalLine: totalLine ?? 0,
    newLine: newLine ?? 0,
  }
}

// Notionブロック helpers
const t = (c) => ({ type: 'text', text: { content: c } })
const tb = (c) => ({ type: 'text', text: { content: c }, annotations: { bold: true } })
const tg = (c) => ({ type: 'text', text: { content: c }, annotations: { color: 'gray' } })
const h2 = (c) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: [t(c)] } })
const h3 = (c) => ({ object: 'block', type: 'heading_3', heading_3: { rich_text: [t(c)] } })
const p = (...parts) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: parts } })
const div = () => ({ object: 'block', type: 'divider', divider: {} })
const callout = (text, emoji, color) => ({ object: 'block', type: 'callout', callout: { rich_text: [t(text)], icon: { emoji }, color } })
const row = (label, value, note) => ({
  object: 'block', type: 'bulleted_list_item',
  bulleted_list_item: {
    rich_text: [
      tb(label + '　'),
      t(value),
      ...(note ? [tg('　' + note)] : [])
    ]
  }
})
const blank = (label) => ({
  object: 'block', type: 'bulleted_list_item',
  bulleted_list_item: { rich_text: [tb(label + '　'), tg('← ここに入力')] }
})

function diff(current, prev) {
  if (prev === 0) return ''
  const d = current - prev
  return d >= 0 ? `（先月比 +${d}）` : `（先月比 ${d}）`
}

async function createReport(data) {
  const scriptsDiff = diff(data.monthlyScripts, data.prevScripts)

  const blocks = [
    callout(`${monthLabel}のレポートです。Instagram・X の数値は手動で入力してください。アプリ・LINE は自動集計済みです。`, '📊', 'yellow_background'),
    div(),

    // Instagram
    h2('📱 Instagram'),
    callout('Instagram Insights（スマホアプリ or Creator Studio）から数値をコピーして入力してください', '✏️', 'gray_background'),
    h3('フォロワー'),
    blank('フォロワー総数'),
    blank('今月の新規フォロワー'),
    blank('先月比'),
    h3('リーチ・インプレッション'),
    blank('リーチ（ユニークアカウント）'),
    blank('インプレッション'),
    blank('プロフィールアクセス数'),
    blank('Webサイトクリック数'),
    h3('オーディエンス属性（Insightsの「フォロワー」タブ）'),
    blank('年齢層 1位'),
    blank('年齢層 2位'),
    blank('性別比率（女性 / 男性）'),
    blank('地域 1位'),
    blank('地域 2位'),
    h3('投稿パフォーマンス'),
    blank('今月の投稿数'),
    blank('平均リーチ / 投稿'),
    blank('最もリーチした投稿'),
    div(),

    // X
    h2('🐦 X（Twitter）'),
    callout('X Analytics（analytics.twitter.com）から確認できます', '✏️', 'gray_background'),
    blank('フォロワー総数'),
    blank('今月の新規フォロワー'),
    blank('インプレッション合計'),
    blank('プロフィールアクセス数'),
    blank('今月の投稿数'),
    div(),

    // LINE（自動）
    h2('💬 LINE'),
    row('友だち総数', `${data.totalLine} 人`),
    row('今月の新規登録', `${data.newLine} 人`),
    div(),

    // アプリ（自動）
    h2('🤖 アプリ（InstaScript AI）'),
    h3('ユーザー'),
    row('累計ユニークユーザー', `${data.totalUniqueUsers} 人`),
    row('今月のアクティブユーザー', `${data.uniqueUsersThisMonth} 人`),
    h3('台本生成'),
    row('今月の生成回数', `${data.monthlyScripts} 回`, scriptsDiff),
    h3(`人気ジャンル TOP${data.topGenres.length}（今月）`),
    ...data.topGenres.map(([genre, count], i) => row(`${i + 1}位　${genre}`, `${count} 回`)),
    h3(`人気ターゲット TOP${data.topTargets.length}（今月）`),
    ...data.topTargets.map(([target, count], i) => row(`${i + 1}位　${target}`, `${count} 回`)),
    div(),

    // 振り返り
    h2('📝 今月の振り返り'),
    callout('月末にここを記入してください', '✏️', 'gray_background'),
    blank('よかったこと'),
    blank('課題・改善点'),
    blank('来月の目標'),
  ]

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.NOTION_API_KEY,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: NOTION_PAGE_ID },
      icon: { emoji: '📊' },
      properties: {
        title: [{ type: 'text', text: { content: `📊 ${monthLabel} 月次レポート` } }]
      },
      children: blocks,
    }),
  })

  const page = await res.json()
  if (page.object === 'error') throw new Error(page.message)
  return page.url
}

;(async () => {
  console.log(`\n📊 ${monthLabel} 月次レポートを生成中...\n`)

  const data = await collectData()

  console.log('【自動集計結果】')
  console.log(`  アクティブユーザー（今月）: ${data.uniqueUsersThisMonth} 人`)
  console.log(`  累計ユニークユーザー: ${data.totalUniqueUsers} 人`)
  console.log(`  台本生成（今月）: ${data.monthlyScripts} 回`)
  console.log(`  LINE友だち総数: ${data.totalLine} 人`)
  console.log(`  LINE新規登録（今月）: ${data.newLine} 人`)
  if (data.topGenres.length > 0) {
    console.log(`  人気ジャンル1位: ${data.topGenres[0][0]} (${data.topGenres[0][1]}回)`)
  }

  const url = await createReport(data)

  console.log(`\n✅ Notionにレポートを作成しました`)
  console.log(`🔗 ${url}\n`)
  console.log('Instagram・X の数値はNotionページを開いて手動で入力してください。\n')
})()
