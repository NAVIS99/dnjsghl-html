# sign-up_4/handoff — 작업 가이드

이 문서는 `sign-up_4/handoff` 폴더(개발자 전달용 인라인 HTML 핸드오프)에서 작업할 때 매 세션 동일한
기준을 따르기 위한 가이드입니다. 새 작업을 시작하기 전에 이 문서를 먼저 확인하세요.

이 문서는 **고정된 스펙이 아니라 살아있는 문서**입니다. 작업하다가 내용이 바뀌거나(클래스 리네임,
값 변경, 패턴 폐기 등) 새로운 컨벤션이 생기면, 같은 세션에서 이 문서도 같이 고치세요. 사용자가
"문서도 고쳐줘"라고 따로 말하지 않아도 됩니다.

## 0. 가장 중요한 원칙 2가지

1. **색상/타이포그래피/컴포넌트 스타일이 `kads-foundation.css`, `kads-components.css`에 이미 있다면
   그것을 우선 사용한다.** 하드코딩한 hex 값이나 직접 계산한 font-size/line-height를 page-local
   `<style>`에 새로 쓰지 않는다.
2. **새 페이지/새 섹션을 만들 때는 `common.css`에 이미 있는 클래스인지 먼저 확인하고 재사용한다.**
   똑같은 의미의 스타일을 page-local `<style>`에 중복 정의하지 않는다.

## 1. 파일 구조

```
common.css            ← 모든 페이지 공통 레이아웃 + 공통 유틸리티 클래스 (field-wrap, btn-*, modal-*, badge-*, guide-* 등)
common.js             ← 공통 헬퍼(이메일 검증 등 window.* 전역 함수), 페이지 전반에서 공유
kads-foundation.css   ← 색상 변수(:root) + .ty-* 타이포 유틸리티 클래스
kads-components.css   ← .btn, .radio 등 컴포넌트 클래스
passport-mask.js      ← 여권/신분증 마스킹 모달(PassportMask 모듈). step1/step2/step3에서 공유 호출
index.html            ← 핸드오프 목차/네비게이션 페이지
step1.html            ← 본인 인증 + 약관 + 회원별 준비사항 모달
step2.html            ← 계정 정보 + 인적사항 + 사업자 정보 + 주소
step3.html            ← (사업자) 인적사항 + 증빙자료 첨부
complete.html         ← 가입 완료 페이지
public/               ← 아이콘(svg), 이미지 등 정적 에셋
변경사항_*.md          ← 작업 이력 메모(날짜별). 새 변경이 생기면 비슷한 패턴으로 추가
```

**`kads-foundation.css`, `kads-components.css`는 파일 맨 위에
`/* Auto-generated from tokens.js — do not edit directly */`라고 적혀 있지만, 이 폴더 안에는
그 `tokens.js`/`generate.js` 생성기가 없다.** k-auction-ds 디자인 시스템 쪽에서 생성된 결과물을
그대로 가져와 쓰는 정적 파일이라는 뜻이다. 따라서:
- 이미 있는 변수/클래스를 쓰는 것은 자유롭게 한다.
- 정말 새로운 색상/타이포 토큰이 필요하면, 이 파일을 직접 손으로 고치기보다 먼저 사용자에게
  k-auction-ds 쪽 토큰에 이미 있는지, 혹은 새로 추가해야 하는지 확인한다. 손으로 추가해야 하는
  경우엔 기존 변수 네이밍 패턴(`--text-*`, `--surface-*`, `--border-*`, `.ty-*`)을 그대로 따른다.

## 2. 색상 — 항상 CSS 변수로

`kads-foundation.css`의 `:root`에 정의된 시맨틱 변수만 사용한다(`--text-default`, `--text-error`,
`--text-primary`, `--surface-white`, `--surface-gray-light`, `--border-gray`, `--border-error`,
`--border-selected` 등). 하드코딩 hex 값(`#252525`, `#E51B27` 등)을 page-local `<style>`이나 인라인
JS 문자열에 새로 쓰지 않는다. 기존 코드에 hex가 보이면 변수로 바꾸는 게 맞다.

## 3. 타이포그래피 — `.ty-*` 유틸리티

`kads-foundation.css`에 정의된 `.ty-*` 클래스(`.ty-heading1`, `.ty-body1`, `.ty-label1-sb`,
`.ty-caption1` 등)로 font-size/font-weight/letter-spacing/line-height를 한 번에 적용한다.
font-size 등을 손으로 다시 계산해서 적지 않는다.

## 4. 단위 — 스케일되는 값은 rem, 고정값만 px

너비/높이/패딩/마진/gap/border-radius/font-size 등 대부분의 치수는 rem으로 쓴다(16px = 1rem 기준
환산). px 예외: 1px/1.5px/2px 헤어라인 보더, `box-shadow` offset/blur, media query breakpoint,
인라인 `<svg>`의 `viewBox`/좌표.

## 5. common.css에 이미 있는 공통 클래스 (재사용 우선)

- **레이아웃/헤더**: `.header`, `.header__back`, `.header__title`, `.header__lang`, `.step-indicator`,
  `.step-bar-wrap`, `.step-bar-track`, `.step-bar-fill`, `.section-title`, `.page-title`, `.page-sub`,
  `.sec-label`, `.field-group`
- **필드**: `.field-wrap`(+ `.disabled`, `.error`, `.addr-click`), `.field-row`, `.field-input`,
  `.err-text`, `.select-wrap`, `.addr-plain`, `.select-btn`(+ `.select-btn__label`, `.select-chevron`)
- **버튼**: `.btn-solid-black-large`, `.btn-outlined-secondary-large`, `.btn-solid-cancel-large`,
  `.btn-outlined-secondary-medium2`, `.btn-solid-white-medium2`, `.btn-solid-primary-medium2`,
  `.inner-btn`, `.icon-btn`, `.enter-icon-wrap`
- **모달/바텀시트**: `.overlay`, `.modal-header`, `.modal-title`, `.modal-close`, `.bottom-sheet`,
  `.sheet-title`, `.sheet-sub`, `.sheet-body`, `.sheet-btns`(+ `.sheet-btns-col`, `.sheet-btn-cancel`,
  `.sheet-btn-confirm`), `.sheet-close`
- **뱃지/칩**: `.badge-req`, `.badge-opt`, `.chip`, `.chip-group`, `.ocheck`, `.radio`
- **안내(가이드) 모달 공통**: `.guide-body`, `.guide-title`, `.guide-sub`, `.guide-infobox`,
  `.guide-info-title`, `.guide-info-desc`, `.guide-line`, `.guide-num`, `.guide-num-col`, `.guide-step`
- **파일 업로드 카드**: `.file-card`, `.file-list-wrap`, `.file-thumb-wrap`, `.file-thumb`,
  `.file-right`, `.file-actions`, `.file-action-btn`
- **섹션 전환 애니메이션**: `.section-reveal`(+ `.section-reveal-inner`), `.section-new`,
  `.section-fade`, `.acct-fade-in`, `.title-fade`, `.fade-out`
- **기타**: `.toast`(+ `.toast-enter`, `.toast-leave`), `.footer`(+ `.footer__copy`, `.footer__link`,
  `.footer__links`, `.footer__sep`), `.sticky-cta`, `.hidden`

페이지 전용 클래스(예: `step2.html`의 `.upload-empty`, `step3.html`의 `.status-chip`,
`.tax-tip-dot` 등)는 다른 페이지에서 똑같이 필요해지지 않는 한 page-local `<style>`에 남겨둔다.

## 6. 폼 필드 에러 표시 패턴 (중요 — 반복적으로 버그가 났던 부분)

`.field-wrap`에 `error` 클래스를 추가하면 보더가 `var(--border-error)`로 바뀐다
(`common.css`의 `.field-wrap.error` 규칙, `!important`). 단, **보더만 토글하고 끝내지 말 것**:

1. 보더: `wrap.classList.add('error')` / `remove('error')`
2. 에러 문구: 해당 `<p class="err-text ...">` 엘리먼트의 **`textContent`를 실제 메시지로 채운 뒤**
   `hidden` 클래스를 토글한다. `hidden`만 풀고 텍스트를 안 채우면 빈 문구 박스만 보이는 버그가 난다
   (실제로 한 번 이렇게 터졌다 — `step2.html`의 `BLUR_VALIDATORS`/`runBlurValidation` 참고).
3. "빈 값" 자체도 에러 조건에 포함해야 하는 경우가 많다. `state.email && !isEmailValid(...)` 처럼
   "값이 있을 때만 검사" 가드를 넣으면 완전히 빈 값일 때 검증을 건너뛰는 버그가 된다. 제출 시
   검증(`validateAll`, `handleNext` 등)과 블러 시 검증의 조건이 서로 다르면 둘 중 하나가 틀린
   것이니 반드시 맞춰본다.
4. 새 필드에 검증을 추가할 때는 `step2.html`의 `BLUR_VALIDATORS` 테이블 패턴(`wrap`, `err`, `msg`,
   `ok()`)을 그대로 따라 추가하면 일관성이 유지된다.

## 7. 마스킹 모달 (`passport-mask.js`)

여권/신분증 이미지 마스킹은 `step1.html`(회원별 준비사항), `step2.html`(해외 개인 신분증 첨부),
`step3.html`(사업자 증빙자료) 세 곳이 **모두 같은 `passport-mask.js` 모듈을 공유**한다(별개
시스템 아님). 이 파일을 고치면 세 페이지에 전부 영향을 준다는 것을 항상 의식할 것:
- `PassportMask.open(src, onSubmit)`로 호출하고, 마스킹 완료 시 `onSubmit(maskedDataUrl)`을 받는다.
- 이미 마스킹된 이미지(주황색 `#F76E33` 영역이 픽셀에 baked-in)를 다시 열었을 때는 새로 마스킹하지
  않아도 제출이 막히지 않아야 한다(`_detectExistingMask()`로 기존 마스킹 여부를 판별).
- X 닫기 버튼도 제출과 동일한 마스킹 필수 검증을 받는다(`_closeAttempt()`).

## 8. 검증 방법

브라우저로 직접 열기 어려우면 로컬 정적 서버 + headless Chrome 스크린샷으로 확인한다:

```bash
python3 -m http.server 8731 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --window-size=480,900 \
  --screenshot=/tmp/preview.png "http://localhost:8731/step2.html"
```

`alert()`가 끼어 있는 흐름을 테스트할 때는 헤드리스가 다이얼로그에서 멈출 수 있으니
`window.alert = (msg) => { document.title = 'ALERT:' + msg }` 같은 식으로 오버라이드하고
`--dump-dom`으로 결과를 확인한다. 실제 사용자 흐름(포커스→블러, 다음 버튼 클릭 등)을 재현할 땐
가능하면 내부 함수를 직접 호출하기보다 실제 `input.focus()`/`.blur()`/`button.click()` 같은
네이티브 DOM 이벤트로 재현해야 진짜 버그를 잡아낼 수 있다(직접 함수 호출은 통과해도 실제 DOM
이벤트 경로에서는 다르게 동작하는 경우가 있었다).

작업이 끝나면 임시 서버 프로세스(`pkill -f "http.server <port>"`)와 스크린샷/임시 테스트 파일을
정리한다.

## 9. Git 커밋/푸시 — 주의 (히스토리 분기 위험)

**`sign-up_4/handoff`는 그 자체로 독립된 git 저장소다** (`sign-up_4/handoff/.git` 존재,
`origin` → `https://github.com/NAVIS99/dnjsghl-html.git`, 브랜치 `main`). 그런데 한 단계 위인
`sign-up_4` 폴더도 **별도의** git 저장소이고(remote 이름은 `html`), 같은 URL
(`https://github.com/NAVIS99/dnjsghl-html.git`)을 보고 있으면서 handoff 안의 파일들을 똑같이
추적하고 있다. 즉 **로컬에 같은 원격 저장소를 보는 두 개의 git 작업 디렉터리가 동시에 존재**한다.

그래서 커밋/푸시는 다음 규칙을 지킨다:

1. **항상 `sign-up_4/handoff` 디렉터리 안에서** `git add`/`commit`/`push`를 수행한다.
   `sign-up_4`(상위) 디렉터리에서 handoff 파일들을 커밋/푸시하지 않는다 — 두 저장소가 같은
   원격을 보고 있어서, 상위 쪽에서 커밋하면 히스토리가 갈라질 수 있다.
2. **푸시 전에 항상 최신 상태인지 확인한다**: `git fetch origin && git status`로
   `origin/main`보다 뒤처져 있지 않은지 확인하고, 뒤처져 있으면 먼저 `git pull`(머지 커밋 대신
   가능하면 `--rebase`)로 맞춘 뒤 푸시한다.
3. **`git push --force`는 절대 쓰지 않는다.** non-fast-forward로 거부되면, 강제 푸시로 밀어붙이지
   말고 먼저 원인을 보고 사용자와 상의한다.
4. 상위 `sign-up_4` 저장소 쪽에서 handoff 파일들이 "수정됨"으로 보이는 것은 이 구조상 흔히 있는
   일이다. 거기서 별도로 커밋하지 않는 한 무해하지만, 혼란을 줄이려면 무엇을 커밋하기 전에
   `pwd`로 어느 저장소에 있는지 항상 먼저 확인한다.

## 10. 이 문서를 업데이트하는 기준

이 문서는 매 세션 다시 쓰는 게 아니라 누적해서 고쳐나가는 문서다. 작업 중 아래 상황을 만나면
**작업과 같은 세션에서** 이 문서도 함께 고친다. 사용자가 "문서도 고쳐줘"라고 따로 말하지 않아도
된다.

- **클래스를 리네임/리팩터했다** → 이 문서에 그 클래스 이름이 나오는 모든 곳을 새 이름으로 고친다.
- **같은 스타일을 두 번 이상 손으로 베껴 쓰는 걸 발견했다** → 공통 클래스로 뽑아내고, 5번 섹션의
  목록에 추가한다.
- **새로운 반복 버그 패턴을 발견했다**(6번 섹션의 "보더만 토글하고 텍스트는 안 채우는" 버그처럼)
  → 같은 실수가 재발하지 않도록 해당 섹션에 명시적으로 적어둔다.
- **여기 적힌 값/이름/경로가 실제 코드와 달라진 걸 발견했다** → 코드가 진실이므로 문서를 코드에
  맞게 고친다. 코드를 문서에 맞춰 되돌리지 않는다.
- **사용자가 새로운 작업 기준/선호를 알려줬다** → 적절한 섹션에 규칙으로 추가한다. 없으면 새
  섹션을 만든다.

반대로 다음은 이 문서에 적지 않는다 (대화/작업 맥락일 뿐, 영속적인 규칙이 아님):
- 특정 PR/세션에서 무엇을 고쳤는지 같은 변경 이력(그건 `변경사항_*.md`나 git log의 역할).
- 그 순간에만 맞았던 임시 값/임시 우회.
