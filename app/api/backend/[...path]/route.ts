import type { NextRequest } from 'next/server'

/**
 * Aynı kaynaklı (same-origin) proxy.
 *
 * Tarayıcı doğrudan backend'e istek attığında CORS engeline takılıyor.
 * Bu yüzden istemci `/api/backend/...` adresine istek atar, bu rota da
 * isteği sunucu tarafından gerçek backend'e ileterek yanıtı aynen döner.
 *
 * Backend adresi yalnızca sunucuda okunur; koda gömülmez.
 */
const BACKEND_URL = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
)

/** Backend'e iletilecek istek başlıkları. Hop-by-hop başlıklar aktarılmaz. */
const FORWARDED_REQUEST_HEADERS = ['authorization', 'content-type', 'accept', 'accept-language']

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status })
}

async function proxy(request: NextRequest, path: string[]) {
  if (!BACKEND_URL) {
    return jsonError(
      'Sunucu adresi tanımlı değil. Ortam değişkenlerine API_BASE_URL ekleyip uygulamayı yeniden başlat.',
      500,
    )
  }

  const search = request.nextUrl.search
  const target = `${BACKEND_URL}/${path.map(encodeURIComponent).join('/')}${search}`

  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.text() : undefined

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      cache: 'no-store',
      redirect: 'manual',
    })
  } catch (error) {
    console.log('[v0] backend proxy failed:', request.method, target, error)
    return jsonError('Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.', 502)
  }

  const responseHeaders = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) responseHeaders.set('content-type', contentType)
  responseHeaders.set('cache-control', 'no-store')

  // 204/304 gövde taşımaz.
  if (upstream.status === 204 || upstream.status === 304) {
    return new Response(null, { status: upstream.status, headers: responseHeaders })
  }

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  return proxy(request, path)
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  return proxy(request, path)
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  return proxy(request, path)
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  return proxy(request, path)
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  return proxy(request, path)
}
