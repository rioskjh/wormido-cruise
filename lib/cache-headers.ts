import { NextResponse } from 'next/server'

// 관리자 API용 캐시 방지 헤더
export function getNoCacheHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Last-Modified': new Date().toUTCString(),
    'ETag': `"${Date.now()}"`
  }
}

// 관리자 API 응답 래퍼
export function createAdminResponse(data: any, status: number = 200) {
  return NextResponse.json({
    ...data,
    timestamp: new Date().toISOString()
  }, {
    status,
    headers: getNoCacheHeaders()
  })
}

// 동적 렌더링 강제 설정
export const adminApiConfig = {
  dynamic: 'force-dynamic' as const,
  revalidate: 0
}
