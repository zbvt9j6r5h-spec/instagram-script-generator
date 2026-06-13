#!/usr/bin/env node
const fs = require('fs'), path = require('path')
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const PAGE_ID = 'a0709720e775456d94725b3f5b64f8f2'
const CONFIG_PATH = path.resolve('.notion-config.json')

;(async () => {
  const res = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.NOTION_API_KEY,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: PAGE_ID },
      icon: { emoji: '🧠' },
      title: [{ type: 'text', text: { content: '学習ログ' } }],
      properties: {
        タイトル: { title: {} },
        日付: { date: {} },
        カテゴリ: {
          select: {
            options: [
              { name: 'Instagram・SNS', color: 'pink' },
              { name: 'ビジネス・起業', color: 'blue' },
              { name: '講座・コンサル', color: 'green' },
              { name: 'AI・テクノロジー', color: 'purple' },
              { name: 'マーケティング', color: 'orange' },
              { name: 'マインドセット', color: 'yellow' },
            ],
          },
        },
        世界のトレンド: { rich_text: {} },
        日本での応用: { rich_text: {} },
        今日のポイント: { rich_text: {} },
        'データ・数字': { rich_text: {} },
        今すぐできること: { rich_text: {} },
        実践したか: { checkbox: {} },
      },
    }),
  })
  const db = await res.json()
  if (db.object === 'error') { console.error('❌', db.message); process.exit(1) }

  const config = fs.existsSync(CONFIG_PATH) ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) : {}
  config.learningDbId = db.id
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))

  console.log('✅ 学習ログDBを作成しました')
  console.log('ID:', db.id)
  console.log('🔗', db.url)
})()
