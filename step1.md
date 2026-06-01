# 1단계 – 본인 인증 (`step1.html`)

---

## 파일 구조

```
step1.html      본 파일
tokens.css      디자인 토큰 (색상 변수)
typography.css  타이포그래피 유틸 클래스 (.ty-*)
common.css      공통 컴포넌트 스타일
common.js       공통 유틸 함수 (이메일 검증, 생년월일 포맷 등)
```

---

## 페이지 구성

| 순서 | 섹션 | 노출 조건 |
|------|------|-----------|
| 1 | 헤더 (sticky) | 항상 |
| 2 | 스텝 인디케이터 | 항상 (클릭 비활성) |
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
                        ▼             ▼             ▼
                     phone          email        telecom
                        │             │              │
                   번호입력        이메일입력     PASS 팝업 오픈
                        │             │          (pass-auth.html)
                    OTP 발송       OTP 발송
                        │             │
                     OTP 입력      OTP 입력
                        │             │
                     2단계 이동    2단계 이동
```

---

## 회원 유형

- 2컬럼 그리드, 옵션 4개: 국내 개인(0) / 국내 사업자(1) / 해외 개인(2) / 해외 사업자(3)
- 선택 시: `border: 1px solid var(--border-selected)`
- 라디오 selected: `border: 6.5px solid var(--status-primary)`
- 클릭 시 전환 애니메이션 없음

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
- 국내 사업자/해외 사업자: 바 3 추가 표시
- 스텝 바 클릭 비활성 (인터랙션 없음)
- fill 트랜지션: `transform: scaleX()` 0.5s cubic-bezier(0.4, 0, 0.2, 1)

---

## 본인 인증 섹션 오픈 애니메이션

`grid-template-rows: 0fr → 1fr` 트랜지션 0.38s ease-in-out
내부 콘텐츠: `animation: slideUp 0.4s ease-out 0.3s both`

---

## 약관 동의

### 필수 약관 4개
- `[필수]` 텍스트 색상: `var(--text-primary)`
- 체크박스 checked: `background: var(--status-primary)`, `border-color: var(--status-primary)`

### 선택 약관
- 광고성 정보 수신 동의 채널 (SMS / 이메일 / 전화)
- 전체 동의: 필수 4개 + 선택 3채널 모두 체크 시 checked

---

## 본인 인증 – 공통

### 인증 카드
- 3개: 통신사 인증(권장 뱃지) / 휴대폰 인증 / 이메일 인증
- 모바일: flex-column 1열 / 태블릿(768px+): 3컬럼 그리드, h=108px
- 권장 뱃지: 우상단, `background: var(--surface-default)`, `border-radius: 0 0 0 4px`

---

## 본인 인증 – 휴대폰 인증

### 번호 입력
- 숫자만 입력, 하이픈 제외 11자리
- 포커스 시: `[clear X] [enter↵]` 아이콘 노출
- OTP 발송 후: disabled 스타일, 재입력 버튼으로 교체

### OTP 입력 필드 (발송 후 노출)
- inputmode="numeric", 6자리
- 우측: 타이머(03:00 카운트다운, 오렌지색) + 재발송 버튼
- 타이머 종료 시 숨김

---

## 본인 인증 – 이메일 인증

### 이메일 자동완성 드롭다운
도메인: `@naver.com`, `@daum.com`, `@gmail.com`, `@outlook.com`, `@hotmail.com`, `@icloud.com`
- `@` 입력 후 일치 도메인 드롭다운 노출
- 방향키 Up/Down 선택, Enter 확정, Escape 닫기
- blur 시 150ms 후 닫힘
- `position: fixed`로 overflow 탈출

---

## 본인 인증 – 통신사 인증 (PASS)

`window.open('pass-auth.html', 'pass-auth', 'width=390,height=653,...')`
팝업에서 postMessage `'pass-complete'` 수신 → 2단계 이동

---

## localStorage 저장값 (2단계 진입 시)

| 키 | 값 | 설명 |
|----|----|------|
| `signup_member` | `"0"~"3"` | 선택한 회원 유형 |
| `signup_auth_method` | `"phone"` \| `"email"` \| `"pass"` | 인증 수단 |
| `signup_phone` | 휴대폰 번호 | 인증 완료된 번호 |
| `signup_email` | 이메일 주소 | 이메일 인증 시 |
| `signup_auth_toast` | `"phone"` \| `"email"` | 2단계 진입 토스트용 |

---

## 회원별 준비 사항 모달

- 트리거: 하단 "회원별 준비 사항" 버튼 클릭
- 모바일: 바텀시트 / 태블릿(768px+): 중앙 모달
- 탭 4개: 국내 개인 / 국내 사업자 / 해외 개인 / 해외 사업자
- 탭 전환 시 높이 고정 (가장 긴 탭 기준)

### 탭별 항목

| 탭 | 항목 | 필수 여부 |
|----|------|----------|
| 국내 개인 | 통신사 인증 | 선택 |
| 국내 개인 | 주소 | 선택 |
| 국내 사업자 | 사업자등록증 | 필수 |
| 국내 사업자 | 담당자 명함 | 필수 |
| 국내 사업자 | 사업자등록증명원 | 선택 |
| 국내 사업자 | 통신사 인증 | 선택 |
| 국내 사업자 | 사업장 주소 | 선택 |
| 해외 개인 | 신분증 | 필수 |
| 해외 개인 | 주소 | 선택 |
| 해외 사업자 | 사업자등록증 | 필수 |
| 해외 사업자 | 사업자등록증명원 | 필수 ⚠️ **확인 필요: 필수/선택 여부 기획 확인 요망** |
| 해외 사업자 | 담당자 명함 | 필수 |
| 해외 사업자 | 신분증 | 선택 |
| 해외 사업자 | 사업장 주소 | 선택 |

---

## 색상 토큰 (→ `tokens.css` 참조)

| 용도 | 토큰 |
|------|------|
| 기본 텍스트/배경 | `--text-default`, `--surface-default` |
| 브랜드 오렌지 | `--status-primary` (#F76E33) |
| 에러 | `--text-error` (#E51B27) |
| 성공 | `--text-success` (#31A427) |
| 기본 보더 | `--border-gray` (#D7D7D7) |
| 호버 보더 | `--border-gray-dark1` (#A3A3A3) |
