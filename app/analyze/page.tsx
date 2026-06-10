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

function extractFrames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) { reject(new Error('Canvas not supported')); return }

    const timestamps = [0, 3, 6, 9, 12]
    const frames: string[] = []
    let index = 0

    video.preload = 'auto'
    video.muted = true
    video.src = URL.createObjectURL(file)

    video.onloadedmetadata = () => {
      const MAX_W = 1280
      const MAX_H = 720
      const scale = Math.min(1, MAX_W / video.videoWidth, MAX_H / video.videoHeight)
      canvas.width = Math.floor(video.videoWidth * scale)
      canvas.height = Math.floor(video.videoHeight * scale)

      const captureNext = () => {
        while (index < timestamps.length && timestamps[index] >= video.duration) {
          index++
        }
        if (index >= timestamps.length) {
          URL.revokeObjectURL(video.src)
          resolve(frames)
          return
        }
        video.currentTime = timestamps[index]
      }

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        frames.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1])
        index++
        captureNext()
      }

      captureNext()
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('動画の読み込みに失敗しました'))
    }
  })
}

export default function AnalyzePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [subTab, setSubTab] = useState<'image' | 'video'>('image')

  // 画像タブ
  const [images, setImages] = useState<{ data: string; type: string }[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  // 動画タブ
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoName, setVideoName] = useState('')

  // 共通
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeStatus, setAnalyzeStatus] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [remainingUsage, setRemainingUsage] = useState<number | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('feature', 'analyze-benchmark')
        .gte('created_at', startOfMonth.toISOString())
      setRemainingUsage(3 - (count ?? 0))

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
        setImages((prev) => [...prev, { data: dataUrl.split(',')[1], type: file.type || 'image/png' }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('ファイルサイズは50MB以下にしてください')
      return
    }
    setVideoFile(file)
    setVideoName(file.name)
    setError('')
  }

  const handleAnalyze = async () => {
    setError('')

    let frameImages: { data: string; type: string }[] = []
    let apiPath = '/api/analyze-benchmark'

    if (subTab === 'image') {
      if (images.length === 0) {
        setError('画像を1枚以上アップロードしてください')
        return
      }
      frameImages = images
      apiPath = '/api/analyze-benchmark'
      setAnalyzing(true)
      setResult(null)
    } else {
      if (!videoFile) {
        setError('動画ファイルをアップロードしてください')
        return
      }
      setAnalyzing(true)
      setResult(null)
      setAnalyzeStatus('フレームを抽出しています...')
      try {
        const frames = await extractFrames(videoFile)
        if (frames.length === 0) throw new Error('フレームを抽出できませんでした')
        frameImages = frames.map((f) => ({ data: f, type: 'image/jpeg' }))
        apiPath = '/api/analyze-video'
        setAnalyzeStatus('動画を分析中...')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'フレーム抽出に失敗しました')
        setAnalyzing(false)
        setAnalyzeStatus('')
        return
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ images: frameImages }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '分析失敗')

      setResult(data)
      setRemainingUsage((prev) => (prev !== null ? Math.max(0, prev - 1) : null))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setAnalyzing(false)
      setAnalyzeStatus('')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const switchSubTab = (tab: 'image' | 'video') => {
    setSubTab(tab)
    setResult(null)
    setError('')
  }

  const analyzeButtonDisabled =
    analyzing ||
    remainingUsage === 0 ||
    (subTab === 'image' ? images.length === 0 : !videoFile)

  const analyzeButtonLabel = (() => {
    if (analyzing) return analyzeStatus || '分析中...（20〜30秒かかります）'
    if (subTab === 'image') return `${images.length}枚の画像を分析する`
    return videoFile ? '動画を分析する' : '動画を選択してください'
  })()

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
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            台本生成
          </button>
          <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
            ベンチマーク分析
          </button>
          <button
            onClick={() => router.push('/account-analysis')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            アカウント分析
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-1">ベンチマーク動画を分析</h2>
          <p className="text-xs text-gray-500 mb-4">
            バズっているリール動画を分析し、AIが構成・演出・戦略を解説します
          </p>

          {/* サブタブ */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5">
            <button
              onClick={() => switchSubTab('image')}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
                subTab === 'image' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              画像
            </button>
            <button
              onClick={() => switchSubTab('video')}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
                subTab === 'video' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              動画
            </button>
          </div>

          {/* 画像タブ */}
          {subTab === 'image' && (
            <>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition"
              >
                <div className="text-gray-400 text-3xl mb-2">📸</div>
                <p className="text-sm text-gray-600">クリックして画像をアップロード</p>
                <p className="text-xs text-gray-400 mt-1">複数枚OK（動画の各シーンのスクショ推奨）</p>
              </div>
              <input
                ref={imageInputRef}
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
            </>
          )}

          {/* 動画タブ */}
          {subTab === 'video' && (
            <>
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition"
              >
                {videoName ? (
                  <>
                    <div className="text-gray-400 text-3xl mb-2">🎬</div>
                    <p className="text-sm text-gray-700 font-medium">{videoName}</p>
                    <p className="text-xs text-gray-400 mt-1">クリックして変更</p>
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 text-3xl mb-2">🎬</div>
                    <p className="text-sm text-gray-600">クリックして動画をアップロード</p>
                    <p className="text-xs text-gray-400 mt-1">mp4 / mov・50MBまで</p>
                  </>
                )}
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleVideoChange}
                className="hidden"
              />
              {videoName && (
                <p className="text-xs text-gray-400 mt-2">
                  0秒・3秒・6秒・9秒・12秒付近のフレームを自動抽出して分析します
                </p>
              )}
            </>
          )}

          {/* 残り回数・ボタン・エラー（共通） */}
          {remainingUsage !== null && (
            <p className="text-xs text-gray-400 text-right mt-4">今月の残り回数：{remainingUsage} / 3回</p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzeButtonDisabled}
            className="w-full mt-2 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40"
          >
            {analyzeButtonLabel}
          </button>

          {remainingUsage === 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-3 mt-3">
              今月の無料枠を使い切りました
            </div>
          )}

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
