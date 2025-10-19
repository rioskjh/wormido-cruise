import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

function getTimestampMs(): string {
  return String(Date.now())
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authToken: string | undefined = body?.authToken
    const authUrl: string | undefined = body?.authUrl
    const clientMid: string | undefined = body?.mid
    const clientTid: string | undefined = body?.tid
    const clientTimestamp: string | undefined = body?.timestamp
    const clientSignature: string | undefined = body?.signature
    const merchantData: string | undefined = body?.merchantData
    const mid: string = process.env.INICIS_MID || clientMid || 'INIpayTest'
    const signKey: string = process.env.INICIS_SIGNKEY || 'SU5JTElURV9UUklQTEVERVNfS0VZU1RS'

    if (!authToken || !authUrl) {
      return NextResponse.json({ ok: false, error: 'MISSING_PARAMS' }, { status: 400 })
    }

    const timestamp = getTimestampMs() // epoch millis per spec
    // Per provided spec:
    // signature = SHA256(authToken, timestamp)
    // verification = SHA256(authToken, signKey, timestamp)
    const signatureSource = `authToken=${authToken}&timestamp=${timestamp}`
    const verificationSource = `authToken=${authToken}&signKey=${signKey}&timestamp=${timestamp}`
    const signature = sha256(signatureSource)
    const verification = sha256(verificationSource)

    const form = new URLSearchParams()
    form.set('mid', mid)
    form.set('authToken', authToken)
    form.set('signature', signature)
    form.set('verification', verification)
    form.set('timestamp', timestamp)
    form.set('charset', 'UTF-8')
    form.set('format', 'JSON')

    const approveRes = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: form.toString(),
      // no cache
      cache: 'no-store',
    })

    const text = await approveRes.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = Object.fromEntries(new URLSearchParams(text)) }

    if (!approveRes.ok) {
      return NextResponse.json({ ok: false, error: 'APPROVE_HTTP_ERROR', data, debug: { raw: text, request: { authUrl, mid, timestamp, signature, verification, signatureSource, verificationSource, form: form.toString(), client: { mid: clientMid, tid: clientTid, timestamp: clientTimestamp, signature: clientSignature }, merchantData } } }, { status: 502 })
    }

    const resultCode = data.resultCode || data.resultcode || data.result_code
    if (resultCode && String(resultCode) !== '0000') {
      return NextResponse.json({ ok: false, error: 'APPROVE_FAILED', data, debug: { raw: text, request: { authUrl, mid, timestamp, signature, verification, signatureSource, verificationSource, form: form.toString(), client: { mid: clientMid, tid: clientTid, timestamp: clientTimestamp, signature: clientSignature }, merchantData } } }, { status: 400 })
    }

    // Persist PayInfo and update Reservation if exists
    try {
      const orderNumber: string = data.MOID || data.oid || ''
      const totPrice = parseInt(String(data.TotPrice || data.price || '0'), 10) || 0
      // Upsert into pay_info using raw SQL to avoid client type drift before migration
      await prisma.$executeRawUnsafe(
        `INSERT INTO pay_info (order_number, tid, mid, result_code, result_msg, tot_price, good_name, pay_method, appl_date, appl_time, event_code, buyer_name, buyer_tel, buyer_email, cust_email, raw_response, merchant_data, created_at) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, NOW())
         ON CONFLICT (order_number) DO UPDATE SET 
           tid = EXCLUDED.tid,
           mid = EXCLUDED.mid,
           result_code = EXCLUDED.result_code,
           result_msg = EXCLUDED.result_msg,
           tot_price = EXCLUDED.tot_price,
           good_name = EXCLUDED.good_name,
           pay_method = EXCLUDED.pay_method,
           appl_date = EXCLUDED.appl_date,
           appl_time = EXCLUDED.appl_time,
           event_code = EXCLUDED.event_code,
           buyer_name = EXCLUDED.buyer_name,
           buyer_tel = EXCLUDED.buyer_tel,
           buyer_email = EXCLUDED.buyer_email,
           cust_email = EXCLUDED.cust_email,
           raw_response = EXCLUDED.raw_response,
           merchant_data = EXCLUDED.merchant_data`,
        orderNumber,
        String(data.tid || ''),
        String(data.mid || mid || ''),
        String(data.resultCode || ''),
        String(data.resultMsg || ''),
        totPrice,
        String(data.goodName || data.goodsName || ''),
        String(data.payMethod || ''),
        String(data.applDate || ''),
        String(data.applTime || ''),
        data.EventCode ? String(data.EventCode) : null,
        data.buyerName ? String(data.buyerName) : null,
        data.buyerTel ? String(data.buyerTel) : null,
        data.buyerEmail ? String(data.buyerEmail) : null,
        data.custEmail ? String(data.custEmail) : null,
        text,
        merchantData || null
      )

      // Update reservation status to COMPLETED if reservation with same orderNumber exists
      if (orderNumber) {
        try {
          await prisma.reservation.update({
            where: { orderNumber },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'CONFIRMED',
              paymentMethod: String(data.payMethod || 'INICIS'),
              paymentDate: new Date(),
              totalAmount: parseInt(String(data.TotPrice || '0'), 10) || undefined,
            }
          })
          // Link reservation to pay_info (optional best-effort)
          const resv = await prisma.reservation.findUnique({ where: { orderNumber }, select: { id: true } })
          if (resv) {
            await prisma.$executeRawUnsafe(`UPDATE pay_info SET reservation_id = $1 WHERE order_number = $2`, resv.id, orderNumber)
          }
        } catch {}
      }

      return NextResponse.json({ ok: true, data, payInfo: { orderNumber }, debug: { raw: text, request: { authUrl, mid, timestamp, signature, verification, signatureSource, verificationSource, form: form.toString(), client: { mid: clientMid, tid: clientTid, timestamp: clientTimestamp, signature: clientSignature }, merchantData } } })
    } catch (persistErr) {
      return NextResponse.json({ ok: true, data, warn: 'PERSIST_FAILED', persistErr: String(persistErr) })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}


