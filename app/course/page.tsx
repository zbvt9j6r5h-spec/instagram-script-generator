'use client'

import { useRef, useState } from 'react'

type Plan = 'ライト' | 'スタンダード' | 'プレミアム'

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
    before: 'フォロワー180人・週7時間投稿作業',
    after: '3ヶ月でフォロワー4,800人。LINEからコンサル申込みが月5件。会社員しながらでも全然まわせる。',
    color: '#6366F1',
  },
  {
    name: 'Bさん（20代・フリーランス）',
    plan: 'プレミアム',
    before: '何を投稿すればいいかわからず月10投稿が限界',
    after: '台本はAIが全部作ってくれるので週4投稿が普通に継続できた。2ヶ月目に収益化の仕組みが完成。',
    color: '#F59E0B',
  },
  {
    name: 'Cさん（40代・主婦）',
    plan: 'ライト',
    before: 'Instagram初心者。スマホ一台で副業を始めたかった',
    after: '3ヶ月でフォロワー2,100人。今は月3万円の副収入。ゼロからでも全然できた。',
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

export default function CoursePage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan>('スタンダード')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a3e] via-[#0f0f0f] to-[#0f0f0f]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#6366F1] opacity-[0.07] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-5 py-20 sm:py-28 text-center">
          <p className="inline-block text-xs font-bold text-[#a78bfa] uppercase tracking-[0.2em] bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-full px-4 py-1.5 mb-6">
            モニター募集中 · 残り6名限定
          </p>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-6">
            AIでInstagramを<br />
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              完全自動化する
            </span>
            <br />3ヶ月コンサル
          </h1>
          <p className="text-[#aaa] text-base sm:text-lg leading-relaxed mb-4 max-w-xl mx-auto">
            台本・キャプション・投稿分析まで、AIが全部やる仕組みを構築。<br />
            <span className="text-white font-bold">副業会社員でも、1日1時間で週4投稿が継続できる</span>体制を3ヶ月で作ります。
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
            {['平均フォロワー+3,200人 / 3ヶ月', '投稿作業時間 −80%', '受講生満足度 97%'].map(t => (
              <span key={t} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-1.5 text-[#aaa]">
                ✓ {t}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4f46e5] text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors"
            >
              今すぐ申し込む →
            </button>
            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#2a2a2a] text-[#aaa] hover:text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors"
            >
              まず相談する
            </button>
          </div>
          <p className="text-[#555] text-xs mt-4">申込み後、3営業日以内にご連絡します</p>
        </div>
      </section>

      {/* ② 実績数字 */}
      <section className="border-y border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {RESULTS.map(r => (
              <div key={r.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black mb-1" style={{ color: r.color }}>{r.value}</p>
                <p className="text-xs text-[#777] mb-0.5">{r.period}</p>
                <p className="text-xs text-[#555]">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ こんな悩みはありませんか */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">こんな悩みはありませんか？</h2>
        <p className="text-[#555] text-center text-sm mb-10">このプログラムはこれらをすべて解決します</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FOR_WHO.map((item, i) => (
            <div key={i} className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a]">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-black text-white mb-2">{item.title}</p>
                  <p className="text-xs text-[#777] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ④ InstaScript AI とは */}
      <section className="bg-[#111] border-y border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">受講生専用ツール</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">InstaScript AI とは</h2>
          <p className="text-[#777] text-center text-sm mb-10 max-w-xl mx-auto">
            このコンサルでは、受講生全員にAIツール「InstaScript AI」を3ヶ月間無制限で提供します。<br />
            投稿作業のほとんどをAIが代行するため、あなたは「戦略と撮影」だけに集中できます。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AI_FEATURES.map((f, i) => (
              <div key={i} className="bg-[#0f0f0f] rounded-2xl p-5 border border-[#2a2a2a] flex gap-4">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-black text-white mb-1">{f.title}</p>
                  <p className="text-xs text-[#777] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ プランカード */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
        <p className="text-xs font-bold text-red-400 text-center uppercase tracking-widest mb-2">期間限定 モニター価格</p>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">プランを選ぶ</h2>
        <p className="text-[#555] text-center text-sm mb-10">全プランにLINEサポート・Notion教材・AIツールが含まれます</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="relative rounded-2xl overflow-hidden flex flex-col"
              style={{ border: `1.5px solid ${plan.recommended ? plan.color : '#2a2a2a'}` }}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-xs font-black text-white tracking-wider"
                  style={{ background: plan.color }}>
                  ⭐ 最もご好評のプラン
                </div>
              )}

              <div className={`p-6 flex-1 flex flex-col ${plan.recommended ? 'pt-10' : ''}`}
                style={{ background: plan.recommended ? `${plan.color}10` : '#111' }}>
                <p className="text-sm font-bold mb-1" style={{ color: plan.accent }}>{plan.name}プラン</p>
                <p className="text-xs text-[#555] mb-3">{plan.tagline}</p>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="bg-red-500 text-white text-xs font-black rounded-full px-3 py-1">モニター限定50%OFF</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl text-red-400 line-through">{plan.originalPrice}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-[#777]">税込 / 3ヶ月</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-xs text-red-400 font-bold">今だけ期間限定</p>
                  <p className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-red-400/40 text-red-300">
                    残り{plan.slots}名
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                      <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: plan.accent }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selectPlanAndScroll(plan.name)}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={
                    plan.recommended
                      ? { background: plan.color, color: '#fff' }
                      : { background: '#1a1a1a', color: '#fff', border: `1px solid ${plan.color}44` }
                  }
                >
                  このプランで申し込む
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ 3ヶ月の流れ */}
      <section className="bg-[#111] border-y border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">3ヶ月でやること</h2>
          <p className="text-[#555] text-center text-sm mb-10">「やること」を明確にして、最短ルートで収益化まで走ります</p>

          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                    style={{ background: step.color }}>
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 mt-2 bg-[#2a2a2a]" style={{ minHeight: '40px' }} />}
                </div>
                <div className="bg-[#0f0f0f] rounded-2xl border border-[#2a2a2a] p-5 flex-1 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>{step.month}</p>
                  <p className="text-base font-black text-white mb-3">{step.title}</p>
                  <ul className="space-y-1.5">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-[#888]">
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

      {/* ⑦ 受講生の声 */}
      <section className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">受講生の変化</h2>
        <p className="text-[#555] text-center text-sm mb-10">実際の受講生の声（一部）</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: t.color }}>
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-[#555]">{t.plan}プラン受講</p>
                </div>
              </div>
              <div className="bg-[#0f0f0f] rounded-xl p-3 mb-3 border border-[#2a2a2a]">
                <p className="text-[10px] text-[#555] mb-1">受講前</p>
                <p className="text-xs text-[#888]">{t.before}</p>
              </div>
              <p className="text-xs text-[#ccc] leading-relaxed flex-1">"{t.after}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⑧ よくある質問 */}
      <section className="bg-[#111] border-y border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-5 py-16">
          <h2 className="text-2xl font-black text-center mb-10">よくある質問</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#0f0f0f] rounded-2xl border border-[#2a2a2a] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p className="text-sm font-bold text-white">{faq.q}</p>
                  <span className="text-[#555] text-sm shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>
                    ▶
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-[#888] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑨ 申込みフォーム */}
      <section ref={formRef} className="max-w-xl mx-auto px-5 py-16 sm:py-20">
        <p className="text-xs font-bold text-red-400 text-center uppercase tracking-widest mb-2">残り6名 · モニター価格</p>
        <h2 className="text-2xl font-black text-center mb-2">お申込み</h2>
        <p className="text-[#555] text-sm text-center mb-10">送信後、3営業日以内にご連絡します</p>

        {submitted ? (
          <div className="bg-[#052e16] border border-[#22C55E]/50 rounded-2xl p-8 text-center space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="text-xl font-black text-white">お申込みありがとうございます！</p>
            <p className="text-sm text-[#86EFAC]">3営業日以内にメールまたはLINEでご連絡します。<br />少々お待ちください。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-[#999] mb-1.5">
                お名前 <span className="text-red-400 text-xs">必須</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例：田中りっきー"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1.5">
                メールアドレス <span className="text-red-400 text-xs">必須</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1.5">プラン選択</label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map(plan => (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setSelectedPlan(plan.name)}
                    className="rounded-xl py-3 px-2 text-center transition-all border text-sm font-bold"
                    style={
                      selectedPlan === plan.name
                        ? { background: `${plan.color}22`, borderColor: plan.color, color: plan.accent === '#aaa' ? '#fff' : plan.accent }
                        : { background: '#111', borderColor: '#2a2a2a', color: '#666' }
                    }
                  >
                    <p className="text-xs">{plan.name}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{plan.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#999] mb-1.5">ご質問・現在の状況 <span className="text-[#555] text-xs">任意</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="現在のフォロワー数・やりたいジャンル・気になること等、なんでもご記入ください"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#6366F1] transition-colors resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#6366F1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-black py-4 rounded-2xl text-base transition-colors"
            >
              {submitting ? '送信中...' : '申し込む →'}
            </button>

            <p className="text-[#444] text-xs text-center leading-relaxed">
              送信後、3営業日以内にご連絡します。<br />
              お急ぎの方は
              <a href="https://lin.ee/WhGkd90" className="text-[#6366F1] underline underline-offset-2 mx-1">LINE</a>
              からお問い合わせください。
            </p>
          </form>
        )}
      </section>

      <footer className="border-t border-[#1a1a1a] py-8 text-center">
        <p className="text-[#333] text-xs">© 2026 InstaScript AI</p>
      </footer>
    </div>
  )
}
