// 学習ログをNotionに保存するユーティリティ

const LEARNING_DB_ID = '37e71f2c-b66d-810f-9c59-f0b8f4234b0d'

type CategoryRecord = {
  category: string
  title: string
  date: string
  worldTrend: string
  japanApply: string
  todayPoints: string
  data: string
  action: string
}

const CATEGORIES = [
  { key: '📱 Instagram・SNS', name: 'Instagram・SNS' },
  { key: '💼 ビジネス・起業', name: 'ビジネス・起業' },
  { key: '🎓 講座・コンサル', name: '講座・コンサル' },
  { key: '🤖 AI・テクノロジー', name: 'AI・テクノロジー' },
  { key: '📣 マーケティング', name: 'マーケティング' },
  { key: '🧠 マインドセット', name: 'マインドセット' },
]

function extractSection(text: string, header: string): string {
  const start = text.indexOf(header)
  if (start === -1) return ''
  const contentStart = start + header.length
  const nextHeader = text.slice(contentStart).search(/【[^】]+】/)
  const raw = nextHeader === -1
    ? text.slice(contentStart)
    : text.slice(contentStart, contentStart + nextHeader)
  return raw.replace(/^[\n\r]+/, '').replace(/[\n\r]+$/, '').trim()
}

function parseCategories(fullText: string, dateStr: string): CategoryRecord[] {
  const records: CategoryRecord[] = []

  for (let i = 0; i < CATEGORIES.length; i++) {
    const { key, name } = CATEGORIES[i]
    const nextKey = CATEGORIES[i + 1]?.key ?? '✅ 今日の最重要タスク'
    const catStart = fullText.indexOf(key)
    if (catStart === -1) continue
    const catEnd = fullText.indexOf(nextKey, catStart + key.length)
    const catText = catEnd === -1 ? fullText.slice(catStart) : fullText.slice(catStart, catEnd)

    records.push({
      category: name,
      title: `${dateStr} - ${name}`,
      date: dateStr,
      worldTrend: extractSection(catText, '【世界のトレンド】'),
      japanApply: extractSection(catText, '【日本での応用】'),
      todayPoints: extractSection(catText, '【今日のポイント】'),
      data: extractSection(catText, '【データ・数字】'),
      action: extractSection(catText, '【今すぐできること】'),
    })
  }
  return records
}

function rt(text: string) {
  return text ? [{ type: 'text', text: { content: text.slice(0, 2000) } }] : []
}

async function saveRecord(record: CategoryRecord): Promise<void> {
  await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: LEARNING_DB_ID },
      properties: {
        タイトル: { title: rt(record.title) },
        日付: { date: { start: record.date } },
        カテゴリ: { select: { name: record.category } },
        世界のトレンド: { rich_text: rt(record.worldTrend) },
        日本での応用: { rich_text: rt(record.japanApply) },
        今日のポイント: { rich_text: rt(record.todayPoints) },
        'データ・数字': { rich_text: rt(record.data) },
        今すぐできること: { rich_text: rt(record.action) },
        実践したか: { checkbox: false },
      },
    }),
  })
}

export async function saveLearningToNotion(fullText: string, dateStr: string): Promise<number> {
  const records = parseCategories(fullText, dateStr)
  await Promise.all(records.map(saveRecord))
  return records.length
}

export { LEARNING_DB_ID }
