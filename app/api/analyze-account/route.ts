import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { accountUrl, genre, targetAudience, postingStyle } = await request.json()

    if (!genre || !targetAudience || !postingStyle) {
      return NextResponse.json(
        { error: 'ジャンル・ターゲット層・投稿スタイルを入力してください' },
        { status: 400 }
      )
    }

    const accountInfo = accountUrl ? `アカウントURL/ユーザー名：${accountUrl}\n` : ''

    const prompt = `あなたはInstagramマーケティングの専門家です。以下のアカウント情報をもとに、詳細な分析と戦略提案を日本語で行ってください。

${accountInfo}ジャンル：${genre}
ターゲット層：${targetAudience}
投稿スタイル：${postingStyle}

以下のJSON形式のみで返してください。前置きや説明文は一切不要です。

{
  "strengths": ["アカウントの強み1", "強み2", "強み3"],
  "weaknesses": ["アカウントの弱み1", "弱み2", "弱み3"],
  "contentDirection": ["伸びるコンテンツの方向性1", "方向性2", "方向性3"],
  "differentiation": ["競合との差別化ポイント1", "差別化ポイント2", "差別化ポイント3"],
  "monthlyStrategy": [
    {"week": 1, "theme": "第1週のテーマ", "rationale": "このテーマを選ぶ理由"},
    {"week": 2, "theme": "第2週のテーマ", "rationale": "このテーマを選ぶ理由"},
    {"week": 3, "theme": "第3週のテーマ", "rationale": "このテーマを選ぶ理由"},
    {"week": 4, "theme": "第4週のテーマ", "rationale": "このテーマを選ぶ理由"}
  ],
  "hashtagStrategy": {
    "primary": ["メインハッシュタグ1", "メインハッシュタグ2", "メインハッシュタグ3"],
    "secondary": ["サブハッシュタグ1", "サブハッシュタグ2", "サブハッシュタグ3", "サブハッシュタグ4"],
    "niche": ["ニッチハッシュタグ1", "ニッチハッシュタグ2", "ニッチハッシュタグ3"]
  }
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => (block.type === 'text' ? block.text : ''))
      .join('')

    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result)
  } catch (error) {
    console.error('アカウント分析エラー:', error)
    return NextResponse.json(
      { error: 'アカウント分析に失敗しました' },
      { status: 500 }
    )
  }
}
