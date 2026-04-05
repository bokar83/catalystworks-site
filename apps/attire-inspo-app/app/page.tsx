'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import PageTransition from '@/components/PageTransition'
import { useVibes } from '@/lib/useVibes'
import { getWardrobe } from '@/lib/api'
import { MOODS } from '@/lib/types'
import type { WardrobeItem } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const { selectedVibes, toggleVibe } = useVibes()
  const [preview, setPreview] = useState<WardrobeItem[]>([])

  useEffect(() => {
    getWardrobe().then(items => setPreview(items.slice(0, 4))).catch(() => {})
  }, [])

  return (
    <PageTransition>
    <div className="px-4 pt-8 pb-4 flex flex-col gap-5">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #c77dff, #ff85a1)' }}
        >
          ✨
        </div>
        <div>
          <h1
            className="font-syne font-extrabold text-xl leading-tight"
            style={{
              background: 'linear-gradient(90deg, #e0aaff, #ff85a1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hey Aminöa 👋
          </h1>
          <p className="text-xs" style={{ color: 'rgba(245,240,255,0.75)' }}>
            What&apos;s the vibe today?
          </p>
        </div>
      </motion.div>

      {/* Vibe chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <p
            className="text-[0.7rem] font-bold uppercase tracking-widest mb-3"
            style={{ color: '#c77dff' }}
          >
            Today&apos;s Vibe
          </p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(v => {
              const active = selectedVibes.includes(v.id)
              return (
                <motion.button
                  key={v.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleVibe(v.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={
                    active
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(199,125,255,0.35), rgba(255,133,161,0.35))',
                          borderColor: '#c77dff',
                          color: '#e0aaff',
                        }
                      : {
                          background: 'rgba(255,255,255,0.12)',
                          borderColor: 'rgba(255,255,255,0.25)',
                          color: 'rgba(245,240,255,0.90)',
                        }
                  }
                >
                  {v.icon} {v.label}
                </motion.button>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Closet preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <p
            className="text-[0.7rem] font-bold uppercase tracking-widest"
            style={{ color: '#c77dff' }}
          >
            Your Closet
          </p>
          <Link href="/closet" className="text-xs" style={{ color: 'rgba(224,170,255,0.90)' }}>
            See all →
          </Link>
        </div>
        {preview.length === 0 ? (
          <GlassCard className="text-center py-8">
            <div className="text-4xl mb-3">👗</div>
            <p className="text-sm mb-4" style={{ color: 'rgba(245,240,255,0.75)' }}>
              Your closet is empty
            </p>
            <Link href="/add">
              <motion.span
                whileTap={{ scale: 0.96 }}
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #c77dff, #ff85a1)' }}
              >
                Add your first piece →
              </motion.span>
            </Link>
          </GlassCard>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {preview.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex-shrink-0 w-28 rounded-2xl overflow-hidden border border-white/20"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <div
                  className="aspect-[3/4] flex items-center justify-center text-3xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(199,125,255,0.15), rgba(255,133,161,0.10))',
                  }}
                >
                  👗
                </div>
                <div className="p-2">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: '#e0aaff' }}
                  >
                    {item.analysis?.type || 'Item'}
                  </p>
                  <p
                    className="text-[0.65rem] truncate"
                    style={{ color: 'rgba(245,240,255,0.70)' }}
                  >
                    {item.analysis?.style || ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/ideas')}
          className="w-full py-4 rounded-2xl font-syne font-bold text-base text-white tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #c77dff, #ff85a1)',
            boxShadow: '0 6px 24px rgba(199,125,255,0.35)',
          }}
        >
          ✨ Get Outfit Ideas
        </motion.button>
      </motion.div>
    </div>
    </PageTransition>
  )
}
