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
  return jwt.sign(payload, 'x0n8m19s8d91n283nd9s1n283nd9s1n283nd9s', { expiresIn: '15m' })
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