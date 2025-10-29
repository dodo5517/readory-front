# Readory Frontend  
> 아이폰 단축어로 독서 기록을 남기고, 웹에서 모아보는 **“나만의 독서 일기장”**

 **관련 저장소**
- [Readory Server (Spring Boot)](https://github.com/dodo5517/readory-server)

---

## 화면 미리보기

<table>
  <tr>
    <td><img width="500" src="https://github.com/user-attachments/assets/cbd58e11-bf4d-4a2c-9d74-d1875b7771c7" /></td>
    <td><img width="500" src="https://github.com/user-attachments/assets/05dc03e0-7bb1-4f70-8c75-7e4dbe4bc9b0" /></td>
  </tr>
</table>

---

## 아이폰 단축어 파일

[Readory 단축어](https://dodo5517.tistory.com/173)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **독서 기록 등록** | 아이폰 단축어를 통해 책의 문장과 코멘트를 서버로 전송 |
| **기록 리스트 보기** | 등록된 독서 기록들을 날짜/책별로 정렬하여 조회 |
| **검색 및 필터링** | 책 제목, 코멘트, 날짜 기반으로 빠르게 검색 |
| **기록 수정/삭제** | 등록된 메모를 자유롭게 편집 및 삭제 가능 |
| **서버 연동 API** | Spring Boot 백엔드와 REST API 통신 |
| **반응형 디자인** | 데스크톱 / 모바일 모두 쾌적한 UI 제공 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Framework** | React (CRA) |
| **Routing** | React Router DOM v7 |
| **State / Context** | React Context API + Hooks |
| **Styling** | CSS Modules (`.module.css`) |
| **Testing** | React Testing Library + Jest |
| **Build Tool** | `react-scripts` |
| **API 통신** | `fetch` 기반 커스텀 서비스 구조 |

---

## 폴더 구조

```
src/
├── api/          # API 요청 정의 (엔드포인트, fetchJson 등)
├── components/   # UI 단위 컴포넌트 (Card, Button, Modal 등)
├── contexts/     # 전역 Context (예: UserContext, ThemeContext)
├── pages/        # 라우팅되는 주요 페이지 (Home, RecordList, RecordDetail 등)
├── services/     # 비즈니스 로직 (api 호출 래핑, 데이터 가공)
├── styles/       # CSS Modules (.module.css)
├── types/        # TypeScript 인터페이스/타입 정의
├── utils/        # 공통 유틸 함수 (포맷터, 날짜 처리 등)
└── index.tsx     # 진입점
```

---
