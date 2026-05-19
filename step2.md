# 2단계 – 계정 정보 (`step2.html`)

> **WIP** — 회원유형별 추가 정보 입력 섹션은 추후 전달 예정

---

## 페이지 구성

섹션이 위에서 아래로 쌓이는 구조. 새 그룹은 이전 그룹 위에 슬라이드 오픈.

| 순서 | 섹션 | 노출 조건 |
|------|------|-----------|
| 1 | 헤더 (sticky) | 항상 |
| 2 | 스텝 인디케이터 | 항상 |
| 3 | 타이틀 | 항상 (phase별 전환) |
| 4 | **주소 그룹** | phase === 'address' 시 슬라이드 오픈 |
| 5 | **인적 사항 그룹** | phase >= 'personal' 시 슬라이드 오픈 |
| 6 | **계정 정보 그룹** | 항상 |
| 7 | CTA 버튼 (sticky bottom) | phase별 |

---

## 상태 흐름 (Phase)

```
account ──(유효성 통과)──▶ personal ──(유효성 통과)──▶ address ──▶ 완료
```

각 phase에서 CTA 버튼 탭 → 현재 그룹 유효성 검증 → 통과 시 다음 그룹 오픈

---

## 타이틀 전환 규칙

| Phase | 타이틀 |
|-------|--------|
| account | 계정 정보를 입력해 주세요. |
| personal | 인적 사항을 입력해 주세요. |
| address | 경매 응찰을 원하신다면\n주소 정보를 입력해 주세요. |

전환: fadeOut(300ms) → 교체 → fadeIn(400ms), `white-space: pre-line`

---

## 스텝 인디케이터

- 바 1: 100% (완료)
- 바 2: account=33%, personal=66%, address=100%

---

## 섹션 오픈 애니메이션

새 그룹 노출: `grid-template-rows: 0fr → 1fr` 0.38s ease-in-out  
내부 콘텐츠: `animation: fadeIn 0.32s ease-out 0.35s both`

---

## CTA 버튼 (Sticky Bottom)

```
position: sticky;  bottom: 0;
```
- phase===account: `다음` (btn-account)
- phase===personal: `다음` (btn-personal)
- phase===address: `가입 완료` (btn-addr)
- 비활성: `background:#C1C1C1`, 활성: `background:#252525`, hover: `#4E4E4E`
- **Enter 아이콘 없음**

---

## 계정 정보 그룹 (phase: account)

### 아이디
- 유효성: 영문+숫자 조합, 5~12자
  - Regex: `/^[a-zA-Z0-9]{5,12}$/`
- 힌트 텍스트 색상: 미입력 `#868686` / 형식 오류 `#E51B27` / 통과 `#31A427`
- 체크 아이콘 stroke 색도 동일

### 비밀번호
- 유효성: 숫자 2자리 이상
- 힌트 텍스트 색상: 동일 패턴
- 우측 아이콘 순서: `[clear X] [↵ enter] [눈 아이콘]`
- show/hide 토글: input type password ↔ text

### 비밀번호 확인
- 입력값 === 비밀번호 → `"비밀번호가 일치합니다."` (`#31A427`)
- 불일치 → `"비밀번호가 일치하지 않습니다."` (`#E51B27`)
- 우측 아이콘 순서: `[clear X] [↵ enter] [눈 아이콘]`

### 휴대폰 번호
- 통신사/휴대폰 인증 완료 시: `disabled` 스타일 + 초록 체크 아이콘 노출
- 직접 입력 시: 숫자만, 010 시작 11자리

### 이메일 (이메일 인증 사용자)
- 이메일 인증으로 온 경우: disabled 스타일 + 초록 체크 아이콘, 편집 불가

### 계정 그룹 활성 조건
```
isIdValid(id) && isPwValid(pw) && pw === confirmPw && isPhoneValid(phone)
```

---

## 인적 사항 그룹 (phase: personal)

### 이름
- 숫자, 특수문자 입력 차단 (정규식 필터링)
- 포커스 시: `[clear X] [↵ enter]`

### 생년월일
- inputmode="numeric", 8자리
- 포커스 중: raw 숫자 표시
- blur 후: YYYY.MM.DD 포맷

### 이메일
- 이메일 인증 사용자는 이 필드 **숨김** (계정 그룹에 disabled로 표시)
- 이메일 자동완성 드롭다운 동일 (step1과 동일 구조)
- blur 시 형식 검증 → 에러 노출

### 인적 사항 그룹 활성 조건
```
name.trim() !== '' && birthdate.length >= 8 && isEmailValid(email)
```

---

## 주소 그룹 (phase: address)

- 우편번호 / 도로명 주소: 클릭 시 다음 Postcode API 오픈
  - API: Daum Postcode (`t1.daumcdn.net/mapjsapi/...`)
- 상세 주소: 도로명 주소 입력 완료 후 활성화 (readOnly 해제)
- 포커스 시: `[↵ enter]` 아이콘

### 주소 개인정보 동의 바텀시트
- 주소 검색 최초 시도 시 노출
- 동의: API 오픈, 동의 상태 저장 (이후 재시도 시 바텀시트 없이 바로 오픈)
- 비동의: 주소 입력 건너뜀

### 주소 미입력 가입 Skip
- `가입 완료` 버튼 탭 시 주소 없음 → 바텀시트 노출
  - "가입 완료하기" → 완료
  - "주소 입력하기" → 바텀시트 닫고 주소 검색 오픈
- 바텀시트 한 번 노출 후 두 번째 탭 → 바로 완료 (skipShown)

---

## Enter 키 네비게이션

현재 phase의 필드 순서로 이동:
```
account:  id → password → confirmPw → phone
personal: name → birthdate → email
address:  detail
```
- 다음 필드 비어있음 → 해당 필드 포커스
- 다음 필드 값 있음(재입력) → 그룹 내 첫 번째 빈 필드로
- 마지막 필드 → handleNext() 호출

---

## 필드 내 아이콘 규칙

| 필드 | 아이콘 순서 |
|------|------------|
| 일반 텍스트 필드 | `[clear X] [↵ enter]` |
| 비밀번호 필드 | `[clear X] [↵ enter] [눈]` |
| 인증 완료 필드 | `[초록 체크]` |

- clear: 포커스 + 값 있을 때만
- enter icon: 포커스 중 항상 (20×20 컨테이너, 16×16 SVG)

---

## 에러 처리

CTA 탭 시 통합 유효성 검증 → 첫 번째 오류 필드로 스크롤 + alert → 포커스

---

## 바텀시트 공통 스펙

- 모바일: 하단에서 슬라이드업, `border-radius: 20px 20px 0 0`
- 태블릿(768px+): 중앙 모달, `border-radius: 8px`
- 닫기(X) 버튼: 우상단 24×24
- 버튼 영역: 취소(bg `#EAEAEA`) / 확인(bg `#252525`) 1:1

---

## 토스트

- 하단 32px 고정
- 진입 애니메이션: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
- 퇴장 애니메이션: slideDown 0.3s ease-in
- 노출 시간: 2.7초 후 퇴장 시작

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
