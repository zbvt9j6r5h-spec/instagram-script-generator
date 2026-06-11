/**
 * X自動投稿スクリプト
 *
 * 使い方:
 *   node scripts/post-to-x.js            # Claude APIでネタ生成→即投稿（時間帯で自動選択）
 *   node scripts/post-to-x.js morning    # 朝の投稿
 *   node scripts/post-to-x.js noon       # 昼の投稿
 *   node scripts/post-to-x.js evening    # 夜の投稿
 *   node scripts/post-to-x.js --dry-run  # 投稿せず内容だけ確認
 */

const fs = require('fs')
const path = require('path')
const { TwitterApi } = require('twitter-api-v2')

// .env.local 読み込み
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const {
  ANTHROPIC_API_KEY,
  NOTION_API_KEY,
  X_API_KEY,
  X_API_KEY_SECRET,
  X_ACCESS_TOKEN,
  X_ACCESS_TOKEN_SECRET,
} = process.env

const NOTION_PAGE_ID = 'a0709720e775456d94725b3f5b64f8f2'

if (!ANTHROPIC_API_KEY || !X_API_KEY || !X_API_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
  console.error('❌ 必要な環境変数が設定されていません。.env.local を確認してください。')
  process.exit(1)
}

// ── 時間帯別のテーマ設定 ────────────────────────────

const SLOTS = {
  morning: {
    label: '朝（7-9時）',
    themes: [
      '副業したい会社員が朝の通勤時間にできる小さな行動',
      'Instagramリールの台本を30秒で作る方法',
      '今日から始められるInstagram副業の第一歩',
      'フォロワー0からでもInstagramで収益化できる理由',
    ],
    tone: '朝に読む人の背中を押す、短くて行動したくなる内容',
  },
  noon: {
    label: '昼（12-13時）',
    themes: [
      'Instagramリールで再生数を伸ばすつかみの作り方',
      'AI活用でInstagram運用の作業時間を90%削減する方法',
      'バズる台本の構成：HOOK→本題→CTAの設計法',
      'InstaScript AIで30秒で台本を作った使い方事例',
    ],
    tone: 'お昼休みに読む想定。具体的なtipsやノウハウ重視',
  },
  evening: {
    label: '夜（21-23時）',
    themes: [
      '会社員が副業でInstagramを伸ばすまでにやった3つのこと',
      'フォロワー127人から初収益を出した日の話',
      '本業しながらInstagramを続けるための時間管理術',
      '副業収入を作るために今すぐやめるべきこと',
    ],
    tone: '夜に1日を振り返る会社員に刺さる、共感・ストーリー寄りの内容',
  },
}

function detectSlot() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'noon'
  return 'evening'
}

// ── Claude APIでポスト生成 ───────────────────────────

async function generatePost(slot) {
  const config = SLOTS[slot]
  const theme = config.themes[new Date().getDate() % config.themes.length]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `あなたはInstagramコーチングの専門家「りっきー」です。
副業したい会社員をターゲットにXに投稿するポストを1本書いてください。

テーマ：${theme}
トーン：${config.tone}

## 絶対に守るルール
- 全角・半角含めて280文字以内
- 最初の一文で読む人の興味を引く（スクロールを止める）
- 具体的な数字・事例を1つ以上入れる
- 改行を使って読みやすくする（1行あたり20文字以内が目安）
- 最後に「→プロフのリンクから」でLINE登録へ誘導
- ハッシュタグは末尾に2〜3個（#副業 #Instagram #会社員副業 から選ぶ）
- 売り込み感ゼロ。共感ベースで書く
- 絵文字は1〜3個まで

ポスト本文のみ出力。前置き・説明・カギカッコ不要。`,
        },
      ],
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic API error')
  return { text: data.content[0].text.trim(), theme }
}

// ── Notionに投稿文を保存 ──────────────────────────────

async function saveToNotion(posts) {
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')

  const t = (c) => ({ type: 'text', text: { content: c } })
  const h2 = (c) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: [t(c)] } })
  const code = (c) => ({ object: 'block', type: 'code', code: { rich_text: [t(c)], language: 'plain text' } })
  const p = (c) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: [t(c)] } })
  const div = () => ({ object: 'block', type: 'divider', divider: {} })

  const children = []
  for (const { slot, text, theme } of posts) {
    children.push(h2(`${SLOTS[slot].label}`))
    children.push(p(`📌 ${theme}`))
    children.push(code(text))
    children.push(p(`文字数：${text.length}文字`))
    children.push(div())
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: NOTION_PAGE_ID },
      properties: {
        title: [{ type: 'text', text: { content: `📣 X投稿文 ${today}` } }],
      },
      children,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data.url
}

// ── メイン ───────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  // --dry-run: 朝・昼・夜の3件を一括生成してターミナル表示＋Notionに保存
  if (isDryRun) {
    console.log('🤖 今日の投稿文を3件生成中...\n')

    const posts = []
    for (const slot of ['morning', 'noon', 'evening']) {
      const { text, theme } = await generatePost(slot)
      posts.push({ slot, text, theme })
      console.log(`⏰ ${SLOTS[slot].label}`)
      console.log(`📌 ${theme}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(text)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`文字数：${text.length}文字\n`)
    }

    if (NOTION_API_KEY) {
      console.log('📝 Notionに保存中...')
      const url = await saveToNotion(posts)
      console.log(`✅ Notionに保存しました`)
      console.log(`🔗 ${url}`)
    }
    return
  }

  // 通常実行: 時間帯に応じた1件を投稿
  const slotArg = process.argv[2]?.trim()
  const slot = ['morning', 'noon', 'evening'].includes(slotArg) ? slotArg : detectSlot()

  console.log(`⏰ 投稿スロット：${SLOTS[slot].label}\n`)
  console.log('🤖 Claude APIでポストを生成中...\n')

  const { text, theme } = await generatePost(slot)

  console.log(`📌 テーマ：${theme}\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(text)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n文字数：${text.length}文字`)

  console.log('\n🚀 Xに投稿します...')

  const client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_KEY_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  })

  const tweet = await client.v2.tweet(text)
  console.log('✅ 投稿完了！')
  console.log(`🔗 https://x.com/i/web/status/${tweet.data.id}`)
}

main().catch((e) => {
  const msg = e?.data ? JSON.stringify(e.data, null, 2) : e.message
  console.error('❌ エラー:', msg)
  process.exit(1)
})
