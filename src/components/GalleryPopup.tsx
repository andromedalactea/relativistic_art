import { useState, useRef } from 'react'
import Image from 'next/image'
import { Artwork } from '@/store/relativityStore'

interface GalleryPopupProps {
  isOpen: boolean
  onClose: () => void
  artworks: Artwork[]
  onSelectArt: (art: Artwork) => void
  currentArt: Artwork | null
}

export const GalleryPopup = ({ isOpen, onClose, artworks, onSelectArt, currentArt }: GalleryPopupProps) => {
  const [customImage, setCustomImage] = useState<Artwork | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.onload = () => {
        const customArt: Artwork = {
          id: 'custom-' + Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Custom Upload',
          year: new Date().getFullYear(),
          src: e.target?.result as string,
          width_px: img.width,
          height_px: img.height
        }
        setCustomImage(customArt)
        onSelectArt(customArt)
        // Reset the input value so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      alert('Error reading file')
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
          <div className="flex gap-3">
            <button
              onClick={triggerFileInput}
              className="group relative px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Image
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
            <button
              onClick={onClose}
              className="group relative px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {customImage && (
              <div className="group relative aspect-square rounded-xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors">
                <Image
                  src={customImage.src}
                  alt={customImage.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm font-medium truncate">{customImage.title}</p>
                  <p className="text-gray-400 text-xs">Custom Upload</p>
                </div>
              </div>
            )}
            
            {artworks.map((art) => (
              <button
                key={art.id}
                onClick={() => onSelectArt(art)}
                className={`group relative aspect-square rounded-xl overflow-hidden transition-all ${
                  currentArt?.id === art.id 
                    ? 'ring-2 ring-white/40' 
                    : 'border border-white/10 hover:border-white/20'
                }`}
              >
                <Image
                  src={art.src}
                  alt={art.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm font-medium truncate">{art.title}</p>
                  <p className="text-gray-400 text-xs">{art.artist} ({art.year})</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 