'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 max-w-md w-full text-center space-y-5">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold text-white">アクセスできません</h1>
        <p className="text-sm text-[#888] leading-relaxed">
          このツールは招待制です。<br />
          アクセス権限をお持ちでないアカウントでログインしています。
        </p>
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 space-y-2">
          <p className="text-xs text-[#666]">利用をご希望の方はLINEからご連絡ください</p>
          <a
            href="https://lin.ee/WhGkd90"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            💬 LINEで問い合わせる
          </a>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#555] hover:text-[#888] transition-colors"
        >
          別のアカウントでログインする
        </button>
      </div>
    </div>
  )
}
