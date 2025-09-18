import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export interface AdminTokenPayload {
  id: number
  username: string
  role: string
}

export function verifyAdminToken(request: NextRequest): AdminTokenPayload | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return null
    }

    return payload as AdminTokenPayload
  } catch (error) {
    console.error('Admin token verification error:', error)
    return null
  }
}

export function requireAdminAuth(handler: (request: NextRequest, admin: AdminTokenPayload) => Promise<Response>) {
  return async (request: NextRequest) => {
    const admin = verifyAdminToken(request)
    
    if (!admin) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return handler(request, admin)
  }
}
