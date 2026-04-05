'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import PageTransition from '@/components/PageTransition'
import UploadZone from '@/components/UploadZone'
import { uploadItem } from '@/lib/api'
import type { WardrobeItemAnalysis } from '@/lib/types'

type Status = 'idle' | 'analyzing' | 'done' | 'error'

export default function AddPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [analysis, setAnalysis] = useState<Partial<WardrobeItemAnalysis>>({})
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStatus('idle')
    setAnalysis({})
  }

  async function handleAnalyze() {
    if (!file) return
    setStatus('analyzing')
    setErrorMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('notes', notes)
      const res = await uploadItem(fd)
      setAnalysis(res.item.analysis)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  const inputClass =
    'w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 text-white placeholder:text-white/25 transition-colors focus:border-accent'
  const inputStyle = { background: 'rgba(255,255,255,0.14)' }
  const labelClass = 'block text-xs font-bold uppercase tracking-widest mb-1.5'
  const labelStyle = { color: '#c77dff' }

  return (
    <PageTransition>
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <h1
        className="font-syne font-extrabold text-2xl"
        style={{
          background: 'linear-gradient(90deg, #e0aaff, #ff85a1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Add a Piece
      </h1>

      <GlassCard>
        <UploadZone onFile={handleFile} preview={preview} />
      </GlassCard>

      <GlassCard className="flex flex-col gap-3">
        <div>
          <label className={labelClass} style={labelStyle}>Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Thrifted, size M"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <AnimatePresence>
          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col gap-3"
            >
              {(['type', 'color', 'style', 'season'] as const).map(field => (
                <div key={field}>
                  <label className={labelClass} style={labelStyle}>{field}</label>
                  <input
                    type="text"
                    value={analysis[field] ?? ''}
                    onChange={e => setAnalysis(prev => ({ ...prev, [field]: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'error' && (
          <p className="text-xs" style={{ color: '#ff85a1' }}>{errorMsg}</p>
        )}
      </GlassCard>

      {status !== 'done' ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAnalyze}
          disabled={!file || status === 'analyzing'}
          className="w-full py-4 rounded-2xl font-syne font-bold text-base text-white disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #c77dff, #ff85a1)',
            boxShadow: '0 6px 24px rgba(199,125,255,0.3)',
          }}
        >
          {status === 'analyzing' ? '✨ Analysing your piece…' : '✨ Analyse with AI'}
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/closet')}
          className="w-full py-4 rounded-2xl font-syne font-bold text-base text-white"
          style={{
            background: 'linear-gradient(135deg, #c77dff, #ff85a1)',
            boxShadow: '0 6px 24px rgba(199,125,255,0.3)',
          }}
        >
          ✅ Saved! Go to Closet
        </motion.button>
      )}
    </div>
    </PageTransition>
  )
}
