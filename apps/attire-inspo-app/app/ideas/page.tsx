// app/ideas/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOODS, MoodId } from '@/lib/types'
import { suggestOutfits } from '@/lib/api'
import MoodCard from '@/components/MoodCard'
import ResultBox from '@/components/ResultBox'
import PageTransition from '@/components/PageTransition'

export default function IdeasPage() {
  const [selectedMoods, setSelectedMoods] = useState<MoodId[]>([])
  const [occasion, setOccasion] = useState('')
  const [weather, setWeather] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  function toggleMood(id: MoodId) {
    setSelectedMoods(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  async function handleGenerate() {
    if (loading) return
    setLoading(true)
    setResult(null)

    const moods = selectedMoods
      .map(id => MOODS.find(m => m.id === id)?.label)
      .filter(Boolean)
      .join(', ')

    const context = [
      moods ? `Mood: ${moods}` : '',
      occasion ? `Occasion: ${occasion}` : '',
      weather ? `Weather/Season: ${weather}` : '',
    ]
      .filter(Boolean)
      .join('. ')

    try {
      const response = await suggestOutfits(context)
      setResult(response.suggestions)
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl bg-white/[0.12] border border-white/20 px-4 py-3 text-[#f5f0ff] placeholder:text-[#f5f0ff]/60 outline-none focus:border-[#c77dff]/50 text-sm font-inter transition-colors'

  return (
    <PageTransition>
    <div className="pt-6 pb-28 px-4">
      <h1 className="font-syne text-2xl font-bold text-[#f5f0ff]">
        Outfit Ideas ✨
      </h1>

      <p className="text-sm text-[#f5f0ff]/75 uppercase tracking-wider mb-3 mt-6">
        Pick your mood
      </p>
      <div className="grid grid-cols-2 gap-3">
        {MOODS.map(mood => (
          <MoodCard
            key={mood.id}
            mood={mood}
            selected={selectedMoods.includes(mood.id)}
            onToggle={() => toggleMood(mood.id)}
          />
        ))}
      </div>

      <p className="text-sm text-[#f5f0ff]/75 uppercase tracking-wider mb-3 mt-6">
        Occasion
      </p>
      <input
        type="text"
        value={occasion}
        onChange={e => setOccasion(e.target.value)}
        placeholder="Birthday dinner, first day of school…"
        className={inputClass}
      />

      <p className="text-sm text-[#f5f0ff]/75 uppercase tracking-wider mb-3 mt-6">
        Weather / Season
      </p>
      <input
        type="text"
        value={weather}
        onChange={e => setWeather(e.target.value)}
        placeholder="Sunny, winter layers, rainy day…"
        className={inputClass}
      />

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold font-syne text-[#12102a] bg-gradient-to-r from-[#c77dff] to-[#ff85a1] mt-8 disabled:opacity-50 transition-opacity"
      >
        Generate Outfit Ideas ✨
      </motion.button>

      <AnimatePresence>
        {(result !== null || loading) && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <ResultBox loading={loading} content={result ?? ''} />
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <button
          onClick={() => {
            setSelectedMoods([])
            setResult(null)
          }}
          className="w-full mt-4 py-3 text-sm text-[#f5f0ff]/75 font-inter hover:text-[#f5f0ff]/80 transition-colors"
        >
          Try another vibe
        </button>
      )}
    </div>
    </PageTransition>
  )
}
