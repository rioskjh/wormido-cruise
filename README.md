# Wormi Cruise - 월미도 크루즈 예약 시스템

## 프로젝트 소개
월미도 크루즈 예약 시스템은 Next.js 14와 TypeScript를 기반으로 구축된 현대적인 웹 애플리케이션입니다. 사용자들이 크루즈 상품을 쉽게 예약하고 결제할 수 있는 플랫폼을 제공합니다.

## 주요 기능
- 🚢 크루즈 상품 조회 및 예약
- 💳 이니시스 결제 시스템 연동 (개발 단계에서는 데이터 처리만)
- 🔐 사용자 인증 및 권한 관리
- 📱 반응형 웹 디자인
- 🎨 shadcn/ui 기반 모던 UI
- 🔒 JWT 기반 보안 인증

## 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Payment**: 이니시스 연동 (개발 단계에서는 데이터 처리만)
- **Deployment**: Vercel

## 시작하기

### 필수 요구사항
- Node.js 20.11.1 이상
- Vercel 계정
- Supabase 계정
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd wormi-cruise
```

2. **의존성 설치**
```bash
npm install
```

3. **환경변수 설정**
```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경변수 설정
```

4. **데이터베이스 설정**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조
```
app/
├── (auth)/          # 인증 관련 페이지
├── admin/           # 관리자 페이지
├── api/             # API 라우트
├── reservation/     # 예약 관련 페이지
├── events/          # 이벤트 페이지
├── gallery/         # 갤러리 페이지
└── support/         # 고객지원 페이지

components/
├── ui/              # shadcn/ui 컴포넌트
├── Navigation.tsx   # 네비게이션
└── PrivateRoute.tsx # 인증 보호 라우트

lib/
├── prisma.ts        # Prisma 클라이언트
├── auth.ts          # 인증 유틸리티
├── utils.ts         # 공통 유틸리티
└── env.ts           # 환경변수 검증
```

## 개발 가이드
자세한 개발 가이드는 다음 문서들을 참조하세요:
- [DEV.md](./DEV.md) - 개발 환경 설정 가이드
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 및 개발 규칙
- [API_GUIDE.md](./API_GUIDE.md) - API 사용 가이드
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 데이터베이스 스키마

## 배포

### Vercel 배포
1. Vercel 계정 생성 및 GitHub 저장소 연결
2. 환경변수 설정 (DATABASE_URL, JWT_SECRET 등)
3. 자동 배포 활성화

### Supabase 설정
1. Supabase 프로젝트 생성
2. 데이터베이스 연결 문자열 설정
3. Prisma 마이그레이션 실행

자세한 배포 가이드는 [DEV.md](./DEV.md)를 참조하세요.

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.

