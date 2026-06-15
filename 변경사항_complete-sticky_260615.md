# complete.html 변경사항 (developer handoff)

> 대상 파일: `common.js`, `common.css`, `complete.html`

# complete.html 추가 변경사항 (2026-06-12)

## 1. 관심분야 / 관심작가 입력 항목 신규 추가

회원가입 완료 페이지의 "추가 정보" 영역에 성별/직업 위쪽으로 관심분야·관심작가 입력 항목을 추가했습니다. (Figma `node-id=18158-19888` 기준)

### 관심분야
- 2열 그리드(`.interest-grid`, complete.html 로컬 CSS)로 6개 항목 배치: 근현대 미술 / 해외 미술 / 판화 / 고미술 / 아트 / 기타
- 각 항목은 `.select-btn`(체크박스 wrapper, step1.html 라디오와 동일 컴포넌트) + `.ocheck` 체크박스 조합
- 클릭 시 `App.toggleInterest(label)` → 선택된 항목 배열(`interests`)에 추가/제거, `.select-btn.selected` + `.ocheck.checked` 토글

```css
.interest-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
```

### 관심작가
- 검색 아이콘이 들어간 입력 필드(`.field-wrap` + `.field-row`, `search_20.svg` 인라인) + 칩 목록(`.chip-group`, `id="artist-chips"`)
- 추천 작가 5명(이우환/박서보/김환기/이강소/유영국)을 `.chip.default.medium2`("+" 아이콘, `plus_16.svg`)로 기본 표시
- 클릭 시 `App.toggleArtist(name)` → `.chip.selected.medium2`("✕" 아이콘, `close_16.svg`)로 토글
- 입력창에 직접 타이핑 후 Enter → `.chip.selected.medium2` 칩으로 추가(`customArtists`), "✕" 클릭 시 제거(`App.removeCustomArtist`)
- 아이콘은 `stroke="currentColor"`로 인라인 처리해서 `.chip.default`(`--text-gray-darker`)/`.chip.selected`(`--text-white`) 색상에 자동으로 맞춰짐
- 한글 IME 조합 중 Enter 키 중복 입력 방지: `onArtistKeydown`에서 `e.isComposing || e.keyCode === 229`일 때 무시

## 2. 관심분야/관심작가 → 개인정보 수집 동의 모달 연동

성별/직업과 동일하게, 관심분야 클릭(`toggleInterest`)·관심작가 입력창 포커스/추천 칩 클릭(`onArtistFocus`, `toggleArtist`)도 기존 `withConsent()` → `#marketing-overlay`(맞춤 컨텐츠 추천 동의) 흐름에 연결했습니다. 동의 전에는 입력/선택이 불가하며, 동의 후 입력창이 자동으로 다시 포커스됩니다.

## 3. `.section-label` → `.sec-label` 통합

complete.html에 로컬로 정의돼 있던 `.section-label`(common.css의 `.sec-label`과 거의 동일, `line-height` 차이만 있음)을 제거하고, 공유 컴포넌트인 `.sec-label`로 통일했습니다. (성별/직업/주소 등 6곳 전체 클래스명 교체)

### 적용 위치
- `complete.html` (관심분야/관심작가/성별/직업/광고성 정보 수신 동의/주소 라벨)

---

# complete.html 스티키/토스트 변경사항 (2026-06-15)

## 1. 저장 버튼(`.save-sticky`)에 `is-stuck` 패턴 적용

기존 디자인 시스템의 sticky CTA 패턴(`.sticky-cta`, `.inline-btn-wrap`, `.btn-sticky`)은 화면 하단에 버튼이 실제로 붙으면(`is-stuck`) padding을 줄여 컴팩트하게 보이도록 되어있었는데, complete.html의 "관심 정보 저장" / "주소 정보 저장" 버튼(`.save-sticky`)에는 적용되어 있지 않았습니다. 동일한 셀렉터에 포함시켰습니다.

**common.js**
```js
// 변경 전
document.querySelectorAll('.sticky-cta, .inline-btn-wrap, .btn-sticky').forEach(...)

// 변경 후
document.querySelectorAll('.sticky-cta, .inline-btn-wrap, .btn-sticky, .save-sticky').forEach(...)
```

**common.css**
```css
/* 변경 전 */
.sticky-cta, .inline-btn-wrap, .btn-sticky { transition: padding-top 0.15s, padding-bottom 0.15s; }
.sticky-cta.is-stuck, .inline-btn-wrap.is-stuck, .btn-sticky.is-stuck {
  padding-top: 0.625rem !important; padding-bottom: 0.625rem !important;
}

/* 변경 후 */
.sticky-cta, .inline-btn-wrap, .btn-sticky, .save-sticky { transition: padding-top 0.15s, padding-bottom 0.15s; }
.sticky-cta.is-stuck, .inline-btn-wrap.is-stuck, .btn-sticky.is-stuck, .save-sticky.is-stuck {
  padding-top: 0.625rem !important; padding-bottom: 0.625rem !important;
}
```

- 효과: `.save-sticky`가 화면 바닥에 붙으면 위/아래 padding이 `0.625rem`으로 줄어듭니다 (다른 sticky CTA와 동일한 동작).

---

## 2. complete.html 저장 버튼 — 저장 후 비활성화, 값 재변경 시 재활성화

"관심 정보 저장" / "주소 정보 저장" 버튼을 클릭하면 토스트 노출 후 버튼이 `disabled` 상태(딤 처리)로 바뀝니다. 이후 관련 입력값이 다시 변경되면 기존 `updateInfoSaveBtn()` / `updateAddrSaveBtn()`이 재실행되어 버튼이 자동으로 다시 활성화됩니다.

```js
// saveInfo()
function saveInfo() {
  const hasOpt = optChans.sms||optChans.email||optChans.phone
  const hasArtists = selectedArtists.length>0 || customArtists.length>0
  if (!gender && !job && !hasOpt && !interests.length && !hasArtists) return
  showToast('입력하신 정보가 저장되었습니다.')
  const btn = $('save-btn-info')
  btn.className = 'btn-solid-black-large disabled'
  btn.disabled = true
}

// saveAddr()
function saveAddr() {
  if (!zip&&!address&&!detail) return
  showToast('입력하신 정보가 저장되었습니다.')
  const btn = $('save-btn-addr')
  btn.className = 'btn-solid-black-large disabled'
  btn.disabled = true
}
```

- 재활성화 조건: 관심분야 / 관심작가 / 성별 / 직업 / 광고성 정보 수신 동의(관심 정보 저장 버튼) 또는 주소·상세주소(주소 정보 저장 버튼) 중 하나라도 다시 변경되면, 해당 값이 채워진 상태로 `update*SaveBtn()`이 재계산되어 버튼이 활성화됩니다.

---

## 3. 토스트가 하단 sticky 버튼을 가리는 문제 수정

토스트(`#toast-wrap`, `bottom: 2rem`)와 하단에 붙은 sticky CTA 버튼이 겹쳐서, 토스트가 버튼을 가리는 문제가 있었습니다. sticky 버튼이 화면 바닥에 붙어있는 상태(`is-stuck`)일 때, 그 버튼 높이만큼 토스트 위치를 위로 올리도록 수정했습니다.

**common.js** — `checkSticky()`에서 `is-stuck` 상태인 버튼의 높이를 측정해 CSS 변수로 저장
```js
function checkSticky() {
  let stuckHeight = 0
  document.querySelectorAll('.sticky-cta, .inline-btn-wrap, .btn-sticky, .save-sticky').forEach(function(el) {
    const rect = el.getBoundingClientRect()
    const stuck = Math.round(rect.bottom) >= window.innerHeight
    el.classList.toggle('is-stuck', stuck)
    if (stuck) stuckHeight = Math.max(stuckHeight, rect.height)
  })
  document.documentElement.style.setProperty('--sticky-cta-h', stuckHeight + 'px')
  document.documentElement.classList.toggle('has-sticky-cta', stuckHeight > 0)
}
```

**common.css**
```css
/* 변경 전 */
#toast-wrap {
  position: fixed; bottom: 2rem; left: 0; right: 0;
  display: flex; justify-content: center; z-index: 50; padding: 0 1.25rem;
  pointer-events: none;
}

/* 변경 후 */
#toast-wrap {
  position: fixed; bottom: 2rem; left: 0; right: 0;
  display: flex; justify-content: center; z-index: 50; padding: 0 1.25rem;
  pointer-events: none; transition: bottom 0.15s;
}
html.has-sticky-cta #toast-wrap { bottom: calc(1.25rem + var(--sticky-cta-h, 0px)); }
```

- sticky 버튼이 화면에 붙어있지 않을 때: 기존과 동일하게 `bottom: 2rem`
- sticky 버튼이 붙어있을 때: 버튼 위로 `1.25rem` 띄운 위치(`1.25rem + 버튼 높이`)에 토스트 표시

---

## 영향도

- `common.js` / `common.css`를 공유하는 모든 페이지에 적용되는 변경이지만, 동작은 `.sticky-cta` / `.inline-btn-wrap` / `.btn-sticky` / `.save-sticky` 요소가 존재하고 화면 바닥에 붙어있는(`is-stuck`) 경우에만 영향을 줍니다.
- complete.html 외 다른 페이지에서 사용 중인 sticky CTA(예: step 페이지 하단 버튼) + 토스트 동시 노출 시에도 동일하게 토스트 위치가 보정됩니다.

## 개발자 작업 필요사항

- 별도 마크업 변경 없음 — `common.js`, `common.css` 적용만으로 동작합니다.
- complete.html의 저장 버튼은 클릭 후 `disabled` 클래스/속성이 추가되므로, 별도 서버 연동 시에도 저장 성공 응답 후 이 상태를 유지/해제하는 로직과 충돌하지 않는지 확인 필요.
