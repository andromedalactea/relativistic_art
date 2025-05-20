'use client'

import { ArtCanvas } from '@/components/ArtCanvas'
import { Sidebar } from '@/components/Sidebar'

export default function Home() {
  return (
    <main className="flex h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1">
        <ArtCanvas />
      </div>
    </main>
  )
}
