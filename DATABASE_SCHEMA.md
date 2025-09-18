# Wormi Cruise 데이터베이스 스키마

## 개요
Wormi Cruise 시스템은 PostgreSQL 데이터베이스를 사용하며, Prisma ORM을 통해 관리됩니다.

## 주요 테이블

### 1. 관리자 테이블 (admins)
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role admin_role DEFAULT 'ADMIN',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**열거형:**
```sql
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR');
```

### 2. 회원 테이블 (members)
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  nickname VARCHAR(255) NOT NULL,
  role role_type DEFAULT 'USER',
  level INTEGER DEFAULT 1,
  point INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**열거형:**
```sql
CREATE TYPE role_type AS ENUM ('USER', 'EDITOR', 'ADMIN');
```

### 3. 상품 카테고리 테이블 (product_categories)
```sql
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. 상품 테이블 (products)
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES product_categories(id),
  base_price INTEGER DEFAULT 0,
  adult_price INTEGER DEFAULT 0,
  child_price INTEGER DEFAULT 0,
  infant_price INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 50,
  current_bookings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  use_options BOOLEAN DEFAULT false,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. 인원 타입별 가격 테이블 (person_type_prices)
```sql
CREATE TABLE person_type_prices (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  person_type person_type_enum NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, person_type)
);
```

**열거형:**
```sql
CREATE TYPE person_type_enum AS ENUM ('ADULT', 'CHILD', 'INFANT');
```

### 6. 상품 옵션 테이블 (product_options)
```sql
CREATE TABLE product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. 상품 옵션 값 테이블 (product_option_values)
```sql
CREATE TABLE product_option_values (
  id SERIAL PRIMARY KEY,
  option_id INTEGER NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL,
  price INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8. 상품 스케줄 테이블 (product_schedules)
```sql
CREATE TABLE product_schedules (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option1_value_id INTEGER REFERENCES product_option_values(id),
  option2_value_id INTEGER REFERENCES product_option_values(id),
  option3_value_id INTEGER REFERENCES product_option_values(id),
  max_capacity INTEGER DEFAULT 0,
  current_bookings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, option1_value_id, option2_value_id, option3_value_id)
);
```

### 9. 예약 테이블 (reservations)
```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  schedule_id INTEGER REFERENCES product_schedules(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  reservation_date TIMESTAMP NOT NULL,
  reservation_time VARCHAR(10) NOT NULL,
  adults INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PENDING',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10. 주문 테이블 (orders)
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  total_amount INTEGER NOT NULL,
  status order_status DEFAULT 'PENDING',
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**열거형:**
```sql
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
```

### 11. 주문 아이템 테이블 (order_items)
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  adult_count INTEGER DEFAULT 0,
  child_count INTEGER DEFAULT 0,
  infant_count INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 12. 게시판 테이블 (boards)
```sql
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  board_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  skin VARCHAR(50) DEFAULT 'default',
  use_comment BOOLEAN DEFAULT true,
  use_upload BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. 게시글 테이블 (posts)
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  board_id VARCHAR(255) NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_notice BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 14. 댓글 테이블 (comments)
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 15. 첨부파일 테이블 (attachments)
```sql
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 16. 감사 로그 테이블 (audit_logs)
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  admin_id INTEGER REFERENCES admins(id),
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  resource_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 17. 리프레시 토큰 테이블 (refresh_tokens)
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 18. 소셜 계정 테이블 (accounts)
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(50),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);
```

## 인덱스

### 성능 최적화를 위한 인덱스
```sql
-- 회원 테이블 인덱스
CREATE INDEX idx_members_username ON members(username);
CREATE INDEX idx_members_email ON members(email);

-- 상품 테이블 인덱스
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 예약 테이블 인덱스
CREATE INDEX idx_reservations_member_id ON reservations(member_id);
CREATE INDEX idx_reservations_product_id ON reservations(product_id);
CREATE INDEX idx_reservations_order_number ON reservations(order_number);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_reservation_date ON reservations(reservation_date);

-- 게시글 테이블 인덱스
CREATE INDEX idx_posts_board_id ON posts(board_id);
CREATE INDEX idx_posts_member_id ON posts(member_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- 댓글 테이블 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_member_id ON comments(member_id);

-- 감사 로그 테이블 인덱스
CREATE INDEX idx_audit_logs_member_id ON audit_logs(member_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 리프레시 토큰 테이블 인덱스
CREATE INDEX idx_refresh_tokens_member_id ON refresh_tokens(member_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

## 관계도

### 주요 관계
1. **Member ↔ Reservation**: 1:N (회원은 여러 예약 가능)
2. **Product ↔ Reservation**: 1:N (상품은 여러 예약 가능)
3. **ProductSchedule ↔ Reservation**: 1:N (스케줄은 여러 예약 가능)
4. **Member ↔ Post**: 1:N (회원은 여러 게시글 작성 가능)
5. **Post ↔ Comment**: 1:N (게시글은 여러 댓글 가능)
6. **Member ↔ Comment**: 1:N (회원은 여러 댓글 작성 가능)
7. **Product ↔ ProductOption**: 1:N (상품은 여러 옵션 가능)
8. **ProductOption ↔ ProductOptionValue**: 1:N (옵션은 여러 값 가능)
9. **Product ↔ ProductSchedule**: 1:N (상품은 여러 스케줄 가능)
10. **Admin ↔ AuditLog**: 1:N (관리자는 여러 감사 로그 생성)

## 데이터 타입

### 열거형 (Enums)
- **admin_role**: SUPER_ADMIN, ADMIN, EDITOR
- **role_type**: USER, EDITOR, ADMIN
- **person_type_enum**: ADULT, CHILD, INFANT
- **order_status**: PENDING, CONFIRMED, CANCELLED, COMPLETED

### 주요 필드 설명
- **id**: 모든 테이블의 기본 키 (SERIAL)
- **created_at**: 레코드 생성 시간 (TIMESTAMP)
- **updated_at**: 레코드 수정 시간 (TIMESTAMP)
- **is_active**: 활성화 상태 (BOOLEAN)
- **status**: 상태 값 (VARCHAR)

## 마이그레이션

### Prisma 마이그레이션 명령어
```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# 마이그레이션 적용
npx prisma migrate deploy

# 스키마 동기화
npx prisma db push

# 클라이언트 재생성
npx prisma generate
```

### 시드 데이터
```bash
# 시드 데이터 실행
npx prisma db seed
```

## 백업 및 복원

### 백업
```bash
# 전체 데이터베이스 백업
pg_dump -h localhost -U username -d wormi_cruise > backup.sql

# 특정 테이블만 백업
pg_dump -h localhost -U username -d wormi_cruise -t reservations > reservations_backup.sql
```

### 복원
```bash
# 백업 파일로 복원
psql -h localhost -U username -d wormi_cruise < backup.sql
```

## 성능 최적화

### 쿼리 최적화
- 적절한 인덱스 사용
- JOIN 최적화
- 페이지네이션 적용
- 캐싱 전략 수립

### 모니터링
- 느린 쿼리 로깅
- 데이터베이스 성능 모니터링
- 연결 풀 관리
- 정기적인 통계 업데이트

