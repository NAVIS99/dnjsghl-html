# step1.html / step2.html / complete.html 변경사항 (developer handoff)

> 대상 파일: `step1.html`, `step2.html`, `complete.html`, `common.js`, `passport-mask.js` (이미지 에셋은
> 기존 `public/arrow_12.svg` 재사용, 신규 파일 없음)
>
> 이 문서는 다음 작업만 다룹니다: (1) 2026-06-24 passport-mask.js 마스킹 필수 검증 누락 버그 수정,
> (2) 2026-06-24 step2.html 인적사항/사업자 정보 blur 에러 문구 버그 수정, (3) 2026-06-25 "해외 휴대폰
> 인증 국가번호" + "해외 주소 국가 검색" 기능 추가, (4) 2026-06-25 complete.html 관심정보/주소정보 저장 후
> 섹션 접힘 애니메이션 + 관련 sticky CTA 버그 수정. 같은 날짜에 파일들에 섞여 있는 다른 수정(디자인 토큰
> 마이그레이션, 칩 클래스명 변경 등)은 이 작업과 무관하며 별도 변경사항 문서를 참고하세요.

# 2026-06-24

## passport-mask.js — 마스킹 필수 검증 누락 버그 2건 수정

여권/신분증 마스킹 모달(`PassportMask`, step1.html/step2.html/step3.html 공유)에서 마스킹 없이도
제출/닫기가 되던 버그 2건을 수정했습니다.

### 1. X 닫기 버튼이 마스킹 검증을 건너뛰던 문제

X 닫기 버튼의 `onclick`이 그냥 `PassportMask.close()`라서, 마스킹을 하나도 안 한 상태에서 X를 눌러도
경고 없이 그냥 닫혔습니다. `PassportMask._closeAttempt()`로 바꿔서, 마스킹이 없으면 "제출하기" 버튼과
동일한 얼럿을 띄우고 닫지 않도록 했습니다.

```html
<!-- 변경 전 -->
<button class="modal-close" onclick="PassportMask.close()">
<!-- 변경 후 -->
<button class="modal-close" onclick="PassportMask._closeAttempt()">
```

```js
function _requireMasked() {
  if (S.masks.length || S.alreadyMasked) return true
  alert('이름, 생년월일, 국적, 발급일, 만료일을 제외한 모든 정보를 마스킹해 주세요.')
  return false
}
function _closeAttempt() {
  if (!_requireMasked()) return
  close()
}
```

### 2. 이미 마스킹된 이미지를 재오픈하면 다시 마스킹해야 했던 버그

이미지를 새로 불러올 때(`_showAfter`) 캔버스 픽셀을 스캔해서 마스킹 색(`#F76E33`)이 이미 포함돼 있는지
검사하는 `_detectExistingMask()`를 추가하고, 결과를 `S.alreadyMasked`에 저장했습니다. 제출/닫기 시
검증(`_requireMasked()`)이 `S.masks.length`(이번 세션에서 새로 그린 마스크)뿐 아니라
`S.alreadyMasked`(이전에 이미 마스킹되어 저장된 이미지)도 함께 확인하도록 해서, 이미 마스킹된 파일을
다시 열었을 때 새로 마스킹하지 않아도 얼럿 없이 제출되도록 했습니다.

```js
function _showAfter(src) {
  const img = new Image()
  img.onload = () => {
    _img = img
    ...
    _draw()
    S.alreadyMasked = _detectExistingMask()
  }
  img.src = src
  S.src = src
}

function _detectExistingMask() {
  if (!_ctx || !_canvas.width || !_canvas.height) return false
  const data = _ctx.getImageData(0, 0, _canvas.width, _canvas.height).data
  for (let i = 0; i < data.length; i += 4 * 7) {
    if (Math.abs(data[i] - 247) < 12 && Math.abs(data[i + 1] - 110) < 12 && Math.abs(data[i + 2] - 51) < 12) return true
  }
  return false
}
```

### 영향도
- `step1.html`(회원별 준비사항), `step2.html`(해외 개인 신분증 첨부), `step3.html`(사업자 증빙자료) 세
  곳 모두 같은 `passport-mask.js`를 공유하므로 전부 동일하게 적용됩니다.
- `S.alreadyMasked`는 마스킹 색(#F76E33) 픽셀 유무로 판별하는 휴리스틱이라, 우연히 같은 색 계열의
  이미지가 업로드되면 오탐할 가능성은 이론적으로 있습니다(현재까지 실사용에서 문제 보고 없음).

---

## step2.html — 인적사항/사업자 정보 필드 blur 시 에러 문구가 안 보이던 버그 수정

이름/생년월일/사업자등록번호/휴대폰 번호 입력란에서 값을 잘못 입력하고 포커스를 벗어나면(blur), 보더는
빨갛게(`error` 클래스) 바뀌지만 그 아래 에러 안내 문구(`<p class="err-text">`)는 빈 텍스트인 채로 `hidden`
클래스만 풀려서, **빈 박스만 보이고 실제 에러 메시지는 안 보이는** 버그가 있었습니다.

**원인**: `runBlurValidation()`이 에러 `<p>`의 `hidden` 클래스만 토글하고, `textContent`를 채워주지
않았습니다.

**수정**: `BLUR_VALIDATORS` 테이블의 각 항목에 `msg`(에러 문구)를 추가하고, `runBlurValidation()`에서
에러일 때 `$(v.err).textContent = v.msg`로 실제 텍스트를 먼저 채운 뒤 `hidden`을 푸는 순서로 수정했습니다.
phone / name / birthdate / bizRegNum 4개 필드 모두 동일하게 적용됩니다.

```js
// step2.html
const BLUR_VALIDATORS = {
  phone:       { wrap: 'phone-wrap',        err: 'phone-err',   msg: '휴대폰 번호를 입력해 주세요.',           ok: () => isPhoneV(form.phone) },
  name:        { wrap: 'name-wrap',         err: 'name-err',    msg: '이름을 입력해 주세요.',                  ok: () => !!form.name.trim() },
  birthdate:   { wrap: 'birth-wrap',        err: 'birth-err',   msg: '생년월일 8자리를 입력해 주세요.',        ok: () => form.birthdate.length >= 8 },
  bizRegNum:   { wrap: 'biz-reg-wrap',      err: 'biz-reg-err', msg: '사업자등록번호 10자리를 입력해 주세요.', ok: () => form.bizRegNum.replace(/[^0-9]/g,'').length === 10 },
  companyName: { wrap: 'company-name-wrap', ok: () => !!form.companyName.trim() },
  ceo:         { wrap: 'ceo-wrap',          ok: () => !!form.ceo.trim() },
  ceoPhone:    { wrap: 'ceo-phone-wrap',    ok: () => !!form.ceoPhone.trim() },
  bizType:     { wrap: 'biz-type-wrap',     ok: () => !!form.bizType.trim() },
  bizCategory: { wrap: 'biz-category-wrap', ok: () => !!form.bizCategory.trim() },
}
function runBlurValidation(field) {
  const v = BLUR_VALIDATORS[field]
  if (!v) return
  const ok = v.ok()
  $(v.wrap).classList.toggle('error', !ok)
  if (v.err) {
    if (!ok) $(v.err).textContent = v.msg
    $(v.err).classList.toggle('hidden', ok)
  }
}
```

**연동**: 각 필드의 blur 핸들러(`clearFocus(field)`) 마지막에 `runBlurValidation(field)` 호출을 추가했습니다.
즉, 포커스 했다가 아웃되는 시점에 보더 에러 + 에러 텍스트가 항상 같이 표시되도록 동작합니다.

### 영향도
- `phone` / `name` / `birthdate` / `bizRegNum` 필드(계정정보·인적사항·사업자정보 단계)에서 blur 시 에러
  메시지가 정상적으로 보입니다.
- `companyName` / `ceo` / `ceoPhone` / `bizType` / `bizCategory`는 원래부터 `err` id(에러 문구 엘리먼트)가
  없는 필드라, 보더만 토글되고 별도 텍스트 문구는 (수정 전과 동일하게) 없습니다 — 버그가 아니라 의도된 동작입니다.

---

# 2026-06-25

## 1. step1.html — 휴대폰 인증에 해외 국가번호(다이얼코드) 선택 추가

Figma `node-id=18231-6484` 기준. 회원 유형이 **해외 개인 / 해외 사업자**일 때만, 휴대폰 인증 입력란 왼쪽에
국기+국가번호 선택 영역이 추가로 표시됩니다 (국내 개인/사업자는 기존과 동일하게 선택 영역 없이 입력란만 표시).

### 마크업/스타일
- 국가번호 선택 UI는 기존 `.field-wrap` 박스 **안쪽**에, 입력란과 같은 줄에 들어갑니다 (별도 보더 없음).
- 신규 클래스: `.cc-select-wrap`(래퍼), `.cc-select`(appearance 제거한 네이티브 `<select>`), `.cc-arrow`(화살표 아이콘, `public/arrow_12.svg`)

```css
.cc-select-wrap { position: relative; display: inline-flex; align-items: center; flex-shrink: 0; margin-right: 0.5rem; }
.cc-select { appearance: none; -webkit-appearance: none; -moz-appearance: none; border: none; background: transparent; padding: 0 1rem 0 0; margin: 0; font-size: 1rem; font-family: inherit; color: var(--text-default); letter-spacing: -0.008rem; cursor: pointer; }
.cc-select:focus { outline: none; }
.cc-arrow { position: absolute; right: 0; top: 50%; transform: translateY(-50%); pointer-events: none; }
```

### 데이터 — `PHONE_COUNTRY_CODES`
16개국 (🇰🇷 KR +82 포함, 사용자 요청으로 목록 맨 위에 추가). 기본 선택값은 `🇺🇸 US +1`입니다.

```js
const PHONE_COUNTRY_CODES = [
  { iso:'KR', flag:'🇰🇷', dial:'+82'  },
  { iso:'US', flag:'🇺🇸', dial:'+1'   },
  { iso:'JP', flag:'🇯🇵', dial:'+81'  },
  { iso:'CN', flag:'🇨🇳', dial:'+86'  },
  { iso:'GB', flag:'🇬🇧', dial:'+44'  },
  { iso:'DE', flag:'🇩🇪', dial:'+49'  },
  { iso:'FR', flag:'🇫🇷', dial:'+33'  },
  { iso:'AU', flag:'🇦🇺', dial:'+61'  },
  { iso:'CA', flag:'🇨🇦', dial:'+1'   },
  { iso:'HK', flag:'🇭🇰', dial:'+852' },
  { iso:'SG', flag:'🇸🇬', dial:'+65'  },
  { iso:'NL', flag:'🇳🇱', dial:'+31'  },
  { iso:'CH', flag:'🇨🇭', dial:'+41'  },
  { iso:'IT', flag:'🇮🇹', dial:'+39'  },
  { iso:'AE', flag:'🇦🇪', dial:'+971' },
  { iso:'TW', flag:'🇹🇼', dial:'+886' },
]
```

### 동작
- `isOverseas()` (`state.member === 2 || 3`) 기준으로 표시 여부가 결정됩니다. 회원 유형은 휴대폰 인증 화면에
  도달하기 전(약관 동의 단계)에 이미 확정되어 있으므로, 인증 화면이 열릴 때 한 번만 분기합니다.
- `renderPhoneInputRow()`가 휴대폰 입력란 한 줄(국가번호 선택 + input + 클리어/엔터 아이콘)을 매번 새로
  그립니다. `showPhoneForm()`(처음 진입), `reInputPhone()`("재입력" 클릭) 양쪽에서 동일하게 호출하므로,
  국가 선택값(`state.countryIso`/`state.countryDial`)이 재입력 시에도 유지됩니다.
- 해외 회원은 휴대폰 입력 최대 길이가 11자리 → 15자리로 늘어났습니다(`onPhoneInput`의 `maxLen` 분기).
- 인증번호 발송 후 "재입력" 전 표시 텍스트: 국내는 기존처럼 `010-1234-5678` 포맷, 해외는
  `{국가번호} {입력한 숫자}` 형태로 그대로 표시합니다(예: `+44 7911123456`).

```js
const overseas = isOverseas()
...
const displayPhone = overseas ? `${state.countryDial} ${raw}` : formatPhone(state.phone)
```

### 휴대폰 번호 검증 단순화
기존에 있던 "010으로 시작하는 11자리" 조건을 완전히 제거했습니다. 국내/해외 구분 없이 **값이 비어있지 않으면**
통과합니다 (자릿수·접두사 제한 없음).

```js
// 변경 후 (sendPhoneOtp)
if (!raw) {
  $('phone-err').textContent = '휴대폰 번호를 입력해 주세요.'
  $('phone-err').classList.remove('hidden')
  $('phone-field-wrap').classList.add('error')
  alert('휴대폰 번호를 입력해 주세요.')
  $('phone-input').focus(); return
}
```

---

## 2. step2.html — 해외 주소 "국가" 선택에 검색 기능 추가

Figma `node-id=18238-6782` 기준. 해외 개인(`addr-country-field`)/해외 사업자(`biz-country-field`) 주소 영역의
국가 선택을, 기존에 하드코딩돼 있던 15개국 `<select>`에서 **검색 가능한 커스텀 드롭다운**으로 교체했습니다.

### 마크업
국가 선택 트리거는 기존과 동일하게 `.select-wrap` + `.select-chevron` 안에 위치하지만, 내부 `<select>`가
버튼으로 바뀌고, 실제 옵션 목록은 검색 입력창과 함께 별도 패널(`#country-dd`)로 분리되었습니다.

```html
<!-- 트리거 (addr/biz 동일 패턴, id만 다름: addr-country-trigger / biz-country-trigger) -->
<div class="select-wrap hidden" id="addr-country-field">
  <button type="button" class="select-trigger field-wrap placeholder" id="addr-country-trigger"
    onclick="App.toggleCountryDD('addr', event)">국가 선택</button>
  <svg class="select-chevron" ...></svg>
</div>

<!-- 드롭다운 패널 (addr/biz 공용, body 레벨에 1개만 존재) -->
<div class="country-dd" id="country-dd">
  <div class="country-dd-search-wrap">
    <input type="text" class="country-dd-search" id="country-dd-search" placeholder="국가 검색"
      oninput="App.onCountrySearchInput(this)" onkeydown="App.onCountrySearchKeyDown(event)"/>
  </div>
  <div class="country-dd-list" id="country-dd-list"></div>
</div>
```

> `#country-dd`를 트리거 바로 옆이 아니라 **`<body>` 레벨**에 둔 이유: 국가 선택 영역의 부모인
> `.section-reveal-inner`가 `overflow:hidden`(섹션 펼침 애니메이션용)이라, 그 안에 드롭다운을 넣으면
> 패널이 잘려서 안 보입니다. 기존 이메일 도메인 추천 드롭다운(`#email-dropdown`)과 동일한 패턴입니다.
> 위치는 JS에서 트리거의 `getBoundingClientRect()`를 읽어 매번 계산합니다(`positionCountryDD()`).

### 데이터 — `COUNTRY_LIST` (⚠️ 임시 데이터, 아래 "개발자 작업 필요사항" 참고)

```js
const COUNTRY_LIST = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
  'Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi',
]
```

### 동작
- 트리거 클릭 → `toggleCountryDD(prefix, e)` → 검색 입력창에 자동 포커스, 전체 목록 표시.
- 검색 입력 시 대소문자 무시 부분 일치로 실시간 필터링 (`onCountrySearchInput`).
- 방향키(↑↓)로 옵션 탐색, Enter로 선택, Esc로 닫기 (`onCountrySearchKeyDown`).
- 옵션 클릭 또는 바깥 영역 클릭 시 닫힘 (`selectCountry`, `onDocMousedownCloseCountryDD`).
- **개인(addr) 주소 국가 선택은 기존과 동일하게 '주소' 개인정보 수집·이용 동의(`addrConsentGranted`) 게이트가
  걸려 있습니다.** 동의 전에 트리거를 클릭하면 동의 바텀시트가 먼저 뜨고, 동의 후 자동으로 드롭다운이 열립니다.
  사업자(biz) 주소 국가 선택에는 원래부터 이 게이트가 없었고, 이번에도 적용하지 않았습니다.
- 기존 `onBizCountryChange` / `onAddrCountryChange` / `onOverseasCountryMousedown` 함수는 제거되고
  `toggleCountryDD` / `selectCountry` 등으로 대체되었습니다. `form.addrCountry` / `form.bizCountry`에
  저장되는 값은 국가명 문자열(예: `"Bahrain"`)로, 기존과 동일한 필드명을 그대로 씁니다.

### 휴대폰 번호 검증 단순화 (계정정보 단계)
step1.html과 동일하게, 기존 `isPhoneV`의 "010으로 시작 + 11자리" 조건을 제거했습니다. 값이 비어있지 않으면
통과합니다. (`BLUR_VALIDATORS.phone`의 안내 문구, `handleNext()`의 에러 문구도 함께 변경)

```js
// 변경 전
const isPhoneV = (v) => v.startsWith('010') && v.replace(/[^0-9]/g,'').length === 11
// 변경 후
const isPhoneV = (v) => v.replace(/[^0-9]/g,'').length > 0
```

---

## 3. complete.html — 관심정보/주소정보 저장 후 섹션 접힘 애니메이션

"관심 정보 저장" / "주소 정보 저장" 버튼을 누르면 해당 영역이 그냥 사라지는 게 아니라, step1.html/step2.html의
섹션 펼침에 쓰던 기존 `.section-reveal` / `.section-reveal-inner` 패턴(common.css)을 재사용해서 부드럽게
접히고, 아래 콘텐츠가 자연스럽게 위로 슬라이드됩니다.

### 마크업
`#info-section`(관심분야/관심작가/성별/직업/광고성 동의 + 저장 버튼)과 `#addr-section`(주소 입력 + 저장
버튼)을 각각 `.section-reveal open` + `.section-reveal-inner`로 감쌌습니다.

```html
<div class="section-reveal open" id="info-section">
  <div class="section-reveal-inner">
    <div class="divider"></div>
    <div style="padding:2.5rem 1.25rem;">
      <!-- 관심분야/관심작가/성별/직업/광고성 동의 + 저장 버튼 -->
    </div>
  </div>
</div>
```
`#addr-section`도 동일한 구조(내부에 우편번호/도로명/상세주소 + 저장 버튼).

### 동작
- `saveInfo()` / `saveAddr()`에서 `hide()` 대신 `classList.remove('open')`을 호출합니다. `.section-reveal`의
  `grid-template-rows`가 줄어들면서 부드럽게 접힙니다.
- **두 섹션은 완전히 독립적입니다.** 관심정보를 스킵하고 주소만 입력해서 저장해도 `#addr-section`만 접히고
  `#info-section`은 그대로 남아있습니다(반대도 마찬가지).
- 접히는 속도는 common.css 기본값(0.38s)보다 느리게, complete.html 로컬 `<style>`에서 ID 셀렉터로
  덮어썼습니다(ID가 class보다 우선순위 높아서 가능):
  ```css
  #info-section, #addr-section { transition: grid-template-rows 0.6s ease-in-out; }
  ```
  속도를 바꾸려면 이 한 줄의 `0.6s` 값만 수정하면 됩니다.

### common.js — sticky CTA(`.save-sticky`) 위치 재계산 버그 수정

위 접힘 애니메이션을 적용하면서 발견된 버그입니다. `.save-sticky`(저장 버튼)는 화면 바닥에 붙으면
padding이 줄어드는 `is-stuck` 처리가 되는데, 이 재계산(`checkSticky`)은 기존엔 `MutationObserver`로
class 속성 변화만 감지해서 트리거됐습니다. 그런데 `.section-reveal`이 접히는 동안은 class 변화 없이
순수 CSS transition만 진행되기 때문에, **트랜지션이 시작되는 시점(아직 안 줄어든 레이아웃)에 계산된
"붙은" 상태가 트랜지션 내내 그대로 남아있다가**, 한참 뒤 우연한 다른 class 변화(예: 토스트가 사라지며
`toast-leave` 클래스로 바뀌는 시점, 약 2.7초 후)에야 재계산되면서 버튼이 갑자기 제자리로 "툭" 떨어지는
것처럼 보이는 부자연스러운 현상이 있었습니다.

```js
// common.js — Sticky CTA detection
document.body.addEventListener('transitionend', function(e) {
  if (e.propertyName === 'grid-template-rows') checkAll()
})
```

`.section-reveal`의 트랜지션이 끝나는 시점에 맞춰 sticky 위치를 다시 계산하도록 추가했습니다.
`common.js`는 공유 파일이라 step1.html/step2.html의 다른 섹션 펼침/접힘에도 동일하게 적용되며,
콘솔 에러 없이 기존 동작에 영향이 없는 것을 확인했습니다.

### 테스트 방법 (Daum 우편번호 API 없이)

주소검색은 외부 Daum 우편번호 API를 호출하기 때문에 네트워크 상황에 따라 응답이 늦거나 안 뜰 수
있습니다. 접힘 애니메이션만 빠르게 확인하려면, 브라우저 개발자도구 콘솔에서 API를 거치지 않고
직접 값을 채워서 저장 함수를 호출하면 됩니다.

```js
// 주소
document.getElementById('detail-input').removeAttribute('readonly');
document.getElementById('detail-input').value = '101동 202호';
document.getElementById('detail-input').dispatchEvent(new Event('input', {bubbles:true}));
App.saveAddr();

// 관심정보
document.getElementById('interest-0').click();
App.confirmMarketing();
App.saveInfo();
```

---

## 4. complete.html — "관심 정보 저장" 버튼 이름을 "추가 정보 저장"으로 변경

관심분야/관심작가/성별/직업/광고성 정보 수신 동의 영역(`#info-section`) 하단의 저장 버튼
(`id="save-btn-info"`) 라벨을 "관심 정보 저장" → **"추가 정보 저장"**으로 바꿨습니다. 동작(`App.saveInfo()`,
저장 후 섹션 접힘 등)은 변경 없이 그대로입니다. id/함수명도 그대로라 다른 코드에 영향 없습니다.

```html
<!-- 변경 전 -->
<button class="btn-solid-black-large disabled" id="save-btn-info" onclick="App.saveInfo()">관심 정보 저장</button>
<!-- 변경 후 -->
<button class="btn-solid-black-large disabled" id="save-btn-info" onclick="App.saveInfo()">추가 정보 저장</button>
```

> 참고: `변경사항_complete-sticky_260615.md` 등 이전 날짜 변경사항 문서에는 옛 이름("관심 정보 저장")으로
> 적혀 있습니다. 그 문서들은 작성 당시 기준 기록이라 수정하지 않았습니다 — 현재 버튼 이름은 이 문서가
> 최신입니다.

---

## 5. passport-mask.js — X 닫기 버튼의 마스킹 필수 검증을 다시 제거

2026-06-24에 추가했던 "X 닫기 버튼도 제출과 동일하게 마스킹 필수 검증을 받는다"(`_closeAttempt`) 동작을
**되돌렸습니다.** 이제 마스킹을 하나도 안 한 상태에서 X를 눌러도 얼럿 없이 그냥 모달이 닫힙니다.

```html
<!-- 변경 전 (2026-06-24 추가) -->
<button class="modal-close" onclick="PassportMask._closeAttempt()">
<!-- 변경 후 (2026-06-25, 되돌림) -->
<button class="modal-close" onclick="PassportMask.close()">
```

`_closeAttempt()` 함수와 export 목록의 `_closeAttempt`도 함께 제거했습니다(더 이상 쓰는 곳이 없음).
"제출하기" 버튼(`_submit()`)의 마스킹 필수 검증(`_requireMasked()`, `_detectExistingMask`/`S.alreadyMasked`
포함)은 그대로 유지됩니다 — **X로 닫을 때만 검증 없이 닫히고, 마스킹 안 한 이미지는 `onSubmit`이 호출되지
않으므로 파일 첨부도 그대로 안 됩니다** (애초에 `close()`는 `onSubmit`을 호출하지 않고 모달만 제거하는
함수라, 따로 "첨부 막기" 코드를 추가하지 않아도 X로 닫으면 자동으로 첨부되지 않습니다).

### 영향도
- step1.html(회원별 준비사항)/step2.html(해외 개인 신분증 첨부)/step3.html(사업자 증빙자료) 세 곳 모두
  같은 모듈을 공유하므로 동일하게 적용됩니다.
- "제출하기" 버튼으로 제출할 때의 마스킹 필수 검증(알럿 포함)은 변경 없습니다. X로 닫을 때만 동작이
  바뀝니다.

---

## 6. step1.html — 약관 동의 체크박스/화살표 정렬 (약관 제목이 길어져 줄바꿈될 때)

약관 동의 목록(`.terms-item`)에서 제목이 한 줄을 넘어가면, 체크박스와 오른쪽 화살표(`.chevron-right`)가
전체 줄(2줄) 높이 기준으로 수직 중앙에 맞춰져서, 체크박스가 텍스트 첫 줄보다 아래로 처져 보이는 문제가
있었습니다. 체크박스는 텍스트 첫 줄에 맞춰 위쪽으로, 화살표는 기존처럼 전체 줄 높이 기준 수직 중앙을
유지하도록 정리했습니다.

```css
/* 변경 전 */
.terms-item { display: flex; align-items: center; justify-content: space-between; padding: 0 1rem; }
.terms-item__left { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; cursor: pointer; }

/* 변경 후 */
.terms-item { display: flex; align-items: center; justify-content: space-between; padding: 0 1rem; }
.terms-item__left { display: flex; align-items: flex-start; gap: 0.5rem; flex: 1; min-width: 0; cursor: pointer; }
.terms-item__left .ocheck { margin-top: 0.125rem; }
```

- `.terms-item`(체크박스+텍스트 묶음 vs 화살표)은 `align-items: center` 그대로 유지 → 화살표는 항상
  전체 행 높이의 수직 중앙.
- `.terms-item__left`(체크박스 vs 텍스트)만 `align-items: flex-start`로 바꿔서, 텍스트가 줄바꿈돼도
  체크박스는 첫 줄 기준으로 위에 고정.
- `.ocheck`는 `.terms-all`(전체 동의)·채널 체크박스 등에서도 쓰는 공유 클래스라, 영향 범위를
  `.terms-item__left .ocheck`로 좁혀서 `margin-top: 0.125rem`만 살짝 줘서 텍스트 첫 줄과 수평이
  맞도록 미세 조정했습니다.

### 영향도
- 약관 제목이 한 줄로 끝나는 평소 상태는 변경 전과 시각적으로 동일합니다. 제목이 길어져 줄바꿈될 때만
  체크박스 위치가 달라집니다.
- `.terms-item__left .ocheck`로 범위를 좁혔기 때문에 `.terms-all`(전체 동의 체크박스), 광고성 정보
  수신 채널(SMS/이메일/전화) 체크박스 등 다른 `.ocheck` 사용처에는 영향 없습니다.

---

## 영향도

- step1.html: 국내 회원(국내 개인/국내 사업자) 화면·동작은 변경 없음 (해외 회원일 때만 국가번호 선택 영역이 추가로 보임).
- step2.html: 국가 선택이 필요 없는 회원 유형(국내 개인/국내 사업자)에는 영향 없음. 해외 개인/해외 사업자의
  국가 선택 UX만 "select 박스" → "검색 가능한 드롭다운"으로 바뀝니다.
- 휴대폰 번호 검증 완화는 **모든 회원 유형**에 적용됩니다 (국내 회원도 이제 010이 아닌 번호로 인증/가입 가능).
- `form.addrCountry` / `form.bizCountry`에 들어가는 값의 형태가 국가 ISO 코드(`"US"`)에서
  **영문 국가명 문자열**(`"Bahrain"`)로 바뀌었습니다. 백엔드 연동 시 이 필드를 그대로 저장/전송한다면
  값 형식이 바뀐 것을 확인해 주세요.
- complete.html: 관심정보/주소정보 저장 후 동작이 "버튼 비활성화만" → "해당 섹션 전체가 부드럽게 접힘"으로
  바뀝니다. 두 섹션 모두 입력 안 한 상태에서는 저장 버튼이 비활성 상태라 동작이 트리거되지 않습니다.
- common.js의 sticky CTA 재계산 fix는 `.section-reveal`을 쓰는 모든 페이지(step1~3, complete)에 공통
  적용되지만, 실제 동작 차이는 `.section-reveal`이 펼침/접힘되는 순간 화면 바닥에 sticky 버튼이 있는
  경우에만 체감됩니다.

## 개발자 작업 필요사항

1. **`COUNTRY_LIST`(step2.html)는 임시 데이터입니다.** 현재 Afghanistan~Burundi(28개국, 알파벳 A·B 일부)만
   들어있고, 실제 전체 국가 목록(국가 코드 포함 여부 등)으로 교체가 필요합니다.
2. **`PHONE_COUNTRY_CODES`(step1.html)도 15개국 + KR만 들어있는 샘플 목록입니다.** 실제 운영에 필요한
   국가/다이얼코드 전체 목록으로 교체가 필요할 수 있습니다.
3. 휴대폰 번호 검증이 "비어있지 않으면 통과" 수준으로 매우 느슨해졌습니다. 실제 서버 측에서는 형식 검증
   (국가별 자릿수, 실제 발신 가능 여부 등)을 프론트와는 별도로 반드시 다시 해야 합니다.
4. `form.addrCountry`/`form.bizCountry`가 국가명 문자열로 저장되므로, 백엔드 스키마가 ISO 코드를
   기대한다면 매핑이 필요합니다 (현재 프론트에는 ISO 코드 정보가 없습니다).
5. **`PHONE_COUNTRY_CODES`(step1.html)의 국기는 현재 이모지(🇰🇷🇺🇸🇯🇵...)로 임시 처리되어 있습니다.**
   우리 사이트에서 기존에 쓰던 국기 이미지 에셋으로 교체해 주세요. (이모지는 OS/폰트에 따라 렌더링이
   깨지거나 안 보이는 경우가 있어서, 운영에서는 이미지 에셋 사용 권장)
