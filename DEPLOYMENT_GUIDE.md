# Wormi Cruise 배포 가이드

## 📋 프로젝트 개요
- **프로젝트명**: Wormi Cruise (월미도 크루즈 예약 시스템)
- **기술 스택**: Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL
- **라이브 서버**: 115.68.177.81
- **도메인**: https://wolmido.web12.kr
- **DB 서버**: 115.68.178.250

## 🗄️ 데이터베이스 정보
- **DB 서버**: 115.68.178.250
- **DB 이름**: wolmido_db
- **DB 계정**: wolmido
- **DB 비밀번호**: dnjfaleh*1001

## 🔧 주요 수정사항 (2025-10-15)

### 1. Hydration 에러 수정
**파일**: `app/page.tsx`
**문제**: `data-debug-info`에서 `new Date().toISOString()` 사용으로 인한 서버-클라이언트 불일치
**해결**: 고정된 시간 문자열로 변경
```typescript
// 수정 전
data-debug-info={`페이지 빌드 시간: ${new Date().toISOString()}, 배경색: #4C9DE8`}

// 수정 후
data-debug-info="페이지 빌드 시간: 2025-10-15T11:09:56.279Z, 배경색: #4C9DE8"
```

### 2. Prisma 스키마 수정
**파일**: `prisma/schema.prisma`
**문제**: `Board`와 `Post` 모델에서 `boardId` 필드 중복 정의
**해결**: 중복된 필드 정의 제거

### 3. 관리자 계정 생성 기능 추가
**파일**: `prisma/seed.ts`
**내용**: 관리자 계정 생성 및 기본 데이터 시드 기능
**관리자 로그인 정보**:
- 사용자명: `admin`
- 비밀번호: `admin123!`
- URL: `https://wolmido.web12.kr/admin/login`

## 🚀 배포 프로세스

### 로컬에서 빌드 및 업로드
```powershell
# 1. 로컬에서 빌드
npm run build

# 2. 빌드 파일 압축
Compress-Archive -Path ".next", "public", "package.json", "ecosystem.config.js", ".env.production" -DestinationPath "wormi-build-final.zip" -Force

# 3. 라이브서버에 업로드 (비밀번호 방식)
scp wormi-build-final.zip root@115.68.177.81:/home/wolmido/
```

### 라이브서버에서 배포
```bash
# 1. 기존 프로세스 정리
pm2 stop all
pm2 delete all

# 2. 기존 프로젝트 백업
cd /home/wolmido
mv public_html public_html_backup_$(date +%Y%m%d_%H%M%S)

# 3. 새 빌드 파일 압축 해제
unzip -o wormi-build-final.zip -d public_html/
cd public_html

# 4. 정적 파일 복사 (standalone 빌드용)
mkdir -p .next/standalone/static
cp -r .next/static/* .next/standalone/static/
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/

# 5. 파일 권한 수정
chown -R www-data:www-data .next/standalone/static/
chmod -R 755 .next/standalone/static/

# 6. PM2로 애플리케이션 시작
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

## 🔧 환경변수 설정

### .env.production 파일 내용
```env
# 프로덕션 환경변수 설정
# 데이터베이스 연결 정보
DATABASE_URL="postgresql://wolmido:dnjfaleh*1001@115.68.178.250:5432/wolmido_db?schema=public"

# JWT 인증 관련
JWT_SECRET="wormi-cruise-production-jwt-secret-key-2024"
NEXTAUTH_SECRET="wormi-cruise-nextauth-secret-key-2024"

# 애플리케이션 URL (HTTPS로 수정)
NEXTAUTH_URL="https://wolmido.web12.kr"
NODE_ENV="production"

# 이니시스 결제 관련 (필요시)
INICIS_MID="your-inicis-mid"
INICIS_SIGNKEY="your-inicis-signkey"

# 기타 설정
NEXT_PUBLIC_APP_URL="https://wolmido.web12.kr"
```

## 🛠️ 문제 해결 가이드

### 1. 정적 파일 404 에러
**증상**: `page-6de33d4ed3a5363d.js` 등 JavaScript 파일 404 에러
**해결**:
```bash
# standalone 빌드용 정적 파일 복사
mkdir -p .next/standalone/static
cp -r .next/static/* .next/standalone/static/

# 파일 권한 수정
chown -R www-data:www-data .next/standalone/static/
chmod -R 755 .next/standalone/static/
```

### 2. 관리자 로그인 문제
**해결**: 관리자 계정 생성
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123!', 12);
    
    const admin = await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@wolmido.com',
        name: '관리자',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    
    console.log('✅ 관리자 계정 생성 완료:', {
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
"
```

### 3. PM2 포트 충돌 문제
**해결**:
```bash
# 모든 Node.js 프로세스 강제 종료
sudo pkill -f node
sudo pkill -f next
sudo pkill -f npm

# 포트 3000 강제 정리
sudo fuser -k 3000/tcp

# PM2 완전 정리
pm2 kill
```

## 📁 파일 구조
```
/home/wolmido/public_html/
├── .next/
│   ├── static/           # 원본 정적 파일
│   └── standalone/       # standalone 빌드
│       ├── static/       # 복사된 정적 파일
│       ├── public/       # 복사된 public 파일
│       └── server.js     # standalone 서버
├── public/               # 정적 자산
├── ecosystem.config.js   # PM2 설정
├── .env.production       # 환경변수
└── package.json
```

## 🔍 모니터링 명령어
```bash
# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs wormido-cruise --lines 20

# 포트 상태 확인
netstat -tulpn | grep :3000

# 파일 권한 확인
ls -la .next/standalone/static/chunks/app/admin/login/

# Nginx 설정 확인
cat /etc/nginx/sites-available/wolmido.web12.kr.conf | grep -A 10 "_next/static"
```

## 🚨 주의사항
1. **standalone 빌드**에서는 정적 파일을 `.next/standalone/static`으로 복사해야 함
2. **파일 권한**은 `www-data:www-data`로 설정
3. **HTTPS URL** 사용 (http://115.68.177.81 → https://wolmido.web12.kr)
4. **PM2 재시작** 후 로그 확인 필수
5. **데이터베이스 연결** 테스트 후 관리자 계정 생성

## 📞 관리자 로그인 정보
- **URL**: https://wolmido.web12.kr/admin/login
- **사용자명**: admin
- **비밀번호**: admin123!

---
**최종 업데이트**: 2025-10-15
**커밋 해시**: 40b7895

