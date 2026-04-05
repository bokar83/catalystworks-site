'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { WardrobeItem, Category, CATEGORY_MAP } from '@/lib/types'
import { getWardrobe, deleteItem } from '@/lib/api'
import CategoryFilter from '@/components/CategoryFilter'
import WardrobeGrid from '@/components/WardrobeGrid'
import PageTransition from '@/components/PageTransition'

export default function ClosetPage() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  useEffect(() => {
    getWardrobe()
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'All') return true
    const typeLower = item.analysis.type?.toLowerCase() ?? ''
    return CATEGORY_MAP[typeLower] === activeCategory || item.analysis.type === activeCategory
  })

  async function handleDelete(id: string) {
    try {
      await deleteItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      // silently fail — item stays in list if delete errors
    }
  }

  return (
    <PageTransition>
    <main className="pt-6 pb-28 px-4 min-h-screen bg-[#12102a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-syne text-2xl font-bold text-[#f5f0ff]">My Closet</h1>
        <span className="rounded-full bg-white/[0.08] border border-white/20 text-[#f5f0ff]/60 text-xs px-3 py-1 font-inter">
          {items.length} pieces
        </span>
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <CategoryFilter selected={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Grid or loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl backdrop-blur-glass bg-white/[0.10] border border-white/20 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <WardrobeGrid items={filteredItems} onDelete={handleDelete} />
      )}

      {/* FAB */}
      <motion.div
        className="fixed bottom-24 right-4 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link
          href="/add"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl bg-gradient-to-br from-[#c77dff] to-[#e0aaff]"
          aria-label="Add item"
        >
          +
        </Link>
      </motion.div>
    </main>
    </PageTransition>
  )
}
