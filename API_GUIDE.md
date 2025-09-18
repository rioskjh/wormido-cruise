# Wormi Cruise API 가이드

## API 개요
Wormi Cruise API는 RESTful 설계 원칙을 따르며, JSON 형식으로 데이터를 주고받습니다.

## 기본 정보
- **Base URL**: `https://your-domain.com/api`
- **Content-Type**: `application/json`
- **인증**: JWT Bearer Token

## 응답 형식
모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "ok": true,
  "data": { ... },
  "error": null
}
```

에러 발생 시:
```json
{
  "ok": false,
  "data": null,
  "error": "에러 메시지"
}
```

## 인증 API

### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user@example.com",
      "email": "user@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123",
  "email": "user@example.com",
  "nickname": "사용자"
}
```

### 토큰 갱신
```http
POST /api/auth/refresh
```

## 상품 API

### 상품 목록 조회
```http
GET /api/products
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `category`: 카테고리 ID
- `search`: 검색어

### 상품 상세 조회
```http
GET /api/products/{id}
```

### 상품 스케줄 조회
```http
GET /api/products/{id}/schedules
```

**쿼리 파라미터:**
- `date`: 날짜 (YYYY-MM-DD 형식)

## 예약 API

### 예약 생성
```http
POST /api/reservations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "productId": 1,
  "scheduleId": 1,
  "customerName": "홍길동",
  "customerPhone": "010-1234-5678",
  "customerEmail": "customer@example.com",
  "reservationDate": "2024-01-15",
  "reservationTime": "14:00",
  "adults": 2,
  "children": 1,
  "infants": 0
}
```

### 예약 조회
```http
GET /api/reservations/{orderNumber}
```

### 예약 취소
```http
DELETE /api/reservations/{orderNumber}
Authorization: Bearer {accessToken}
```

## 결제 API

### 결제 요청
```http
POST /api/payment/inicis
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "orderNumber": "ORD-20240115-001",
  "amount": 150000,
  "productName": "월미도 크루즈 투어",
  "customerName": "홍길동",
  "customerEmail": "customer@example.com",
  "customerPhone": "010-1234-5678"
}
```

### 결제 결과 처리
```http
POST /api/payment/inicis/return
Content-Type: application/x-www-form-urlencoded

# 이니시스에서 전송하는 결제 결과 데이터
```

## 관리자 API

### 관리자 로그인
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 상품 관리
```http
# 상품 생성
POST /api/admin/products
Authorization: Bearer {adminToken}

# 상품 수정
PUT /api/admin/products/{id}
Authorization: Bearer {adminToken}

# 상품 삭제
DELETE /api/admin/products/{id}
Authorization: Bearer {adminToken}
```

### 예약 관리
```http
# 예약 목록 조회
GET /api/admin/reservations
Authorization: Bearer {adminToken}

# 예약 상태 변경
PUT /api/admin/reservations/{id}/status
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

## 에러 코드

| HTTP 상태 코드 | 설명 |
|---------------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

## 인증 토큰

### Access Token
- **만료 시간**: 15분
- **사용법**: `Authorization: Bearer {token}` 헤더에 포함
- **갱신**: Refresh Token을 사용하여 자동 갱신

### Refresh Token
- **만료 시간**: 7일
- **저장**: HttpOnly 쿠키
- **갱신**: `/api/auth/refresh` 엔드포인트 사용

## Rate Limiting
API 호출은 다음 제한이 적용됩니다:
- **일반 API**: 분당 100회
- **인증 API**: 분당 10회
- **결제 API**: 분당 5회

## 예제 코드

### JavaScript/TypeScript
```typescript
// API 호출 예제
const response = await fetch('/api/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();
if (result.ok) {
  console.log('상품 목록:', result.data);
} else {
  console.error('에러:', result.error);
}
```

### cURL
```bash
# 상품 목록 조회
curl -X GET "https://your-domain.com/api/products" \
  -H "Content-Type: application/json"

# 예약 생성
curl -X POST "https://your-domain.com/api/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "productId": 1,
    "customerName": "홍길동",
    "customerPhone": "010-1234-5678",
    "customerEmail": "customer@example.com",
    "reservationDate": "2024-01-15",
    "adults": 2
  }'
```

## 테스트
API 테스트는 다음 도구를 사용할 수 있습니다:
- Postman
- Insomnia
- Thunder Client (VS Code 확장)
- cURL

## 지원
API 관련 문의사항이 있으시면 개발팀에 연락해주세요.

