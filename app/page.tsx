import Link from 'next/link'

const LINE_URL = 'https://lin.ee/9VIHcYZ'

const HERO_BADGES = ['30秒で完成', '登録不要ログイン', '月3回まで完全無料']

const STATS = [
  { value: '30秒', label: '台本生成完了まで', period: '入力してから', color: '#6366F1' },
  { value: '3STEP', label: 'かんたん操作', period: 'ログイン→入力→生成', color: '#10B981' },
  { value: '無制限', label: '対応ジャンル', period: '料理・美容・副業など', color: '#F59E0B' },
  { value: '完全無料', label: '月3回まで', period: 'カード登録不要', color: '#E1306C' },
]

const BEFORE_AFTER = [
  { before: '台本を考えるのに毎回1時間以上かかる', after: 'テーマを入力するだけで30秒で完成' },
  { before: '撮影中に何を話すか忘れて撮り直す', after: 'セリフ・カメラアングルまで台本に明記' },
  { before: '伸びてる動画の理由がわからない', after: 'AIが構成・訴求ポイントを自動分析' },
  { before: '投稿ネタが尽きて更新が止まる', after: 'ジャンル×ターゲットで何本でも提案' },
]

const FEATURES = [
  {
    icon: '🎬',
    title: '撮影台本生成',
    description: 'ジャンル・ターゲット・テーマを入力するだけ。カメラアングルや話す内容まで含んだ本格台本が自動で完成します。',
    color: '#6366F1',
  },
  {
    icon: '📊',
    title: 'ベンチマーク動画分析',
    description: '参考にしたいリール動画の画像をAIが分析。構成・編集・訴求ポイントを抽出して自分の投稿に活かせます。',
    color: '#E1306C',
  },
  {
    icon: '🔍',
    title: 'アカウント分析',
    description: 'Instagramアカウントを分析して、改善点や伸ばすべき方向性をAIがフィードバックします。',
    color: '#10B981',
  },
]

const PERSONAS = [
  { icon: '🏪', title: '個人事業主', description: '集客・ブランディングにInstagramを活用したい方' },
  { icon: '💻', title: 'フリーランサー', description: 'ポートフォリオや実績をリールで発信したい方' },
  { icon: '📈', title: '副業したい会社員', description: 'スキルや知識を発信してマネタイズしたい方' },
  { icon: '📱', title: 'Instagram運用者', description: '投稿ネタ切れ・台本作りに時間がかかっている方' },
]

const STEPS = [
  { step: '01', title: 'Googleでログイン', description: 'アカウント登録不要。Googleアカウントでワンクリックでログインできます。', color: '#6366F1' },
  { step: '02', title: 'ジャンル・ターゲット・テーマを入力', description: '例）ジャンル「料理」、ターゲット「20代一人暮らし女性」、テーマ「時短パスタレシピ」', color: '#E1306C' },
  { step: '03', title: 'AIが台本を自動生成', description: '30秒以内にカメラアングル・話す内容・BGM提案まで含んだ台本が完成します。', color: '#10B981' },
]

const SCRIPT_ROWS = [
  { time: '0〜3秒', action: 'テロップ＋顔アップ', line: '「朝これだけで痩せました」' },
  { time: '3〜10秒', action: '食事の手元ショット', line: '「毎朝飲んでいるのがコレ…」' },
  { time: '10〜20秒', action: '結果のビフォーアフター', line: '「1週間でウエスト-3cm」' },
  { time: '20〜30秒', action: 'カメラ目線・締め', line: '「保存して試してみてね！」' },
]

const FAQS = [
  { q: '無料で使えますか？', a: 'はい、月3回まで完全無料でご利用いただけます。クレジットカード登録も不要です。' },
  { q: 'どんな業種に使えますか？', a: '料理、美容、フィットネス、コーチング、不動産、整体・サロン、副業・ビジネス系など、あらゆるジャンルに対応しています。' },
  { q: 'AIの精度はどうですか？', a: 'Anthropic社が開発したClaude（最新版）を使用しています。撮影現場で実際に使えるレベルの台本を生成します。' },
  { q: 'スマホでも使えますか？', a: 'はい、スマートフォンに完全対応しています。iPhoneのSafariやAndroidのChromeからそのままご利用いただけます。' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05050a] text-white antialiased">

      {/* ナビゲーション */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#05050a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #6366F1, #E1306C)' }}>
              I
            </span>
            <span className="text-white font-black text-sm tracking-wide">InstaScript AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login?ref=lp" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">
              ログイン
            </Link>
            <Link
              href="/login?ref=lp"
              className="text-xs font-bold text-white px-4 py-2 rounded-full transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8b5cf6)' }}
            >
              無料で試す
            </Link>
          </div>
        </div>
      </header>

      {/* ── 1. ヒーローセクション ── */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4 sm:px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #12122e 0%, #05050a 55%, #0a0a14 100%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#6366F1] opacity-[0.09] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-[8%] w-[320px] h-[320px] bg-[#E1306C] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-[5%] w-[380px] h-[380px] bg-[#10B981] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          {/* テキスト */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#a78bfa] uppercase tracking-[0.15em] bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
              Claude搭載 · 完全無料で使えるAIツール
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-[1.15] mb-6 tracking-tight">
              Instagramの撮影台本を<br />
              <span style={{ background: 'linear-gradient(90deg, #6366F1, #a78bfa, #E1306C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AIが自動生成
              </span>
            </h1>

            <p className="text-[#999] text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              ジャンル・ターゲット・テーマを入力するだけで、<br className="hidden sm:block" />
              <span className="text-white font-bold">カメラアングルまで指定した本格台本</span>が30秒で完成します。
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-10 text-sm">
              {HERO_BADGES.map(t => (
                <span key={t} className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-[#bbb] text-xs">
                  ✓ {t}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/login?ref=lp"
                className="group inline-flex items-center justify-center gap-2 text-white font-black px-9 py-4 rounded-2xl text-base transition-all shadow-lg shadow-[#6366F1]/30 hover:shadow-[#6366F1]/50 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8b5cf6)' }}
              >
                無料で今すぐ試す
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href={LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
              >
                <LineIcon />
                LINEで使い方を受け取る
              </a>
            </div>
            <p className="text-[#444] text-xs mt-4">クレジットカード不要 · Googleアカウントで即利用開始</p>
          </div>

          {/* プレビューモックアップ */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute -top-4 -right-4 z-10 bg-[#0d0d0d] border border-[#6366F1]/40 rounded-xl px-3 py-2 shadow-lg shadow-[#6366F1]/20 rotate-3">
              <p className="text-[10px] text-[#a78bfa] font-bold whitespace-nowrap">⚡ 28秒で生成完了</p>
            </div>
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-[#6366F1]/10 bg-[#0d0d0d] -rotate-1">
              <div className="bg-[#111] px-5 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <span className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <span className="text-white/30 text-xs ml-2">InstaScript AI · 生成結果</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] text-[#6366F1] font-bold uppercase tracking-wider mb-1.5">つかみ</p>
                  <p className="text-sm font-bold text-white leading-relaxed">&ldquo;1週間で3kg減！？忙しくても続けられた朝だけダイエット法&rdquo;</p>
                </div>
                <div className="space-y-1.5">
                  {SCRIPT_ROWS.slice(0, 2).map((row, i) => (
                    <div key={i} className="flex gap-3 text-xs py-1.5 border-t border-white/5">
                      <span className="text-[#a78bfa] w-14 shrink-0">{row.time}</span>
                      <span className="text-[#777]">{row.line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 数字で見る実績 ── */}
      <section className="border-y border-white/10 bg-[#080810]">
        <div className="max-w-4xl mx-auto px-5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#666] mb-0.5">{s.period}</p>
                <p className="text-xs text-[#444]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Before / After ── */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6">
        <div className="absolute top-0 right-[10%] w-[400px] h-[400px] bg-[#8b5cf6] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">Before / After</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">AIに任せると、ここまで変わります</h2>
          <p className="text-[#555] text-center text-sm mb-12">台本作りの &ldquo;当たり前&rdquo; だった悩みを、まるごと解消します</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BEFORE_AFTER.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-stretch gap-3 bg-[#0d0d0d] rounded-2xl border border-white/10 p-5">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5">従来</p>
                  <p className="text-sm text-[#888] leading-relaxed">{item.before}</p>
                </div>
                <div className="flex items-center justify-center text-[#333] sm:rotate-0 rotate-90 shrink-0">→</div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider mb-1.5">InstaScript AI</p>
                  <p className="text-sm text-white font-bold leading-relaxed">{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 機能紹介 ── */}
      <section className="bg-[#0a0a0f] border-y border-white/10 py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">3つの主要機能</h2>
          <p className="text-center text-[#555] text-sm mb-12">Instagram運用に必要なことを、AIがまるごとサポート</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-[#0d0d0d] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: `${f.color}1a` }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#777] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. こんな人におすすめ ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">For Who</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">こんな方におすすめ</h2>
          <p className="text-center text-[#555] text-sm mb-12">Instagramをビジネスやブランディングに活用している方に最適です</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PERSONAS.map((p, i) => (
              <div key={i} className="bg-[#0d0d0d] rounded-2xl border border-white/10 p-5 text-center hover:border-white/20 transition-colors">
                <div className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center text-xl mb-3 bg-white/5">
                  {p.icon}
                </div>
                <h3 className="font-black text-white text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-[#666] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 使い方 ── */}
      <section className="bg-[#0a0a0f] border-y border-white/10 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">使い方はカンタン3ステップ</h2>
          <p className="text-center text-[#555] text-sm mb-12">登録から台本完成まで、最短2分</p>

          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0" style={{ background: s.color }}>
                    {s.step}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 mt-2 bg-white/10" style={{ minHeight: '30px' }} />}
                </div>
                <div className="bg-[#0d0d0d] rounded-2xl border border-white/10 p-5 flex-1 mb-2">
                  <h3 className="font-black text-white mb-1.5">{s.title}</h3>
                  <p className="text-sm text-[#777] leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 台本サンプル ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#6366F1] text-center uppercase tracking-widest mb-3">Sample</p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">実際の台本サンプル</h2>
          <p className="text-center text-[#555] text-sm mb-12">AIが生成する台本はこんな内容です。コピーしてそのまま撮影に使えます。</p>

          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-[#6366F1]/5 bg-[#0d0d0d]">
            <div className="bg-[#111] px-5 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <span className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <span className="text-white/30 text-xs ml-2">生成結果プレビュー</span>
            </div>

            <div className="divide-y divide-white/5">
              <div className="p-5">
                <p className="text-xs text-[#a78bfa] font-bold uppercase tracking-wider mb-2">つかみ</p>
                <p className="text-base font-black text-white">&ldquo;1週間で3kg減！？忙しくても続けられた朝だけダイエット法&rdquo;</p>
              </div>

              <div className="p-5">
                <p className="text-xs text-[#a78bfa] font-bold uppercase tracking-wider mb-3">動画構成</p>
                <div className="space-y-2">
                  {SCRIPT_ROWS.map((row, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-0.5 sm:gap-3 text-sm py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-[#6366F1] text-xs sm:w-20 shrink-0">{row.time}</span>
                      <span className="text-[#666] sm:w-36 shrink-0">{row.action}</span>
                      <span className="text-[#ddd]">{row.line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs text-[#a78bfa] font-bold uppercase tracking-wider mb-3">カメラ指示</p>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-[#555]">アングル：</span><span className="text-[#ddd]">正面やや上から・アイレベル交互</span></div>
                  <div><span className="text-[#555]">位置・距離：</span><span className="text-[#ddd]">バスト〜ウエストショット</span></div>
                  <div><span className="text-[#555]">動き：</span><span className="text-[#ddd]">ゆっくりズームイン＋カット編集</span></div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#444] mt-4">※ これはサンプルです。実際にはあなたのジャンル・テーマに合わせた台本が生成されます。</p>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section className="bg-[#0a0a0f] border-y border-white/10 py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-3">よくある質問</h2>
          <p className="text-center text-[#555] text-sm mb-12">ご不明な点はフィードバックからお問い合わせください</p>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. 最終CTA ── */}
      <section className="relative overflow-hidden py-28 px-4 sm:px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #12122e 0%, #05050a 60%, #0a0a14 100%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#6366F1] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-[#a78bfa] text-xs font-bold uppercase tracking-widest mb-4">今すぐ始めよう</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight tracking-tight">
            撮影台本を作る時間を<br className="hidden sm:block" />AIに任せませんか？
          </h2>
          <p className="text-[#999] text-sm sm:text-base mb-10 max-w-md mx-auto">
            クレジットカード不要・登録不要。Googleアカウントさえあれば今すぐ使えます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login?ref=lp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-black text-base px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[#6366F1]/30 hover:shadow-[#6366F1]/50 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8b5cf6)' }}
            >
              今すぐ無料で試す →
            </Link>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
            >
              <LineIcon />
              LINEで使い方ガイドを受け取る
            </a>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-white/10 py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#444]">
          <span>© 2026 InstaScript AI · Powered by Claude</span>
          <div className="flex gap-4">
            <Link href="/login?ref=lp" className="hover:text-white/60 transition-colors">ログイン</Link>
            <Link href="/feedback" className="hover:text-white/60 transition-colors">フィードバック</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-[#0d0d0d] rounded-2xl border border-white/10 overflow-hidden">
      <summary className="flex justify-between items-center px-5 py-4 cursor-pointer list-none text-sm font-bold text-white select-none">
        <span>{q}</span>
        <span className="shrink-0 text-[#555] ml-4 group-open:rotate-45 transition-transform">＋</span>
      </summary>
      <div className="px-5 pb-4 text-sm text-[#888] leading-relaxed border-t border-white/5 pt-3">
        {a}
      </div>
    </details>
  )
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.078 2 11.108c0 2.608 1.14 4.958 2.97 6.67-.13.466-.842 3.022-.896 3.222 0 0-.028.22.116.304.144.083.311.01.311.01.41-.057 4.757-3.112 5.372-3.516.695.097 1.408.15 2.127.15 5.523 0 10-4.078 10-9.108C22 6.078 17.523 2 12 2z" />
    </svg>
  )
}
