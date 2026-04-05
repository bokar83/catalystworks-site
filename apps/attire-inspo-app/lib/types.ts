// lib/types.ts

export interface WardrobeItemAnalysis {
  type: string
  color: string
  style: string
  season: string
  description: string
  tags: string[]
}

export interface WardrobeItem {
  id: string
  filename: string
  notes: string
  analysis: WardrobeItemAnalysis
  image_url?: string
}

export interface SuggestOutfitsRequest {
  context: string
}

export interface SuggestOutfitsResponse {
  success: boolean
  suggestions: string
}

export interface AnalyzeOutfitResponse {
  success: boolean
  feedback: string
}

export interface UploadItemResponse {
  success: boolean
  item: WardrobeItem
}

export const CATEGORIES = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Bags',
  'Accessories',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_MAP: Record<string, Category> = {
  top: 'Tops',
  shirt: 'Tops',
  blouse: 'Tops',
  bottom: 'Bottoms',
  pants: 'Bottoms',
  jeans: 'Bottoms',
  skirt: 'Bottoms',
  dress: 'Dresses',
  outerwear: 'Outerwear',
  jacket: 'Outerwear',
  coat: 'Outerwear',
  shoes: 'Shoes',
  sneakers: 'Shoes',
  boots: 'Shoes',
  bag: 'Bags',
  accessories: 'Accessories',
}

export const MOODS = [
  { id: 'coquette',       label: 'Coquette',      icon: '🎀', color: 'from-pink-500/20 to-rose-400/20',    border: 'border-pink-400/30' },
  { id: 'dark-academia',  label: 'Dark Academia', icon: '🕯️', color: 'from-purple-900/40 to-indigo-900/30', border: 'border-purple-500/30' },
  { id: 'y2k-glam',       label: 'Y2K Glam',      icon: '💜', color: 'from-violet-500/20 to-fuchsia-400/20', border: 'border-violet-400/30' },
  { id: 'cottagecore',    label: 'Cottagecore',   icon: '🌿', color: 'from-green-500/10 to-emerald-400/10', border: 'border-green-400/30' },
  { id: 'clean-girl',     label: 'Clean Girl',    icon: '🤍', color: 'from-slate-100/10 to-white/5',        border: 'border-slate-300/20' },
  { id: 'sporty-chic',    label: 'Sporty Chic',   icon: '🏋️', color: 'from-blue-500/15 to-cyan-400/10',    border: 'border-blue-400/30' },
  { id: 'night-out',      label: 'Night Out',     icon: '🌙', color: 'from-rose-600/20 to-pink-900/20',    border: 'border-rose-500/30' },
  { id: 'school-day',     label: 'School Day',    icon: '📚', color: 'from-amber-500/15 to-orange-400/10', border: 'border-amber-400/30' },
] as const

export type MoodId = (typeof MOODS)[number]['id']
