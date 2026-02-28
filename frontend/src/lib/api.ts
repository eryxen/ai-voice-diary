const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://voicediary.zeabur.app'

export interface DiaryEntry {
  id: string
  title: string
  content: string
  transcript: string
  mood: string
  key_events: string[]
  todos: string[]
  tags: string[]
  audio_path: string | null
  duration_sec: number | null
  created_at: string
}

export interface DiaryListItem {
  id: string
  title: string
  mood: string
  tags: string[]
  duration_sec: number | null
  created_at: string
}

export async function createDiary(audioBlob: Blob): Promise<DiaryEntry> {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')

  const res = await fetch(`${API_BASE}/api/diary/create`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Failed to create diary')
  }

  return res.json()
}

export async function listDiaries(page = 1, limit = 20): Promise<{
  items: DiaryListItem[]
  total: number
  page: number
}> {
  const res = await fetch(`${API_BASE}/api/diary/list?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load diaries')
  return res.json()
}

export async function getDiary(id: string): Promise<DiaryEntry> {
  const res = await fetch(`${API_BASE}/api/diary/${id}`)
  if (!res.ok) throw new Error('Diary not found')
  return res.json()
}

export async function deleteDiary(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/diary/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete diary')
}

export async function searchDiaries(q: string): Promise<{
  items: DiaryListItem[]
  query: string
  total: number
}> {
  const res = await fetch(`${API_BASE}/api/diary/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}
