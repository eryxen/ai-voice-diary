'use client'

import { DiaryEntry } from '@/lib/api'

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  excited: '🤩',
}

const MOOD_COLOR: Record<string, string> = {
  happy: 'bg-yellow-100 border-yellow-400',
  neutral: 'bg-blue-50 border-blue-300',
  sad: 'bg-blue-100 border-blue-400',
  anxious: 'bg-red-50 border-red-300',
  excited: 'bg-green-50 border-green-300',
}

interface DiaryCardProps {
  diary: DiaryEntry
  onClose: () => void
  onDelete: (id: string) => void
}

export default function DiaryCard({ diary, onClose, onDelete }: DiaryCardProps) {
  const moodEmoji = MOOD_EMOJI[diary.mood] || '😐'
  const moodColor = MOOD_COLOR[diary.mood] || 'bg-gray-50 border-gray-300'

  return (
    <div className="pixel-fade-in space-y-4">
      {/* Header - like Pokémon status screen */}
      <div className={`poke-panel p-4 ${moodColor}`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[12px] leading-tight">{diary.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[16px]">{moodEmoji}</span>
              <span className="text-[9px] text-gray-500 uppercase">{diary.mood}</span>
              {diary.duration_sec && (
                <span className="text-[9px] text-gray-400">
                  {Math.floor(diary.duration_sec / 60)}:{String(Math.floor(diary.duration_sec % 60)).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
          <span className="text-[8px] text-gray-400">
            {new Date(diary.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {/* Content - dialog box style */}
      <div className="poke-textbox">
        <p className="whitespace-pre-wrap leading-[1.8]">{diary.content}</p>
      </div>

      {/* Key Events */}
      {diary.key_events.length > 0 && (
        <div className="poke-panel p-3">
          <div className="text-[9px] text-poke-blue mb-2">▸ KEY EVENTS</div>
          <div className="space-y-1">
            {diary.key_events.map((event, i) => (
              <div key={i} className="text-[10px] flex items-start gap-2">
                <span className="text-poke-yellow">★</span>
                <span>{event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todos */}
      {diary.todos.length > 0 && (
        <div className="poke-panel p-3">
          <div className="text-[9px] text-poke-red mb-2">▸ TODO</div>
          <div className="space-y-1">
            {diary.todos.map((todo, i) => (
              <div key={i} className="text-[10px] flex items-start gap-2">
                <span className="text-poke-red">□</span>
                <span>{todo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {diary.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {diary.tags.map((tag, i) => (
            <span
              key={i}
              className="poke-panel px-2 py-1 text-[8px] text-poke-blue"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Transcript - collapsible */}
      <details className="poke-panel p-3">
        <summary className="text-[9px] text-gray-400 cursor-pointer">
          ▸ 原始转录
        </summary>
        <p className="mt-2 text-[9px] text-gray-500 leading-relaxed">
          {diary.transcript}
        </p>
      </details>

      {/* Action buttons - battle menu style */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onClose} className="poke-btn text-center">
          ← BACK
        </button>
        <button
          onClick={() => {
            if (confirm('确定删除这篇日记吗？')) onDelete(diary.id)
          }}
          className="poke-btn-danger text-center"
        >
          DELETE
        </button>
      </div>
    </div>
  )
}
