# Wormi Cruise 개발 환경 설정 가이드

## 프로젝트 개요
- **프로젝트명**: Wormi Cruise (월미도 크루즈 예약 시스템)
- **기술 스택**: Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL
- **스타일링**: Tailwind CSS + shadcn/ui
- **인증**: JWT + bcrypt
- **결제**: 이니시스 연동 (개발 단계에서는 데이터 처리만)
- **배포**: Vercel
- **데이터베이스**: Supabase (PostgreSQL)

## 1. 사전 준비사항

### 필수 요구사항
- Node.js 20.11.1 이상
- Git
- Vercel 계정
- Supabase 계정

### 권장 도구
- VS Code
- Vercel CLI
- Supabase CLI

## 2. Vercel 설정 (배포 플랫폼)

### 2.1 Vercel 계정 생성 및 프로젝트 연결

#### 단계 1: Vercel 계정 생성
1. [Vercel 웹사이트](https://vercel.com) 방문
2. GitHub 계정으로 로그인 (권장)
3. 계정 생성 완료

#### 단계 2: 프로젝트 연결
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 선택 또는 연결
3. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

#### 단계 3: 환경변수 설정
Vercel 대시보드에서 다음 환경변수들을 설정:

```env
# 데이터베이스 (Supabase 연결 문자열)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT 시크릿 키
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# 이니시스 결제 (개발 단계에서는 선택사항)
INICIS_MID="your-mid"
INICIS_SIGNKEY="your-signkey"
INICIS_RETURN_URL="https://your-domain.vercel.app/api/payment/inicis/return"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret"
```

#### 단계 4: 도메인 설정 (선택사항)
1. Vercel 대시보드 → Settings → Domains
2. 커스텀 도메인 추가 (예: `wormi-cruise.com`)
3. DNS 설정 완료

### 2.2 Vercel CLI 설치 및 설정

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리에서 로그인
vercel login

# 프로젝트 연결
vercel link

# 로컬에서 배포 테스트
vercel build
```

## 3. Supabase 설정 (데이터베이스)

### 3.1 Supabase 프로젝트 생성

#### 단계 1: Supabase 계정 생성
1. [Supabase 웹사이트](https://supabase.com) 방문
2. GitHub 계정으로 로그인
3. "Start your project" 클릭

#### 단계 2: 새 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트 설정:
   - **Name**: `wormi-cruise`
   - **Database Password**: 강력한 비밀번호 생성 (기록해두기)
   - **Region**: `Northeast Asia (Seoul)` (한국 사용자 권장)
   - **Pricing Plan**: Free (개발용)

#### 단계 3: 데이터베이스 연결 정보 확인
1. 프로젝트 대시보드 → Settings → Database
2. Connection string 복사:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 3.2 Supabase CLI 설정 (선택사항)

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# Supabase에 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref [YOUR-PROJECT-REF]
```

### 3.3 데이터베이스 스키마 설정

#### Prisma 스키마 생성
```bash
# Prisma 초기화
npx prisma init

# 스키마 파일 생성 (prisma/schema.prisma)
```

#### 마이그레이션 실행
```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# Prisma 클라이언트 생성
npx prisma generate데

# 시드 데이터 실행 (선택사항)
npx prisma db seed
```

## 4. 로컬 개발 환경 설정

### 4.1 프로젝트 클론 및 의존성 설치

```bash
# 저장소 클론
git clone [YOUR-REPOSITORY-URL]
cd wormi-cruise

# 의존성 설치
npm install
```

### 4.2 환경변수 설정

`.env.local` 파일 생성:
```env
# 데이터베이스 (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# 이니시스 결제 (개발 단계에서는 선택사항)
INICIS_MID="your-mid"
INICIS_SIGNKEY="your-signkey"
INICIS_RETURN_URL="http://localhost:3000/api/payment/inicis/return"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 4.3 개발 서버 실행

```bash
# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 시작
npm run dev
```

## 5. 결제 시스템 설정 (개발 단계)

### 5.1 이니시스 테스트 환경 설정

개발 단계에서는 실제 결제 연동 없이 데이터 처리만 수행합니다.

#### 테스트용 결제 처리 로직
```typescript
// app/api/payment/inicis/route.ts
export async function POST(request: Request) {
  try {
    // 결제 요청 데이터 검증
    const paymentData = await request.json();
    
    // 테스트 모드에서는 항상 성공 처리
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        ok: true,
        data: {
          orderNumber: paymentData.orderNumber,
          status: 'SUCCESS',
          amount: paymentData.amount,
          message: '테스트 결제 성공'
        }
      });
    }
    
    // 실제 결제 연동 로직 (운영 환경에서만)
    // ...
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: '결제 처리 중 오류가 발생했습니다.'
    });
  }
}
```

### 5.2 결제 연동 활성화 (운영 환경)

운영 환경에서 실제 결제 연동을 활성화하려면:

1. 이니시스 계정 생성 및 승인
2. 운영 환경 MID/SignKey 발급
3. Vercel 환경변수에 운영 키 설정
4. 결제 테스트 완료 후 활성화

## 6. 배포 프로세스

### 6.1 자동 배포 설정

GitHub와 Vercel을 연결하면 자동 배포가 설정됩니다:

1. `main` 브랜치에 푸시 → 자동 배포
2. Pull Request 생성 → Preview 배포
3. 배포 상태는 Vercel 대시보드에서 확인

### 6.2 수동 배포

```bash
# Vercel CLI를 통한 배포
vercel --prod

# 또는 GitHub에 푸시
git add .
git commit -m "Deploy to production"
git push origin main
```

### 6.3 배포 전 체크리스트

- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] `npm run lint` 통과 (0 경고)
- [ ] `npm run typecheck` 통과 (0 오류)
- [ ] `npm run build` 성공
- [ ] 결제 테스트 (개발 모드)
- [ ] 인증 플로우 테스트
- [ ] 예약 프로세스 테스트

## 7. 모니터링 및 로깅

### 7.1 Vercel Analytics

1. Vercel 대시보드 → Analytics
2. 웹사이트 성능 모니터링
3. Core Web Vitals 추적

### 7.2 Supabase 모니터링

1. Supabase 대시보드 → Logs
2. 데이터베이스 쿼리 모니터링
3. API 사용량 추적

### 7.3 에러 추적

```typescript
// lib/error-tracking.ts
export function logError(error: Error, context?: any) {
  console.error('Error:', error.message, context);
  
  // 운영 환경에서는 에러 추적 서비스 연동
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket 등 연동
  }
}
```

## 8. 보안 설정

### 8.1 환경변수 보안

- 민감한 정보는 절대 코드에 하드코딩하지 않기
- `.env.local` 파일을 `.gitignore`에 추가
- Vercel 환경변수는 대시보드에서만 설정

### 8.2 데이터베이스 보안

- Supabase Row Level Security (RLS) 활성화
- 적절한 인덱스 설정
- 정기적인 백업

### 8.3 API 보안

- JWT 토큰 만료 시간 설정
- Rate limiting 적용
- CORS 설정

## 9. 성능 최적화

### 9.1 Next.js 최적화

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['your-image-domain.com'],
  },
  // 성능 최적화
  swcMinify: true,
  compress: true,
}

module.exports = nextConfig
```

### 9.2 데이터베이스 최적화

- 적절한 인덱스 설정
- 쿼리 최적화
- 연결 풀 설정

## 10. 트러블슈팅

### 10.1 일반적인 문제

#### 빌드 실패
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# Prisma 클라이언트 재생성
npx prisma generate
```

#### 데이터베이스 연결 오류
1. Supabase 연결 문자열 확인
2. 방화벽 설정 확인
3. 데이터베이스 상태 확인

#### 환경변수 오류
1. Vercel 대시보드에서 환경변수 확인
2. 변수명 대소문자 확인
3. 특수문자 이스케이프 확인

### 10.2 로그 확인

```bash
# Vercel 로그 확인
vercel logs [deployment-url]

# Supabase 로그 확인
# Supabase 대시보드 → Logs
```

## 11. 개발 워크플로우

### 11.1 브랜치 전략

```
main (운영)
├── develop (개발)
├── feature/기능명 (기능 개발)
├── bugfix/버그명 (버그 수정)
└── hotfix/긴급수정 (긴급 수정)
```

### 11.2 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 11.3 Pull Request 규칙

1. 제목은 명확하고 간결하게
2. 변경사항 상세 설명
3. 스크린샷 첨부 (UI 변경 시)
4. 체크리스트 완료 확인

## 12. 추가 리소스

### 12.1 문서 링크

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)

### 12.2 유용한 도구

- [Vercel CLI](https://vercel.com/cli)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Prisma Studio](https://www.prisma.io/studio)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 🚀 최근 개발 진행사항 (2025-01-18)

### 관리자 시스템 구현 및 배포 문제 해결

#### 1. 관리자 시스템 분리 구현
- **관리자 로그인 페이지**: `/admin/login` 별도 구현
- **관리자 대시보드**: `/admin/dashboard` 구현
- **관리자 예약 관리**: `/admin/reservations` 구현
- **관리자 전용 API**: `/api/admin/auth/login`, `/api/admin/dashboard/stats` 등 구현

#### 2. Prisma 스키마 동기화 문제 해결
- **문제**: Supabase 데이터베이스의 snake_case 컬럼명과 Prisma의 camelCase 필드명 불일치
- **해결**: 모든 모델에 `@map` 속성 추가하여 데이터베이스 스키마와 완전 동기화
- **수정된 모델들**:
  - `Member`: `createdAt` → `@map("created_at")`, `updatedAt` → `@map("updated_at")`
  - `Admin`: `isActive` → `@map("is_active")`, `lastLoginAt` → `@map("last_login_at")` 등
  - `ProductCategory`, `Product`, `Reservation`, `PersonTypePrice` 모델 전체 매핑 완료

#### 3. 관리자 로그인 307 리다이렉트 문제 해결
- **문제**: 관리자 로그인 후 대시보드로 이동 시 307 Temporary Redirect 발생
- **원인**: 미들웨어에서 관리자 페이지를 보호 대상에 포함하여 서버 사이드 인증 처리
- **해결**:
  - 미들웨어에서 관리자 페이지(`/admin/dashboard`, `/admin/reservations`) 제외
  - 관리자 페이지는 클라이언트 사이드에서 인증 처리하도록 변경
  - `config.matcher`에서 `/admin/:path*` 제거

#### 4. 관리자 토큰 검증 401 에러 해결
- **문제**: "유효하지 않은 토큰입니다" 에러로 대시보드 API 호출 실패
- **원인 분석 과정**:
  1. JWT_SECRET 불일치 의심 → Vercel 환경변수 확인 (정상)
  2. 토큰 만료 의심 → 토큰 만료 시간 확인 (정상)
  3. 토큰 형식 문제 의심 → JWT 토큰에 공백 포함 발견
  4. 미들웨어 문제 발견 → Vercel 로그에서 "Middleware: Unauthorized 401" 확인
- **최종 해결**:
  - 미들웨어의 `config.matcher`에서 `/api/admin/:path*` 제거
  - 관리자 API는 자체 인증 처리하도록 수정
  - JWT 토큰 생성 시 공백 제거 로직 추가

#### 5. 기술적 개선사항
- **JWT 토큰 관리**:
  - Access Token: 15분 만료
  - Refresh Token: 7일 만료
  - HttpOnly 쿠키와 localStorage 이중 저장
- **인증 방식**:
  - 일반 사용자: 미들웨어 + 쿠키 기반 인증
  - 관리자: 클라이언트 사이드 + Authorization 헤더 기반 인증
- **에러 처리**:
  - 상세한 에러 로깅 추가
  - 토큰 검증 실패와 권한 부족 구분

#### 6. 배포 및 테스트
- **Vercel 배포**: 성공적으로 배포 완료
- **관리자 계정**: `admin` / `admin123` (해싱된 비밀번호로 DB 저장)
- **테스트 결과**:
  - ✅ 관리자 로그인 성공
  - ✅ 대시보드 페이지 접근 성공
  - ✅ API 호출 정상화
  - ✅ 307 리다이렉트 문제 해결
  - ✅ 401 토큰 검증 에러 해결

#### 7. 현재 상태
- **관리자 시스템**: 완전 구현 및 정상 작동
- **일반 사용자 시스템**: 기존 기능 유지
- **데이터베이스**: Prisma 스키마와 Supabase 완전 동기화
- **배포 환경**: Vercel에서 안정적으로 운영 중

### 🔧 해결된 주요 이슈들
1. **PrismaClientKnownRequestError**: 데이터베이스 컬럼명 불일치
2. **307 Temporary Redirect**: 미들웨어 인증 처리 문제
3. **401 Unauthorized**: 미들웨어가 관리자 API 차단 문제
4. **JWT 토큰 검증 실패**: 토큰 형식 및 미들웨어 라우팅 문제

### 📝 다음 개발 계획
- 관리자 예약 관리 기능 완성
- 상품 관리 기능 구현
- 회원 관리 기능 구현
- 결제 시스템 연동
- 모바일 반응형 최적화

---

## 🚀 추가 개발 진행사항 (2025-01-18)

### 관리자 네비게이션 시스템 구현

#### 1. 관리자 공통 네비게이션 컴포넌트
- **AdminNavigation 컴포넌트**: 좌측 사이드바 네비게이션
- **접기/펼치기 기능**: 화살표 버튼으로 토글 가능
- **현재 페이지 하이라이트**: 활성 상태 표시
- **네비게이션 메뉴**:
  - 📊 대시보드
  - 📋 예약 관리
  - 🚢 상품 관리
  - 📂 카테고리 관리
  - 👥 회원 관리
  - ⚙️ 설정
- **하단 사용자 정보 및 로그아웃 버튼**

#### 2. 관리자 레이아웃 시스템
- **AdminLayout 컴포넌트**: 공통 레이아웃 래퍼
- **자동 인증 처리**: 토큰 만료 확인 및 갱신
- **일관된 헤더 구조**: 제목, 설명 표시
- **반응형 디자인**: 모바일에서도 사용 가능

#### 3. 적용된 페이지
- ✅ **관리자 대시보드** (`/admin/dashboard`)
- ✅ **관리자 예약 관리** (`/admin/reservations`)

#### 4. 주요 특징
- **토큰 만료 자동 처리**: 페이지 로드 시 토큰 상태 확인
- **자동 로그인 페이지 이동**: 토큰 만료 시 자동 리다이렉트
- **일관된 UI/UX**: 모든 관리자 페이지에서 동일한 네비게이션
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

### 카테고리 관리 시스템 구현

#### 1. 카테고리 관리 API
- **`GET /api/admin/categories`**: 카테고리 목록 조회 (정렬 순서대로)
- **`POST /api/admin/categories`**: 새 카테고리 생성
- **`GET /api/admin/categories/[id]`**: 특정 카테고리 조회
- **`PUT /api/admin/categories/[id]`**: 카테고리 수정
- **`DELETE /api/admin/categories/[id]`**: 카테고리 삭제

#### 2. 카테고리 관리 페이지 (`/admin/categories`)
- **카테고리 목록 표시**: 테이블 형태로 정렬 순서, 이름, 설명, 상품 수, 상태, 생성일 표시
- **새 카테고리 추가**: 모달을 통한 카테고리 생성
- **카테고리 수정**: 기존 카테고리 정보 수정
- **카테고리 삭제**: 연결된 상품이 없는 경우에만 삭제 가능
- **상태 관리**: 활성/비활성 상태 토글

#### 3. 카테고리 필드
- **name**: 카테고리명 (필수)
- **description**: 카테고리 설명 (선택)
- **sortOrder**: 정렬 순서 (숫자, 기본값 0)
- **isActive**: 활성 상태 (boolean, 기본값 true)

#### 4. 주요 기능
- **카테고리명 중복 확인**: 동일한 이름의 카테고리 생성 방지
- **정렬 순서 관리**: `sortOrder` 필드로 카테고리 표시 순서 제어
- **상품 수 표시**: 각 카테고리에 속한 상품 개수 표시
- **안전한 삭제**: 연결된 상품이 있는 카테고리는 삭제 불가
- **토큰 만료 처리**: 자동 토큰 갱신 및 로그인 페이지 이동

### Toast 알림 시스템 구현

#### 1. Toast 컴포넌트 시스템
- **Toast 컴포넌트**: 4가지 타입 (success, error, warning, info)
- **자동 사라짐**: 기본 5초 후 자동 제거
- **수동 닫기**: X 버튼으로 즉시 닫기 가능
- **아이콘 표시**: 각 타입별 적절한 이모지 아이콘
- **색상 구분**: 타입별 다른 배경색과 테두리색

#### 2. Toast Context 시스템
- **useToast 훅**: 간편한 Toast 사용을 위한 커스텀 훅
- **편의 메서드**: `showSuccess`, `showError`, `showWarning`, `showInfo`
- **자동 관리**: Toast 생명주기 자동 관리
- **다중 Toast**: 여러 Toast 동시 표시 가능

#### 3. 적용된 페이지
- ✅ **관리자 대시보드**: 데이터 로드 실패 시 에러 Toast
- ✅ **카테고리 관리**: 생성/수정/삭제 성공/실패 Toast
- ✅ **예약 관리**: 상태 변경 성공/실패 Toast

#### 4. Toast 타입별 스타일
- **Success**: 초록색 배경, ✅ 아이콘
- **Error**: 빨간색 배경, ❌ 아이콘
- **Warning**: 노란색 배경, ⚠️ 아이콘
- **Info**: 파란색 배경, ℹ️ 아이콘

#### 5. 사용자 경험 개선
- **시각적 피드백**: 액션 결과를 즉시 확인 가능
- **비침습적**: 기존 UI를 방해하지 않는 우상단 표시
- **자동 정리**: 시간 경과 후 자동으로 사라짐
- **접근성**: 스크린 리더 지원 및 키보드 접근 가능

### 🔧 추가 해결된 이슈들
1. **관리자 네비게이션 일관성**: 모든 관리자 페이지에서 동일한 네비게이션 제공
2. **카테고리 관리 시스템**: 상품 분류를 위한 카테고리 CRUD 기능
3. **사용자 피드백 개선**: Toast 알림으로 액션 결과 즉시 확인
4. **관리자 UX 향상**: 직관적인 네비게이션과 시각적 피드백

### 📝 향후 개발 계획
- 상품 관리 기능 구현 (카테고리 연동)
- 회원 관리 기능 구현
- 결제 시스템 연동
- 모바일 반응형 최적화
- 관리자 권한 세분화
- 시스템 로그 및 감사 기능

## 2024-12-19: 상품 옵션 관리 시스템 구현

### 구현된 기능
1. **상품 목록에 옵션 관리 버튼 추가**
   - `useOptions`가 true인 상품에만 "옵션 관리" 버튼 표시
   - 상품 목록에서 옵션 사용 여부 표시

2. **상품 옵션 관리 API 구현**
   - `GET /api/admin/products/[id]/options` - 옵션 목록 조회
   - `POST /api/admin/products/[id]/options` - 옵션 생성
   - `GET /api/admin/products/[id]/options/[optionId]` - 개별 옵션 조회
   - `PUT /api/admin/products/[id]/options/[optionId]` - 옵션 수정
   - `DELETE /api/admin/products/[id]/options/[optionId]` - 옵션 삭제

3. **옵션 값 관리 API 구현**
   - `GET /api/admin/products/[id]/options/[optionId]/values` - 옵션 값 목록 조회
   - `POST /api/admin/products/[id]/options/[optionId]/values` - 옵션 값 생성
   - `GET /api/admin/products/[id]/options/[optionId]/values/[valueId]` - 개별 옵션 값 조회
   - `PUT /api/admin/products/[id]/options/[optionId]/values/[valueId]` - 옵션 값 수정
   - `DELETE /api/admin/products/[id]/options/[optionId]/values/[valueId]` - 옵션 값 삭제

4. **상품 옵션 설정 페이지 구현**
   - `/admin/products/[id]/options` - 옵션 관리 페이지
   - 옵션 생성/수정/삭제 기능
   - 옵션 값 생성/수정/삭제 기능
   - Toast 알림 시스템 연동

### 데이터베이스 스키마
- `ProductOption` 모델: 옵션 정보 (name, description, isRequired, sortOrder)
- `ProductOptionValue` 모델: 옵션 값 정보 (value, price, isActive, sortOrder)
- Cascade 삭제: 옵션 삭제 시 관련 옵션 값들도 함께 삭제

### 주요 특징
- 관리자 인증 필수
- 옵션 사용 상품만 옵션 관리 가능
- 필수/선택 옵션 구분
- 옵션 값별 추가 가격 설정
- 정렬 순서 관리
- 활성/비활성 상태 관리
- Toast 알림으로 사용자 피드백

### 사용법
1. 상품 관리에서 "옵션 사용" 체크박스 활성화
2. 상품 목록에서 "옵션 관리" 버튼 클릭
3. 옵션 생성 및 옵션 값 추가
4. 예약 시 고객이 옵션 선택 가능

### 2024-12-19 업데이트: 옵션 관리 UI 개선

#### 수정된 사항
1. **옵션 관리 버튼 UI 개선**
   - 파란색 배경의 눈에 띄는 버튼으로 변경
   - 옵션 사용 상품임을 명확하게 표시

2. **옵션 데이터 없을 때 인터페이스 개선**
   - 옵션이 없을 때 친화적인 안내 메시지
   - "첫 번째 옵션 추가하기" 버튼 제공
   - 옵션 예시 (룸 타입, 식사 옵션) 표시

3. **데이터베이스 스키마 호환성 수정**
   - `ProductOption` 모델에 맞게 API 스키마 수정
   - `description`, `isRequired` 필드 제거
   - `isActive` 필드로 활성/비활성 상태 관리

4. **옵션 목록 로드 실패 문제 해결**
   - Prisma 스키마와 API 코드 일치성 확보
   - 옵션 데이터가 없어도 정상적으로 페이지 로드

5. **UI 정렬 및 데이터베이스 스키마 수정**
   - 수정, 삭제, 옵션 관리 버튼을 한 줄로 정렬
   - ProductOption 및 ProductOptionValue 모델에 @map 속성 추가
   - snake_case 데이터베이스 컬럼명과 camelCase Prisma 필드명 매핑
   - Prisma 클라이언트 재생성으로 스키마 동기화

6. **CSS 클래스 충돌 문제 해결**
   - `.space-y-6`과 `.space-y-4` 클래스 중첩 사용으로 인한 충돌 해결
   - 모달창 폼에서 `space-y-4`를 `space-y-3`으로 변경
   - 로그인 페이지 폼에서 `space-y-6`을 `space-y-4`로 변경
   - 카테고리 관리 모달 폼 spacing 조정
   - 일반 페이지와 모달창 간 CSS 클래스 충돌 방지

---

이 가이드를 따라 Wormi Cruise 프로젝트의 개발 환경을 설정하고 배포할 수 있습니다. 추가 질문이나 문제가 있으면 개발팀에 문의해주세요.

```
