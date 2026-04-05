'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { WardrobeItem as WardrobeItemType } from '@/lib/types'
import WardrobeItem from './WardrobeItem'

interface WardrobeGridProps {
  items: WardrobeItemType[]
  onDelete: (id: string) => void
}

export default function WardrobeGrid({ items, onDelete }: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[#f5f0ff]/40 text-base font-inter">Nothing here yet ✨</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <WardrobeItem item={item} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
