// lib/useVibes.ts
'use client'
import { useState, useEffect } from 'react'
import type { MoodId } from './types'

const STORAGE_KEY = 'attire-inspo-vibes'

export function useVibes() {
  const [selectedVibes, setSelectedVibes] = useState<MoodId[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSelectedVibes(JSON.parse(stored))
    } catch {}
  }, [])

  function toggleVibe(id: MoodId) {
    setSelectedVibes(prev => {
      const next = prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function clearVibes() {
    setSelectedVibes([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  return { selectedVibes, toggleVibe, clearVibes }
}
