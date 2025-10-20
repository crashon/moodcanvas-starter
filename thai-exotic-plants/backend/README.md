# Thai Exotic Plants - Backend API

Node.js + Express + MongoDB 기반의 RESTful API 서버

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 설정합니다:

```bash
cp .env.example .env
```

필수 환경 변수:
- `MONGODB_URI`: MongoDB 연결 문자열
- `JWT_SECRET`: JWT 토큰 시크릿 키
- `PORT`: 서버 포트 (기본값: 5000)

### 3. MongoDB 설정

#### 로컬 MongoDB 사용:
```bash
# MongoDB 설치 후 실행
mongod
```

#### MongoDB Atlas (클라우드) 사용:
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 계정 생성
2. 클러스터 생성
3. 연결 문자열 복사하여 `.env`에 설정

### 4. 데이터베이스 시드

샘플 데이터 생성:

```bash
npm run seed
```

### 5. 서버 실행

개발 모드 (nodemon 사용):
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

서버 접속: `http://localhost:5000`

## 📚 API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | `/api/v1/auth/register` | 회원가입 | ❌ |
| POST | `/api/v1/auth/login` | 로그인 | ❌ |
| GET | `/api/v1/auth/me` | 내 정보 조회 | ✅ |
| PUT | `/api/v1/auth/updatedetails` | 정보 수정 | ✅ |
| PUT | `/api/v1/auth/updatepassword` | 비밀번호 변경 | ✅ |
| GET | `/api/v1/auth/logout` | 로그아웃 | ✅ |

### 상품 (Products)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/v1/products` | 상품 목록 | ❌ |
| GET | `/api/v1/products/:id` | 상품 상세 | ❌ |
| POST | `/api/v1/products` | 상품 생성 | ✅ (샵 오너/관리자) |
| PUT | `/api/v1/products/:id` | 상품 수정 | ✅ (샵 오너/관리자) |
| DELETE | `/api/v1/products/:id` | 상품 삭제 | ✅ (샵 오너/관리자) |
| GET | `/api/v1/products/featured` | 추천 상품 | ❌ |
| GET | `/api/v1/products/shop/:shopId` | 샵별 상품 | ❌ |

### 주문 (Orders)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/v1/orders` | 주문 목록 | ✅ (관리자) |
| POST | `/api/v1/orders` | 주문 생성 | ✅ |
| GET | `/api/v1/orders/:id` | 주문 상세 | ✅ |
| GET | `/api/v1/orders/my` | 내 주문 목록 | ✅ |
| PUT | `/api/v1/orders/:id/status` | 주문 상태 변경 | ✅ (샵 오너/관리자) |
| PUT | `/api/v1/orders/:id/cancel` | 주문 취소 | ✅ |
| GET | `/api/v1/orders/shop/:shopId` | 샵별 주문 | ✅ (샵 오너/관리자) |

## 🔐 인증

JWT (JSON Web Token) 기반 인증을 사용합니다.

### 로그인 응답 예시:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "사용자 이름",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### 요청 헤더에 토큰 포함:

```
Authorization: Bearer <your-token>
```

## 📝 API 요청 예시

### 1. 회원가입

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "email": "hong@example.com",
    "password": "password123"
  }'
```

### 2. 로그인

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hong@example.com",
    "password": "password123"
  }'
```

### 3. 상품 목록 조회 (필터링)

```bash
# 카테고리별 필터링
curl http://localhost:5000/api/v1/products?category=<category_id>

# 가격 범위 필터링
curl http://localhost:5000/api/v1/products?price[gte]=1000&price[lte]=10000

# 검색
curl http://localhost:5000/api/v1/products?search=monstera

# 정렬
curl http://localhost:5000/api/v1/products?sort=-price

# 페이지네이션
curl http://localhost:5000/api/v1/products?page=2&limit=10
```

### 4. 상품 생성

```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Monstera Deliciosa",
    "koreanName": "몬스테라",
    "description": "아름다운 몬스테라",
    "category": "<category_id>",
    "shop": "<shop_id>",
    "price": 25000,
    "stockQuantity": 10
  }'
```

### 5. 주문 생성

```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "items": [
      {
        "product": "<product_id>",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "서울시 강남구 테헤란로 123",
      "city": "서울",
      "country": "대한민국"
    },
    "paymentMethod": "card"
  }'
```

## 🗄 데이터 모델

### User (사용자)
- name, email, password
- role: customer | shop_owner | admin
- addresses[], wishlist[]

### Shop (샵)
- name, description, owner
- contact: { email, phone }
- address, logo, banner
- statistics: { totalProducts, totalSales, totalRevenue }

### Product (상품)
- shop, category
- name, koreanName, thaiName, scientificName
- description, price, priceUSD
- stockQuantity, images[], videos[]
- difficultyLevel, isRare, isFeatured

### Order (주문)
- orderNumber, customer
- items[], shippingAddress
- pricing: { subtotal, shippingFee, tax, total }
- orderStatus, paymentInfo

### Category (카테고리)
- name, nameEn, slug
- description, icon, parent

### Review (리뷰)
- product, user, rating, comment
- images[], isVerifiedPurchase

## 🛠 개발 도구

### Postman Collection

API 테스트를 위한 Postman 컬렉션을 제공합니다.

### VS Code REST Client

`.http` 파일로 API 테스트:

```http
### 로그인
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@thaiexoticplants.com",
  "password": "admin123"
}

### 상품 목록
GET http://localhost:5000/api/v1/products
```

## 🔧 환경별 설정

### Development
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/thai-exotic-plants
```

### Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-secret-key
```

## 📊 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [] // 유효성 검사 에러 시
}
```

## 🚦 상태 코드

- `200` - 성공
- `201` - 생성 성공
- `400` - 잘못된 요청
- `401` - 인증 필요
- `403` - 권한 없음
- `404` - 찾을 수 없음
- `500` - 서버 오류

## 🔒 보안

- Helmet.js로 HTTP 헤더 보안
- CORS 설정
- Rate Limiting (IP당 15분에 100 요청)
- Password hashing (bcrypt)
- JWT 토큰 인증
- Input validation (express-validator)

## 📈 성능 최적화

- MongoDB 인덱싱
- Response compression
- Pagination
- Field limiting
- 캐싱 (추후 구현)

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 커버리지
npm run test:coverage
```

## 📝 로그

Morgan 로거 사용:
- Development: 콘솔에 상세 로그
- Production: 파일에 간소화된 로그

## 🚀 배포

### Heroku
```bash
heroku create
git push heroku main
heroku config:set MONGODB_URI=...
```

### AWS / DigitalOcean
- PM2로 프로세스 관리
- Nginx 리버스 프록시
- SSL/TLS 인증서

## 📞 문의

- API 문서: `http://localhost:5000/api`
- 이슈 리포팅: GitHub Issues

---

© 2025 Thai Exotic Plants
