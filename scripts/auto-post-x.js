/**
 * 自動投稿スクリプト
 * Anthropic APIでXポスト用コンテンツを生成して投稿する
 *
 * 使い方:
 *   node scripts/auto-post-x.js           # AIがネタを自動生成して投稿
 *   node scripts/auto-post-x.js --dry-run  # 投稿せず内容だけ確認
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const {
  ANTHROPIC_API_KEY,
  X_API_KEY, X_API_KEY_SECRET,
  X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET,
} = process.env

const isDryRun = process.argv.includes('--dry-run')

// ── X投稿ユーティリティ ────────────────────────────

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function buildOAuthHeader(method, url) {
  const nonce = crypto.randomBytes(16).toString('hex')
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const oauthParams = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: '1.0',
  }

  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join('&')

  const signatureBase = [method.toUpperCase(), percentEncode(url), percentEncode(sortedParams)].join('&')
  const signingKey = `${percentEncode(X_API_KEY_SECRET)}&${percentEncode(X_ACCESS_TOKEN_SECRET)}`
  oauthParams.oauth_signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64')

  return 'OAuth ' + Object.keys(oauthParams).sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ')
}

async function postTweet(text) {
  const url = 'https://api.twitter.com/2/tweets'
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: buildOAuthHeader('POST', url), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(JSON.stringify(data)), { data })
  return data
}

// ── コンテンツ生成 ────────────────────────────────

// 投稿テーマをローテーション（同じネタが続かないように日付ベースで選ぶ）
const THEMES = [
  '副業を始めたいけど一歩が踏み出せない会社員へのアドバイス',
  'Instagramのリールで再生数を伸ばすための台本の作り方',
  'フォロワーが少なくても副業収入を作れる理由',
  '会社員が副業でやりがちな失敗とその対策',
  'Instagramで集客するために最初にやるべきこと',
  '副業収入を作るためのInstagramアカウント設計',
  'リール動画のつかみ（最初の3秒）の作り方',
  '副業で月5万円を稼ぐまでのロードマップ',
]

const todayIndex = new Date().getDate() % THEMES.length
const todayTheme = THEMES[todayIndex]

async function generatePost() {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `あなたはInstagramコーチングの専門家「りっきー」です。
副業したい会社員をターゲットに、Xに投稿するポストを1本書いてください。

テーマ：${todayTheme}

## 条件
- 140文字以内（日本語）
- 最初の一文で興味を引く
- 具体的な数字や事例を入れる
- 最後にLINE登録への自然な誘導を入れる（「→プロフのリンクから」など）
- 改行を活用して読みやすくする
- ハッシュタグは2〜3個（#副業 #Instagram #会社員副業 などから選ぶ）
- 売り込み感を出さない・共感ベースで書く

ポスト本文のみを出力してください。説明や前置きは不要です。`,
        },
      ],
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic API error')
  return data.content[0].text.trim()
}

// ── メイン ───────────────────────────────────────

async function main() {
  console.log(`📝 今日のテーマ：${todayTheme}\n`)
  console.log('🤖 ポストを生成中...\n')

  const postText = await generatePost()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(postText)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n文字数：${postText.length}文字`)

  if (isDryRun) {
    console.log('\n[dry-run] 投稿はスキップしました。')
    return
  }

  console.log('\n🚀 Xに投稿します...')
  const result = await postTweet(postText)
  console.log('✅ 投稿完了！')
  console.log(`🔗 https://x.com/i/web/status/${result.data.id}`)
}

main().catch((e) => {
  console.error('❌ エラー:', e.message)
  process.exit(1)
})
