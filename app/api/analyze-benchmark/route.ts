import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient, getMonthlyUsageCount, recordUsage, FREE_LIMIT } from '@/lib/usage'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function detectMediaType(base64: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
  if (base64.startsWith('/9j/')) return 'image/jpeg'
  if (base64.startsWith('iVBOR')) return 'image/png'
  if (base64.startsWith('UklGR')) return 'image/webp'
  if (base64.startsWith('R0lGO')) return 'image/gif'
  return 'image/png'
}

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

  const usageCount = await getMonthlyUsageCount(supabase, user.id, 'analyze-benchmark')
  if (usageCount >= FREE_LIMIT) {
    return NextResponse.json(
      { error: '今月の無料枠を使い切りました', limitReached: true },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const rawImages = body.images

    if (!rawImages || rawImages.length === 0) {
      return NextResponse.json({ error: '画像を1枚以上アップロードしてください' }, { status: 400 })
    }

    const imageContents = rawImages.map((img: any) => {
      const data = typeof img === 'string' ? img : img.data
      const mediaType = detectMediaType(data)
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mediaType,
          data: data,
        },
      }
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text' as const,
              text: `あなたはInstagramリール動画の分析エキスパートです。
アップロードされた画像（動画のスクリーンショット）を分析し、以下の項目をJSON形式で返してください。

{
  "summary": "この動画の概要（1〜2文）",
  "genre": "ジャンル（例：料理、フィットネス、美容、ビジネス）",
  "target_audience": "想定ターゲット層",
  "hook": "冒頭のつかみ（どんな手法で注意を引いているか）",
  "structure": [
    {"time": "0〜3秒", "description": "何が起きているか"},
    {"time": "4〜7秒", "description": "何が起きているか"},
    {"time": "8〜11秒", "description": "何が起きているか"},
    {"time": "12〜15秒", "description": "何が起きているか"}
  ],
  "camera_work": {
    "angles": "使われているカメラアングル",
    "movements": "カメラの動き（固定、パン、ズームなど）",
    "transitions": "シーン切り替えの手法"
  },
  "staging": {
    "background": "背景・ロケーション",
    "lighting": "照明の特徴",
    "props": "使われている小道具",
    "text_overlay": "テロップ・テキストの使い方"
  },
  "engagement_tactics": "エンゲージメントを高めるために使われている戦略（CTA、質問、共感要素など）",
  "strengths": ["この動画の強み1", "強み2", "強み3"],
  "suggestions": ["自分の動画に活かせるポイント1", "ポイント2", "ポイント3"]
}

JSONのみを返してください。説明文は不要です。`,
            },
          ],
        },
      ],
    })

    const text = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => (block.type === 'text' ? block.text : ''))
      .join('')

    const result = JSON.parse(text.replace(/```json|```/g, '').trim())

    await recordUsage(supabase, user.id, 'analyze-benchmark')
    return NextResponse.json(result)
  } catch (error) {
    console.error('分析エラー:', error)
    return NextResponse.json({ error: 'ベンチマーク分析に失敗しました' }, { status: 500 })
  }
}
