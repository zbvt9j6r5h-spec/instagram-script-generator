import { createClient } from '@supabase/supabase-js'

export const FREE_LIMIT = 3

export function createAuthClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

type AuthClient = ReturnType<typeof createAuthClient>

export async function getMonthlyUsageCount(
  supabase: AuthClient,
  userId: string,
  feature: string
): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', startOfMonth.toISOString())
  return count ?? 0
}

export async function recordUsage(
  supabase: AuthClient,
  userId: string,
  feature: string
): Promise<void> {
  await supabase.from('usage_logs').insert({ user_id: userId, feature })
}
