import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

const LINE_USER_ID = 'U3ec2ceaf46873f225d09848605779388'

const PLAN_PRICES: Record<string, string> = {
  'ライト': '¥100,000',
  'スタンダード': '¥150,000',
  'プレミアム': '¥200,000',
}

async function notifyLine(name: string, plan: string, email: string, message: string | null) {
  const price = PLAN_PRICES[plan] ?? '不明'
  const text = [
    '【講座申込み】🎉',
    '',
    `お名前：${name}さん`,
    `プラン：${plan}プラン（${price}）`,
    `メール：${email}`,
    message ? `質問：${message}` : null,
    '',
    'Supabaseで確認してください。',
    'https://supabase.com/dashboard/project/qjuwikdpllmedmangyof',
  ].filter(l => l !== null).join('\n')

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: LINE_USER_ID, messages: [{ type: 'text', text }] }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error('[course-apply] LINE notify failed:', res.status, body)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, plan, message } = body

  if (!name || !email || !plan) {
    return NextResponse.json({ error: 'name, email, plan は必須です' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('course_applications').insert({
    name,
    email,
    plan,
    message: message || null,
  })

  if (error) {
    console.error('[course-apply] Supabase error:', error.message)
    return NextResponse.json({ error: 'データの保存に失敗しました' }, { status: 500 })
  }

  await notifyLine(name, plan, email, message || null)

  return NextResponse.json({ ok: true })
}
