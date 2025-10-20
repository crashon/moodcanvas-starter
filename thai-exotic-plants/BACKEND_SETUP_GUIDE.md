# Thai Exotic Plants - 백엔드 서버 설정 가이드

## 🎯 완성된 백엔드 API 서버

Node.js + Express + MongoDB 기반의 완전한 RESTful API 서버가 구축되었습니다!

## 📦 구현된 기능

### ✅ 완료된 백엔드 기능

1. **인증 시스템**
   - 회원가입 / 로그인
   - JWT 토큰 기반 인증
   - 역할 기반 권한 관리 (고객/샵오너/관리자)
   - 비밀번호 암호화 (bcrypt)

2. **상품 관리 API**
   - CRUD 작업 (생성/조회/수정/삭제)
   - 검색 및 필터링
   - 정렬 및 페이지네이션
   - 샵별/카테고리별 조회

3. **주문 관리 API**
   - 주문 생성 및 조회
   - 주문 상태 관리
   - 재고 자동 차감
   - 샵별 주문 조회

4. **데이터 모델**
   - User (사용자)
   - Shop (샵)
   - Product (상품)
   - Order (주문)
   - Category (카테고리)
   - Review (리뷰)

5. **보안 기능**
   - Helmet.js (HTTP 헤더 보안)
   - CORS 설정
   - Rate Limiting
   - Input Validation
   - Password Hashing

## 🚀 빠른 시작 (5분 안에!)

### 1단계: MongoDB 설치

#### 옵션 A: MongoDB Atlas (클라우드 - 추천)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 회원가입 (무료)
2. "Create a New Cluster" 클릭
3. Free Tier 선택
4. Cluster 생성 (2-5분 소요)
5. "Connect" 클릭 → "Connect your application" 선택
6. 연결 문자열 복사

```
mongodb+srv://<username>:<password>@cluster.mongodb.net/thai-exotic-plants?retryWrites=true&w=majority
```

#### 옵션 B: 로컬 MongoDB

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# MongoDB Installer 다운로드 및 설치
# https://www.mongodb.com/try/download/community
```

### 2단계: 프로젝트 설정

```bash
# 백엔드 폴더로 이동
cd thai-exotic-plants/backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 3단계: .env 파일 수정

```env
# 필수 설정
NODE_ENV=development
PORT=5000

# MongoDB 연결 (Atlas 또는 로컬 선택)
# MongoDB Atlas 사용 시:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thai-exotic-plants

# 로컬 MongoDB 사용 시:
# MONGODB_URI=mongodb://localhost:27017/thai-exotic-plants

# JWT Secret (아무 문자열이나 입력)
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_EXPIRE=7d

# 프론트엔드 URL
FRONTEND_URL=http://localhost:8000
```

### 4단계: 데이터베이스 시드 (샘플 데이터)

```bash
npm run seed
```

출력 예시:
```
✅ Data destroyed
✅ Categories created
✅ Users created
✅ Shops created
✅ Products created
✅ Data imported successfully!

📧 Admin credentials:
   Email: admin@thaiexoticplants.com
   Password: admin123
```

### 5단계: 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 또는 프로덕션 모드
npm start
```

서버가 정상 실행되면:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌿 Thai Exotic Plants API Server                   ║
║                                                       ║
║   🚀 Server running in development mode              ║
║   🌐 Port: 5000                                       ║
║   📍 URL: http://localhost:5000                       ║
║   🔗 API: http://localhost:5000/api/v1               ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

### 6단계: 테스트

브라우저에서 열기:
```
http://localhost:5000/health
```

응답:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

## 🔗 프론트엔드와 연결

### 1. 프론트엔드 설정

`index.html`, `admin.html`, `shop-owner.html` 파일의 `<head>` 섹션에 추가:

```html
<!-- API Client -->
<script src="js/api.js"></script>
```

### 2. 로그인 페이지 열기

```
http://localhost:8000/login.html
```

### 3. 테스트 계정으로 로그인

- **관리자**: admin@thaiexoticplants.com / admin123
- **샵 오너**: tropical@example.com / shop123
- **고객**: customer@example.com / customer123

## 📊 API 엔드포인트 테스트

### Postman으로 테스트

1. **로그인**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@thaiexoticplants.com",
  "password": "admin123"
}
```

2. **상품 목록 조회**
```
GET http://localhost:5000/api/v1/products
```

3. **인증이 필요한 요청** (토큰 포함)
```
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer <your-token-here>
```

### cURL로 테스트

```bash
# 로그인
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thaiexoticplants.com","password":"admin123"}'

# 상품 목록
curl http://localhost:5000/api/v1/products

# 인증 필요 (토큰 사용)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 문제 해결

### MongoDB 연결 오류

```
❌ Error connecting to MongoDB
```

**해결방법:**
1. MongoDB가 실행 중인지 확인
2. `.env` 파일의 `MONGODB_URI` 확인
3. Atlas 사용 시: IP 화이트리스트 확인
4. 네트워크 연결 확인

### 포트 충돌

```
Error: listen EADDRINUSE: address already in use :::5000
```

**해결방법:**
```bash
# 포트 사용 중인 프로세스 확인 및 종료
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# 또는 .env에서 다른 포트 사용
PORT=5001
```

### npm install 오류

```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📁 프로젝트 구조

```
backend/
├── config/
│   └── database.js          # MongoDB 연결
├── controllers/
│   ├── authController.js    # 인증 로직
│   ├── productController.js # 상품 로직
│   └── orderController.js   # 주문 로직
├── models/
│   ├── User.js             # 사용자 모델
│   ├── Shop.js             # 샵 모델
│   ├── Product.js          # 상품 모델
│   ├── Order.js            # 주문 모델
│   ├── Category.js         # 카테고리 모델
│   └── Review.js           # 리뷰 모델
├── routes/
│   ├── auth.js             # 인증 라우트
│   ├── products.js         # 상품 라우트
│   └── orders.js           # 주문 라우트
├── middleware/
│   ├── auth.js             # 인증 미들웨어
│   ├── errorHandler.js     # 에러 처리
│   └── validators.js       # 유효성 검사
├── utils/
│   └── seed.js             # 데이터 시드
├── .env.example            # 환경 변수 템플릿
├── .gitignore
├── package.json
├── server.js               # 메인 서버 파일
└── README.md
```

## 🎓 다음 단계

### 추가 기능 구현

1. **샵 관리 API** (구현 예정)
   - 샵 CRUD
   - 샵 통계

2. **카테고리 API** (구현 예정)
   - 카테고리 관리
   - 계층형 카테고리

3. **리뷰 API** (구현 예정)
   - 리뷰 작성/수정/삭제
   - 평점 계산

4. **이미지 업로드** (Cloudinary)
5. **이메일 알림** (NodeMailer)
6. **결제 연동** (Stripe/PayPal)

### 배포하기

#### Heroku 배포
```bash
# Heroku CLI 설치 후
heroku login
heroku create thai-exotic-plants
git push heroku main
heroku config:set MONGODB_URI=...
heroku open
```

#### Railway 배포
1. [Railway.app](https://railway.app) 가입
2. "New Project" → "Deploy from GitHub"
3. 환경 변수 설정
4. 자동 배포

## 📞 도움말

### 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@thaiexoticplants.com | admin123 |
| 샵 오너 1 | tropical@example.com | shop123 |
| 샵 오너 2 | green@example.com | shop123 |
| 고객 | customer@example.com | customer123 |

### API 문서

서버 실행 후 방문:
- API 정보: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

### 추가 자료

- [Express.js 문서](https://expressjs.com/)
- [MongoDB 문서](https://docs.mongodb.com/)
- [Mongoose 문서](https://mongoosejs.com/)

---

백엔드 서버 설정이 완료되었습니다! 🎉

문제가 있으시면 이슈를 남겨주세요.
