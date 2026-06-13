'use client'

import { useRef, useState } from 'react'

type Plan = 'ライト' | 'スタンダード' | 'プレミアム'

const PLANS: Array<{
  name: Plan
  originalPrice: string
  price: string
  recommended?: boolean
  slots: number
  features: string[]
  color: string
  accent: string
}> = [
  {
    name: 'ライト',
    originalPrice: '¥200,000',
    price: '¥100,000',
    slots: 3,
    color: '#2a2a2a',
    accent: '#888',
    features: [
      'InstaScript AI（台本・分析）3ヶ月使い放題',
      '初回Zoom：アカウント診断60分 × 1回',
      'LINEサポート3ヶ月',
      'Notion教材',
    ],
  },
  {
    name: 'スタンダード',
    originalPrice: '¥300,000',
    price: '¥150,000',
    recommended: true,
    slots: 2,
    color: '#6366F1',
    accent: '#6366F1',
    features: [
      'InstaScript AI（全機能）3ヶ月使い放題',
      '初回Zoom：アカウント診断90分 × 1回',
      '月1回Zoom（60分）× 3回',
      'LINEサポート3ヶ月',
      'Notion教材',
      '投稿スケジュール作成サポート',
    ],
  },
  {
    name: 'プレミアム',
    originalPrice: '¥400,000',
    price: '¥200,000',
    slots: 1,
    color: '#F59E0B',
    accent: '#F59E0B',
    features: [
      'InstaScript AI（全機能）3ヶ月使い放題',
      '初回Zoom：アカウント診断90分 × 1回',
      '月2回Zoom（60分）× 3ヶ月',
      'LINEサポート3ヶ月',
      'Notion教材',
      '投稿自動化システム構築',
      '月間コンテンツ戦略作成',
    ],
  },
]

const FOR_WHO = [
  { emoji: '👔', text: '副業でInstagramを始めたい会社員' },
  { emoji: '⚡', text: 'AIを使って投稿作業を効率化したい人' },
  { emoji: '📈', text: 'フォロワーを増やしてビジネスにつなげたい人' },
  { emoji: '💡', text: '毎日の投稿ネタに悩んでいる人' },
]

const STEPS = [
  { month: '1ヶ月目', title: '戦略設計', desc: 'ジャンル・ターゲット・世界観を決め、勝てるアカウントの土台を作ります。', color: '#E1306C' },
  { month: '2ヶ月目', title: 'コンテンツ量産', desc: 'AIツールを活用した投稿制作・スケジュール管理をマスターします。', color: '#6366F1' },
  { month: '3ヶ月目', title: 'マネタイズ導線', desc: 'LINE誘導・問い合わせ対応・収益化の仕組みを整えます。', color: '#10B981' },
]

const FAQS = [
  { q: '副業初心者でも大丈夫ですか？', a: 'はい、AIツールが全部サポートするので初心者でも安心です。ゼロから一緒に構築します。' },
  { q: 'いつから始められますか？', a: 'お申込み後、3営業日以内にご連絡します。スタート日は相談して決めます。' },
  { q: '分割払いはできますか？', a: 'ご相談ください。LINEでお問い合わせいただければ対応します。' },
  { q: '返金保証はありますか？', a: '開始前のキャンセルは全額返金します。安心してお申込みください。' },
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

      {/* ① ヒーローセクション */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a3e] via-[#0f0f0f] to-[#0f0f0f]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#6366F1] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-5 py-20 sm:py-28 text-center">
          <p className="inline-block text-xs font-bold text-[#a78bfa] uppercase tracking-[0.2em] bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-full px-4 py-1.5 mb-6">
            3ヶ月コンサルプログラム
          </p>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-6">
            AIでInstagramを<br />
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              自動化する
            </span>
            <br />3ヶ月プログラム
          </h1>
          <p className="text-[#888] text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            撮影台本からキャプションまで、AIが全部作る仕組みを一緒に構築します
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 bg-[#6366F1] hover:bg-[#4f46e5] text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors"
          >
            申込みフォームへ ↓
          </button>
        </div>
      </section>

      {/* ② プランカード */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">プランを選ぶ</h2>
        <p className="text-[#555] text-center text-sm mb-10">すべてのプランにLINEサポートとNotion教材が含まれます</p>

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
                  ⭐ おすすめ
                </div>
              )}

              <div className={`p-6 flex-1 flex flex-col ${plan.recommended ? 'pt-10' : ''}`}
                style={{ background: plan.recommended ? `${plan.color}10` : '#111' }}>
                <p className="text-sm font-bold mb-3" style={{ color: plan.accent }}>{plan.name}プラン</p>
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
                  <p className="text-xs text-red-400 font-bold">今だけ期間限定価格</p>
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

      {/* ③ こんな人向け */}
      <section className="bg-[#111] border-y border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-5 py-16">
          <h2 className="text-2xl font-black text-center mb-10">こんな人に向いています</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FOR_WHO.map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]">
                <span className="text-3xl">{item.emoji}</span>
                <p className="text-sm font-bold text-white leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ④ 講座の流れ */}
      <section className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-2xl font-black text-center mb-3">講座の流れ</h2>
        <p className="text-[#555] text-center text-sm mb-10">3ヶ月で収益化できるアカウントを作ります</p>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-5 items-start">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                  style={{ background: step.color }}>
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 mt-2 bg-[#2a2a2a]" style={{ minHeight: '32px' }} />}
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-5 flex-1 mb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>{step.month}</p>
                <p className="text-base font-black text-white mb-1">{step.title}</p>
                <p className="text-sm text-[#777] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⑤ よくある質問 */}
      <section className="bg-[#111] border-y border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-5 py-16">
          <h2 className="text-2xl font-black text-center mb-10">よくある質問</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden">
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

      {/* ⑥ 申込みフォーム */}
      <section ref={formRef} className="max-w-xl mx-auto px-5 py-16 sm:py-20">
        <h2 className="text-2xl font-black text-center mb-2">お申込み</h2>
        <p className="text-[#555] text-sm text-center mb-10">3営業日以内にご連絡します</p>

        {submitted ? (
          <div className="bg-[#052e16] border border-[#22C55E]/50 rounded-2xl p-8 text-center space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="text-xl font-black text-white">お申込みありがとうございます！</p>
            <p className="text-sm text-[#86EFAC]">3営業日以内にメールまたはLINEでご連絡します。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* お名前 */}
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

            {/* メールアドレス */}
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

            {/* プラン選択 */}
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
                        ? { background: `${plan.color}22`, borderColor: plan.color, color: plan.accent === '#888' ? '#fff' : plan.accent }
                        : { background: '#111', borderColor: '#2a2a2a', color: '#666' }
                    }
                  >
                    <p className="text-xs">{plan.name}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{plan.price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ご質問 */}
            <div>
              <label className="block text-sm text-[#999] mb-1.5">ご質問・ご要望 <span className="text-[#555] text-xs">任意</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="ご不明な点や気になることをご記入ください"
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

      {/* フッター */}
      <footer className="border-t border-[#1a1a1a] py-8 text-center">
        <p className="text-[#333] text-xs">© 2026 InstaScript AI</p>
      </footer>
    </div>
  )
}
