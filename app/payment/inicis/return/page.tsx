'use client'

import { Suspense, useMemo, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import PageBanner from '@/components/PageBanner'

function InicisReturnContent() {
  const router = useRouter()
  const params = useSearchParams()
  const resultCode = params.get('resultCode') || ''
  const resultMsg = params.get('resultMsg') || ''
  const merchantData = params.get('merchantData')
  const [approveJson, setApproveJson] = useState<any | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const approveOnceRef = useRef(false)
  const decodedMerchantData = useMemo(() => {
    if (!merchantData) return ''
    try {
      // try base64 decode first
      const json = decodeURIComponent(escape(window.atob(merchantData)))
      return json
    } catch {
      try {
        // maybe plain json
        JSON.parse(merchantData)
        return merchantData
      } catch {
        return merchantData
      }
    }
  }, [merchantData])

  const lines = useMemo(() => {
    const arr: string[] = []
    params.forEach((v, k) => arr.push(`${k}=${v}`))
    return arr
  }, [params])

  useEffect(() => {
    if (resultCode === 'V801' || resultMsg.includes('취소')) {
      // If merchantData has original reservation path/query, go back to it
      try {
        const md = params.get('merchantData')
        if (md) {
          try {
            const json = JSON.parse(decodeURIComponent(escape(window.atob(md))))
            const cancelTarget = (json.reservationPath as string) || '/reservation'
            router.replace(cancelTarget)
            return
          } catch {
            // ignore decode errors
          }
        }
        if (window.history.length > 1) {
          window.history.back()
          return
        }
      } catch {}
      router.replace('/reservation')
    }
    // Success: resultCode === '0000' (STDPay), or authToken returned
    else if (resultCode === '0000' || !!params.get('authToken')) {
      (async () => {
        try {
          // Approve payment on server first
          const authToken = params.get('authToken') || ''
          const authUrl = params.get('authUrl') || ''
          const mid = params.get('mid') || ''
          const tid = params.get('tid') || ''
          const timestamp = params.get('timestamp') || ''
          const signature = params.get('signature') || ''
          // strict-mode safe one-time guard: set session flag BEFORE network calls
          const onceKey = `inicis_approved_${authToken || tid}`
          if (!authToken || !authUrl) return
          if (approveOnceRef.current) return
          if (typeof window !== 'undefined') {
            try {
              if (sessionStorage.getItem(onceKey) === '1') return
              sessionStorage.setItem(onceKey, '1')
            } catch {}
          }
          approveOnceRef.current = true

          // Create PENDING reservation immediately after payment success (before approval)
          try {
            const mdRaw = params.get('merchantData')
            if (mdRaw) {
              let payload: any = {}
              try { payload = JSON.parse(decodeURIComponent(escape(window.atob(mdRaw)))) } catch { try { payload = JSON.parse(mdRaw) } catch {} }
              if (payload && payload.productId && payload.customerName && payload.customerPhone && payload.customerEmail && payload.oid) {
                const token = localStorage.getItem('accessToken')
                await fetch('/api/reservations', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                  },
                  body: JSON.stringify({
                    productId: payload.productId,
                    adults: payload.adults,
                    children: payload.children,
                    infants: payload.infants,
                    customerName: payload.customerName,
                    customerPhone: payload.customerPhone,
                    customerEmail: payload.customerEmail,
                    representativeName: payload.representativeName,
                    representativePhone: payload.representativePhone,
                    representativeEmail: payload.representativeEmail,
                    totalAmount: payload.totalPrice,
                    selectedOptions: payload.selectedOptions || {},
                    orderNumber: payload.oid,
                    statusMode: 'PENDING'
                  })
                })
              }
            }
          } catch {}
          // prevent duplicate approve calls (refresh/back or double render)
          if (authToken && authUrl) {
            try {
              const approve = await fetch('/api/payment/inicis/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authToken, authUrl, mid, tid, timestamp, signature, merchantData })
              })
              const approveJson = await approve.json()
              if (!approveJson.ok) {
                console.error('Approve failed:', approveJson)
                setApproveError(JSON.stringify(approveJson, null, 2))
                setApproveJson(approveJson)
                return
              }
              setApproveJson(approveJson)
              try { sessionStorage.setItem(onceKey, '1') } catch {}

              // 성공 시 장바구니 비우고 완료 페이지로 이동
              try {
                localStorage.setItem('cart', '[]')
                window.dispatchEvent(new Event('cartUpdated'))
              } catch {}

              const d = approveJson.data || {}
              // Pull reservation context from merchantData
              let payload: any = {}
              try {
                const mdRaw = params.get('merchantData') || ''
                if (mdRaw) {
                  try { payload = JSON.parse(decodeURIComponent(escape(window.atob(mdRaw)))) } catch { try { payload = JSON.parse(mdRaw) } catch {}
                  }
                }
              } catch {}

              const paramsUsp = new URLSearchParams({
                resultCode: d.resultCode || '',
                resultMsg: d.resultMsg || '',
                tid: d.tid || '',
                mid: d.mid || '',
                orderNumber: d.MOID || d.oid || payload.oid || '',
                MOID: d.MOID || '',
                TotPrice: d.TotPrice || '',
                goodName: d.goodName || d.goodsName || '월미도 크루즈 예약',
                payMethod: d.payMethod || '',
                applDate: d.applDate || '',
                applTime: d.applTime || '',
                EventCode: d.EventCode || '',
                buyerName: d.buyerName || '',
                buyerTel: d.buyerTel || '',
                buyerEmail: d.buyerEmail || '',
                custEmail: d.custEmail || '',
                // Reservation complete page fields
                productName: d.goodName || d.goodsName || '일반 유람선 투어',
                reservationDate: '',
                reservationTime: '',
                adults: String(payload.adults ?? ''),
                children: String(payload.children ?? ''),
                infants: String(payload.infants ?? ''),
                totalAmount: String(d.TotPrice || payload.totalPrice || ''),
                customerName: String(payload.customerName || ''),
                customerPhone: String(payload.customerPhone || ''),
                customerEmail: String(payload.customerEmail || ''),
                representativeName: String(payload.representativeName || ''),
                representativePhone: String(payload.representativePhone || ''),
                representativeEmail: String(payload.representativeEmail || ''),
              })
              router.replace(`/reservation/complete?${paramsUsp.toString()}`)
            } catch (e) {
              console.error('Approve error:', e)
              setApproveError(String(e))
              return
            }
          }

          // NOTE: 아래 로직은 디버깅을 위해 임시로 비활성화합니다.
          // 결제 승인 성공 후 장바구니 비우기 및 완료 페이지 리다이렉트는
          // 승인 결과 검증이 끝난 뒤 재활성화합니다.
          // try {
          //   localStorage.setItem('cart', '[]')
          //   window.dispatchEvent(new Event('cartUpdated'))
          // } catch {}
          // let payload: any = {}
          // const md = params.get('merchantData')
          // if (md) {
          //   try {
          //     payload = JSON.parse(decodeURIComponent(escape(window.atob(md))))
          //   } catch {
          //     try { payload = JSON.parse(md) } catch { payload = {} }
          //   }
          // }
          // const orderNumber = params.get('oid') || `ORD-${Date.now()}`
          // const usp = new URLSearchParams({
          //   orderNumber,
          //   productName: '일반 유람선 투어',
          //   reservationDate: '',
          //   reservationTime: '',
          //   adults: String(payload.adults ?? ''),
          //   children: String(payload.children ?? ''),
          //   infants: String(payload.infants ?? ''),
          //   totalAmount: String(payload.totalPrice ?? ''),
          //   customerName: String(payload.customerName ?? ''),
          //   customerPhone: String(payload.customerPhone ?? ''),
          //   customerEmail: String(payload.customerEmail ?? ''),
          //   representativeName: String(payload.representativeName ?? ''),
          //   representativePhone: String(payload.representativePhone ?? ''),
          //   representativeEmail: String(payload.representativeEmail ?? ''),
          // })
          // router.replace(`/reservation/complete?${usp.toString()}`)
        } catch {}
      })()
    }
  }, [resultCode, resultMsg, router])

  return (
    <div className="min-h-screen bg-white">
      <UserNavigation />
      <PageBanner title="결제 승인 처리중" />
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
        <div className="text-center text-gray-700">결제 승인 처리중입니다. 잠시만 기다려주세요...</div>
      </div>
      <Footer />
    </div>
  )
}

export default function InicisReturnPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <InicisReturnContent />
    </Suspense>
  )
}


