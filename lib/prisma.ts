import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection Pooler 사용 시 prepared statement 충돌 방지를 위한 클라이언트 생성 함수
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
// Connection Pooler와의 충돌을 방지하기 위해 production에서는 싱글톤을 사용하지 않음
export const prisma = process.env.NODE_ENV === 'production' 
  ? createPrismaClient()
  : (globalForPrisma.prisma ?? createPrismaClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
