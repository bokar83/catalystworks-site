// app/api/proxy/route.ts
export const runtime = 'edge'

const VPS = 'http://72.60.209.109:8080'

function buildVpsUrl(request: Request): string {
  const url = new URL(request.url)
  const endpoint = url.searchParams.get('endpoint') ?? ''
  return `${VPS}${endpoint}`
}

export async function GET(request: Request) {
  const vpsUrl = buildVpsUrl(request)
  const vpsRes = await fetch(vpsUrl)
  const data = await vpsRes.arrayBuffer()
  return new Response(data, {
    status: vpsRes.status,
    headers: { 'content-type': vpsRes.headers.get('content-type') ?? 'application/json' },
  })
}

export async function POST(request: Request) {
  const vpsUrl = buildVpsUrl(request)
  const contentType = request.headers.get('content-type') ?? ''
  const body = await request.arrayBuffer()
  const vpsRes = await fetch(vpsUrl, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
  })
  const data = await vpsRes.arrayBuffer()
  return new Response(data, {
    status: vpsRes.status,
    headers: { 'content-type': vpsRes.headers.get('content-type') ?? 'application/json' },
  })
}

export async function DELETE(request: Request) {
  const vpsUrl = buildVpsUrl(request)
  const vpsRes = await fetch(vpsUrl, { method: 'DELETE' })
  const data = await vpsRes.arrayBuffer()
  return new Response(data, {
    status: vpsRes.status,
    headers: { 'content-type': vpsRes.headers.get('content-type') ?? 'application/json' },
  })
}
