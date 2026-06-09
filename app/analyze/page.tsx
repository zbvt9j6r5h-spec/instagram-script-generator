'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type AnalysisResult = {
  summary: string
  genre: string
  target_audience: string
  hook: string
  structure: { time: string; description: string }[]
  camera_work: { angles: string; movements: string; transitions: string }
  staging: { background: string; lighting: string; props: string; text_overlay: string }
  engagement_tactics: string
  strengths: string[]
  suggestions: string[]
}

export default function AnalyzePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<{ data: string; type: string }[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setPreviews((prev) => [...prev, dataUrl])
        const base64 = dataUrl.split(',')[1]
        const mimeType = file.type || 'image/png'
        setImages((prev) => [...prev, { data: base64, type: mimeType }])
      }
      reader.readAsDataURL(file)
    })
  }


  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    setError('')
    if (images.length === 0) {
      setError('画像を1枚以上アップロードしてください')
      return
    }

    setAnalyzing(true)
    setResult(null)

    try {
      const res = await fetch('/api/analyze-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '分析失敗')

      setResult(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'エラーが発生しました'
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">撮影台本ジェネレーター</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
              ログアウト
            </button>
          </div>
        </div>
      </header>
<div className="max-w-3xl mx-auto px-6 py-2">
        <div className="flex gap-4 border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
            台本生成
          </button>
          <button
            onClick={() => router.push('/analyze')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            ベンチマーク分析
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-2">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            台本生成
          </button>
          <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
            ベンチマーク分析
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-1">ベンチマーク動画を分析</h2>
          <p className="text-xs text-gray-500 mb-4">
            バズっているリール動画のスクリーンショットをアップロードすると、AIが構成・演出・戦略を分析します
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition"
          >
            <div className="text-gray-400 text-3xl mb-2">📸</div>
            <p className="text-sm text-gray-600">クリックして画像をアップロード</p>
            <p className="text-xs text-gray-400 mt-1">複数枚OK（動画の各シーンのスクショ推奨）</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {previews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img
                    src={preview}
                    alt={`スクショ ${i + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || images.length === 0}
            className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40"
          >
            {analyzing ? '分析中...（20〜30秒かかります）' : `${images.length}枚の画像を分析する`}
          </button>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mt-3">{error}</div>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">概要</div>
              <p className="text-sm">{result.summary}</p>
              <div className="flex gap-2 mt-3">
                <span className="bg-blue-50 text-blue-700 text-xs rounded px-2 py-0.5">{result.genre}</span>
                <span className="bg-green-50 text-green-700 text-xs rounded px-2 py-0.5">{result.target_audience}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">つかみの手法</div>
              <p className="text-sm font-medium">{result.hook}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">動画構成</div>
              {result.structure.map((s, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr] gap-2 text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500">{s.time}</span>
                  <span>{s.description}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">カメラワーク</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">アングル：</span>{result.camera_work.angles}</div>
                <div><span className="text-gray-500">動き：</span>{result.camera_work.movements}</div>
                <div><span className="text-gray-500">トランジション：</span>{result.camera_work.transitions}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">セッティング</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">背景：</span>{result.staging.background}</div>
                <div><span className="text-gray-500">照明：</span>{result.staging.lighting}</div>
                <div><span className="text-gray-500">小道具：</span>{result.staging.props}</div>
                <div><span className="text-gray-500">テロップ：</span>{result.staging.text_overlay}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">エンゲージメント戦略</div>
              <p className="text-sm">{result.engagement_tactics}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">この動画の強み</div>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-green-500">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">自分の動画に活かせるポイント</div>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-blue-500">💡</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
               router.push(`/dashboard?genre=${encodeURIComponent(result.genre)}&target=${encodeURIComponent(result.target_audience)}&theme=${encodeURIComponent(result.summary)}`)
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              この分析を参考に台本を生成する →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}