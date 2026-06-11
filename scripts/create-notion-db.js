const NOTION_API_KEY = process.env.NOTION_API_KEY
const PAGE_ID = 'a0709720e775456d94725b3f5b64f8f2'

if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY が設定されていません。.env.local を確認してください。')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
}

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data.message), { data })
  return data
}

async function getOrCreateParentPage() {
  // 指定ページが使えるか確認
  try {
    const page = await notion('GET', `/pages/${PAGE_ID}`)
    if (!page.archived && !page.in_trash) {
      console.log(`✅ 既存ページを使用: ${page.properties?.title?.title?.[0]?.plain_text ?? PAGE_ID}`)
      return PAGE_ID
    }
    console.log('⚠️  指定ページはゴミ箱にあります。新しいページを作成します...')
  } catch (e) {
    console.log('⚠️  指定ページにアクセスできません。新しいページを作成します...')
  }

  // 新しい親ページを作成
  const newPage = await notion('POST', '/pages', {
    parent: { type: 'workspace', workspace: true },
    properties: {
      title: [{ type: 'text', text: { content: 'InstaScript AI タスク管理' } }],
    },
  })
  console.log(`✅ 新しいページを作成: ${newPage.url}`)
  return newPage.id
}

async function createDatabase(parentId) {
  return await notion('POST', '/databases', {
    parent: { type: 'page_id', page_id: parentId },
    title: [{ type: 'text', text: { content: 'タスク管理' } }],
    properties: {
      タスク名: { title: {} },
      ステータス: {
        select: {
          options: [
            { name: '未着手', color: 'red' },
            { name: '進行中', color: 'yellow' },
            { name: '完了', color: 'green' },
          ],
        },
      },
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
      メモ: { rich_text: {} },
    },
  })
}

async function main() {
  console.log('🚀 Notionタスクデータベースを作成します...\n')

  const parentId = await getOrCreateParentPage()
  const db = await createDatabase(parentId)

  console.log('\n✅ データベース作成完了！')
  console.log(`📋 データベースID: ${db.id}`)
  console.log(`🔗 URL: ${db.url}`)
}

main().catch((e) => {
  console.error('❌ エラー:', e.message)
  if (e.data) console.error(JSON.stringify(e.data, null, 2))
  process.exit(1)
})
