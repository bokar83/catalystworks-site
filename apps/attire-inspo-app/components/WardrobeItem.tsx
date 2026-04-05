'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { WardrobeItem as WardrobeItemType } from '@/lib/types'

interface WardrobeItemProps {
  item: WardrobeItemType
  onDelete: (id: string) => void
}

export default function WardrobeItem({ item, onDelete }: WardrobeItemProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [imgError, setImgError] = useState(false)

  const label = item.analysis.type || item.filename
  const imageUrl = `/api/proxy?endpoint=/wardrobe/${item.id}/image`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex flex-col aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.10] border border-white/20 cursor-pointer"
      onClick={() => setShowDelete((prev) => !prev)}
    >
      {/* Image or placeholder */}
      <div className="relative flex-1 min-h-0">
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#c77dff]/20 to-[#ff85a1]/20">
            <span className="text-5xl">🧥</span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={label}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-6 pb-3">
        <p className="text-[#f5f0ff] text-xs font-medium font-inter truncate capitalize">{label}</p>
        {item.analysis.type && (
          <span className="mt-1 inline-block rounded-full bg-[#c77dff]/20 border border-[#c77dff]/30 text-[#e0aaff] text-[10px] px-2 py-0.5 capitalize">
            {item.analysis.type}
          </span>
        )}
      </div>

      {/* Delete button */}
      {showDelete && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center text-white text-sm shadow-lg z-10"
          aria-label="Delete item"
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  )
}
