'use client'

import { useState } from 'react'
import type { CategoryData } from '@/lib/parse-knowledge'

type CatKey = 'instagram' | 'ai_tech' | 'marketing' | 'mindset' | 'course' | 'business'

export type DataPayload = {
  instagram: CategoryData | null
  business: CategoryData | null
  course: CategoryData | null
  ai_tech: CategoryData | null
  marketing: CategoryData | null
  mindset: CategoryData | null
  key_task: string | null
  quote: string | null
  quote_author: string | null
}

const CATS: Array<{ key: CatKey; angle: number; emoji: string; label: string; color: string }> = [
  { key: 'instagram', angle: -90,  emoji: '📱', label: 'Instagram・SNS',   color: '#E1306C' },
  { key: 'ai_tech',  angle: -30,  emoji: '🤖', label: 'AI・テクノロジー', color: '#6366F1' },
  { key: 'marketing', angle: 30,  emoji: '📣', label: 'マーケティング',   color: '#3B82F6' },
  { key: 'mindset',  angle: 90,   emoji: '🧠', label: 'マインドセット',   color: '#8B5CF6' },
  { key: 'course',   angle: 150,  emoji: '🎓', label: '講座・コンサル',   color: '#10B981' },
  { key: 'business', angle: 210,  emoji: '💼', label: 'ビジネス・起業',   color: '#F59E0B' },
]

const VW = 1200, VH = 800
const CX = 600, CY = 400
const CAT_R = 220
const SUB_R = 130
const FAN = 25

const POINT_COLORS = [
  { bg: 'rgba(239,68,68,0.12)', border: '#EF4444', text: '#FCA5A5', label: '重要' },
  { bg: 'rgba(234,179,8,0.12)', border: '#EAB308', text: '#FDE047', label: '注目' },
  { bg: 'rgba(34,197,94,0.12)', border: '#22C55E', text: '#86EFAC', label: '実践' },
]

function toRad(d: number) { return d * Math.PI / 180 }

function catPos(angle: number) {
  return { x: CX + CAT_R * Math.cos(toRad(angle)), y: CY + CAT_R * Math.sin(toRad(angle)) }
}

function subPositions(cx: number, cy: number, angle: number, n: number) {
  const offsets = n <= 1 ? [0] : n === 2 ? [-FAN, FAN] : [-FAN, 0, FAN]
  return offsets.map(f => ({
    x: cx + SUB_R * Math.cos(toRad(angle + f)),
    y: cy + SUB_R * Math.sin(toRad(angle + f)),
  }))
}

function trunc(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function qBezier(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  return `M ${x1} ${y1} Q ${mx - dy * 0.12} ${my + dx * 0.12} ${x2} ${y2}`
}

function extractNum(text: string) {
  const m = text.match(/([0-9,]+(?:\.[0-9]+)?)\s*(億|万|%|兆|ドル|円|倍|人|件|回|社|ヶ月|名|個|本|台)/)
  if (!m) return null
  return { num: m[1], unit: m[2], rest: text.replace(m[0], '').replace(/^[・→：:\s]+/, '').trim() }
}

function CategoryDetail({ cat, catData }: { cat: typeof CATS[number]; catData: CategoryData }) {
  const numData = catData.data ? extractNum(catData.data) : null
  return (
    <div className="space-y-3">
      {catData.points.length > 0 && (
        <div className="space-y-2">
          {catData.points.slice(0, 3).map((p, i) => {
            const c = POINT_COLORS[i] ?? POINT_COLORS[2]
            return (
              <div key={i} className="flex items-start gap-2 rounded-xl p-3"
                style={{ background: c.bg, border: `1px solid ${c.border}44` }}>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{ background: `${c.border}33`, color: c.text }}>
                  {c.label}
                </span>
                <p className="text-xs text-white leading-relaxed">{p}</p>
              </div>
            )
          })}
        </div>
      )}

      {(catData.worldTrend || catData.japanApply) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {catData.worldTrend && (
            <div className="bg-[#111] rounded-xl p-3 border border-[#2a2a2a]">
              <p className="text-[10px] text-[#555] mb-1">🌍 世界のトレンド</p>
              <p className="text-xs text-[#ccc] leading-relaxed">{catData.worldTrend}</p>
            </div>
          )}
          {catData.japanApply && (
            <div className="bg-[#111] rounded-xl p-3 border border-[#2a2a2a]">
              <p className="text-[10px] text-[#555] mb-1">🇯🇵 日本での応用</p>
              <p className="text-xs text-[#ccc] leading-relaxed">{catData.japanApply}</p>
            </div>
          )}
        </div>
      )}

      {catData.data && (
        <div className="rounded-xl px-4 py-4 text-center"
          style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}44` }}>
          {numData ? (
            <>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-black" style={{ color: cat.color }}>{numData.num}</span>
                <span className="text-xl font-bold" style={{ color: cat.color }}>{numData.unit}</span>
              </div>
              {numData.rest && <p className="text-xs text-[#888]">{numData.rest}</p>}
            </>
          ) : (
            <p className="text-sm font-bold" style={{ color: cat.color }}>📊 {catData.data}</p>
          )}
        </div>
      )}

      {catData.action && (
        <div className="rounded-xl p-4" style={{ background: `${cat.color}18`, border: `1.5px solid ${cat.color}55` }}>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center"
              style={{ borderColor: cat.color }}>
              <span className="text-[10px]" style={{ color: cat.color }}>✓</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cat.color }}>今日やること</p>
              <p className="text-sm font-bold text-white leading-relaxed">{catData.action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MindmapClient({ data, label }: { data: DataPayload; label: string }) {
  const [selected, setSelected] = useState<CatKey | null>(null)

  function toggleCat(key: CatKey) {
    setSelected(prev => prev === key ? null : key)
  }

  const selectedCat = selected ? CATS.find(c => c.key === selected) ?? null : null
  const selectedData = selected ? data[selected] : null

  return (
    <div>
      {/* === DESKTOP: SVG マインドマップ (md+) === */}
      <div className="hidden md:block">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ maxHeight: '78vh', display: 'block' }}>
          <defs>
            <radialGradient id="mm-bg" cx="50%" cy="50%" r="45%">
              <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={VW} height={VH} fill="#0f0f0f" />
          <circle cx={CX} cy={CY} r={500} fill="url(#mm-bg)" />

          {CATS.map(cat => {
            const { x: catX, y: catY } = catPos(cat.angle)
            const catData = data[cat.key]
            const pts = (catData?.points ?? []).slice(0, 3)
            const isSelected = selected === cat.key
            const subs = subPositions(catX, catY, cat.angle, pts.length)

            return (
              <g key={cat.key}>
                {/* 中心 → カテゴリ の曲線 */}
                <path
                  d={qBezier(CX, CY, catX, catY)}
                  stroke={cat.color}
                  strokeWidth={isSelected ? 2.5 : 1.8}
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                  fill="none"
                />

                {/* カテゴリ → サブポイント の直線 */}
                {subs.map((sp, si) => (
                  <line key={si}
                    x1={catX} y1={catY} x2={sp.x} y2={sp.y}
                    stroke={cat.color} strokeWidth={1}
                    strokeOpacity={isSelected ? 0.55 : 0.22}
                  />
                ))}

                {/* サブポイントノード */}
                {subs.map((sp, si) => (
                  <g key={si} opacity={isSelected ? 1 : 0.5}>
                    <rect x={sp.x - 72} y={sp.y - 17} width={144} height={34} rx={8}
                      fill="#151515"
                      stroke={isSelected ? cat.color : '#252525'}
                      strokeWidth={isSelected ? 1 : 0.8}
                      strokeOpacity={isSelected ? 0.7 : 1}
                    />
                    <text x={sp.x} y={sp.y + 5} textAnchor="middle"
                      fontSize="8" fill={isSelected ? '#ccc' : '#555'}
                      fontFamily="system-ui, -apple-system, sans-serif">
                      {trunc(pts[si] ?? '', 22)}
                    </text>
                  </g>
                ))}

                {/* カテゴリノード（クリック可能） */}
                <g style={{ cursor: 'pointer' }} onClick={() => toggleCat(cat.key)}>
                  <rect
                    x={catX - 82} y={catY - 27} width={164} height={54} rx={14}
                    fill={isSelected ? cat.color : `${cat.color}20`}
                    stroke={cat.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text x={catX} y={catY - 5} textAnchor="middle" fontSize="15"
                    fontFamily="system-ui, -apple-system, sans-serif">
                    {cat.emoji}
                  </text>
                  <text x={catX} y={catY + 13} textAnchor="middle"
                    fontSize="9" fontWeight="700"
                    fill={isSelected ? '#fff' : cat.color}
                    fontFamily="system-ui, -apple-system, sans-serif">
                    {trunc(cat.label, 13)}
                  </text>
                </g>
              </g>
            )
          })}

          {/* 中心ノード */}
          <circle cx={CX} cy={CY} r={56} fill="#111" stroke="#333" strokeWidth={1} />
          <circle cx={CX} cy={CY} r={50} fill="none" stroke="#222" strokeWidth={1} />
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff"
            fontFamily="system-ui, -apple-system, sans-serif">今日の学び</text>
          <text x={CX} y={CY + 8} textAnchor="middle" fontSize="8.5" fill="#666"
            fontFamily="system-ui, -apple-system, sans-serif">{label}</text>
          <text x={CX} y={CY + 24} textAnchor="middle" fontSize="7" fill="#3a3a3a"
            fontFamily="system-ui, -apple-system, sans-serif">クリックで詳細</text>
        </svg>

        {/* 詳細パネル */}
        {selectedCat && selectedData && (
          <div className="rounded-2xl overflow-hidden mt-3" style={{ border: `1.5px solid ${selectedCat.color}55` }}>
            <div className="flex items-center justify-between px-5 py-3"
              style={{ background: `${selectedCat.color}22` }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedCat.emoji}</span>
                <h3 className="font-bold text-white text-sm">{selectedCat.label}</h3>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-[#555] hover:text-white transition-colors text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                ✕
              </button>
            </div>
            <div className="p-5 bg-[#0f0f0f]">
              <CategoryDetail cat={selectedCat} catData={selectedData} />
            </div>
          </div>
        )}
      </div>

      {/* === MOBILE: 縦型アコーディオン (< md) === */}
      <div className="md:hidden space-y-2">
        {CATS.map(cat => {
          const catData = data[cat.key]
          const isOpen = selected === cat.key

          return (
            <div key={cat.key} className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${isOpen ? cat.color + '88' : cat.color + '44'}` }}>
              <button
                className="w-full flex items-center justify-between px-4 py-4 text-left"
                style={{ background: isOpen ? `${cat.color}20` : '#111' }}
                onClick={() => toggleCat(cat.key)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{cat.label}</p>
                    {catData?.points[0] && (
                      <p className="text-[10px] text-[#666] mt-0.5 line-clamp-1 max-w-[210px]">
                        {catData.points[0]}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[#555] text-xs shrink-0 ml-2 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>
                  ▶
                </span>
              </button>

              {isOpen && catData && (
                <div className="px-4 pb-5 pt-3 bg-[#0f0f0f]">
                  <CategoryDetail cat={cat} catData={catData} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
