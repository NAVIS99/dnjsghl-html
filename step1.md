# 1단계 – 본인 인증 (`step1.html`)

> **WIP** — 회원유형별 추가 정보 입력 섹션은 추후 전달 예정

---

## 페이지 구성

| 순서 | 섹션 | 노출 조건 |
|------|------|-----------|
| 1 | 헤더 (sticky) | 항상 |
| 2 | 스텝 인디케이터 | 항상 |
| 3 | 타이틀 영역 | 항상 (텍스트 phase별 전환) |
| 4 | **본인 인증 섹션** | 회원유형 선택 + 필수약관 4개 동의 완료 시 슬라이드 오픈 |
| 5 | **회원 유형 + 약관 섹션** | 항상 (하단 고정) |
| 6 | 로고 + 푸터 | 항상 |

---

## 상태 흐름 (Phase)

```
termsAndMember ──(회원유형 선택 + 필수약관 4개 동의)──▶ authMethod
                                                            │
                          ┌─────────────┬──────────────────┘
                          ▼             ▼
                       phone          email          telecom
                          │             │                │
                     번호입력        이메일입력       PASS 팝업 오픈
                          │             │            (pass-auth.html)
                      OTP 발송       OTP 발송
                          │             │
                       OTP 입력      OTP 입력
                          │             │
                       2단계 이동    2단계 이동
```

---

## 타이틀 전환 규칙

| Phase / Auth 상태 | 타이틀 | 서브텍스트 |
|-------------------|--------|-----------|
| termsAndMember | 회원 유형을 선택해 주세요. | — |
| authMethod (선택 전) | 인증 수단을 선택해 주세요. | 경매 응찰을 원하신다면 통신사 인증을 권장합니다. |
| phone – 번호 입력 | 휴대폰 번호를 입력해 주세요. | — |
| phone – OTP 입력 | 인증번호를 입력해 주세요. | — |
| email – 이메일 입력 | 이메일을 입력해 주세요. | — |
| email – OTP 입력 | 인증번호를 입력해 주세요. | — |

전환 시 fadeOut(300ms) → 텍스트 교체 → fadeIn(400ms)

---

## 스텝 인디케이터

- 바 1: `termsAndMember` = 50%, `authMethod` = 100%
- 바 2: 항상 0% (2단계 진입 전)
- fill 트랜지션: `transform: scaleX()` 0.5s cubic-bezier(0.4, 0, 0.2, 1)

---

## 본인 인증 섹션 오픈 애니메이션

`grid-template-rows: 0fr → 1fr` 트랜지션 0.38s ease-in-out  
내부 콘텐츠: `animation: slideUp 0.4s ease-out 0.3s both` (fadeIn만, 0.35s delay)

---

## 회원 유형

- 2컬럼 그리드, 옵션 4개: 국내 개인 / 국내 사업자 / 해외 개인 / 해외 사업자
- 선택 시: `border: 1px solid #252525`
- 라디오 selected: `border: 6.5px solid #F76E33`

---

## 약관 동의

### 필수 약관 4개
- `[필수]` 텍스트 색상: `#F76E33`
- 체크박스 checked: `background: #F76E33`, `border-color: #F76E33`

### 선택 약관
- 광고성 정보 수신 동의 채널 (SMS / 이메일 / 전화)
- 전체 동의 헤더: 필수 4개 + 선택 3채널 모두 체크 시 checked

### 전체 동의 조건
필수약관 4개 모두 + 선택(옵션) 동의 → 모두 체크되어야 `전체 동의` 체크

---

## 본인 인증 – 공통

### 인증 카드
- 3개: 통신사 인증(권장 뱃지) / 휴대폰 인증 / 이메일 인증
- 모바일: flex-column 1열 / 태블릿(768px+): 3컬럼 그리드, h=108px
- 권장 뱃지: 우상단, `background: #252525`, `border-radius: 0 0 0 4px`

### 인증 섹션 라벨
| Auth | 라벨 |
|------|------|
| 미선택 | 본인 인증 |
| phone | 휴대폰 인증 |
| email | 이메일 인증 |

라벨 전환: opacity 0→1 (0.2s ease)

---

## 본인 인증 – 휴대폰 인증

### 번호 입력 필드
- 숫자만 입력, 하이픈 제외 11자리
- 포커스 시: `[clear X] [enter↵]` 아이콘 노출
  - clear: 값 있을 때만
  - enter: 포커스 중 항상
- OTP 발송 후: disabled 스타일(bg `#F9F9F9`), 재입력 버튼으로 교체

### OTP 발송 버튼
- 비활성: `background: #C1C1C1`, `border: 1px solid #C1C1C1`
- 활성(번호 1자 이상): `background: #252525`
- Enter 키 → 발송 트리거

### OTP 입력 필드 (발송 후 노출)
- inputmode="numeric", 6자리
- 우측: 타이머(03:00 카운트다운, 오렌지색) + 재발송 버튼
- 타이머 종료 시 숨김

### 확인 버튼
- 비활성: `background: #C1C1C1`
- 활성(1자 이상): `background: #252525`
- 6자 미만 입력 시 확인 → 에러 메시지

### 에러 메시지
- 번호 형식 오류: `"010으로 시작하는 11자리를 입력해 주세요."`
- OTP 오류: `"인증번호 6자리를 입력해 주세요."`
- 색상: `#E51B27`, 폰트: 13px

### 토스트
- OTP 발송/재발송: `"인증번호를 발송했습니다."`
- 2.7초 후 사라짐

---

## 본인 인증 – 이메일 인증

휴대폰 인증과 동일 구조, 아래 사항 추가:

### 이메일 자동완성 드롭다운
도메인 목록: `@naver.com`, `@daum.com`, `@gmail.com`, `@outlook.com`, `@hotmail.com`, `@icloud.com`
- `@` 입력 후 일치 도메인 드롭다운 노출
- 방향키 Up/Down으로 선택, Enter로 확정, Escape로 닫기
- blur 시 150ms 후 닫힘
- `position: fixed`로 overflow 탈출 처리

### 이메일 발송 버튼 활성 조건
이메일 1자 이상 입력

### 에러
- 형식 오류: `"올바른 이메일 형식을 입력해 주세요."`

### 토스트
- OTP 발송: `"인증 메일을 발송했습니다."`

---

## 본인 인증 – 통신사 인증 (PASS)

`window.open('pass-auth.html', 'pass-auth', 'width=390,height=653,left=200,top=50,...')`  
팝업에서 postMessage `'pass-complete'` 수신 시 → 2단계 이동

---

## 인터랙션 상세

### 필드 내 아이콘 배치 (포커스 시)
```
[input ] [X clear] [↵ enter]
```
- clear: 값 있을 때만 노출
- enter icon: 포커스 중 항상 노출
- enter icon 크기: 외부 20×20px, 내부 SVG 16×16px

### 버튼 아이콘
- **없음** (삭제됨)

### 하단 "다른 인증 수단 선택" 링크
- underline, `text-underline-offset: 5px`, 색상 `#868686`
- 클릭 시: auth state 초기화 → 인증 카드 선택 화면으로

---

## 푸터 저작권 연도

```js
// 매년 자동 갱신 — 하드코딩 금지
document.querySelectorAll('.copy-year').forEach(el => el.textContent = new Date().getFullYear())
```

출력 예: `© 2026 K Auction. All Rights Reserved.` → 내년 자동으로 `© 2027 ...`

---

## 색상 토큰

| 토큰 | 값 |
|------|----|
| main | #252525 |
| orange | #F76E33 |
| gray1 | #868686 |
| gray2 | #D7D7D7 |
| gray4 | #EAEAEA |
| gray6 | #F9F9F9 |
| error | #E51B27 |
| success | #31A427 |
| border | #D7D7D7 |
| border-dark | #A3A3A3 |
