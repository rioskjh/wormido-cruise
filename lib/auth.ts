import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from './env'

export interface TokenPayload {
  id: number
  username: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, 'x0n8m19s8d91n283nd9s1n283nd9s1n283nd9s', { expiresIn: '10m' })
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, '29dns19x82n19djx91n28dj1nx9d182nxj', { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, 'x0n8m19s8d91n283nd9s1n283nd9s1n283nd9s') as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, '29dns19x82n19djx91n28dj1nx9d182nxj') as TokenPayload
  } catch {
    return null
  }
}

// verifyToken은 verifyAccessToken의 별칭
export const verifyToken = verifyAccessToken

// 관리자 토큰 검증 (NextRequest에서 Authorization 헤더 추출)
export async function verifyAdminToken(request: Request): Promise<{ ok: boolean; error?: string; payload?: TokenPayload }> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { ok: false, error: '인증 토큰이 필요합니다.' }
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)
    
    if (!payload) {
      return { ok: false, error: '유효하지 않은 토큰입니다.' }
    }

    // 디버깅: 실제 role 값 확인
    console.log('Admin token payload:', payload)

    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN' && payload.role !== 'EDITOR') {
      return { ok: false, error: `관리자 권한이 필요합니다. 현재 권한: ${payload.role}` }
    }

    return { ok: true, payload }
  } catch (error) {
    return { ok: false, error: '토큰 검증 중 오류가 발생했습니다.' }
  }
}