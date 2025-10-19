import { NextRequest, NextResponse } from 'next/server'

function buildRedirectUrl(origin: string) {
  return new URL('/payment/inicis/return', origin)
}

export async function GET(req: NextRequest) {
  const incoming = req.nextUrl
  const redirectUrl = buildRedirectUrl(incoming.origin)
  incoming.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value)
  })
  return NextResponse.redirect(redirectUrl.toString(), 302)
}

export async function POST(req: NextRequest) {
  const incoming = req.nextUrl
  const redirectUrl = buildRedirectUrl(incoming.origin)
  // copy query params first
  incoming.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value)
  })
  // merge form fields if present (INICIS posts form-urlencoded)
  try {
    const form = await req.formData()
    for (const [key, value] of form.entries()) {
      redirectUrl.searchParams.set(String(key), String(value))
    }
  } catch {}
  return NextResponse.redirect(redirectUrl.toString(), 302)
}


