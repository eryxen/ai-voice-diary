'use client'

import { useState, useRef, useCallback } from 'react'

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void
  disabled?: boolean
}

export default function Recorder({ onRecordingComplete, disabled }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      chunks.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        onRecordingComplete(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      mediaRecorder.current = recorder
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch (err) {
      alert('无法访问麦克风，请检查权限设置')
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording && (
        <div className="poke-panel px-6 py-3 pixel-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-poke-red rounded-full recording-pulse" />
            <span className="text-[11px]">REC {formatTime(duration)}</span>
          </div>
          {/* HP bar style timer (max 5 min) */}
          <div className="hp-bar mt-2 w-48">
            <div
              className="hp-bar-fill bg-poke-red"
              style={{ width: `${Math.min((duration / 300) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`
          w-20 h-20 rounded-full border-[4px] shadow-pixel
          flex items-center justify-center
          transition-all duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${
            isRecording
              ? 'bg-poke-red border-red-700 hover:bg-red-600 recording-pulse'
              : 'bg-poke-panel border-poke-border hover:bg-poke-blue hover:border-poke-darkblue group'
          }
        `}
      >
        {isRecording ? (
          <div className="w-6 h-6 bg-white rounded-sm" />
        ) : (
          <svg
            className="w-8 h-8 text-poke-border group-hover:text-white transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      <span className="text-[9px] text-gray-500">
        {isRecording ? '点击停止' : disabled ? '处理中...' : '点击录音'}
      </span>
    </div>
  )
}
