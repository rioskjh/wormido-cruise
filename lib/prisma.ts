import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection Pooler 사용 시 prepared statement 충돌 방지를 위한 클라이언트 생성 함수
const createPrismaClient = () => {
  // Connection Pooler와의 충돌 방지를 위해 pgbouncer 파라미터 추가
  let databaseUrl = process.env.DATABASE_URL
  
  // 빌드 시 환경변수가 없으면 기본값 사용
  if (!databaseUrl) {
    databaseUrl = 'postgresql://user:password@localhost:5432/wormi_cruise'
  }
  
  if (process.env.NODE_ENV === 'production' && databaseUrl && !databaseUrl.includes('pgbouncer=true')) {
    databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true'
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // Vercel 환경에서 타임아웃 및 연결 문제 해결을 위한 설정
    __internal: {
      engine: {
        connectTimeout: 10000, // 10초
        queryTimeout: 30000,   // 30초
        preparedStatements: false, // prepared statement 비활성화
      },
    },
  } as any)
}

// Vercel serverless 환경에서는 매번 새로운 클라이언트 생성하여 prepared statement 충돌 방지
// Connection Pooler와의 충돌을 방지하기 위해 production에서는 싱글톤을 사용하지 않음
export const prisma = process.env.NODE_ENV === 'production' 
  ? createPrismaClient()
  : (globalForPrisma.prisma ?? createPrismaClient())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
