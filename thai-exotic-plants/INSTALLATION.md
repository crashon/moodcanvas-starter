# Thai Exotic Plants - 설치 가이드

## 빠른 시작 (3분 완료)

### 방법 1: 파일 직접 열기 (가장 간단)

1. **프로젝트 다운로드**
   - 프로젝트 폴더 전체를 다운로드합니다.

2. **파일 열기**
   - `index.html` 파일을 더블클릭하거나 브라우저로 드래그하여 엽니다.
   - 또는 브라우저에서 `Ctrl+O` (Windows) / `Cmd+O` (Mac)를 눌러 파일을 선택합니다.

3. **완료!**
   - 웹사이트가 바로 실행됩니다.
   - 관리자 페이지: `admin.html` 열기
   - 샵 오너 페이지: `shop-owner.html` 열기

### 방법 2: 로컬 웹 서버 사용 (권장)

#### Python 사용
```bash
# 프로젝트 폴더로 이동
cd thai-exotic-plants

# Python 3로 웹 서버 실행
python -m http.server 8000
# 또는 Python 2
python -m SimpleHTTPServer 8000

# 브라우저에서 열기
# http://localhost:8000
```

#### Node.js 사용
```bash
# npx 사용 (Node.js 설치 필요)
npx http-server -p 8000

# 또는 전역 설치 후 사용
npm install -g http-server
http-server -p 8000

# 브라우저에서 열기
# http://localhost:8000
```

#### PHP 사용
```bash
# PHP 내장 웹 서버
php -S localhost:8000

# 브라우저에서 열기
# http://localhost:8000
```

#### VS Code 사용
```
1. VS Code에서 프로젝트 폴더 열기
2. "Live Server" 확장 프로그램 설치
3. index.html 우클릭 → "Open with Live Server"
```

## 페이지 구조

### 🏠 메인 페이지 (index.html)
- 상품 검색 및 필터링
- 샵별 상품 조회
- 장바구니 및 주문하기
- **URL**: `http://localhost:8000/index.html`

### 👨‍💼 관리자 대시보드 (admin.html)
- 매출 통계 및 차트
- 상품/샵/주문 관리
- 소셜미디어 자동화
- 미디어 라이브러리
- **URL**: `http://localhost:8000/admin.html`

### 🏪 샵 오너 대시보드 (shop-owner.html)
- 샵 정보 관리
- 상품 관리
- 재고 관리
- 매출 통계
- **URL**: `http://localhost:8000/shop-owner.html`

## 초기 데이터

프로젝트는 다음과 같은 샘플 데이터로 시작됩니다:

### 카테고리 (4개)
- 희귀 아로이드
- 다육식물
- 관엽식물
- 꽃식물

### 샵 (3개)
- Tropical Paradise (열대식물 전문)
- Green Garden (다육식물 전문)
- Exotic Flora (희귀 아로이드)

### 상품 (4개)
- Monstera Albo Variegata
- Echeveria Black Prince
- Philodendron Pink Princess
- Anthurium Clarinervium

## 데이터 초기화

모든 데이터는 브라우저의 LocalStorage에 저장됩니다.

### 데이터 확인
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
console.log(localStorage);
```

### 데이터 초기화
```javascript
// 모든 데이터 삭제
localStorage.clear();

// 페이지 새로고침하면 샘플 데이터가 다시 생성됩니다
location.reload();
```

## 브라우저 호환성

### 지원하는 브라우저
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### 필요한 기능
- LocalStorage
- ES6+ JavaScript
- CSS Grid & Flexbox
- Fetch API

## 문제 해결

### 1. 페이지가 제대로 표시되지 않는 경우

**증상**: CSS나 이미지가 로드되지 않음

**해결방법**:
- 모든 파일(HTML, CSS, JS)이 올바른 폴더 구조에 있는지 확인
- 로컬 웹 서버를 사용 (방법 2)
- 브라우저 캐시 삭제 후 새로고침

### 2. JavaScript 오류

**증상**: 기능이 작동하지 않음

**해결방법**:
- 브라우저 개발자 도구(F12)의 콘솔 확인
- 모든 JS 파일이 로드되었는지 확인
- 브라우저가 최신 버전인지 확인

### 3. 데이터가 저장되지 않음

**증상**: 새로고침하면 데이터가 사라짐

**해결방법**:
- 브라우저의 LocalStorage가 활성화되어 있는지 확인
- 시크릿/프라이빗 모드가 아닌지 확인
- 브라우저 저장소 공간 확인

### 4. 이미지 업로드가 안됨

**증상**: 미디어 업로드 실패

**해결방법**:
- 파일 크기 확인 (최대 10MB)
- 지원하는 형식 확인 (JPG, PNG, WebP, GIF, MP4)
- LocalStorage 용량 확인 (약 5-10MB 제한)

## 개발 환경 설정

### VS Code 추천 확장 프로그램
- Live Server
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Path Intellisense

### Chrome 개발자 도구 사용법
```
1. F12 또는 Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)
2. Console 탭: JavaScript 오류 확인
3. Network 탭: 파일 로딩 확인
4. Application 탭: LocalStorage 데이터 확인
```

## 배포하기

### GitHub Pages
```bash
1. GitHub 저장소 생성
2. 프로젝트 업로드
3. Settings → Pages → Source: main branch
4. 몇 분 후 https://username.github.io/thai-exotic-plants 에서 접속
```

### Netlify
```bash
1. netlify.com 가입
2. "New site from Git" 클릭
3. 저장소 선택 또는 드래그 앤 드롭
4. Deploy 클릭
```

### Vercel
```bash
1. vercel.com 가입
2. "New Project" 클릭
3. 저장소 연결 또는 폴더 업로드
4. Deploy 클릭
```

## 다음 단계

1. **데이터 커스터마이징**
   - `js/main.js`의 MockDB 수정
   - 샘플 상품, 샵, 카테고리 변경

2. **디자인 커스터마이징**
   - `css/style.css` 수정
   - Tailwind 클래스 변경

3. **기능 추가**
   - 실제 API 연동
   - 결제 시스템 통합
   - 사용자 인증 구현

## 도움말

문제가 계속되면:
- 프로젝트 README.md 참고
- 브라우저 개발자 도구 콘솔 확인
- GitHub Issues에 문의

---

즐거운 개발 되세요! 🌱
