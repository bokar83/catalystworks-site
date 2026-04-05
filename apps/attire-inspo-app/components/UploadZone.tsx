'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface UploadZoneProps {
  onFile: (file: File) => void
  preview?: string | null
  accept?: string
  icon?: string
}

export default function UploadZone({
  onFile,
  preview,
  accept = 'image/*',
  icon = '📸',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
        style={{
          borderColor: dragging ? '#c77dff' : 'rgba(255,255,255,0.15)',
          background: dragging ? 'rgba(199,125,255,0.08)' : 'rgba(199,125,255,0.03)',
        }}
      >
        {preview ? (
          <div className="relative w-full max-h-64 overflow-hidden rounded-xl">
            <Image src={preview} alt="Preview" width={600} height={400} className="w-full rounded-xl object-cover max-h-64" unoptimized />
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">{icon}</div>
            <p className="text-sm" style={{ color: 'rgba(240,234,255,0.55)' }}>
              <span style={{ color: '#c77dff', fontWeight: 600 }}>Tap to upload</span>{' '}
              a photo
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(245,240,255,0.72)' }}>
              or drag it here
            </p>
          </>
        )}
      </motion.div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
