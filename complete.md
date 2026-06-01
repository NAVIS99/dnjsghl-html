# 완료 페이지 (`complete.html`)

---

## 파일 구조

```
complete.html   본 파일
tokens.css      디자인 토큰 (색상 변수)
typography.css  타이포그래피 유틸 클래스 (.ty-*)
common.css      공통 컴포넌트 스타일
common.js       공통 유틸 함수
```

---

## 페이지 구성

| 순서 | 섹션 | 노출 조건 |
|------|------|-----------|
| 1 | 헤더 (sticky) | 항상 — 로고 클릭 시 홈 이동 |
| 2 | 가입 축하 | 항상 |
| 3 | 구분선 (8px) | 항상 |
| 4 | **추가 정보 입력** | 항상 |
| 5 | 구분선 (8px) | 항상 |
| 6 | **주소 입력** | 2단계에서 주소 미입력 시만 |
| 7 | 구분선 (8px) | 항상 |
| 8 | **진행 중 경매** (Mock) | 항상 |
| 9 | 구분선 (8px) | 항상 |
| 10 | 홈으로 이동 버튼 | 항상 |
| 11 | 푸터 | 항상 |

---

## 헤더

- 좌측: K Auction 로고 (클릭 시 홈)
- 우측: 검색 아이콘 + 메뉴 아이콘

---

## 가입 축하

### 체크 서클 애니메이션
1. 원 등장: `scale(0.4) → scale(1)`, opacity 0→1, 0.35s ease-out, delay 0.5s
2. 체크 드로우: `stroke-dasharray: 32`, `stroke-dashoffset: 32 → 0`, 0.4s ease-out, delay 0.8s

- 원 크기: 52×52px, `background: --surface-default`
- 체크 stroke: white, stroke-width 2.5

---

## 추가 정보 입력

### 성별 (선택)
- 라디오 3개: 여성 / 남성 / 비공개
- 클릭 시 전환 애니메이션 없음 (즉시 전환)
- 선택 전 마케팅 동의 바텀시트 (최초 1회)

### 직업 (선택)
- `<select>` 드롭다운
- 옵션: 직업 선택 / 학생 / 직장인 / 자영업 / 전문직 / 주부 / 기타
- **미선택 시 텍스트 색상: `--text-secondary` (#868686)**
- **선택 후 텍스트 색상: `--text-default` (#252525)**
- 선택 전 마케팅 동의 바텀시트 (최초 1회)

### 광고성 정보 수신 동의 (선택)
- 1단계 선택 약관 미동의 시만 노출
- 전체 동의 헤더 + SMS/이메일/전화 채널 선택

### 입력 정보 저장 버튼
- 활성 조건: 성별 OR 직업 OR 광고성 채널 중 하나 이상
- 활성: `--surface-default` / 비활성: `--surface-disabled` + `border: --border-gray-dark2`
- disabled 상태 hover 없음
- 저장 시 토스트: `"입력하신 정보가 저장되었습니다."`

### 마케팅 동의 바텀시트
- 타이틀: `"맞춤 컨텐츠 추천을 위한\n개인정보 수집 · 이용에 동의하시나요?"`
- 버튼: 비동의 / 동의
- 동의 후: `consentGranted = true` → 이후 바텀시트 미표시

---

## 주소 입력 (2단계 미입력 시)

### 필드 구성
- 우편번호 (주소검색 버튼 포함)
- 도로명 주소
- 상세 주소 (도로명 입력 후 활성화)

### 클릭 동작
- **우편번호, 도로명, 상세주소 필드 모두** 클릭 시 주소 개인정보 동의 바텀시트 → Daum Postcode API

### 주소 개인정보 동의 바텀시트
- 타이틀: `"경매 응찰을 위한 '주소'\n개인정보 수집 · 이용에 동의하시나요?"`
- 동의 후: Daum Postcode API 오픈, 이후 동의 바텀시트 없이 바로 오픈

### Daum Postcode API
```html
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
```
- 선택 후: 우편번호 + 도로명 주소 자동 입력, 텍스트 색상 `--text-default` 전환
- 상세 주소 `readonly` 해제 → 입력 가능

### 입력 정보 저장 버튼
- 활성 조건: 우편번호 OR 도로명 OR 상세 주소 중 하나 이상
- 저장 시 토스트: `"입력하신 정보가 저장되었습니다."`

---

## 진행 중 경매 (Mock 데이터)

| 경매명 | 뱃지 | 뱃지 색상 | 악센트 컬러 |
|--------|------|-----------|------------|
| 4월 29일 메이저 경매 | LIVE | `--text-error` (#E51B27), border rgba(229,27,39,0.4) | `--surface-primary` (#F76E33) |
| 4월 28일 프리미엄 온라인 경매 | ONLINE | `--text-default` (#252525), border `--border-gray` | `#B2814C` (브랜드 전용 컬러) |
| 4월 23일 위클리 온라인 경매 | ONLINE | `--text-default` (#252525), border `--border-gray` | `#5EB6B9` (브랜드 전용 컬러) |

- 카드 우측: 10px 폭 컬러 악센트 바
- `경매마감` + `D-6` (오렌지 `--text-primary`)

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

## 푸터 저작권 연도

```js
// 매년 자동 갱신 — 하드코딩 금지
document.querySelectorAll('.copy-year').forEach(el => el.textContent = new Date().getFullYear())
```

---

## 색상 토큰 (→ `tokens.css` 참조)

| 용도 | 토큰 |
|------|------|
| 기본 텍스트 | `--text-default` (#252525) |
| 보조 텍스트 / 미선택 셀렉트 | `--text-secondary` (#868686) |
| 브랜드 오렌지 | `--status-primary` (#F76E33) |
| 에러 | `--text-error` (#E51B27) |
| 성공 | `--text-success` (#31A427) |
| disabled 배경 | `--surface-gray-lighter2` (#F9F9F9) |
