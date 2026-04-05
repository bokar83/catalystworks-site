// components/MoodCard.tsx
'use client'

import { motion } from 'framer-motion'
import { MOODS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MoodCardProps {
  mood: (typeof MOODS)[number]
  selected: boolean
  onToggle: () => void
}

export default function MoodCard({ mood, selected, onToggle }: MoodCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={cn(
        'aspect-square flex flex-col items-center justify-center gap-2 p-4',
        'bg-gradient-to-br backdrop-blur-glass border rounded-2xl',
        'transition-all duration-200',
        mood.color,
        selected
          ? 'border-[#c77dff]/60 ring-2 ring-[#c77dff]/30'
          : mood.border
      )}
    >
      <motion.div
        animate={{ scale: selected ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-4xl"
      >
        {mood.icon}
      </motion.div>
      <span className="text-sm font-medium font-inter text-[#f5f0ff] text-center leading-tight">
        {mood.label}
      </span>
    </motion.button>
  )
}
