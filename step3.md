# 3단계 – 사업자 추가 정보 (국내 사업자 / 해외 사업자 전용)

> 1단계에서 국내 사업자 또는 해외 사업자 선택 시에만 진입. 개인 회원은 2단계 완료 후 바로 완료 페이지로 이동.

---

## 페이지 구성

섹션이 위에서 아래로 쌓이는 구조. 증빙자료 섹션은 인적사항 완료 후 위쪽에 슬라이드 오픈.

| 순서 | 섹션 | 노출 조건 |
|------|------|-----------|
| 1 | 헤더 (sticky) | 항상 |
| 2 | 스텝 인디케이터 | 항상 |
| 3 | 타이틀 | 항상 (phase별 전환) |
| 4 | **증빙자료 섹션** | phase === 'documents' 진입 후 슬라이드 오픈 |
| 5 | **담당자 인적사항 섹션** | 항상 (첫 진입 시 section-new 애니메이션) |
| 6 | CTA 버튼 (sticky bottom) | phase별 |

---

## 상태 흐름 (Phase)

```
personal ──(담당자 정보 유효성 통과)──▶ documents ──(사업자증빙 + 명함 분류 완료)──▶ 완료
```

---

## 타이틀 전환 규칙

| Phase | 타이틀 | 서브텍스트 |
|-------|--------|-----------|
| personal | 담당자 정보를 입력해 주세요. | — |
| documents | 증빙자료를 업로드해 주세요. | 사업체 소속 확인을 위한 용도입니다. |

전환: fadeOut(300ms) → 교체 → fadeIn(400ms)

---

## 스텝 인디케이터

- 바 1, 2: 100% (완료)
- 바 3: personal = 50%, documents = 100%

---

## 섹션 오픈 애니메이션

증빙자료 섹션 노출: `grid-template-rows: 0fr → 1fr` 0.38s ease-in-out  
내부 콘텐츠: `animation: fadeIn 0.32s ease-out 0.35s both`

---

## 담당자 인적사항 섹션 (phase: personal)

### 담당자 이름
- 포커스 시: `[clear X] [↵ enter]`
- Enter → 생년월일 필드 포커스

### 담당자 생년월일
- `inputMode="numeric"`, 8자리
- 포커스 중: raw 숫자 / blur 후: `YYYY.MM.DD` 포맷
- Enter → 이메일 필드 포커스

### 담당자 이메일
- 이메일 자동완성 드롭다운: step1, step2와 동일 구조
- 우측에 **세금계산서 용도 안내** 버튼 (infomark 아이콘)
  - 클릭 시 툴팁 팝오버 노출 (아래 TaxTooltip 섹션 참조)
- Enter → `goToDocuments()` 호출

### 인적사항 CTA 활성 조건
```
이름.trim() !== '' && 생년월일.length >= 8 && isEmailValid(이메일)
```

---

## 증빙자료 섹션 (phase: documents)

### 빈 상태 — 업로드 영역

- 높이 `10rem`, 배경 `#F9F9F9`, SVG 점선 보더 `#D7D7D7` `stroke-width: 1`, `stroke-dasharray: 6, 4`
- 클릭 시 파일 선택 (`accept="image/*,.pdf"`, multiple)
- 드래그 오버 시:
  - 배경 `#FCF2EE`
  - 보더 SVG stroke `#F76E33` (DASH_BORDER_ORANGE)
  - 아이콘 오렌지 필터
  - 텍스트 `#F76E33`

### 파일 있는 상태 — 파일 카드 목록

배경 영역: `background: #F3F3F3`, 좌우 여백 없이 풀 너비 (`margin: 0 -1.25rem`)

**파일 카드 구조:**
- 모바일 높이 `8.75rem` / 태블릿(768px+) `6.25rem`
- 좌측: 이미지 썸네일 (`140×전체높이`, `object-fit: contain`)
- 우측: 라벨 버튼 + 하단 액션(삭제, 마스킹)

**라벨 버튼 (분류 칩):**

| 상태 | 배경 | 텍스트 |
|------|------|--------|
| 선택됨 | `#F76E33` | `#FFF` |
| 비활성(다른 파일이 이미 선택) | `#F9F9F9`, `border: 1px solid #E2E2E2` | `#C1C1C1` |
| 기본 | `#EAEAEA` | `#4E4E4E` |
| 기본 hover | `#D7D7D7` | `#4E4E4E` |

- `border-radius: 31.25rem` (pill)
- 국내 사업자: 라벨 2개 (사업자 증빙자료, 명함)
- 해외 사업자: 라벨 3개 (사업자 증빙자료, 명함, 신분증) — 신분증은 선택(Optional)

### 초기화 + 파일첨부 버튼

파일이 1개 이상일 때 파일 카드 목록 하단에 표시.

**초기화 버튼:**
- 높이 `3.25rem`, `border-radius: 0.25rem`
- 기본: `border: 1px solid #C1C1C1`, `background: #FFF`
- **hover: `border: 1px solid #6A6A6A`**
- 아이콘: `/refresh_20.svg`
- 동작: 모든 파일의 라벨을 null로 초기화 (파일 삭제 아님)

**파일첨부 버튼:**
- 높이 `3.25rem`, `border-radius: 0.25rem`, `flex: 1`
- 기본: SVG 점선 보더 stroke `#C1C1C1`, **`stroke-width: 1.5`**, `stroke-dasharray: 6, 4`, `background: #FFF`
- **hover: SVG 점선 보더 stroke `#6A6A6A`, `stroke-width: 1.5`**
- 아이콘: `/add_20.svg`

### 분류 현황 칩

| 상태 | 보더 | 텍스트 |
|------|------|--------|
| 분류 완료 | `1px solid rgba(49,164,39,0.30)` | `#31A427` + 체크 아이콘 |
| 미분류 | `1px solid #D7D7D7` | `#4E4E4E` |

- 선택(Optional) 항목: 라벨 뒤에 `(선택)` 텍스트 추가, 색상 `#868686`

### 파일 포맷 힌트 텍스트

- `13px`, `#868686`, 분류 현황 칩 하단

### 증빙자료 CTA 활성 조건

```
사업자 증빙자료 분류 완료 && 명함 분류 완료
```
(신분증은 선택 — 미완료 시 스킵 확인 모달 노출)

---

## 모달 / 팝오버

### 증빙자료 가이드 모달 (DocGuideModal)

- 증빙자료 단계 첫 진입 시 자동 노출 (1회)
- 인포마크 버튼 클릭 시 재오픈
- 바텀시트 공통 스펙 적용

### 신분증 스킵 확인 모달 (IDSkipModal)

해외 사업자 전용. 신분증 미분류 상태에서 가입 완료 클릭 시 노출.

- 버튼: 취소 (`#EAEAEA`) / 가입 완료 (`#252525`)
- 취소 hover: `#D7D7D7` / 완료 hover: `#4E4E4E`

### 세금계산서 툴팁 (TaxTooltip)

담당자 이메일 필드 옆 버튼 클릭 시 노출.

- `position: fixed`, 이메일 필드 위쪽 정렬
- 배경 `#FFF`, `border: 1px solid #4E4E4E`, `border-radius: 0.5rem`
- 하단 우측에 삼각형 꼬리 (12×9px SVG, 아래 방향)
- 텍스트 항목: 불릿(3.5px 원, `#C1C1C1`) + 본문 14px
- 바깥 클릭 시 닫힘

---

## Enter 키 네비게이션

```
contactName → contactBirth → contactEmail → goToDocuments()
```

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
| border | #C1C1C1 |
| border-hover | #6A6A6A |
