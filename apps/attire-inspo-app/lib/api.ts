// lib/api.ts
import type {
  WardrobeItem,
  UploadItemResponse,
  SuggestOutfitsResponse,
  AnalyzeOutfitResponse,
} from './types'

const PROXY = '/api/proxy'

async function proxyFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const url = `${PROXY}?endpoint=${encodeURIComponent(endpoint)}`
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error ${res.status}: ${endpoint}`)
  return res
}

export async function getWardrobe(): Promise<WardrobeItem[]> {
  const res = await proxyFetch('/wardrobe')
  return res.json()
}

export async function uploadItem(formData: FormData): Promise<UploadItemResponse> {
  const res = await proxyFetch('/upload-item', { method: 'POST', body: formData })
  return res.json()
}

export async function deleteItem(id: string): Promise<void> {
  const url = `${PROXY}?endpoint=${encodeURIComponent(`/wardrobe/${id}`)}`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}

export async function suggestOutfits(context: string): Promise<SuggestOutfitsResponse> {
  const res = await proxyFetch('/suggest-outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context }),
  })
  return res.json()
}

export async function analyzeOutfit(formData: FormData): Promise<AnalyzeOutfitResponse> {
  const res = await proxyFetch('/analyze-outfit', { method: 'POST', body: formData })
  return res.json()
}
