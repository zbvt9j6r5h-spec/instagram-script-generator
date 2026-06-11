import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ナビゲーション */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-sm tracking-wide">InstaScript AI</span>
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm px-8 py-4 rounded-full transition-colors"
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

      {/* 機能紹介セクション */}
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
              description="参考にしたいリール動画のURLや画像をAIが分析。構成・編集・訴求ポイントを抽出して自分の投稿に活かせます。"
            />
            <FeatureCard
              icon="🔍"
              title="アカウント分析"
              description="Instagramアカウントを分析して、改善点や伸ばすべき方向性をAIがフィードバックします。"
            />
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-20 px-4 sm:px-6 bg-white">
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

      {/* CTAセクション */}
      <section className="bg-gray-950 text-white py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            今すぐ無料で試してみませんか？
          </h2>
          <p className="text-white/60 text-sm sm:text-base mb-10">
            クレジットカード不要・登録不要。Googleアカウントさえあれば今すぐ使えます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm px-8 py-4 rounded-full transition-colors"
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
              LINEで使い方を受け取る
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
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

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.078 2 11.108c0 2.608 1.14 4.958 2.97 6.67-.13.466-.842 3.022-.896 3.222 0 0-.028.22.116.304.144.083.311.01.311.01.41-.057 4.757-3.112 5.372-3.516.695.097 1.408.15 2.127.15 5.523 0 10-4.078 10-9.108C22 6.078 17.523 2 12 2z" />
    </svg>
  )
}
