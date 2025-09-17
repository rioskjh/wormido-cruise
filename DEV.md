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
npx prisma generate

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

이 가이드를 따라 Wormi Cruise 프로젝트의 개발 환경을 설정하고 배포할 수 있습니다. 추가 질문이나 문제가 있으면 개발팀에 문의해주세요.

```
