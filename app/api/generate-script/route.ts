import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient, getMonthlyUsageCount, recordUsage, FREE_LIMIT } from '@/lib/usage'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const supabase = createAuthClient(token)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const usageCount = await getMonthlyUsageCount(supabase, user.id, 'generate-script')
  if (usageCount >= FREE_LIMIT) {
    return NextResponse.json(
      { error: '今月の無料枠を使い切りました', limitReached: true },
      { status: 429 }
    )
  }

  try {
    const { genre, target, theme, duration, mood } = await request.json()

    if (!genre || !target || !theme) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    const prompt = `あなたはInstagramリール動画の撮影台本を作る専門家です。以下の情報をもとに、プロの撮影台本を日本語で作成してください。

アカウントジャンル：${genre}
ターゲット：${target}
今週のテーマ：${theme}
動画の長さ：${duration}
雰囲気：${mood}

以下のJSON形式のみで返してください。前置きや説明文は一切不要です。

{
  "hook": "最初3秒のつかみセリフ（視聴者が止まる一言）",
  "structure": [
    {"time": "0〜3秒", "action": "やること", "line": "セリフまたはテロップ"},
    {"time": "4〜○秒", "action": "やること", "line": "セリフまたはテロップ"},
    {"time": "○〜${duration}", "action": "やること", "line": "CTA（行動喚起）"}
  ],
  "camera": {
    "angle": "カメラアングル",
    "position": "カメラ位置・距離感",
    "movement": "カメラの動き（固定・パン・ズームなど）"
  },
  "staging": {
    "background": "背景の指示",
    "lighting": "照明の指示",
    "props": "必要な小道具"
  },
  "caption": "投稿キャプション（200字程度）",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", "ハッシュタグ3", "ハッシュタグ4", "ハッシュタグ5", "ハッシュタグ6", "ハッシュタグ7", "ハッシュタグ8", "ハッシュタグ9", "ハッシュタグ10"]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => (block.type === 'text' ? block.text : ''))
      .join('')

    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    await recordUsage(supabase, user.id, 'generate-script')
    return NextResponse.json(result)
  } catch (error) {
    console.error('生成エラー:', error)
    return NextResponse.json(
      { error: '台本の生成に失敗しました' },
      { status: 500 }
    )
  }
}
