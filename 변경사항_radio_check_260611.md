# 라디오 / 체크박스 클래스 정리 (developer handoff) — 2026-06-11

## 1. .ocheck 통합

- `step1.html`, `complete.html`에 각각 따로 있던 `.ocheck` 정의를 `common.css`로 통합
- 각 페이지의 `<style>` 내 중복 정의 삭제
- `step1.html`의 "전체 동의" 체크박스(`#check-all`)는 항상 체크 아이콘이 보여야 하는데, 기존엔 `.terms-all .ocheck` 부모 선택자로 처리하던 걸 `complete.html`과 동일한 `.always` 클래스 방식으로 통일
  - 변경 전: `<div class="ocheck" id="check-all">`
  - 변경 후: `<div class="ocheck always" id="check-all">`
- 색상값(체크 전 회색 `#C1C1C1` / 체크 후 흰색 `#fff`)은 토큰(`--border-gray-dark2`, `--text-white`)으로 통일, 실제 색상 차이는 없음

## 2. .radio-dot → .radio로 통합

- `step1`의 `.radio`와 `complete`의 `.radio-dot`은 동일한 스타일이라 `.radio`로 통합, `common.css`로 이동
- 각 페이지의 중복 정의 삭제
- `complete.html`의 라디오 버튼 3개 클래스명 변경
  - 변경 전: `class="radio-dot"` (id: `r-female`, `r-male`, `r-private`)
  - 변경 후: `class="radio"`
- `.radio-row`, `.radio-label`은 `complete.html` 전용이라 그대로 유지 (공통화 안 함)

---

## 클래스 치환 표

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 전체 동의 체크박스 (step1, `#check-all`) | `class="ocheck"` | `class="ocheck always"` |
| 라디오 버튼 (complete, `#r-female`/`#r-male`/`#r-private`) | `class="radio-dot"` | `class="radio"` |

---

## 영향도

- JS는 id 기반(`classList.add('checked')` 등)이라 클래스명 변경에 영향 없음
- `.radio-dot`, 그리고 step1의 `.terms-all .ocheck` 관련 override 잔여 참조 없음 (grep 확인 완료)

## 개발자 작업 필요사항

- 이전 버전 마크업으로 작업 중이라면, 위 표의 클래스명 변경분(`radio-dot`→`radio`, `#check-all`에 `always` 클래스 추가)을 마크업에도 반영해주세요.
- 반영 안 하면 라디오 스타일이 빈 div로 깨지거나, "전체 동의" 체크 아이콘이 평소엔 안 보이는 문제가 생깁니다.
