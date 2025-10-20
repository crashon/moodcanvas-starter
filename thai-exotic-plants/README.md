# Thai Exotic Plants - 태국 특이식물 전문 쇼핑몰

태국에서 직접 수집한 희귀하고 아름다운 특이식물을 한국으로 직배송하는 전문 온라인 쇼핑몰

## 🌱 프로젝트 개요

Thai Exotic Plants는 태국 현지에서 희귀한 특이식물을 수집하여 한국의 식물 애호가들에게 제공하는 전문 쇼핑몰입니다. 워드프레스 기반의 쇼핑 기능, 소셜미디어 자동화 시스템, 그리고 다중 샵 관리 기능을 갖춘 종합적인 전자상거래 플랫폼입니다.

## ✨ 주요 특징

- 🛒 **종합 쇼핑몰**: 상품 등록부터 주문 처리까지 완전한 전자상거래 시스템
- 🏪 **다중 샵 관리**: 여러 샵의 상품 및 운영 관리
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 사용자 경험
- 🤖 **소셜미디어 자동화**: 페이스북, 인스타그램, 트위터(X)에 자동 포스팅
- 📊 **관리자 대시보드**: 실시간 매출 분석, 상품/주문/샵 관리
- 🎥 **미디어 관리**: 이미지와 동영상 업로드 및 관리 시스템
- 🌏 **다국어 지원**: 한국어, 영어, 태국어 상품명 및 설명

## 📂 프로젝트 구조

```
Thai-Exotic-Plants/
├── index.html              # 메인 페이지
├── admin.html              # 관리자 대시보드
├── shop-owner.html         # 샵 오너 대시보드
├── css/
│   └── style.css          # 커스텀 스타일
├── js/
│   ├── main.js            # 메인 애플리케이션 로직
│   ├── cart.js            # 장바구니 및 주문 시스템
│   ├── products.js        # 상품 관리 로직
│   ├── admin.js           # 관리자 기능
│   ├── shop.js            # 샵 관리 및 샵 오너 로직
│   ├── social-media.js    # 소셜미디어 자동화
│   └── media-manager.js   # 미디어 관리 시스템
└── README.md              # 프로젝트 문서
```

## 🚀 시작하기

### 요구사항

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 로컬 웹 서버 (선택사항)

### 설치 및 실행

1. **프로젝트 다운로드**
   ```bash
   # 프로젝트 폴더로 이동
   cd thai-exotic-plants
   ```

2. **웹 서버 실행** (선택사항)
   ```bash
   # Python 3를 사용하는 경우
   python -m http.server 8000
   
   # 또는 Node.js의 http-server를 사용하는 경우
   npx http-server -p 8000
   ```

3. **브라우저에서 열기**
   - 메인 페이지: `http://localhost:8000/index.html`
   - 관리자 대시보드: `http://localhost:8000/admin.html`
   - 샵 오너 대시보드: `http://localhost:8000/shop-owner.html`

   또는 파일을 직접 브라우저로 드래그하여 열 수 있습니다.

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Vanilla JavaScript**: ES6+ 문법 활용
- **Chart.js**: 데이터 시각화
- **Font Awesome**: 아이콘 라이브러리

### 데이터 저장
- **LocalStorage**: 클라이언트 사이드 데이터 저장
- **JSON**: 데이터 구조화

## 📊 데이터 모델

### 상품 (Products)
```javascript
{
  id: string,
  shop_id: string,
  name: string,
  korean_name: string,
  thai_name: string,
  scientific_name: string,
  description: string,
  category_id: string,
  price: number,
  price_usd: number,
  stock_quantity: number,
  images: array,
  videos: array,
  difficulty_level: string,
  is_rare: boolean,
  is_featured: boolean,
  is_active: boolean
}
```

### 샵 (Shops)
```javascript
{
  id: string,
  name: string,
  description: string,
  owner_id: string,
  contact: string,
  address: string,
  is_active: boolean,
  created_at: timestamp
}
```

### 주문 (Orders)
```javascript
{
  id: string,
  order_number: string,
  customer_name: string,
  customer_email: string,
  items: array,
  total_amount: number,
  payment_status: string,
  order_status: string,
  created_at: timestamp
}
```

## 🎯 주요 기능

### 사용자 기능
- ✅ 상품 검색 및 필터링
- ✅ 카테고리별 상품 조회
- ✅ 샵별 상품 조회
- ✅ 상품 상세 정보 확인
- ✅ 장바구니 관리
- ✅ 주문하기

### 관리자 기능
- ✅ 대시보드 (매출 통계, 차트)
- ✅ 상품 관리 (CRUD)
- ✅ 샵 관리 (CRUD)
- ✅ 주문 관리
- ✅ 카테고리 관리
- ✅ 소셜미디어 자동 포스팅
- ✅ 미디어 라이브러리

### 샵 오너 기능
- ✅ 샵 정보 관리
- ✅ 샵별 상품 관리
- ✅ 재고 관리
- ✅ 매출 통계
- ✅ 판매 내역 조회

## 🎨 디자인 특징

- **반응형 레이아웃**: 모든 화면 크기에 최적화
- **모던 UI/UX**: 직관적이고 세련된 인터페이스
- **부드러운 애니메이션**: 향상된 사용자 경험
- **접근성**: 키보드 네비게이션 지원

## 🔒 보안 고려사항

현재 버전은 프로토타입이므로 다음 보안 기능이 추가되어야 합니다:

- [ ] 사용자 인증 및 권한 관리
- [ ] 데이터 암호화
- [ ] XSS 방지
- [ ] CSRF 토큰
- [ ] API 보안
- [ ] HTTPS 연결

## 🌟 향후 개발 계획

### 단기 계획 (1-2개월)
- [ ] 결제 시스템 연동 (PayPal, Stripe)
- [ ] 배송 추적 시스템
- [ ] 재고 알림 시스템
- [ ] 고객 리뷰 시스템
- [ ] 샵 리뷰 시스템

### 중기 계획 (3-6개월)
- [ ] 회원 등급 시스템
- [ ] 위시리스트 기능
- [ ] 쿠폰 및 할인 시스템
- [ ] 이메일 마케팅
- [ ] 샵별 프로모션

### 장기 계획 (6개월+)
- [ ] 모바일 앱 개발
- [ ] AI 기반 상품 추천
- [ ] AR/VR 식물 배치 체험
- [ ] 글로벌 확장
- [ ] 샵 커뮤니티 기능

## 📝 사용 가이드

### 고객용
1. 메인 페이지에서 원하는 상품 검색
2. 카테고리 또는 샵별로 필터링
3. 상품 클릭하여 상세 정보 확인
4. 장바구니에 추가
5. 주문 정보 입력 후 주문 완료

### 관리자용
1. admin.html 접속
2. 사이드바에서 원하는 메뉴 선택
3. 대시보드에서 전체 통계 확인
4. 상품, 샵, 주문 등을 관리
5. 소셜미디어 자동 포스팅 예약

### 샵 오너용
1. shop-owner.html 접속
2. 내 샵 정보 관리
3. 샵 상품 추가/수정/삭제
4. 재고 관리
5. 매출 통계 확인

## 🐛 알려진 문제

- LocalStorage는 브라우저별로 독립적이므로 다른 브라우저에서는 데이터가 공유되지 않습니다.
- 실제 API 연동이 필요합니다.
- 이미지 업로드는 Base64로 저장되므로 대용량 파일은 성능 이슈가 있을 수 있습니다.

## 🤝 기여하기

프로젝트 개선에 기여하고 싶으시다면:

1. 프로젝트 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📧 연락처

프로젝트 관련 문의: info@thaiexoticplants.com

---

© 2025 Thai Exotic Plants. All rights reserved.
