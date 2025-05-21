import { useRelativityStore, Artwork } from '@/store/relativityStore'
import { calculateGamma, calculateDopplerFactor } from '@/lib/physics'
import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { GalleryPopup } from './GalleryPopup'

// Particle reference points with their typical velocities
const PARTICLE_REFERENCES = [
  { name: "Commercial Jet", velocity: 0.0000009, description: "Commercial aircraft cruising speed" },
  { name: "Space Shuttle", velocity: 0.00003, description: "Space Shuttle orbital velocity" },
  { name: "Electron in TV", velocity: 0.3, description: "Electrons in a cathode ray tube" },
  { name: "Muon", velocity: 0.9994, description: "Cosmic ray muons" },
  { name: "LHC Proton", velocity: 0.999999991, description: "Protons in the Large Hadron Collider" }
];

// Format artwork title for display
const formatArtworkTitle = (title: string) => {
  // Convert from kebab-case or snake_case to Title Case
  return title
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Format velocity for display
const formatVelocity = (v: number) => v.toFixed(4);

// Custom precision formatter to display velocities close to c with more precision
const formatReferencePrecision = (velocity: number) => {
  if (velocity > 0.999) {
    return velocity.toFixed(9) + 'c';
  } else if (velocity < 0.0001) {
    return velocity.toExponential(6) + 'c';
  } else {
    return velocity.toFixed(4) + 'c';
  }
};

export const Sidebar = () => {
  const { velocityX, velocityY, currentArt, setVelocityX, setVelocityY, selectArt } = useRelativityStore()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [inputX, setInputX] = useState(formatVelocity(velocityX))
  const [inputY, setInputY] = useState(formatVelocity(velocityY))
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  useEffect(() => {
    fetch('/artworks.json')
      .then((res) => res.json())
      .then((data) => {
        setArtworks(data)
        if (data.length > 0 && !currentArt) {
          selectArt(data[0])
        }
      })
  }, [currentArt, selectArt])

  // Update input fields when velocities change from slider
  useEffect(() => {
    setInputX(formatVelocity(velocityX))
    setInputY(formatVelocity(velocityY))
  }, [velocityX, velocityY])

  // Calculate total velocity vector magnitude
  const totalVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
  // Ensure we don't exceed c (speed of light)
  const cappedTotalVelocity = Math.min(totalVelocity, 0.9999)
  
  const gamma = calculateGamma(cappedTotalVelocity)
  const dopplerFactor = calculateDopplerFactor(cappedTotalVelocity)

  // Find the closest particle reference
  const closestParticle = PARTICLE_REFERENCES.reduce((closest, particle) => {
    const currentDiff = Math.abs(cappedTotalVelocity - particle.velocity);
    const closestDiff = Math.abs(cappedTotalVelocity - closest.velocity);
    return currentDiff < closestDiff ? particle : closest;
  }, PARTICLE_REFERENCES[0]);

  // Handle velocity input changes
  const handleVelocityInput = (value: string, axis: 'x' | 'y') => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 0.9999) {
      if (axis === 'x') {
        setVelocityX(numValue)
        setInputX(value)
      } else {
        setVelocityY(numValue)
        setInputY(value)
      }
    }
  }

  // Handle particle selection
  const handleParticleSelect = (particle: typeof PARTICLE_REFERENCES[0]) => {
    setSelectedParticle(particle.name)
    setVelocityX(particle.velocity)
    setVelocityY(0) // Reset Y velocity when selecting a particle
  }

  return (
    <div className="w-150 h-full bg-black border-r border-gray-800 shadow-2xl flex flex-col">
      {/* Gallery Section - Fixed height */}
      <div className="h-48 p-6 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="group relative px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              View All
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </div>
        
        {currentArt && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-1">
              {formatArtworkTitle(currentArt.title)}
            </h3>
            <p className="text-sm text-gray-400">
              by {currentArt.artist} ({currentArt.year})
            </p>
          </div>
        )}
      </div>

      {/* Controls Section - Flexible height */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Velocity Controls */}
          <div className="bg-white/5 rounded-xl p-6 space-y-6 border border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Horizontal Velocity (c)
              </label>
              <div className="flex gap-2 items-center mb-3">
                <input
                  type="number"
                  value={inputX}
                  onChange={(e) => handleVelocityInput(e.target.value, 'x')}
                  step="0.0001"
                  min="0"
                  max="0.9999"
                  className="w-24 px-3 py-2 bg-black/50 text-white rounded-lg border border-white/10 focus:border-white/30 focus:outline-none"
                />
                <span className="text-gray-400">c</span>
              </div>
              <Slider
                value={[velocityX]}
                onValueChange={([v]) => setVelocityX(v)}
                min={0}
                max={0.9999}
                step={0.0001}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Vertical Velocity (c)
              </label>
              <div className="flex gap-2 items-center mb-3">
                <input
                  type="number"
                  value={inputY}
                  onChange={(e) => handleVelocityInput(e.target.value, 'y')}
                  step="0.0001"
                  min="0"
                  max="0.9999"
                  className="w-24 px-3 py-2 bg-black/50 text-white rounded-lg border border-white/10 focus:border-white/30 focus:outline-none"
                />
                <span className="text-gray-400">c</span>
              </div>
              <Slider
                value={[velocityY]}
                onValueChange={([v]) => setVelocityY(v)}
                min={0}
                max={0.9999}
                step={0.0001}
              />
            </div>
          </div>

          {/* Physics Info Section */}
          <div className="bg-white/5 rounded-xl p-6 space-y-3 border border-white/10">
            <p className="text-sm text-gray-300">
              |v| = {cappedTotalVelocity.toFixed(4)}c → γ = {gamma.toFixed(2)}
            </p>
            <p className="text-sm text-gray-300">
              Contraction: {(1/gamma).toFixed(4)} × original size
            </p>
            <p className="text-sm text-gray-300">
              Doppler factor = {dopplerFactor.toFixed(2)}
            </p>
            {totalVelocity > 0.001 && (
              <div className="pt-4 mt-3 border-t border-white/10">
                <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-indigo-900/50 p-4 rounded-lg border border-indigo-500/30 shadow-lg shadow-purple-900/20 transform transition-all duration-500 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-600 rounded-full p-1.5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-wide">Relativistic Perspective</h4>
                  </div>
                  <p className="text-sm font-medium text-white/90 mb-1.5">
                    You&apos;re viewing {formatArtworkTitle(currentArt?.title || '')} like a <span className="text-indigo-300 font-bold">{closestParticle.name}</span> would
                  </p>
                  <p className="text-xs text-indigo-200/80 italic">
                    {closestParticle.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reference Section - Moved to the end */}
          <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
            <h4 className="text-sm font-medium text-gray-300">Quick Reference</h4>
            <div className="space-y-2">
              {PARTICLE_REFERENCES.map((particle) => (
                <button
                  key={particle.name}
                  onClick={() => handleParticleSelect(particle)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                    selectedParticle === particle.name
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{particle.name}</span>
                    <span className="text-xs opacity-75">{formatReferencePrecision(particle.velocity)}</span>
                  </div>
                  <div className="text-xs opacity-75 mt-1">{particle.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GalleryPopup
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        artworks={artworks}
        onSelectArt={selectArt}
        currentArt={currentArt}
      />
    </div>
  )
} 