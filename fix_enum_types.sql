-- Wormi Cruise 데이터베이스 enum 타입 수정 스크립트
-- 이 스크립트는 데이터베이스에서 직접 실행해야 합니다.

-- 1. ReservationStatus enum 생성
DO $$ 
BEGIN
    -- enum이 이미 존재하는지 확인
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReservationStatus') THEN
        CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
    END IF;
END $$;

-- 2. PaymentStatus enum 생성
DO $$ 
BEGIN
    -- enum이 이미 존재하는지 확인
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
    END IF;
END $$;

-- 3. reservations 테이블의 status 컬럼을 enum 타입으로 변경
ALTER TABLE reservations 
ALTER COLUMN status TYPE "ReservationStatus" 
USING status::"ReservationStatus";

-- 4. reservations 테이블의 payment_status 컬럼을 enum 타입으로 변경
ALTER TABLE reservations 
ALTER COLUMN payment_status TYPE "PaymentStatus" 
USING payment_status::"PaymentStatus";

-- 5. 기본값 설정
ALTER TABLE reservations 
ALTER COLUMN status SET DEFAULT 'PENDING'::"ReservationStatus";

ALTER TABLE reservations 
ALTER COLUMN payment_status SET DEFAULT 'PENDING'::"PaymentStatus";

-- 완료 메시지
SELECT 'Enum types created and applied successfully!' as message;
