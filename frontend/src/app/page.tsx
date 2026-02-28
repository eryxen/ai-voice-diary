'use client'

import { useState, useEffect, useCallback } from 'react'
import Recorder from '@/components/Recorder'
import DiaryList from '@/components/DiaryList'
import DiaryCard from '@/components/DiaryCard'
import {
  createDiary,
  listDiaries,
  getDiary,
  deleteDiary,
  DiaryEntry,
  DiaryListItem,
} from '@/lib/api'

type View = 'home' | 'detail' | 'processing'

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [diaries, setDiaries] = useState<DiaryListItem[]>([])
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null)
  const [processingText, setProcessingText] = useState('')
  const [error, setError] = useState('')

  const loadDiaries = useCallback(async () => {
    try {
      const data = await listDiaries()
      setDiaries(data.items)
    } catch {
      // silent fail on initial load
    }
  }, [])

  useEffect(() => {
    loadDiaries()
  }, [loadDiaries])

  const handleRecordingComplete = async (blob: Blob) => {
    setView('processing')
    setError('')
    setProcessingText('正在转录语音...')

    try {
      setProcessingText('AI 正在整理日记...')
      const diary = await createDiary(blob)
      setSelectedDiary(diary)
      setView('detail')
      await loadDiaries()
    } catch (err: any) {
      setError(err.message || '处理失败')
      setView('home')
    }
  }

  const handleSelectDiary = async (id: string) => {
    try {
      const diary = await getDiary(id)
      setSelectedDiary(diary)
      setView('detail')
    } catch {
      setError('无法加载日记')
    }
  }

  const handleDeleteDiary = async (id: string) => {
    try {
      await deleteDiary(id)
      setView('home')
      setSelectedDiary(null)
      await loadDiaries()
    } catch {
      setError('删除失败')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-8">
      {/* Title bar - Pokémon style */}
      <div className="poke-panel p-3 mb-6 bg-poke-darkblue text-white text-center">
        <h1 className="text-[12px]">🎙️ VOICE DIARY</h1>
        <p className="text-[7px] mt-1 text-blue-200">speak your thoughts</p>
      </div>

      {/* Error toast */}
      {error && (
        <div className="poke-panel p-3 mb-4 bg-red-50 border-poke-red pixel-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-poke-red">{error}</span>
            <button
              onClick={() => setError('')}
              className="text-[9px] text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {view === 'processing' && (
        <div className="poke-textbox text-center py-12 pixel-fade-in">
          <div className="inline-block w-8 h-8 border-[3px] border-poke-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px]">{processingText}</p>
          <div className="hp-bar mt-4 w-48 mx-auto">
            <div className="hp-bar-fill bg-poke-blue animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {view === 'home' && (
        <div className="space-y-6">
          {/* Recorder */}
          <div className="poke-panel p-6 flex justify-center">
            <Recorder onRecordingComplete={handleRecordingComplete} />
          </div>

          {/* Diary list */}
          <div>
            <div className="text-[9px] text-gray-400 mb-2 px-1">
              ▸ DIARY LOG ({diaries.length})
            </div>
            <DiaryList items={diaries} onSelect={handleSelectDiary} />
          </div>
        </div>
      )}

      {view === 'detail' && selectedDiary && (
        <DiaryCard
          diary={selectedDiary}
          onClose={() => {
            setView('home')
            setSelectedDiary(null)
          }}
          onDelete={handleDeleteDiary}
        />
      )}
    </div>
  )
}
