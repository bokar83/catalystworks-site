'use client'

import { CATEGORIES, Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  selected: Category
  onChange: (c: Category) => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-all duration-200',
            selected === category
              ? 'bg-[#c77dff] text-[#12102a] font-semibold'
              : 'bg-white/[0.08] text-[#f5f0ff]/70 border border-white/20 hover:bg-white/[0.12]'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
