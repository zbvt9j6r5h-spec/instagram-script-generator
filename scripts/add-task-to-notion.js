const fs = require('fs')
const path = require('path')

// .env.local を自動読み込み
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  })
}

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = '37c71f2c-b66d-8149-8c68-c1e2e8489efc'

const VALID_DEPARTMENTS = ['講座', 'セールス', 'SNS', 'サポート', '開発', '分析']
const VALID_PRIORITIES = ['高', '中', '低']

if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY が設定されていません。')
  process.exit(1)
}

const [, , taskName, department, priority, dueDate] = process.argv

if (!taskName) {
  console.error('使い方: node scripts/add-task-to-notion.js "タスク名" "担当部門" "優先度" "YYYY-MM-DD"')
  console.error('例:     node scripts/add-task-to-notion.js "X投稿を3本作る" "SNS" "高" "2026-06-12"')
  console.error(`\n担当部門: ${VALID_DEPARTMENTS.join(' / ')}`)
  console.error(`優先度:   ${VALID_PRIORITIES.join(' / ')}`)
  process.exit(1)
}

if (department && !VALID_DEPARTMENTS.includes(department)) {
  console.error(`❌ 担当部門が無効です: "${department}"`)
  console.error(`   有効な値: ${VALID_DEPARTMENTS.join(' / ')}`)
  process.exit(1)
}

if (priority && !VALID_PRIORITIES.includes(priority)) {
  console.error(`❌ 優先度が無効です: "${priority}"`)
  console.error(`   有効な値: ${VALID_PRIORITIES.join(' / ')}`)
  process.exit(1)
}

if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
  console.error(`❌ 期日の形式が無効です: "${dueDate}"`)
  console.error('   YYYY-MM-DD 形式で指定してください（例: 2026-06-12）')
  process.exit(1)
}

async function addTask() {
  const properties = {
    タスク名: {
      title: [{ type: 'text', text: { content: taskName } }],
    },
    ステータス: {
      select: { name: '未着手' },
    },
  }

  if (department) properties['担当部門'] = { select: { name: department } }
  if (priority) properties['優先度'] = { select: { name: priority } }
  if (dueDate) properties['期日'] = { date: { start: dueDate } }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'database_id', database_id: DATABASE_ID },
      properties,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data.message), { data })
  return data
}

addTask()
  .then((page) => {
    console.log(`✅ タスクを追加しました`)
    console.log(`   タスク名: ${taskName}`)
    if (department) console.log(`   担当部門: ${department}`)
    if (priority)   console.log(`   優先度:   ${priority}`)
    if (dueDate)    console.log(`   期日:     ${dueDate}`)
    console.log(`   URL: ${page.url}`)
  })
  .catch((e) => {
    console.error('❌ エラー:', e.message)
    if (e.data) console.error(JSON.stringify(e.data, null, 2))
    process.exit(1)
  })
