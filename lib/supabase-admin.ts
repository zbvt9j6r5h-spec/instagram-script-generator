import { createClient } from '@supabase/supabase-js'

/**
 * RLSをバイパスするサービスロールクライアント。
 * サーバーサイド（API Route）専用 — クライアントコンポーネントからは呼ばない。
 *
 * 必要な環境変数の設定手順:
 *   1. Supabase Dashboard を開く
 *   2. 左メニュー → Settings → API
 *   3. "Project API keys" の service_role (secret) をコピー
 *   4. .env.local に以下を追加:
 *      SUPABASE_SERVICE_ROLE_KEY=<コピーしたキー>
 *   5. 開発サーバーを再起動 (npm run dev)
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey || serviceRoleKey === 'your-service-role-key-here') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY が .env.local に設定されていません。' +
      'Supabase Dashboard → Settings → API → service_role key を .env.local に追加してください。'
    )
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
