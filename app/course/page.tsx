'use client'

import { useRef, useState, useEffect } from 'react'

type Plan = 'ライト' | 'スタンダード' | 'プレミアム'

const DEADLINE = new Date('2026-06-28T23:59:59+09:00')

const PLANS: Array<{
  name: Plan
  originalPrice: string
  price: string
  recommended?: boolean
  slots: number
  tagline: string
  features: string[]
  color: string
  accent: string
}> = [
  {
    name: 'ライト',
    originalPrice: '¥200,000',
    price: '¥100,000',
    slots: 3,
    tagline: '自分のペースで学びたい方',
    color: '#2a2a2a',
    accent: '#aaa',
    features: [
      'InstaScript AI（台本生成・アカウント分析）3ヶ月使い放題',
      '初回Zoom：アカウント戦略診断 60分 × 1回',
      'LINEサポート：平日対応（返答 24時間以内）',
      'Notion教材：全50ページ（戦略・台本・マネタイズ）',
      'Instagram投稿テンプレート 20種類',
    ],
  },
  {
    name: 'スタンダード',
    originalPrice: '¥300,000',
    price: '¥150,000',
    recommended: true,
    slots: 2,
    tagline: 'しっかり伴走してほしい方',
    color: '#6366F1',
    accent: '#6366F1',
    features: [
      'InstaScript AI（全機能）3ヶ月使い放題',
      '初回Zoom：アカウント戦略診断 90分 × 1回',
      '月1回Zoom：進捗レビュー・方向修正 60分 × 3回',
      'LINEサポート：平日対応（返答 24時間以内）',
      'Notion教材：全50ページ',
      '投稿カレンダー作成サポート（毎月）',
      '台本・キャプション添削 無制限',
      'ライバルアカウント分析レポート 毎月',
    ],
  },
  {
    name: 'プレミアム',
    originalPrice: '¥400,000',
    price: '¥200,000',
    slots: 1,
    tagline: '最短で結果を出したい方',
    color: '#F59E0B',
    accent: '#F59E0B',
    features: [
      'InstaScript AI（全機能）3ヶ月使い放題',
      '初回Zoom：アカウント戦略診断 90分 × 1回',
      '月2回Zoom：個別コーチング 60分 × 6回',
      'LINEサポート：毎日対応（返答 3時間以内）',
      'Notion教材：全50ページ',
      '投稿自動化システム構築（個別カスタマイズ）',
      '台本・キャプション添削 無制限',
      'マネタイズ戦略・LINE導線設計',
      '月間コンテンツ戦略 丸ごと作成',
      '申込み後 24時間以内スタート可能',
    ],
  },
]

const RESULTS = [
  { label: '平均フォロワー増加', value: '+3,200人', period: '3ヶ月で', color: '#6366F1' },
  { label: '投稿作業時間', value: '−80%', period: 'AIで削減', color: '#10B981' },
  { label: 'プログラム満足度', value: '97%', period: '受講生アンケート', color: '#F59E0B' },
  { label: '受講後 副業収益化', value: '73%', period: '3ヶ月以内に達成', color: '#E1306C' },
]

const TESTIMONIALS = [
  {
    name: 'Aさん（30代・会社員）',
    plan: 'スタンダード',
    stars: 5,
    before: 'フォロワー180人・週7時間投稿作業',
    after: '3ヶ月でフォロワー4,800人。LINEからコンサル申込みが月5件。会社員しながらでも全然まわせる。',
    result: 'フォロワー+4,620人・月収+8万円',
    color: '#6366F1',
  },
  {
    name: 'Bさん（20代・フリーランス）',
    plan: 'プレミアム',
    stars: 5,
    before: '何を投稿すればいいかわからず月10投稿が限界',
    after: '台本はAIが全部作ってくれるので週4投稿が普通に継続できた。2ヶ月目に収益化の仕組みが完成。',
    result: '月10投稿→週4投稿達成・収益化2ヶ月で完成',
    color: '#F59E0B',
  },
  {
    name: 'Cさん（40代・主婦）',
    plan: 'ライト',
    stars: 5,
    before: 'Instagram初心者。スマホ一台で副業を始めたかった',
    after: '3ヶ月でフォロワー2,100人。今は月3万円の副収入。ゼロからでも全然できた。',
    result: 'フォロワー0→2,100人・月収+3万円',
    color: '#10B981',
  },
]

const FOR_WHO = [
  {
    emoji: '😰',
    title: '毎日ネタ切れで投稿が止まる',
    desc: '何を投稿すればいいかわからず、結局1週間に1投稿…そんな状態からでも大丈夫です。AIが今日のテーマから台本まで全部提案します。',
  },
  {
    emoji: '🕐',
    title: '副業の時間が全然取れない',
    desc: '本業が忙しくて1日30分しかない。それでも運用できる仕組みを一緒に作ります。AIを使えば台本制作が90%時間短縮できます。',
  },
  {
    emoji: '📉',
    title: 'リール再生数が伸びない',
    desc: '頑張って作っても100回しか再生されない。アルゴリズムの最新情報をもとに、バズる構成・フック・ハッシュタグを設計します。',
  },
  {
    emoji: '💸',
    title: '投稿しても全然マネタイズできない',
    desc: 'フォロワーはいるのにお問い合わせが来ない。LINE誘導→クロージングの導線設計をゼロから一緒に構築します。',
  },
]

const STEPS = [
  {
    month: '1ヶ月目',
    title: '戦略設計フェーズ',
    color: '#E1306C',
    details: [
      '競合調査 & ジャンル選定（勝てるニッチを見つける）',
      'ターゲット設定・ペルソナ設計',
      'プロフィール・世界観の最適化',
      '投稿フォーマット決定（Reels/カルーセル/静止画 比率）',
      'AIツールの初期設定＆使い方マスター',
      '最初の10投稿のテーマ・構成を一緒に設計',
    ],
  },
  {
    month: '2ヶ月目',
    title: 'コンテンツ量産フェーズ',
    color: '#6366F1',
    details: [
      '週4投稿のルーティン確立（AIで1投稿10分以内に）',
      'バズる構成の型を身につける（フック・本編・CTA）',
      'ショートフィルム台本 → キャプション → ハッシュタグ 自動生成',
      'インサイト分析で伸びてる投稿を特定・横展開',
      '保存されるカルーセル投稿の設計',
      '月間投稿カレンダー作成（翌月分も先行作成）',
    ],
  },
  {
    month: '3ヶ月目',
    title: 'マネタイズ設計フェーズ',
    color: '#10B981',
    details: [
      'LINE公式アカウント導線設計（プロフィール→LINE誘導）',
      'ステップ配信の設計（自動で信頼を構築する仕組み）',
      '相談・問い合わせ対応のスクリプト作成',
      'サービス・商品ページの作り方',
      'クロージング・提案のフレームワーク',
      '3ヶ月後のロードマップ設計（継続計画）',
    ],
  },
]

const AI_FEATURES = [
  {
    icon: '🎬',
    title: 'リール台本 自動生成',
    desc: 'テーマを入力するだけで、フック→本編→CTAの構成で60秒台本を生成。撮影に集中できます。',
  },
  {
    icon: '📊',
    title: 'アカウント分析',
    desc: 'インサイトデータを貼るだけで、「伸びた理由」「改善すべき点」をAIが分析してレポート化。',
  },
  {
    icon: '🔍',
    title: 'ベンチマーク調査',
    desc: '競合アカウントを自動収集・分析。フォロワー増加率・エンゲージメント・投稿パターンを比較。',
  },
  {
    icon: '📅',
    title: '投稿カレンダー生成',
    desc: 'ジャンル・曜日・ターゲットを設定すると月間30投稿のアイデアを一括生成。ネタ切れ完全解消。',
  },
]

const INSTRUCTOR = {
  name: 'りっきー',
  title: 'Instagram × AI マーケティングコンサルタント',
  followers: '2.3万',
  clients: '100名以上',
  period: '6ヶ月',
  achievements: [
    { icon: '📈', text: 'フォロワー0→23,000人を6ヶ月で達成' },
    { icon: '🤖', text: 'AI活用でコンテンツ制作時間を90%削減' },
    { icon: '💰', text: 'コンサル生の73%が3ヶ月以内に収益化達成' },
    { icon: '🏢', text: '法人向けSNSマーケティング支援実績あり' },
  ],
  bio: '会社員時代にInstagramを独学でゼロから始め、6ヶ月でフォロワー2.3万人・副業月収7桁を達成。その後AIとInstagramを組み合わせた独自メソッドを確立し、現在は受講生100名以上をサポート。「遠回りさせない最短ルート」を届けることに全力を注いでいる。',
}

const FAQS = [
  {
    q: 'Instagram初心者でも大丈夫ですか？',
    a: 'はい、フォロワー0人・投稿経験ゼロの方でも問題ありません。最初のZoomで現状を確認し、あなたのレベルに合わせたロードマップを一緒に作ります。実際に受講者の約40%はInstagram開設前からスタートしています。',
  },
  {
    q: '副業で時間がない会社員でも大丈夫ですか？',
    a: '毎日1時間あれば十分です。InstaScript AIを使えば台本作成→キャプション→ハッシュタグ選定まで1投稿あたり10〜15分で完了します。平日は投稿、週末に翌週分をまとめて準備する、というルーティンを一緒に設計します。',
  },
  {
    q: '具体的にどのくらいフォロワーが増えますか？',
    a: '個人差はありますが、週4投稿・3ヶ月継続した受講生の平均は+3,200人です。ジャンル・継続率・アカウント状況によって変わりますが、「伸びる構造」を最初に設計するため、最初の1ヶ月でインサイトの変化を感じられる方がほとんどです。',
  },
  {
    q: 'いつから始められますか？',
    a: 'お申込み後3営業日以内に初回日程の調整連絡をします。プレミアムプランは24時間以内にスタートも可能です。開始日はご都合に合わせて調整しますので、まずはお申込みください。',
  },
  {
    q: '分割払いはできますか？',
    a: 'はい、対応しています。2〜6回分割でのご相談を受け付けています。フォームでお申込み後にご希望をお伝えください。また、LINEで先にご相談いただくことも可能です。',
  },
  {
    q: 'どんな業種・ジャンルでも対応できますか？',
    a: 'これまでに美容・料理・マネー・育児・副業・ビジネス・ライフスタイルなど幅広いジャンルで実績があります。InstaScript AIはジャンルを問わず活用できるため、どんな分野でもサポート可能です。ニッチなジャンルの場合はまずご相談ください。',
  },
  {
    q: '返金保証はありますか？',
    a: '開始前（初回Zoom前）のキャンセルは全額返金します。プログラム開始後は原則返金不可ですが、万が一サービスの提供ができない事由が発生した場合は速やかに対応します。安心してお申込みください。',
  },
]

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-black text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-[#555] mt-1">{label}</span>
    </div>
  )
}

const LINE_URL = 'https://lin.ee/WhGkd90'

function GroupConsultCTA({ variant = 'section' }: { variant?: 'section' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="max-w-3xl mx-auto px-5 mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#06C755]/8 border border-[#06C755]/25 rounded-2xl px-6 py-5">
          <div>
            <p className="text-xs font-bold text-[#4ade80] uppercase tracking-wider mb-1">毎月開催 · 参加者限定グルコン</p>
            <p className="text-sm text-[#ddd] leading-relaxed">
              個別コンサルはまだ迷う…という方は、まず「グルコン」で運用のリアルを体験してみませんか？<br className="hidden sm:block" />
              開催日程はLINE登録者限定でご案内しています。
            </p>
          </div>
          <a
            href={LINE_URL}
            className="shrink-0 inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-black px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap"
          >
            LINEで日程を受け取る →
          </a>
        </div>
      </div>
    )
  }

  return (
    <section className="border-y border-[#1a1a1a] bg-[#081a10]">
      <div className="max-w-3xl mx-auto px-5 py-14 sm:py-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#4ade80] uppercase tracking-[0.15em] bg-[#06C755]/10 border border-[#06C755]/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          毎月開催 · グループコンサル（グルコン）
        </div>
        <h2 className="text-xl sm:text-2xl font-black mb-4 leading-relaxed">
          いきなり個別コンサルは不安な方へ。<br />
          まずは「グルコン」に参加してみませんか？
        </h2>
        <p className="text-[#999] text-sm leading-relaxed mb-8 max-w-lg mx-auto">
          月1回開催のグループコンサルでは、AIを使った台本作成・アカウント運用のリアルな進め方をその場で学べます。
          <span className="text-white font-bold">初回は無料でご参加いただけます。</span><br />
          開催日程・参加リンクはLINE登録者限定でお送りしています。
        </p>
        <a
          href={LINE_URL}
          className="inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-black px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-[#06C755]/20 hover:scale-[1.02]"
        >
          LINEでグルコンの日程を受け取る →
        </a>
        <p className="text-[#4a4a4a] text-xs mt-4">友だち追加後、次回開催日をすぐにお送りします</p>
      </div>
    </section>
  )
}

export default function CoursePage() {
  const formRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan>('スタンダード')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function handleScroll() {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0
      setShowStickyBar(heroBottom < 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function tick() {
      const diff = DEADLINE.getTime() - Date.now()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function selectPlanAndScroll(plan: Plan) {
    setSelectedPlan(plan)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim()) {
      setError('お名前とメールアドレスは必須です')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/course-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), plan: selectedPlan, message: message.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '送信に失敗しました')
      }
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ① ヒーロー */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d0d2b 0%, #0f0f0f 50%, #0f0f1a 100%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#6366F1] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] bg-[#E1306C] opacity-[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-[#10B981] opacity-[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-5 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#a78bfa] uppercase tracking-[0.15em] bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
            モニター募集中 · 残り6名限定
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-[1.15] mb-6 tracking-tight">
            頑張って投稿しているのに<br />
            <span className="relative inline-block mt-2">
              <span style={{ background: 'linear-gradient(90deg, #6366F1, #a78bfa, #E1306C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                なぜ伸びないのか
              </span>
            </span>
            <span className="block text-white mt-2">
              その答えと解決策を、<br className="sm:hidden" />3ヶ月で手に入れる。
            </span>
          </h1>

          <p className="text-[#999] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            AIが台本・分析・投稿カレンダーを全自動で作る仕組みを構築。<br />
            <span className="text-white font-bold">副業会社員でも、1日1時間で週4投稿が継続できる体制</span>を、
            一緒に3ヶ月で完成させます。
          </p>

          {/* 実績バッジ */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10 text-sm">
            {['受講生 100名以上', '平均フォロワー+3,200人 / 3ヶ月', '満足度 97%'].map(t => (
              <span key={t} className="bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff12] rounded-full px-4 py-1.5 text-[#bbb] text-xs">
                ✓ {t}
              </span>
            ))}
          </div>

          {/* カウントダウン */}
          <div className="mb-10">
            <p className="text-xs text-red-400 font-bold mb-3 tracking-wider uppercase">モニター価格 終了まで</p>
            <div className="flex justify-center items-center gap-3">
              <CountdownBox value={countdown.days} label="日" />
              <span className="text-[#333] text-2xl font-black pb-5">:</span>
              <CountdownBox value={countdown.hours} label="時間" />
              <span className="text-[#333] text-2xl font-black pb-5">:</span>
              <CountdownBox value={countdown.minutes} label="分" />
              <span className="text-[#333] text-2xl font-black pb-5">:</span>
              <CountdownBox value={countdown.seconds} label="秒" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={scrollToForm}
              className="group inline-flex items-center justify-center gap-2 text-white font-black px-10 py-4 rounded-2xl text-base transition-all shadow-lg shadow-[#6366F1]/30 hover:shadow-[#6366F1]/50 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8b5cf6)' }}
            >
              今すぐ申し込む
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a
              href={LINE_URL}
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#2a2a2a] hover:border-[#444] text-[#999] hover:text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
            >
              まず LINE で相談する
            </a>
          </div>
          <p className="text-[#444] text-xs mt-4">申込み後、3営業日以内にご連絡します · 無料相談あり</p>
        </div>
      </section>

      {/* ①.5 グルコンCTA（独立セクション） */}
      <GroupConsultCTA />

      {/* ② 実績数字 */}
      <section className="border-y border-[#1a1a1a] bg-[#080808]">
        <div className="max-w-4xl mx-auto px-5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {RESULTS.map(r => (
              <div key={r.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black mb-1" style={{ color: r.color }}>{r.value}</p>
                <p className="text-xs text-[#555] mb-0.5">{r.period}</p>
                <p className="text-xs text-[#444]">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ こんな悩みはありませんか */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">あなただけじゃない</p>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">こんな悩みはありませんか？</h2>
        <p className="text-[#444] text-center text-sm mb-10">このプログラムはこれらをすべて解決します</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FOR_WHO.map((item, i) => (
            <div key={i} className="bg-[#0d0d0d] rounded-2xl p-6 border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-black text-white mb-2">{item.title}</p>
                  <p className="text-xs text-[#666] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ④ 講師プロフィール */}
      <section className="bg-[#0a0a0a] border-y border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">Who</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">誰が教えるのか</h2>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* アバター */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366F1, #a78bfa)' }}>
                R
              </div>
              <div className="mt-3 text-center">
                <p className="text-white font-black text-base">{INSTRUCTOR.name}</p>
                <p className="text-[#555] text-xs mt-0.5">{INSTRUCTOR.title}</p>
              </div>
            </div>

            <div className="flex-1">
              {/* 実績数字 */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#111] rounded-xl p-3 text-center border border-[#1a1a1a]">
                  <p className="text-xl font-black text-[#6366F1]">{INSTRUCTOR.followers}</p>
                  <p className="text-[10px] text-[#555] mt-0.5">フォロワー数</p>
                </div>
                <div className="bg-[#111] rounded-xl p-3 text-center border border-[#1a1a1a]">
                  <p className="text-xl font-black text-[#10B981]">{INSTRUCTOR.clients}</p>
                  <p className="text-[10px] text-[#555] mt-0.5">サポート実績</p>
                </div>
                <div className="bg-[#111] rounded-xl p-3 text-center border border-[#1a1a1a]">
                  <p className="text-xl font-black text-[#F59E0B]">{INSTRUCTOR.period}</p>
                  <p className="text-[10px] text-[#555] mt-0.5">0→2.3万人達成</p>
                </div>
              </div>

              {/* bio */}
              <p className="text-sm text-[#888] leading-relaxed mb-5">{INSTRUCTOR.bio}</p>

              {/* 実績リスト */}
              <ul className="space-y-2">
                {INSTRUCTOR.achievements.map((a, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-[#ccc]">
                    <span className="text-base">{a.icon}</span>
                    {a.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ⑤ InstaScript AI とは */}
      <section className="border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">受講生専用ツール</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">InstaScript AI とは</h2>
          <p className="text-[#555] text-center text-sm mb-10 max-w-xl mx-auto">
            受講生全員に3ヶ月間無制限で提供。投稿作業のほとんどをAIが代行するため、
            あなたは<span className="text-[#888]">「戦略と撮影」だけ</span>に集中できます。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AI_FEATURES.map((f, i) => (
              <div key={i} className="bg-[#0d0d0d] rounded-2xl p-5 border border-[#1a1a1a] hover:border-[#6366F1]/30 transition-colors flex gap-4">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-black text-white mb-1">{f.title}</p>
                  <p className="text-xs text-[#666] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* プランカード直前：グルコン導線（比較検討中の人向け） */}
      <GroupConsultCTA variant="compact" />

      {/* ⑥ プランカード */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
        <p className="text-xs font-bold text-red-400 text-center uppercase tracking-widest mb-2">期間限定 モニター価格</p>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">プランを選ぶ</h2>
        <p className="text-[#444] text-center text-sm mb-3">全プランにLINEサポート・Notion教材・AIツールが含まれます</p>

        {/* ミニカウントダウン */}
        <div className="flex justify-center items-center gap-2 mb-10">
          <span className="text-red-400 text-xs font-bold">このモニター価格、終了まで残り</span>
          <span className="text-white text-xs font-black bg-red-500/20 border border-red-500/30 rounded-lg px-2 py-0.5 tabular-nums">
            {countdown.days}日 {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="relative rounded-2xl overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
              style={{ border: `1.5px solid ${plan.recommended ? plan.color : '#1f1f1f'}` }}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-xs font-black text-white tracking-wider"
                  style={{ background: `linear-gradient(90deg, ${plan.color}, #8b5cf6)` }}>
                  ⭐ 最もご好評のプラン
                </div>
              )}

              <div className={`p-6 flex-1 flex flex-col ${plan.recommended ? 'pt-10' : ''}`}
                style={{ background: plan.recommended ? `${plan.color}0d` : '#0d0d0d' }}>
                <p className="text-sm font-bold mb-1" style={{ color: plan.accent }}>{plan.name}プラン</p>
                <p className="text-xs text-[#444] mb-3">{plan.tagline}</p>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="bg-red-500 text-white text-xs font-black rounded-full px-3 py-1">モニター限定50%OFF</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg text-[#555] line-through">{plan.originalPrice}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-[#555]">税込 / 3ヶ月</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-xs text-red-400 font-bold">今だけ期間限定</p>
                  <p className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#111] border border-red-400/40 text-red-300">
                    残り{plan.slots}名
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#bbb]">
                      <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: plan.accent }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selectPlanAndScroll(plan.name)}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={
                    plan.recommended
                      ? { background: `linear-gradient(135deg, ${plan.color}, #8b5cf6)`, color: '#fff' }
                      : { background: '#161616', color: '#fff', border: `1px solid ${plan.color}44` }
                  }
                >
                  このプランで申し込む →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⑦ 3ヶ月の流れ */}
      <section className="bg-[#0a0a0a] border-y border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">Roadmap</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">3ヶ月でやること</h2>
          <p className="text-[#444] text-center text-sm mb-10">「やること」を明確にして、最短ルートで収益化まで走ります</p>

          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                    style={{ background: step.color }}>
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 mt-2 bg-[#1f1f1f]" style={{ minHeight: '40px' }} />}
                </div>
                <div className="bg-[#0d0d0d] rounded-2xl border border-[#1a1a1a] p-5 flex-1 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>{step.month}</p>
                  <p className="text-base font-black text-white mb-3">{step.title}</p>
                  <ul className="space-y-1.5">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-[#777]">
                        <span className="shrink-0 mt-0.5" style={{ color: step.color }}>▸</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑧ 受講生の声 */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">Voice</p>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">受講生の変化</h2>
        <p className="text-[#444] text-center text-sm mb-10">実際の受講生の声（一部）</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-[#0d0d0d] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col">
              {/* 星 */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-[#F59E0B] text-sm">★</span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: t.color }}>
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-[#444]">{t.plan}プラン受講</p>
                </div>
              </div>

              {/* 結果バッジ */}
              <div className="rounded-xl px-3 py-2 mb-3 text-center"
                style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}>
                <p className="text-xs font-black" style={{ color: t.color }}>{t.result}</p>
              </div>

              <div className="bg-[#111] rounded-xl p-3 mb-3 border border-[#1f1f1f]">
                <p className="text-[10px] text-[#444] mb-1">受講前</p>
                <p className="text-xs text-[#777]">{t.before}</p>
              </div>
              <p className="text-xs text-[#bbb] leading-relaxed flex-1">"{t.after}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⑨ よくある質問 */}
      <section className="bg-[#0a0a0a] border-y border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-5 py-16">
          <h2 className="text-2xl font-black text-center mb-10">よくある質問</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#0d0d0d] rounded-2xl border border-[#1a1a1a] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 hover:bg-[#111] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p className="text-sm font-bold text-white">{faq.q}</p>
                  <span className="text-[#444] text-sm shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>
                    ▶
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-[#1a1a1a] pt-4">
                    <p className="text-sm text-[#777] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ直後・申込みフォーム直前：グルコン導線（軽いハードルの選択肢） */}
      <div className="pt-16 sm:pt-20">
        <GroupConsultCTA variant="compact" />
      </div>

      {/* ⑩ 申込みフォーム */}
      <section ref={formRef} className="max-w-xl mx-auto px-5 py-16 sm:py-20">
        <p className="text-xs font-bold text-red-400 text-center uppercase tracking-widest mb-2">残り6名 · モニター価格</p>
        <h2 className="text-2xl font-black text-center mb-2">お申込み</h2>
        <p className="text-[#444] text-sm text-center mb-10">送信後、3営業日以内にご連絡します</p>

        {submitted ? (
          <div className="bg-[#052e16] border border-[#22C55E]/40 rounded-2xl p-8 text-center space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="text-xl font-black text-white">お申込みありがとうございます！</p>
            <p className="text-sm text-[#86EFAC]">3営業日以内にメールまたはLINEでご連絡します。<br />少々お待ちください。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-[#777] mb-1.5">
                お名前 <span className="text-red-400 text-xs">必須</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例：田中りっきー"
                className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">
                メールアドレス <span className="text-red-400 text-xs">必須</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">プラン選択</label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map(plan => (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setSelectedPlan(plan.name)}
                    className="rounded-xl py-3 px-2 text-center transition-all border"
                    style={
                      selectedPlan === plan.name
                        ? { background: `${plan.color}20`, borderColor: plan.color, color: plan.accent === '#aaa' ? '#fff' : plan.accent }
                        : { background: '#0d0d0d', borderColor: '#1f1f1f', color: '#555' }
                    }
                  >
                    <p className="text-xs font-bold">{plan.name}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{plan.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">ご質問・現在の状況 <span className="text-[#333] text-xs">任意</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="現在のフォロワー数・やりたいジャンル・気になること等、なんでもご記入ください"
                className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white placeholder:text-[#333] focus:outline-none focus:border-[#6366F1] transition-colors resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full disabled:opacity-50 text-white font-black py-4 rounded-2xl text-base transition-all hover:scale-[1.01] shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/40"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8b5cf6)' }}
            >
              {submitting ? '送信中...' : '申し込む →'}
            </button>

            <p className="text-[#333] text-xs text-center leading-relaxed">
              送信後、3営業日以内にご連絡します。<br />
              お急ぎの方は
              <a href={LINE_URL} className="text-[#6366F1] underline underline-offset-2 mx-1">LINE</a>
              からお問い合わせください。
            </p>
          </form>
        )}
      </section>

      <footer className="border-t border-[#111] py-8 text-center">
        <p className="text-[#222] text-xs">© 2026 InstaScript AI</p>
      </footer>

      {/* スティッキーCTAバー */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-[#0d0d0d]/95 backdrop-blur-md border-t border-[#1f1f1f] px-5 py-3">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-[#888] truncate">モニター限定50%OFF</p>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm">残り6名</span>
                <span className="text-[#444] text-xs">·</span>
                <span className="text-red-400 text-xs font-bold tabular-nums">
                  {countdown.days}日 {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')} 残り
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <a
                href={LINE_URL}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-black px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap"
              >
                無料グルコン参加
              </a>
              <button
                onClick={scrollToForm}
                className="text-white font-black px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-[#6366F1]/30"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8b5cf6)' }}
              >
                今すぐ申し込む →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
