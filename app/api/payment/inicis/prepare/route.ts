import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const price = typeof body?.price === 'number' ? body.price : parseInt(body?.price ?? '0', 10)
    if (!price || Number.isNaN(price) || price < 1) {
      return NextResponse.json({ ok: false, error: 'INVALID_PRICE' }, { status: 400 })
    }

    const mid = process.env.INICIS_MID || 'INIpayTest'
    const signKey = process.env.INICIS_SIGNKEY || 'SU5JTElURV9UUklQTEVERVNfS0VZU1RS'
    const returnUrl = process.env.INICIS_RETURN_URL || 'http://localhost:3000/api/payment/inicis/return'

    // INICIS requires yyyyMMddHHmmss timestamp format
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const oid = `ORD-${timestamp}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`

    // INIStdPay signature: sha256 of "oid=...&price=...&timestamp=..."
    const signature = sha256(`oid=${oid}&price=${price}&timestamp=${timestamp}`)
    // verification: sha256 of "oid=...&price=...&signKey=...&timestamp=..." (field order per spec)
    const verification = sha256(`oid=${oid}&price=${price}&signKey=${signKey}&timestamp=${timestamp}`)
    const mKey = sha256(signKey)

    const payload = {
      mid,
      oid,
      price,
      timestamp,
      signature,
      verification,
      mKey,
      version: '1.0',
      currency: 'WON',
      gopaymethod: 'Card',
      // Removed centerCd(Y) to avoid sub-merchant business number requirement
      acceptmethod: 'below1000',
      use_chkfake: 'Y',
      returnUrl,
    }

    return NextResponse.json({ ok: true, data: payload })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}


