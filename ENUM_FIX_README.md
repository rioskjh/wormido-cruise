# Wormi Cruise Enum 타입 에러 해결 가이드

## 문제 상황
관리자 대시보드 접근 시 다음과 같은 에러가 발생했습니다:

```
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "42883", message: "operator does not exist: character varying = \"ReservationStatus\"", severity: "ERROR", detail: None, column: None, hint: Some("No operator matches the given name and argument types. You might need to add explicit type casts.") }), transient: false })
```

## 원인 분석
- Prisma 스키마에서는 `ReservationStatus`와 `PaymentStatus`를 enum 타입으로 정의
- 실제 데이터베이스에서는 해당 컬럼들이 `character varying` 타입으로 생성됨
- Prisma가 enum 타입으로 쿼리를 생성하지만, 데이터베이스는 문자열 타입이어서 타입 불일치 발생

## 해결 방법

### 1. 데이터베이스에 enum 타입 생성
`fix_enum_types.sql` 파일을 데이터베이스에서 실행하여 enum 타입을 생성합니다:

```sql
-- 1. ReservationStatus enum 생성
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- 2. PaymentStatus enum 생성  
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- 3. reservations 테이블의 status 컬럼을 enum 타입으로 변경
ALTER TABLE reservations 
ALTER COLUMN status TYPE "ReservationStatus" 
USING status::"ReservationStatus";

-- 4. reservations 테이블의 payment_status 컬럼을 enum 타입으로 변경
ALTER TABLE reservations 
ALTER COLUMN payment_status TYPE "PaymentStatus" 
USING payment_status::"PaymentStatus";
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 데이터베이스 연결 정보를 설정합니다:

```env
# 데이터베이스 (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
```

### 3. Prisma 클라이언트 재생성
```bash
npx prisma generate
```

## 수정된 파일들
- `app/api/admin/dashboard/stats/route.ts` - 대시보드 통계 API
- `app/api/admin/reservations/route.ts` - 관리자 예약 목록 API
- `fix_enum_types.sql` - 데이터베이스 enum 타입 생성 스크립트

## 주의사항
1. 데이터베이스 스키마 변경 전에 반드시 백업을 수행하세요
2. 운영 환경에서는 다운타임이 발생할 수 있으므로 적절한 시점에 실행하세요
3. enum 타입 생성 후 기존 데이터가 올바르게 변환되는지 확인하세요

## 테스트 방법
1. 데이터베이스에 enum 타입 생성
2. 환경변수 설정
3. Prisma 클라이언트 재생성
4. 관리자 대시보드 접근 테스트
5. 예약 목록 조회 테스트
6. 예약 상태 변경 테스트

## 추가 개선사항
향후 Prisma 마이그레이션을 사용하여 스키마 변경을 관리하는 것을 권장합니다:

```bash
npx prisma migrate dev --name fix_enum_types
```
