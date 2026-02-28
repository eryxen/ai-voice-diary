'use client'

import { DiaryListItem } from '@/lib/api'

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  excited: '🤩',
}

interface DiaryListProps {
  items: DiaryListItem[]
  onSelect: (id: string) => void
}

export default function DiaryList({ items, onSelect }: DiaryListProps) {
  if (items.length === 0) {
    return (
      <div className="poke-textbox text-center py-8">
        <p className="text-[11px] text-gray-400">还没有日记</p>
        <p className="text-[9px] text-gray-300 mt-2">点击上方按钮开始录音</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="poke-panel w-full p-3 text-left hover:bg-blue-50 transition-colors cursor-pointer pixel-fade-in"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">{MOOD_EMOJI[item.mood] || '😐'}</span>
              <span className="text-[10px] leading-tight">{item.title}</span>
            </div>
            <span className="text-[8px] text-gray-400 shrink-0 ml-2">
              {new Date(item.created_at).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          {item.tags.length > 0 && (
            <div className="flex gap-1 mt-2 ml-6">
              {item.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[7px] text-poke-blue">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
