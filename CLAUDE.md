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
changes/              ← 작업 이력 메모(변경사항_*.md). 로컬 전용 폴더, git 추적 안 함(.gitignore)
```

**작업 이력 메모(`변경사항_*.md`)는 `changes/` 폴더 안에만 둔다.** 이 폴더는 `.gitignore`에
`changes/`로 등록돼 있어 git이 추적하지 않는다(개발자 전달용 푸시에 안 올라감). 새 변경 이력을
남길 땐 기존 파일명 패턴(`변경사항_<주제>_<YYMMDD>.md`)대로 `changes/` 안에 만든다. handoff 루트에
바로 두지 않는다.

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

여권/신분증 이미지 마스킹은 `step2.html`(해외 개인 신분증 첨부)과 `step3.html`(사업자 증빙자료)
**두 곳이 같은 `passport-mask.js` 모듈을 공유**한다(별개 시스템 아님). 이 파일을 고치면 두 페이지에
모두 영향을 준다는 것을 항상 의식할 것. **`step1.html`은 `passport-mask.js`를 로드하지도 호출하지도
않는다** — step1의 "회원별 준비사항" 모달(`#mi-modal`)은 회원 유형별 준비물을 보여주는 **안내용**일
뿐, 파일 첨부·마스킹 기능이 없다. 마스킹 동작/모달 HTML/모달 CSS는 전부 `passport-mask.js` 한 파일
안에 들어있다(HTML은 `_template()`, CSS는 `_injectCSS()`의 `CSS` 상수). 단, `public/`의 아이콘·예시
이미지 에셋과 `kads-foundation.css`의 토큰 변수(`--text-*` 등)·`ty-*` 클래스에는 의존한다:
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

## 9. Git 커밋/푸시 — 반드시 `sign-up_4/handoff`에서만, 무조건

**회원가입(sign-up_4) 프로젝트는 `git add`/`commit`/`push`를 무조건 `sign-up_4/handoff` 디렉터리
안에서만 한다. 예외 없음.** 한 단계 위 `sign-up_4` 디렉터리에서는 절대 커밋/푸시하지 않는다.

**작업 이력 메모(`변경사항_*.md`)는 `changes/` 폴더에 두고, 이 폴더는 `.gitignore`(`changes/`)로
git 추적에서 제외돼 있다.** 따라서 커밋/푸시에 자동으로 안 올라간다 — `git add .`을 해도 포함되지
않으니 따로 신경 쓸 필요 없다. (이력 메모는 로컬 전용이라 개발자 전달용 푸시에 넣지 않는다.)
새 이력 메모는 항상 `changes/` 안에 만든다(1번 섹션 참고).

### handoff가 유일한 작업 공간이다 (중요)

**사용자는 이 프로젝트를 `sign-up_4/handoff`에서만 작업하고, 상위 `sign-up_4`나 그 외 다른 곳에서
따로 작업한 적이 없다고 확인함(2026-06-25).** 즉 origin에 로컬이 모르는 커밋이 보이더라도, 그건
보존해야 할 별도의 정당한 작업이 아니라 — 과거 어느 세션이 실수로 다른 위치에서 커밋/푸시해서 생긴
부산물일 뿐이다. 그래서:

**히스토리가 갈라져 있으면, 매번 충돌을 비교해서 머지할 필요 없이 `sign-up_4/handoff`의 로컬
히스토리를 기준으로 origin을 덮어써도 된다(사용자 승인, 2026-06-25).** 아래 절차의 5번처럼
가볍게 한 번 훑어보는 정도면 충분하다.

### 왜 자꾸 갈라지는지 (원인)

`sign-up_4/handoff`와 `sign-up_4`(상위)는 같은 원격(`https://github.com/NAVIS99/dnjsghl-html.git`,
브랜치 `main`)을 보는 서로 다른 두 개의 git 작업 디렉터리이고, 둘 다 handoff 안의 같은 파일들
(step1~3.html, common.css 등)을 추적한다. 과거에 (사용자가 아닌) 어느 세션이 상위 디렉터리에서
커밋/푸시한 적이 있어서, origin에는 로컬 handoff 히스토리와 무관한 커밋이 섞여 있다 — 심지어 같은
작업을 양쪽에서 따로 해서 **커밋 메시지는 같은데 내용/해시가 다른 커밋**이 생기기도 했다
(`fix(handoff): step2/step3 ... (2026-06-02)`가 로컬·origin에 따로 존재했던 사례, 2026-06-25 발견).

### 2026-06-25에 실제로 있었던 일 (참고)

로컬에 8개, origin에 5개의 서로 다른 커밋이 있는 상태로 갈라져 있었다. 당시엔 origin 쪽 커밋에
보존할 만한 내용(마스킹 모달 기능, complete.html 토스트 위치 수정 등)이 실제로 있었기 때문에
`git merge origin/main`으로 6개 파일 충돌을 직접 읽어서 합쳤다. 하지만 이후 사용자가 "이 프로젝트는
handoff에서만 작업했다"고 확인했으므로, **다음에 또 갈라지면 이렇게 정성껏 머지할 필요 없이 로컬
기준으로 덮어쓰면 된다.**

### 커밋할 때마다 이 순서로

1. `pwd`로 지금 `sign-up_4/handoff` 안에 있는지 먼저 확인한다. 아니면 진행하지 않는다.
2. `git fetch origin`을 먼저 한다.
3. `git log origin/main..HEAD --oneline`과 `git log HEAD..origin/main --oneline`으로 양쪽에
   서로 모르는 커밋이 있는지 확인한다. 둘 다 비어있으면 바로 commit → push.
4. **갈라져 있으면**: `git log HEAD..origin/main`으로 origin 쪽 커밋들을 한 번 가볍게 훑어본다 —
   진짜 처음 보는 의미 있는 작업이 있으면 사용자에게 확인하고, 보통 그렇듯 별다른 게 없으면 그냥
   로컬 기준으로 덮어쓴다: `git push --force origin main`.
5. 덮어쓴 뒤에는 **headless 브라우저로 핵심 기능이 실제로 동작하는지 다시 확인**한다.

이렇게 해도 두 디렉터리 구조 자체는 안 바뀌므로 또 갈라질 수 있다 — 근본 해결은 상위 `sign-up_4`
쪽에서 다시는 handoff 파일들을 커밋/푸시하지 않는 것뿐이다(맨 위 규칙).

## 10. SVG 아이콘 작성 — 보안 + 일관성

SVG는 이미지처럼 보이지만 실제로는 스크립트(`<script>`, `on*` 핸들러, `<foreignObject>`)를 품을 수
있는 XML 문서다. 그래서 "어떻게 그리느냐"보다 **"DOM에 어떤 방식으로 넣느냐"** 가 보안의 핵심이다.
이 폴더의 아이콘은 전부 팀이 만든 신뢰 자산(`public/*.svg`)이므로 무거운 정화(DOMPurify 등)는
필요 없고, **동적 주입 경로만 끊으면 안전**하다. (배경 이론은 상위 폴더 `SVG_보안_가이드.md` 참고.)

### 10.1 호출 방식 — 아래 두 가지만 쓴다 (현재 코드의 표준)

1. **단순 표시용 아이콘 → `<img src="./public/...svg">`**
   브라우저가 `<img>`로 불러온 SVG 내부 스크립트를 실행하지 않으므로 가장 안전하다. 색상 고정
   아이콘은 거의 다 이 방식이다.
   ```html
   <img src="./public/textfield_delete.svg" width="16" height="16" alt=""/>
   ```
   - 의미 없는 장식 아이콘은 `alt=""`, 의미가 있으면 `alt="검색"`처럼 설명을 넣는다.
   - 크기는 `width`/`height` 속성(px)으로 준다. 인라인 `<svg>`가 아니므로 색상은 CSS로 못 바꾼다.

2. **색상/호버를 CSS로 제어해야 하는 아이콘 → 정적 inline `<svg>`** (HTML에 직접 작성)
   ```html
   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
     <path d="..." />
   </svg>
   ```
   - `fill="currentColor"`(또는 `stroke="currentColor"`)로 두면 부모 `color`/`--text-*` 변수를
     따라가서 호버·상태 색을 CSS만으로 바꿀 수 있다. 색을 SVG 안에 hex로 박지 않는다(2번 섹션 원칙).
   - `viewBox`/좌표값은 px 예외로 그대로 둔다(4번 섹션). 화면에 표시되는 `width`/`height`만 신경 쓴다.
   - 장식 아이콘은 `aria-hidden="true"`.

### 10.2 절대 하지 말 것 — 동적 주입 sink

```js
document.write(svgString);              // 금지 — DOM XSS의 대표 sink
el.innerHTML = svgString;               // 지양 — 문자열을 마크업으로 파싱
el.insertAdjacentHTML('...', svgString);// 지양 — 위와 동일
```

현재 `document.write()`는 코드에 **없다(유지)**. 다만 `step3.html`에는 정적 체크 아이콘 SVG를
`innerHTML` 템플릿/`insertAdjacentHTML`로 주입하는 곳이 있다(파일 분류 칩 — `renderFiles` 부근,
`chip.insertAdjacentHTML('afterbegin', '<svg…>')`). **내용이 하드코딩 상수라 지금 당장 위험하진 않지만
권장 패턴은 아니다.** 새로 칩/아이콘을 그릴 때는 이 방식을 복제하지 말고, 미리 HTML에 적어둔 정적
`<svg>`를 CSS로 show/hide 하거나 `<img>`로 빼는 쪽을 택한다.

### 10.3 사용자 입력을 마크업에 섞을 때 (XSS 일반 주의)

SVG든 아니든, **사용자가 입력한 값을 `innerHTML` 문자열 템플릿에 그대로 넣으면 XSS**가 된다.
값을 넣어야 하면 `complete.html`의 `escapeHtml()` 헬퍼처럼 이스케이프하거나 `textContent`로 채운다.
(현재 작가 칩은 `escapeHtml` 적용됨 ✓. 이메일 추천 드롭다운의 입력값 보간은 이스케이프가 빠져 있어
self-XSS 여지가 있으나, 이번엔 수정하지 않기로 함 — 새로 비슷한 드롭다운을 만들 땐 이스케이프할 것.)

### 10.4 비신뢰 SVG(사용자 업로드)는 이 방식으로 다루지 않는다

증빙자료·프로필 등 외부에서 올라온 SVG는 신뢰 자산이 아니다. 현재는 업로드 이미지를 `<img src>`
(blob URL)로만 표시하므로 안전하다 — **이 경계를 깨고 업로드 SVG를 inline `<svg>`나 innerHTML로
마크업 파싱하지 말 것.** 그런 요구가 생기면 서버 측 정화 + 별도 origin 서빙이 필요하니 먼저 사용자에게
확인한다(상위 `SVG_보안_가이드.md` 3장).

## 11. 변경 기록(changes/) 작성 규칙 — 매 수정마다 필수

`sign-up_4/handoff`의 코드/스타일(`*.html`, `*.css`, `*.js` 등)을 수정할 때마다, **그 작업 내용을
설명하는 변경 기록 md 파일을 `changes/` 폴더에 새로 만든다.** 개발자가 이 문서만 읽고도 "무엇이 왜
어떻게 바뀌었는지" 이해하고 실제 코드에 반영할 수 있어야 한다. (이 폴더는 `.gitignore`로 git 추적에서
빠져 있어 푸시에는 안 올라가고, 로컬/전달용 기록으로만 쓴다 — 1·9번 섹션 참고.)

### 11.1 파일명 규칙

```
changes/변경사항_{주요변경을 함축하는 단어}_{YYMMDD}.md
```

- **하루치 작업은 파일 하나에 모은다.** 같은 날짜(`{YYMMDD}`)의 변경은 새 파일을 계속 만들지 말고
  그날의 한 파일에 누적해서 적는다.
- `{함축 단어}`: **그날 한 작업들 중 가장 규모가 큰 변경**을 한 단어(필요하면 하이픈 연결)로 요약한다.
  영문 kebab-case 권장(기존 파일들과 통일) — 예: `overseas-country`, `radio-check`, `svg-guide`.
  → 하루 동안 더 큰 작업이 추가되면 **그에 맞춰 파일명(함축 단어)을 바꿔도 무방**하다. 같은 날짜
  파일이면 이름이 바뀌어도 같은 하루치 기록이라는 뜻이다(파일을 새로 만드는 게 아니라 이름만 변경).
- `{YYMMDD}`: 작업 날짜 6자리 — 예: 2026-06-30 → `260630`. (오늘 날짜는 세션 컨텍스트의 currentDate 사용)
- 예시: `changes/변경사항_svg-guide_260630.md`

### 11.2 작성 내용 (개발자가 이해할 수 있게)

기존 파일(`changes/변경사항_overseas-country_260625.md` 등)의 형식을 따른다. 최소 다음을 담는다:

1. **제목 + 대상 파일**: 어떤 파일을 건드렸는지, 신규 에셋이 있으면 명시.
2. **작업 단위별 섹션**: "무엇을 / 왜 / 어떻게" 바꿨는지 자연어로 설명. 한 문서에 여러 작업이 섞이면
   날짜·주제로 구분한다.
3. **변경 전/후 코드 스니펫**: 핵심 변경은 ` ```html ` / ` ```js ` / ` ```css ` 블록으로 `변경 전` →
   `변경 후`를 보여준다. 클래스명·함수명·파일경로는 실제 코드와 정확히 일치시킨다.
4. **주의/영향 범위**: 공유 모듈(`passport-mask.js`처럼 step1~3 동시 영향)이나 회귀 위험이 있으면 적는다.

### 11.3 운영 원칙

- 이 변경 기록 작성은 **사용자가 따로 시키지 않아도** 코드 수정 작업의 일부로 매번 한다.
- 하루치 작업은 같은 날짜 파일 하나에 모으고, 함축 단어는 그날 가장 큰 변경 기준으로 정한다(11.1 참고).
- **수정했다가 다시 원래대로 되돌려 결국 순(net) 변경이 없으면 적지 않는다.** 최종적으로 코드가
  바뀐 게 없는 작업은 개발자에게 전달할 변경이 아니므로 기록할 필요가 없다. 기록은 "최종 상태가
  이전과 어떻게 달라졌는가"를 남기는 것이지 작업 과정을 남기는 게 아니다.
- 코드가 실제로 바뀌었는데 이 기록을 빼먹지는 않는다 — 빠지면 개발자가 인라인 핸드오프의 변경
  의도를 못 따라온다.

## 12. 이 문서를 업데이트하는 기준

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
