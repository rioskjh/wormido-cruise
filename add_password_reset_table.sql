-- 비밀번호 재설정 토큰 테이블 생성
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" SERIAL PRIMARY KEY,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "member_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_token" ON "password_reset_tokens"("token");
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_member_id" ON "password_reset_tokens"("member_id");
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_expires_at" ON "password_reset_tokens"("expires_at");

-- members 테이블에 name 컬럼이 없다면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'name') THEN
        ALTER TABLE "members" ADD COLUMN "name" VARCHAR(255);
    END IF;
END $$;
