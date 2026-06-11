/**
 * 許可ユーザーの管理スクリプト
 *
 * 使い方:
 *   node scripts/manage-users.js add user@example.com     # ユーザーを追加
 *   node scripts/manage-users.js remove user@example.com  # ユーザーを削除
 *   node scripts/manage-users.js list                     # 許可済みユーザー一覧
 */

const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace('your-service-role-key-here', '')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません。')
  process.exit(1)
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function req(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204 || res.status === 201) return null
  const text = await res.text()
  if (!text) return null
  const data = JSON.parse(text)
  if (!res.ok) throw new Error(data?.message ?? JSON.stringify(data))
  return data
}

async function addUser(email) {
  await req('POST', 'allowed_users', { email })
  console.log(`✅ 追加しました: ${email}`)
}

async function removeUser(email) {
  await req('DELETE', `allowed_users?email=eq.${encodeURIComponent(email)}`)
  console.log(`✅ 削除しました: ${email}`)
}

async function listUsers() {
  const users = await req('GET', 'allowed_users?select=email,created_at&order=created_at.asc')
  if (!users || users.length === 0) {
    console.log('許可済みユーザーはいません。')
    return
  }
  console.log(`\n許可済みユーザー（${users.length}人）:\n`)
  users.forEach((u, i) => {
    const date = new Date(u.created_at).toLocaleDateString('ja-JP')
    console.log(`  ${i + 1}. ${u.email}  （追加日: ${date}）`)
  })
  console.log('')
}

const [, , command, email] = process.argv

switch (command) {
  case 'add':
    if (!email) { console.error('使い方: node scripts/manage-users.js add user@example.com'); process.exit(1) }
    addUser(email).catch((e) => { console.error('❌', e.message); process.exit(1) })
    break
  case 'remove':
    if (!email) { console.error('使い方: node scripts/manage-users.js remove user@example.com'); process.exit(1) }
    removeUser(email).catch((e) => { console.error('❌', e.message); process.exit(1) })
    break
  case 'list':
    listUsers().catch((e) => { console.error('❌', e.message); process.exit(1) })
    break
  default:
    console.error('使い方:')
    console.error('  node scripts/manage-users.js add user@example.com')
    console.error('  node scripts/manage-users.js remove user@example.com')
    console.error('  node scripts/manage-users.js list')
    process.exit(1)
}
