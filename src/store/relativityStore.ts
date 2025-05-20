import { create } from 'zustand'

export interface Artwork {
  id: string
  title: string
  artist: string
  year: number
  src: string
  width_px: number
  height_px: number
}

interface RelativityState {
  velocityX: number
  velocityY: number
  currentArt: Artwork | null
  setVelocityX: (v: number) => void
  setVelocityY: (v: number) => void
  selectArt: (art: Artwork) => void
}

export const useRelativityStore = create<RelativityState>((set) => ({
  velocityX: 0,
  velocityY: 0,
  currentArt: null,
  setVelocityX: (v: number) => set({ velocityX: v }),
  setVelocityY: (v: number) => set({ velocityY: v }),
  selectArt: (art: Artwork) => set({ currentArt: art }),
})) 