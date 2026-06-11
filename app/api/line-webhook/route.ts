import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

const REPLY_TEXT = `ありがとうございます！🙏

確認しました✅

今月の利用回数をリセットしました🎁
また3回使えるようになりました！

引き続きInstaScript AIをお使いください👇
instagram-script-generator-tau.vercel.app

何かご不明な点があれば
お気軽にメッセージしてください😊`

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET
  if (!secret) return false
  const hash = createHmac('sha256', secret).update(rawBody).digest('base64')
  return hash === signature
}

async function replyMessage(replyToken: string, text: string): Promise<void> {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }],
    }),
  })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-line-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    console.error('[line-webhook] 署名検証失敗')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: { events: LineEvent[] }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  for (const event of body.events ?? []) {
    if (event.type !== 'message' || event.message.type !== 'text') continue

    const lineUserId = event.source.userId
    const text = event.message.text.trim()
    const replyToken = event.replyToken

    console.log(`[line-webhook] from=${lineUserId} text="${text}"`)

    if (text === '追加希望') {
      const admin = createAdminClient()

      // LINEユーザーIDからSupabaseユーザーを検索
      const { data: lineUser, error: lookupError } = await admin
        .from('line_users')
        .select('supabase_user_id')
        .eq('line_user_id', lineUserId)
        .single()

      if (lookupError || !lineUser?.supabase_user_id) {
        console.warn(`[line-webhook] line_user not found: ${lineUserId}`)
        // ユーザーが見つからなくても返信だけ送る
        await replyMessage(replyToken, REPLY_TEXT)
        continue
      }

      // 今月のusage_logsを全削除（利用回数をリセット）
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { error: deleteError } = await admin
        .from('usage_logs')
        .delete()
        .eq('user_id', lineUser.supabase_user_id)
        .gte('created_at', startOfMonth.toISOString())

      if (deleteError) {
        console.error('[line-webhook] usage_logs削除エラー:', deleteError)
      } else {
        console.log(`[line-webhook] usage_logs reset: supabase_user_id=${lineUser.supabase_user_id}`)
      }

      await replyMessage(replyToken, REPLY_TEXT)
    }
  }

  return NextResponse.json({ ok: true })
}

// LINE Webhook の型定義
type LineEvent = {
  type: string
  replyToken: string
  source: { userId: string; type: string }
  message: { type: string; text: string }
}
