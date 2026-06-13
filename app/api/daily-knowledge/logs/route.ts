import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const admin = createAdminClient()

  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(jstNow)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

  const { data, error } = await admin
    .from('daily_knowledge')
    .select('id, date, key_task, practiced_today')
    .gte('date', fromDate)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
