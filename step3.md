# 3단계 – 증빙자료 첨부 (`step3.html`)

> 1단계에서 **국내 사업자(1) 또는 해외 사업자(3)** 선택 시에만 진입.  
> 개인 회원(국내/해외)은 2단계 완료 후 바로 완료 페이지로 이동.

---

## 파일 구조

```
step3.html      본 파일
tokens.css      디자인 토큰 (색상 변수)
typography.css  타이포그래피 유틸 클래스 (.ty-*)
common.css      공통 컴포넌트 스타일
common.js       공통 유틸 함수
```

---

## 페이지 DOM 구조 (위 → 아래)

| DOM 순서 | 섹션 | 표시 조건 |
|----------|------|-----------|
| 1 | `doc-section` 증빙자료 | phase = documents 진입 후 슬라이드 오픈 |
| 2 | 담당자 인적사항 | 항상 |
| 3 | CTA 버튼 (sticky bottom) | phase별 |

---

## 상태 흐름 (Phase)

```
personal ──(담당자 정보 유효)──▶ documents ──(증빙자료 분류 완료)──▶ 완료
```

---

## 타이틀 전환

| Phase | 타이틀 | 서브텍스트 |
|-------|--------|-----------|
| personal | 인적 사항을 입력해 주세요. | 회사 정보 도용 방지 등 안전한 서비스 제공을 위하여\n사업자 증빙자료를 확인하고 있습니다. |
| documents | 증빙자료를 첨부해 주세요. | 회사 정보 도용 방지 등 안전한 서비스 제공을 위하여\n사업자 증빙자료를 확인하고 있습니다. |

---

## 스텝 인디케이터

- 바 1, 2: 100% (완료)
- 바 3: personal = 50%, documents = 100%
- 스텝 바 클릭 비활성

---

## 담당자 인적사항 (phase: personal)

### 담당자 이름
- 포커스 시: `[clear X] [↵ enter]`

### 담당자 생년월일
- inputmode="numeric", 8자리
- 포커스 중: raw 숫자 / blur 후: `YYYY.MM.DD`

### 담당자 이메일
- 이메일 자동완성 드롭다운 (step1과 동일)
- 우측: 세금계산서 용도 안내 버튼 (`infomark_g_16.svg`)
  - 클릭 시 툴팁 팝오버 노출
- 이메일 인증 진입 시: step1 이메일값 자동 입력

### 활성 조건
```
name.trim() !== '' && birthdate.length >= 8 && isEmailValid(email)
```

---

## 증빙자료 섹션 (phase: documents)

### 라벨 구성

| 회원 유형 | 라벨 칩 | 분류 키 | 필수 여부 |
|----------|---------|---------|----------|
**국내 사업자 (member === 1):**

| 라벨 | 분류 키 | 필수 여부 |
|------|---------|----------|
| 사업자등록증 | `reg` | 필수 |
| 담당자 명함 | `card` | 필수 |
| 사업자등록증명원 | `cert` | 선택 (사업 유지 상태 증명, 응찰을 원하는 경우 반드시 필요) |
| 신분증 | — | 미표시 |

**해외 사업자 (member === 3):**

| 라벨 | 분류 키 | 필수 여부 |
|------|---------|----------|
| 사업자 증빙자료 | `business` | 필수 |
| 담당자 명함 | `card` | 필수 |
| 신분증 | `id` | 선택 (가입 신청자 신원 증명, 응찰을 원하는 경우 반드시 필요) |

### 가입완료 CTA 활성 조건
```
국내 사업자: reg && card 분류 완료 (cert는 선택)
해외 사업자: business && card 분류 완료
```
(신분증은 선택 — 미완료 시 스킵 확인 모달 노출, 해외 사업자 전용)

### 업로드 영역 (빈 상태)
- 높이 `10rem`, 배경 `--surface-gray-lighter2` (#F9F9F9)
- SVG 점선 보더 `--border-gray` (#D7D7D7), stroke-width 1
- 클릭: 파일 선택 (`accept="image/*,.pdf"`, multiple)
- 드래그 오버: 보더 오렌지, 배경 `#FCF2EE`, 아이콘·텍스트 `--text-primary`
- 텍스트: 모바일(768px 미만) "파일첨부" / PC "파일을 드래그하거나 첨부해 주세요"

### 파일 카드 목록 (파일 있는 상태)
- 배경 래퍼: `--surface-gray-lighter1` (#F3F3F3), 좌우 여백 없이 풀 너비
- 카드 높이: 모바일 `8.75rem` / 태블릿(768px+) `6.25rem`
- 좌측: 이미지 썸네일 (`object-fit: contain`)
- 우측 상단: 분류 칩 버튼 (아래 상태 참조)
- 우측 하단: 마스킹(`pencil_16.svg`) / 삭제 버튼

**분류 칩 상태:**

| 상태 | 배경 | 텍스트 |
|------|------|--------|
| 선택됨 | `--surface-primary` (#F76E33) | `--text-white` |
| 비활성 (타 파일이 이미 선택) | `--surface-gray-lighter2` + `border: --border-gray-light` | `--text-disabled` |
| 기본 | `--surface-gray-light` (#EAEAEA) | `--text-gray-darker` |
| 기본 hover | `--surface-gray` (#D7D7D7) | `--text-gray-darker` |

### 초기화 + 파일첨부 버튼

**초기화 버튼:**
- 기본: `border: 1px solid --border-gray-dark2`
- hover: `border: 1px solid --border-gray-dark`
- 아이콘: `refresh_20.svg`
- 동작: 모든 파일 라벨 null 초기화 (파일 삭제 아님)

**파일첨부 버튼:**
- 기본: SVG 점선 보더 stroke `--border-gray-dark2` (#C1C1C1), stroke-width 1.5
- hover: stroke `--border-gray-dark` (#868686)
- 아이콘: `add_20.svg`

### 분류 현황 칩

| 상태 | 보더 | 텍스트 |
|------|------|--------|
| 분류 완료 | `rgba(49,164,39,0.30)` | `--text-success` + 체크 SVG |
| 미분류 | `--border-gray` | `--text-gray-darker` |

- 신분증(선택): 라벨 뒤 `(선택)` 텍스트 (`--text-secondary`)

---

## 모달 / 팝오버

### 증빙자료 가이드 모달
- 증빙자료 단계 첫 진입 시 자동 노출 (1회)
- 라벨 옆 `infomark_g_16.svg` 클릭 시 재오픈
- 안내 4단계: 사업자등록증 → 사업자등록증명원 → 담당자 명함 → 신분증(마스킹 필수) 준비 → 파일 첨부 → 라벨링

### 신분증 스킵 확인 모달 (해외 사업자 전용)
- 신분증 미분류 상태에서 가입 완료 클릭 시 노출
- 버튼: 취소 / 가입 완료

### 세금계산서 툴팁
- 담당자 이메일 필드 옆 버튼 클릭 시 노출
- `position: fixed`, 이메일 필드 위쪽 정렬
- 뷰포트 너비 400px 이하: 양쪽 여백 1.25rem 동적 너비
- 너비 400px 초과: 최대 400px 고정
- 바깥 클릭 시 닫힘

---

## Enter 키 네비게이션

```
contactName → contactBirth → contactEmail → goToDocuments()
```

---

## 색상 토큰 (→ `tokens.css` 참조)

| 용도 | 토큰 |
|------|------|
| 기본 텍스트 | `--text-default` (#252525) |
| 브랜드 오렌지 | `--status-primary` (#F76E33) |
| 에러 | `--text-error` (#E51B27) |
| 성공 | `--text-success` (#31A427) |
| 기본 보더 | `--border-gray` (#D7D7D7) |
| 버튼 hover 보더 | `--border-gray-dark` (#868686) |
