# Readory Frontend

> Readory (Reading + Memory)  
> 아이폰 단축어로 책의 문장과 감상을 웹에 기록하는 독서 기록 서비스

**기간:** 2025.07.28 ~ 현재 (초기 개발 후 지속적 유지보수 중)  
**개인 프로젝트**

백엔드 레포지토리: [Readory Server(Spring Boot)](https://github.com/dodo5517/readory-server)

---

## 화면 미리보기

**Desktop**

<img src="https://github.com/user-attachments/assets/03403272-2886-44d4-b150-debcb011182d" width="32%"> <img src="https://github.com/user-attachments/assets/25cd8593-7297-4148-81f8-3553dd9986f1" width="32%"> <img src="https://github.com/user-attachments/assets/049eb8a9-7933-4bd8-96aa-80a5b79f595c" width="32%">

**Mobile**

<img src="https://github.com/user-attachments/assets/4c785920-43e6-49fa-975f-60c4fa65c862" width="24%"> <img src="https://github.com/user-attachments/assets/fe029ee5-6c64-4be8-8f3b-cfdff7b23399"  width="24%"> <img  src="https://github.com/user-attachments/assets/ad0206f1-d9bc-4851-8abd-afb101a58be1"  width="24%"> <img src="https://github.com/user-attachments/assets/d789f1e8-df31-4c81-a71e-3988beeec154" width="24%">

---

## 데모

[데모 바로가기](https://readory.kimdohyeon.dev/)  
[아이폰 단축어 파일](https://dodo5517.tistory.com/173)

---

## 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| Language | TypeScript |
| Framework | React 19 (CRA) |
| Routing | React Router DOM v7 |
| 상태 관리 | React Context API |
| 스타일 | CSS Modules |
| 차트 | Recharts |
| 아이콘 | Phosphor Icons |
| 인프라 | Raspberry Pi (Nginx), GitHub Actions |

---

## 프로젝트 구조

```
src/
├── api/          # API 요청 함수
├── components/   # 공통 UI 컴포넌트
│   └── modal/    # 모달 컴포넌트 (일반 + 관리자)
├── contexts/     # 전역 Context (UserContext, ThemeContext)
├── hook/         # 커스텀 훅
├── layouts/      # 레이아웃 (일반, 관리자)
├── pages/        # 라우팅 페이지
├── styles/       # CSS Modules
├── types/        # TypeScript 타입 정의
└── utils/        # 공통 유틸리티
```

---

## 주요 기능

### 독서 기록

- 전체 기록 조회, 검색 (제목/작가/문장/메모)
- 기록 생성, 수정, 삭제 (단일 / 책 전체)
- 책별 기록 페이지 (커서 기반 페이지네이션)
- 책 매칭 확정 / 해제 (BookSelectModal)

### 책장 (My Shelf)

- 매칭 완료된 책 목록, 최근순 / 제목순 정렬
- 책 제목·작가 검색
- 메인 화면 캐러셀로 최근 읽은 책 미리보기

### 캘린더 & 히트맵

- 월간 달력: 날짜별 기록 수 표시, 날짜 클릭 시 해당 일 기록 목록으로 이동
- 연간 히트맵: 월별 책장 시각화 (책 모양 SVG, 월별 컬러 팔레트)
- 월 이동 네비게이션

### 인증

- 이메일 로그인 / 회원가입
- OAuth2 소셜 로그인 (구글, 카카오, 네이버)
- Access Token 만료 시 자동 재발급 (`fetchWithAuth`)
- 데모 계정 보호 (`useDemoGuard`) - 쓰기 기능 차단

### 마이페이지

- 닉네임 / 비밀번호 변경
- 프로필 이미지 업로드 / 삭제
- API Key 확인 및 재발급

### 관리자

- 유저 관리: 목록 조회, 상태·권한 변경, 강제 로그아웃
- 책 관리: 목록 조회, 소프트 삭제 / 복구
- 기록 관리: 특정 유저 기록 조회·수정·삭제
- 로그: API 요청 로그, 인증 이벤트 로그
- 통계: 기록/유저 활동 현황

---

## 인프라 & 배포

main 브랜치에 push하면 GitHub Actions에서 빌드 후 SSH로 Raspberry Pi에 정적 파일을 업로드하고 Nginx를 재로드한다.

```
GitHub push (main)
      ↓
GitHub Actions
  - Node.js 20 설치
  - npm ci
  - npm run build
  - SCP로 빌드 결과물 업로드 (/var/www/readory-app/)
  - sudo systemctl reload nginx
      ↓
Raspberry Pi (Nginx로 정적 파일 서빙)
```

---

## 환경 변수

```env
REACT_APP_API_BASE_URL=
```
