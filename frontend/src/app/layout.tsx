import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🎙️ AI Voice Diary',
  description: 'Speak your thoughts, get structured journals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
