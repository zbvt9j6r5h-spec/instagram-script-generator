import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase-admin'

webpush.setVapidDetails(
  'mailto:rikicoco0709@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

// VAPID公開鍵を返す
export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? '' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  // プッシュ購読の保存
  if (action === 'subscribe') {
    const { userId, subscription } = body
    if (!userId || !subscription) {
      return NextResponse.json({ error: 'userId and subscription required' }, { status: 400 })
    }
    const admin = createAdminClient()
    await admin.from('push_subscriptions').upsert(
      { user_id: userId, subscription: JSON.stringify(subscription) },
      { onConflict: 'user_id' },
    )
    return NextResponse.json({ ok: true })
  }

  // 通知送信（サーバー側から呼び出し）
  if (action === 'send') {
    const { userId, title, body: msgBody, url } = body
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const admin = createAdminClient()
    const { data } = await admin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .maybeSingle()

    if (!data) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

    const sub = JSON.parse(data.subscription) as webpush.PushSubscription
    await webpush.sendNotification(
      sub,
      JSON.stringify({ title: title ?? 'InstaScript AI', body: msgBody ?? '新しい通知があります', url: url ?? '/dashboard' }),
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
