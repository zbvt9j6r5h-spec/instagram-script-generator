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
const TASK_DB_ID = '37c71f2c-b66d-8149-8c68-c1e2e8489efc'
const PAGE_ID = 'a0709720e775456d94725b3f5b64f8f2'

// 完了ログDBのIDを保存するファイル
const CONFIG_PATH = path.resolve(__dirname, '../.notion-config.json')

if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY が設定されていません。')
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

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  return {}
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

async function getOrCreateLogDatabase() {
  const config = loadConfig()
  if (config.logDatabaseId) {
    // 既存DBの存在確認
    try {
      await notion('GET', `/databases/${config.logDatabaseId}`)
      return config.logDatabaseId
    } catch {
      // 取得できなければ再作成
    }
  }

  console.log('📋 完了ログデータベースを作成します...')
  const db = await notion('POST', '/databases', {
    parent: { type: 'page_id', page_id: PAGE_ID },
    title: [{ type: 'text', text: { content: '✅ 完了ログ' } }],
    properties: {
      タスク名: { title: {} },
      担当部門: {
        select: {
          options: [
            { name: '講座', color: 'blue' },
            { name: 'セールス', color: 'orange' },
            { name: 'SNS', color: 'pink' },
            { name: 'サポート', color: 'purple' },
            { name: '開発', color: 'gray' },
            { name: '分析', color: 'brown' },
          ],
        },
      },
      優先度: {
        select: {
          options: [
            { name: '高', color: 'red' },
            { name: '中', color: 'yellow' },
            { name: '低', color: 'default' },
          ],
        },
      },
      期日: { date: {} },
      完了日: { date: {} },
    },
  })

  const config2 = loadConfig()
  config2.logDatabaseId = db.id
  saveConfig(config2)

  console.log(`✅ 完了ログDB作成: ${db.url}`)
  return db.id
}

async function getCompletedTasks() {
  const result = await notion('POST', `/databases/${TASK_DB_ID}/query`, {
    filter: { property: 'ステータス', select: { equals: '完了' } },
  })
  return result.results
}

function extractProp(page, key) {
  const prop = page.properties[key]
  if (!prop) return null
  if (prop.type === 'title') return prop.title?.[0]?.plain_text ?? null
  if (prop.type === 'select') return prop.select?.name ?? null
  if (prop.type === 'date') return prop.date?.start ?? null
  return null
}

async function copyToLog(logDbId, task) {
  const today = new Date().toISOString().slice(0, 10)
  const properties = {
    タスク名: {
      title: [{ type: 'text', text: { content: extractProp(task, 'タスク名') ?? '(無題)' } }],
    },
    完了日: { date: { start: today } },
  }
  const dept = extractProp(task, '担当部門')
  const prio = extractProp(task, '優先度')
  const due = extractProp(task, '期日')
  if (dept) properties['担当部門'] = { select: { name: dept } }
  if (prio) properties['優先度'] = { select: { name: prio } }
  if (due) properties['期日'] = { date: { start: due } }

  await notion('POST', '/pages', {
    parent: { type: 'database_id', database_id: logDbId },
    properties,
  })
}

async function archiveTask(pageId) {
  await notion('PATCH', `/pages/${pageId}`, { archived: true })
}

async function main() {
  console.log('🧹 デイリークリーンアップを開始します...\n')

  const logDbId = await getOrCreateLogDatabase()
  const completed = await getCompletedTasks()

  if (completed.length === 0) {
    console.log('✨ 完了タスクはありません。')
    return
  }

  console.log(`📦 完了タスク ${completed.length} 件を処理します:\n`)

  for (const task of completed) {
    const name = extractProp(task, 'タスク名') ?? task.id
    await copyToLog(logDbId, task)
    await archiveTask(task.id)
    console.log(`  ✅ ${name}`)
  }

  console.log(`\n🎉 完了！${completed.length} 件をログに移動してタスク一覧から削除しました。`)
}

main().catch((e) => {
  console.error('❌ エラー:', e.message)
  if (e.data) console.error(JSON.stringify(e.data, null, 2))
  process.exit(1)
})
