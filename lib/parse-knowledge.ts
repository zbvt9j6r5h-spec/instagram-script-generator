// daily-knowledge のテキストをStructured Dataに変換するユーティリティ

export type CategoryData = {
  worldTrend: string
  japanApply: string
  points: string[]
  data: string
  action: string
}

export type DailyKnowledgeData = {
  instagram: CategoryData | null
  business: CategoryData | null
  course: CategoryData | null
  ai_tech: CategoryData | null
  marketing: CategoryData | null
  mindset: CategoryData | null
  key_task: string
  quote: string
  quote_author: string
}

const CATEGORY_KEYS = [
  { marker: '📱 Instagram・SNS', field: 'instagram' },
  { marker: '💼 ビジネス・起業', field: 'business' },
  { marker: '🎓 講座・コンサル', field: 'course' },
  { marker: '🤖 AI・テクノロジー', field: 'ai_tech' },
  { marker: '📣 マーケティング', field: 'marketing' },
  { marker: '🧠 マインドセット', field: 'mindset' },
] as const

function extractBetween(text: string, start: string, end: string): string {
  const s = text.indexOf(start)
  if (s === -1) return ''
  const contentStart = s + start.length
  const e = text.indexOf(end, contentStart)
  return (e === -1 ? text.slice(contentStart) : text.slice(contentStart, e)).trim()
}

function extractSection(catText: string, header: string): string {
  const next = ['【世界のトレンド】', '【日本での応用】', '【今日のポイント】', '【データ・数字】', '【今すぐできること】', '━━━']
    .filter(h => h !== header)
  const start = catText.indexOf(header)
  if (start === -1) return ''
  const contentStart = start + header.length
  let end = catText.length
  for (const n of next) {
    const i = catText.indexOf(n, contentStart)
    if (i !== -1 && i < end) end = i
  }
  return catText.slice(contentStart, end).trim()
}

function parsePoints(raw: string): string[] {
  return raw.split('\n')
    .map(l => l.replace(/^[・•\-\s]+/, '').trim())
    .filter(l => l.length > 0)
    .slice(0, 3)
}

function parseCategorySection(text: string, markerIndex: number, nextMarkerIndex: number): CategoryData {
  const catText = text.slice(markerIndex, nextMarkerIndex === -1 ? undefined : nextMarkerIndex)
  return {
    worldTrend: extractSection(catText, '【世界のトレンド】'),
    japanApply: extractSection(catText, '【日本での応用】'),
    points: parsePoints(extractSection(catText, '【今日のポイント】')),
    data: extractSection(catText, '【データ・数字】').replace(/^→\s*/, ''),
    action: extractSection(catText, '【今すぐできること】').replace(/^→\s*/, ''),
  }
}

export function parseKnowledgeText(fullText: string): DailyKnowledgeData {
  const result: DailyKnowledgeData = {
    instagram: null, business: null, course: null,
    ai_tech: null, marketing: null, mindset: null,
    key_task: '', quote: '', quote_author: '',
  }

  // 各カテゴリの位置を検索して解析
  const positions = CATEGORY_KEYS.map(k => ({
    ...k,
    index: fullText.indexOf(k.marker),
  })).filter(k => k.index !== -1)

  for (let i = 0; i < positions.length; i++) {
    const { field, index } = positions[i]
    const nextIndex = positions[i + 1]?.index ?? -1
    result[field] = parseCategorySection(fullText, index, nextIndex)
  }

  // 今日の最重要タスク
  const taskRaw = extractBetween(fullText, '✅ 今日の最重要タスク', '💬 今日の一言')
  result.key_task = taskRaw.replace(/^→\s*/, '').replace(/^[\n\r]+/, '').trim()

  // 今日の一言
  const quoteSection = fullText.slice(fullText.indexOf('💬 今日の一言') === -1 ? fullText.length : fullText.indexOf('💬 今日の一言'))
  const quoteMatch = quoteSection.match(/「([^」]+)」/)
  const authorMatch = quoteSection.match(/―\s*(.+)/)
  result.quote = quoteMatch?.[1] ?? ''
  result.quote_author = authorMatch?.[1]?.trim() ?? ''

  return result
}
