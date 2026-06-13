import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { date, practiced } = body

  if (!date || typeof practiced !== 'boolean') {
    return NextResponse.json({ error: 'date and practiced (boolean) required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('daily_knowledge')
    .update({ practiced_today: practiced })
    .eq('date', date)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
