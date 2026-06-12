# 2단계 – 계정 정보 입력 (`step2.html`)

---

## 파일 구조

```
step2.html      본 파일
tokens.css      디자인 토큰 (색상 변수)
typography.css  타이포그래피 유틸 클래스 (.ty-*)
common.css      공통 컴포넌트 스타일
common.js       공통 유틸 함수
```

---

## 회원 유형별 진입 경로

| 회원 유형 | localStorage `signup_member` | 2단계 흐름 |
|----------|-------------------------------|-----------|
| 국내 개인 | `"0"` | account → personal → address → 완료 |
| 국내 사업자 | `"1"` | account → bizInfo → bizAddr → 3단계 |
| 해외 개인 | `"2"` | account → personal → **idUpload** → address → 완료 |
| 해외 사업자 | `"3"` | account → bizInfo → bizAddr → 3단계 |

---

## 페이지 DOM 구조 (위 → 아래)

섹션은 DOM 위쪽에 배치될수록 스크롤 상단에 표시됨.
새 섹션은 이전 섹션 위에 슬라이드 오픈 (`grid-template-rows: 0fr → 1fr`).

| DOM 순서 | 섹션 ID | 표시 조건 |
|----------|---------|-----------|
| 1 | `addr-section` | phase = address |
| 2 | `biz-addr-section` | phase = bizAddr (사업자) |
| 3 | `id-upload-section` | phase = idUpload (해외 개인만) |
| 4 | `personal-section` | phase = personal |
| 5 | `biz-info-section` | phase = bizInfo (사업자) |
| 6 | `account-section` | 항상 (최초 노출) |

---

## 스텝 인디케이터

- 바 1: 100% (완료)
- 바 2 (개인): account=33%, personal=66%, address=100%
- 바 2 (해외 개인): account=25%, personal=50%, idUpload=75%, address=100%
- 바 2 (사업자): account=33%, bizInfo=66%, bizAddr=100%
- 바 3: 사업자 회원만 표시
- 스텝 바 클릭 비활성

---

## 타이틀 전환

| Phase | 타이틀 |
|-------|--------|
| account | 계정 정보를 입력해 주세요. |
| personal | 인적 사항을 입력해 주세요. |
| idUpload | 경매 응찰을 원하신다면\n신분증을 첨부해 주세요. |
| address | 경매 응찰을 원하신다면\n주소 정보를 입력해 주세요. |
| bizInfo | 사업자 정보를 입력해 주세요. |
| bizAddr | 사업장 주소를 입력해 주세요. |

---

## 계정 정보 그룹 (phase: account)

### 아이디
- 유효성: 영문+숫자 조합, 5~12자 `/^[a-zA-Z0-9]{5,12}$/`
- 힌트: 미입력 `--text-secondary` / 오류 `--text-error` / 통과 `--text-success`

### 비밀번호
- 유효성: 숫자 2자리 이상
- 우측 아이콘: `[clear X] [↵ enter] [눈 아이콘]`
- show/hide 토글: input type password ↔ text

### 비밀번호 확인
- 일치: `"비밀번호가 일치합니다."` (`--text-success`)
- 불일치: `"비밀번호가 일치하지 않습니다."` (`--text-error`)

### 휴대폰 번호
- 통신사/휴대폰 인증 완료 시: disabled 스타일 + 초록 체크 아이콘
- 직접 입력: 숫자만, 010 시작 11자리

### 이메일 (이메일 인증 사용자)
- 이메일 인증 진입 시: disabled 스타일, 편집 불가
- personal 단계에서 휴대폰 번호 아래 별도 표시 (`field-email-authed`)

### 활성 조건
```
isIdValid(id) && isPwValid(pw) && pw === confirmPw && isPhoneValid(phone)
```

---

## 인적 사항 그룹 (phase: personal)

> 이메일 인증 사용자: 이름/생년월일이 아이디 위(DOM 위쪽)에 표시됨

### 이름
- 숫자·특수문자 입력 차단
- 포커스 시: `[clear X] [↵ enter]`

### 생년월일
- inputmode="numeric", 8자리
- 포커스 중: raw 숫자 / blur 후: YYYY.MM.DD 포맷

### 이메일
- 이메일 인증 사용자: 이 필드 숨김 (계정 그룹에서 처리)
- 이메일 자동완성 드롭다운 (step1과 동일)

### 활성 조건
```
name.trim() !== '' && birthdate.length >= 8 && isEmailValid(email)
```

---

## 신분증 첨부 그룹 (phase: idUpload) — 해외 개인 전용

### 업로드 영역
- 높이 `10rem`, 배경 `--surface-gray-lighter2` (#F9F9F9)
- SVG 점선 보더 `--border-gray` (#D7D7D7)
- 클릭: 파일 선택 (`accept="image/*,.pdf"`, 단일 파일)
- 드래그 오버: 보더 오렌지, 배경 `#FCF2EE`, 아이콘·텍스트 `--text-primary`
- 텍스트: 모바일 "파일첨부" / PC(768px+) "파일을 드래그하거나 첨부해 주세요"

### 파일 카드 (업로드 후)
- 그레이 배경 래퍼 (`--surface-gray-lighter1` #F3F3F3)
- 썸네일 + ✓ 신분증 칩 (오렌지) + 마스킹(pencil 아이콘) / 삭제 버튼

### 증빙자료 첨부 안내 모달
- 라벨 옆 `infomark_g_16.svg` 클릭 시 바텀시트 오픈
- 2단계 안내: 신분증 준비 (가입 신청자 신원 증명, 응찰을 원하는 경우 반드시 필요) → 파일 첨부

### 활성 조건
- 선택 항목 — 파일 없어도 다음 진행 가능

---

## 주소 그룹 (phase: address)

### 국내 회원
- 우편번호 / 도로명 주소 / 상세주소 필드 클릭 → 주소 개인정보 동의 바텀시트 → Daum Postcode API
- 상세 주소: 도로명 주소 입력 후 활성화

### 해외 개인 회원
- 국가 선택 셀렉트박스 (우편번호 위) 추가
- 주소 직접 입력 (Daum API 미사용)
- 미선택 시 셀렉트 색상 `--text-secondary`

### 주소 개인정보 동의 바텀시트
- 최초 1회 노출, 동의 후 재요청 시 바로 API 오픈
- 우편번호, 도로명, 상세주소 필드 모두 클릭 시 트리거

---

## 사업자 정보 그룹 (phase: bizInfo) — 사업자 전용

- 사업자등록번호: 입력 중 raw 숫자, blur 시 `000-00-00000` 포맷
- 대표전화: 입력 중 raw 숫자, blur 시 `000-0000-0000` 포맷
- 국내 사업자: 국가 필드 숨김
- 해외 사업자: 국가 선택 셀렉트 노출 (이모지 국기 포함)

---

## 사업장 주소 그룹 (phase: bizAddr) — 사업자 전용

- 국내: Daum Postcode API
- 해외: 국가 선택 + 직접 입력

---

## Enter 키 네비게이션

```
account:  id → password → confirmPw → phone
personal: name → birthdate → email
address:  detail
bizInfo:  bizRegNum → companyName → ceo → ceoPhone → bizType → bizCategory
```

---

## 바텀시트 공통 스펙

- 모바일: 하단 슬라이드업, `border-radius: 1.25rem 1.25rem 0 0`
- 태블릿(768px+): 중앙 모달, `border-radius: 0.5rem`
- 오버레이 클릭 시 닫힘
- 버튼: 취소(`--surface-gray-light`) / 확인(`--surface-default`) 1:1

---

## 토스트

- 하단 32px 고정, slideUp 0.35s
- 노출 시간: 2.7초

---

## 색상 토큰 (→ `tokens.css` 참조)

| 용도 | 토큰 |
|------|------|
| 기본 텍스트 | `--text-default` (#252525) |
| 보조 텍스트 / 미선택 셀렉트 | `--text-secondary` (#868686) |
| 브랜드 오렌지 | `--status-primary` (#F76E33) |
| 에러 | `--text-error` (#E51B27) |
| 성공 | `--text-success` (#31A427) |
| 기본 보더 | `--border-gray` (#D7D7D7) |
| 호버 보더 | `--border-gray-dark1` (#A3A3A3) |
| disabled 배경 | `--surface-gray-lighter2` (#F9F9F9) |
