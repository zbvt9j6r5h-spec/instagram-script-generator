const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  })
}

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = '37c71f2c-b66d-8149-8c68-c1e2e8489efc'
const VALID_STATUSES = ['未着手', '進行中', '完了']

if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY が設定されていません。')
  process.exit(1)
}

const [, , taskName, newStatus] = process.argv

if (!taskName || !newStatus) {
  console.error('使い方: node scripts/update-notion-task.js "タスク名" "ステータス"')
  console.error('例:     node scripts/update-notion-task.js "X投稿を3本作る" "完了"')
  console.error(`\nステータス: ${VALID_STATUSES.join(' / ')}`)
  process.exit(1)
}

if (!VALID_STATUSES.includes(newStatus)) {
  console.error(`❌ ステータスが無効です: "${newStatus}"`)
  console.error(`   有効な値: ${VALID_STATUSES.join(' / ')}`)
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
}

async function notion(method, endpoint, body) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data.message), { data })
  return data
}

async function findTaskByName(name) {
  const result = await notion('POST', `/databases/${DATABASE_ID}/query`, {
    filter: {
      property: 'タスク名',
      title: { contains: name },
    },
  })
  return result.results
}

async function updateStatus(pageId, status) {
  return await notion('PATCH', `/pages/${pageId}`, {
    properties: {
      ステータス: { select: { name: status } },
    },
  })
}

async function main() {
  const matches = await findTaskByName(taskName)

  if (matches.length === 0) {
    console.error(`❌ タスクが見つかりません: "${taskName}"`)
    process.exit(1)
  }

  if (matches.length > 1) {
    console.log(`⚠️  ${matches.length}件ヒットしました。全て更新します。`)
  }

  for (const page of matches) {
    const title = page.properties['タスク名']?.title?.[0]?.plain_text ?? page.id
    await updateStatus(page.id, newStatus)
    console.log(`✅ 更新しました: "${title}" → ${newStatus}`)
  }
}

main().catch((e) => {
  console.error('❌ エラー:', e.message)
  if (e.data) console.error(JSON.stringify(e.data, null, 2))
  process.exit(1)
})
