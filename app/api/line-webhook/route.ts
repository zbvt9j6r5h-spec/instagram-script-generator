import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

const REPLY_RESET_OK = `ありがとうございます！🙏

確認しました✅

今月の利用回数をリセットしました🎁
また3回使えるようになりました！

引き続きInstaScript AIをお使いください👇
instagram-script-generator-tau.vercel.app

何かご不明な点があれば
お気軽にメッセージしてください😊`

const REPLY_ALREADY_RESET = `申し訳ありません🙏

今月はすでにリセット済みです。
リセットは月1回までとなっております。

来月またご利用ください📅`

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

async function getLineProfile(userId: string): Promise<string> {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
  })
  if (!res.ok) return ''
  const data = await res.json()
  return data.displayName ?? ''
}

function buildWelcomeMessage(displayName: string): string {
  return `${displayName}さん、ようこそ！🎉

登録ありがとうございます。

目的に合わせてどうぞ👇

📱 ツールを使いたい方
→ instagram-script-generator-tau.vercel.app

🚀 さらなるAIツールを使いたい方・
　AIで業務を効率化したい方
→「自動化」と送ってください`
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
    const lineUserId = event.source.userId

    // 友だち追加イベント
    if (event.type === 'follow') {
      const displayName = await getLineProfile(lineUserId)
      const admin = createAdminClient()
      await admin.from('line_users').upsert(
        { line_user_id: lineUserId, display_name: displayName || null },
        { onConflict: 'line_user_id' }
      )
      console.log(`[line-webhook] follow: ${lineUserId} name="${displayName}"`)
      await replyMessage(event.replyToken, buildWelcomeMessage(displayName || ''))
      continue
    }

    if (event.type !== 'message' || event.message.type !== 'text') continue

    const text = event.message.text.trim()
    const replyToken = event.replyToken

    console.log(`[line-webhook] from=${lineUserId} text="${text}"`)

    if (text === '追加希望') {
      const admin = createAdminClient()

      // LINEユーザーIDからSupabaseユーザーを検索（last_reset_atも取得）
      const { data: lineUser, error: lookupError } = await admin
        .from('line_users')
        .select('supabase_user_id, last_reset_at')
        .eq('line_user_id', lineUserId)
        .single()

      if (lookupError) {
        // テーブルやカラムが存在しない場合もここに来る
        console.error(`[line-webhook] lookup error for ${lineUserId}:`, lookupError)
        continue
      }

      if (!lineUser?.supabase_user_id) {
        console.warn(`[line-webhook] line_user not found: ${lineUserId}`)
        continue
      }

      // 今月すでにリセット済みかチェック
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      if (lineUser.last_reset_at && new Date(lineUser.last_reset_at) >= startOfMonth) {
        console.log(`[line-webhook] already reset this month: ${lineUserId}`)
        await replyMessage(replyToken, REPLY_ALREADY_RESET)
        continue
      }

      // 今月のusage_logsを全削除（利用回数をリセット）
      const startOfMonthISO = startOfMonth.toISOString()
      const { error: deleteError } = await admin
        .from('usage_logs')
        .delete()
        .eq('user_id', lineUser.supabase_user_id)
        .gte('created_at', startOfMonthISO)

      if (deleteError) {
        console.error('[line-webhook] usage_logs削除エラー:', deleteError)
      } else {
        console.log(`[line-webhook] usage_logs reset: supabase_user_id=${lineUser.supabase_user_id}`)
      }

      // last_reset_at を現在時刻に更新
      const { error: updateError } = await admin
        .from('line_users')
        .update({ last_reset_at: now.toISOString() })
        .eq('line_user_id', lineUserId)

      if (updateError) {
        console.error('[line-webhook] last_reset_at更新エラー:', updateError)
      } else {
        console.log(`[line-webhook] last_reset_at updated: ${lineUserId}`)
      }

      await replyMessage(replyToken, REPLY_RESET_OK)
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
  timestamp: number
}
