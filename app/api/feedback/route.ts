import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { rating, category, message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 })
    }

    // ログイン中ならトークンからユーザーIDを取得（任意）
    let userId: string | null = null
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    const { error } = await supabase.from('feedback').insert({
      user_id: userId,
      rating: rating ?? null,
      category: category || null,
      message: message.trim(),
    })

    if (error) {
      console.error('フィードバック保存エラー:', error)
      return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('フィードバックAPIエラー:', error)
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
  }
}
