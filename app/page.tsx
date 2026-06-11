import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ナビゲーション */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-sm tracking-wide">InstaScript AI</span>
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
            ログイン
          </Link>
        </div>
      </header>

      {/* ── 1. ヒーローセクション ── */}
      <section className="bg-gray-950 text-white pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-block text-xs font-medium tracking-widest text-indigo-400 uppercase mb-6">
            無料で使えるAIツール
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
            Instagramの撮影台本を<br className="hidden sm:block" />
            AIが自動生成
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl mx-auto mb-10">
            ジャンル・ターゲット・テーマを入力するだけで、カメラアングルまで指定した本格的な撮影台本が30秒で完成
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm px-8 py-4 rounded-full transition-colors"
            >
              無料で試してみる
            </Link>
            <a
              href="https://lin.ee/9VIHcYZ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-4 rounded-full transition-colors border border-white/20"
            >
              <LineIcon />
              LINE登録で使い方を受け取る
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. 数字で見る実績 ── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">30秒</p>
              <p className="text-xs sm:text-sm text-gray-500">台本生成完了まで</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">3STEP</p>
              <p className="text-xs sm:text-sm text-gray-500">かんたん操作</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-indigo-500 mb-1">完全無料</p>
              <p className="text-xs sm:text-sm text-gray-500">月3回まで</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 機能紹介 ── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            3つの主要機能
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            Instagram運用に必要なことを、AIがまるごとサポート
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FeatureCard
              icon="🎬"
              title="撮影台本生成"
              description="ジャンル・ターゲット・テーマを入力するだけ。カメラアングルや話す内容まで含んだ本格台本が自動で完成します。"
            />
            <FeatureCard
              icon="📊"
              title="ベンチマーク動画分析"
              description="参考にしたいリール動画の画像をAIが分析。構成・編集・訴求ポイントを抽出して自分の投稿に活かせます。"
            />
            <FeatureCard
              icon="🔍"
              title="アカウント分析"
              description="Instagramアカウントを分析して、改善点や伸ばすべき方向性をAIがフィードバックします。"
            />
          </div>
        </div>
      </section>

      {/* ── 4. こんな人におすすめ ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            こんな方におすすめ
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            Instagramをビジネスやブランディングに活用している方に最適です
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <PersonaCard icon="🏪" title="個人事業主" description="集客・ブランディングにInstagramを活用したい方" />
            <PersonaCard icon="💻" title="フリーランサー" description="ポートフォリオや実績をリールで発信したい方" />
            <PersonaCard icon="📈" title="副業したい会社員" description="スキルや知識を発信してマネタイズしたい方" />
            <PersonaCard icon="📱" title="Instagram運用者" description="投稿ネタ切れ・台本作りに時間がかかっている方" />
          </div>
        </div>
      </section>

      {/* ── 5. 使い方 ── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            使い方はカンタン3ステップ
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            登録から台本完成まで、最短2分
          </p>
          <div className="flex flex-col gap-6">
            <StepCard
              step="01"
              title="Googleでログイン"
              description="アカウント登録不要。Googleアカウントでワンクリックでログインできます。"
            />
            <StepCard
              step="02"
              title="ジャンル・ターゲット・テーマを入力"
              description="例）ジャンル「料理」、ターゲット「20代一人暮らし女性」、テーマ「時短パスタレシピ」"
            />
            <StepCard
              step="03"
              title="AIが台本を自動生成"
              description="30秒以内にカメラアングル・話す内容・BGM提案まで含んだ台本が完成します。"
            />
          </div>
        </div>
      </section>

      {/* ── 6. 台本サンプル ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            実際の台本サンプル
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            AIが生成する台本はこんな内容です。コピーしてそのまま撮影に使えます。
          </p>

          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* ヘッダー */}
            <div className="bg-gray-950 px-5 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-white/40 text-xs ml-2">生成結果プレビュー</span>
            </div>

            <div className="divide-y divide-gray-100">
              {/* つかみ */}
              <div className="p-5">
                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-2">つかみ</p>
                <p className="text-base font-bold text-gray-900">&ldquo;1週間で3kg減！？忙しくても続けられた朝だけダイエット法&rdquo;</p>
              </div>

              {/* 動画構成 */}
              <div className="p-5">
                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-3">動画構成</p>
                <div className="space-y-2">
                  {[
                    { time: '0〜3秒', action: 'テロップ＋顔アップ', line: '「朝これだけで痩せました」' },
                    { time: '3〜10秒', action: '食事の手元ショット', line: '「毎朝飲んでいるのがコレ…」' },
                    { time: '10〜20秒', action: '結果のビフォーアフター', line: '「1週間でウエスト-3cm」' },
                    { time: '20〜30秒', action: 'カメラ目線・締め', line: '「保存して試してみてね！」' },
                  ].map((row, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-0.5 sm:gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-indigo-400 text-xs sm:w-20 shrink-0">{row.time}</span>
                      <span className="text-gray-500 sm:w-36 shrink-0">{row.action}</span>
                      <span className="text-gray-800">{row.line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* カメラ指示 */}
              <div className="p-5">
                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-3">カメラ指示</p>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-gray-400">アングル：</span><span className="text-gray-800">正面やや上から・アイレベル交互</span></div>
                  <div><span className="text-gray-400">位置・距離：</span><span className="text-gray-800">バスト〜ウエストショット</span></div>
                  <div><span className="text-gray-400">動き：</span><span className="text-gray-800">ゆっくりズームイン＋カット編集</span></div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">※ これはサンプルです。実際にはあなたのジャンル・テーマに合わせた台本が生成されます。</p>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            よくある質問
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            ご不明な点はフィードバックからお問い合わせください
          </p>
          <div className="space-y-3">
            <FaqItem
              q="無料で使えますか？"
              a="はい、月3回まで完全無料でご利用いただけます。クレジットカード登録も不要です。"
            />
            <FaqItem
              q="どんな業種に使えますか？"
              a="料理、美容、フィットネス、コーチング、不動産、整体・サロン、副業・ビジネス系など、あらゆるジャンルに対応しています。"
            />
            <FaqItem
              q="AIの精度はどうですか？"
              a="Anthropic社が開発したClaude（最新版）を使用しています。撮影現場で実際に使えるレベルの台本を生成します。"
            />
            <FaqItem
              q="スマホでも使えますか？"
              a="はい、スマートフォンに完全対応しています。iPhoneのSafariやAndroidのChromeからそのままご利用いただけます。"
            />
          </div>
        </div>
      </section>

      {/* ── 8. 最終CTA ── */}
      <section className="bg-gray-950 text-white py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">今すぐ始めよう</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
            撮影台本を作る時間を<br className="hidden sm:block" />AIに任せませんか？
          </h2>
          <p className="text-white/50 text-sm sm:text-base mb-10 max-w-md mx-auto">
            クレジットカード不要・登録不要。Googleアカウントさえあれば今すぐ使えます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-base px-10 py-4 rounded-full transition-colors shadow-lg shadow-indigo-500/20"
            >
              今すぐ無料で試す
            </Link>
            <a
              href="https://lin.ee/9VIHcYZ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-4 rounded-full transition-colors border border-white/20"
            >
              <LineIcon />
              LINEで使い方ガイドを受け取る
            </a>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-950 border-t border-white/10 py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/30">
          <span>© 2025 InstaScript AI</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white/60 transition-colors">ログイン</Link>
            <Link href="/feedback" className="hover:text-white/60 transition-colors">フィードバック</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function PersonaCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="shrink-0 w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
        <span className="text-indigo-500 font-bold text-sm">{step}</span>
      </div>
      <div className="pt-2">
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <summary className="flex justify-between items-center px-5 py-4 cursor-pointer list-none text-sm font-semibold text-gray-900 select-none">
        <span>{q}</span>
        <span className="shrink-0 text-gray-400 ml-4 group-open:rotate-45 transition-transform">＋</span>
      </summary>
      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
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
