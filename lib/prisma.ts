import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection Pooler 사용 시 prepared statement 충돌 방지
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Vercel serverless 환경에서는 매번 새로운 클라이언트 생성하여 prepared statement 충돌 방지
export const prisma = process.env.NODE_ENV === 'production' 
  ? createPrismaClient()
  : (globalForPrisma.prisma ?? createPrismaClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
