/* passport-mask.js — 여권 사본 제출하기 & 마스킹 기능 */
const PassportMask = (() => {

/* ── CSS (모달 전용 — 공통 패턴은 common.css 재활용) ── */
const CSS = `
#pm-overlay {
  position: fixed; inset: 0; z-index: 400;
  display: flex; flex-direction: column;
}
@media (min-width: 64rem) {
  #pm-overlay { left: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
}

#pm-modal {
  width: 100%; height: 100%; min-height: 0;
  background: var(--surface-white); display: flex; flex-direction: column; overflow: hidden;
}
@media (min-width: 64rem) {
  #pm-modal {
    width: calc(100% - 2.5rem); max-width: 75rem;
    height: calc(100vh - 5rem); max-height: 45rem;
    border-radius: 0.5rem; flex-direction: row;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
  }
}

.pm-pc-only { display: none !important; }
@media (min-width: 64rem) {
  .pm-mobile-only { display: none !important; }
  .pm-pc-only     { display: flex !important; }
}

.pm-notice {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--surface-primary-lighter);
  border-radius: 0.25rem; padding: 0.75rem 1rem; margin: 0.5rem 1.25rem 1.25rem;
}
.pm-notice-em { color: var(--text-primary); }
.pm-notice-break { display: none; }
@media (min-width: 64rem) {
  .pm-notice-break { display: inline; }
}
.pm-example-wrap { margin: 0 1.25rem; overflow: hidden; }
.pm-example-img  { width: 100%; height: auto; display: block; }

#pm-after { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
@media (min-width: 64rem) { #pm-after { flex-direction: row; width: 100%; } }

#pm-canvas-col {
  position: relative; flex: 1; min-height: 0; min-width: 0; background: var(--surface-gray-lighter1); border-right: 1px solid var(--divider-gray-light);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
#pm-canvas { display: block; max-width: 100%; max-height: 100%; cursor: crosshair; touch-action: none; }
#pm-example-dim {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: none; pointer-events: none;
}
#pm-example-overlay {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: contain; display: none; pointer-events: none;
}

#pm-right-after {
  display: flex; flex-direction: column; flex-shrink: 0;
  background: var(--surface-white);
}
@media (min-width: 64rem) {
  #pm-right-after { width: 22.5rem; overflow: hidden; }
  #pm-right-after .modal-header,
  #pm-right-after .pm-toolbar,
  #pm-right-after #pm-after-cta { flex-shrink: 0; }
  #pm-right-after #pm-after-guide { flex: 1; min-height: 0; overflow-y: auto; }
}
@media (max-width: 63.9375rem) {
  #pm-after-guide .pm-example-wrap { display: none; }

  /* 헤더 - 노티스 - 캔버스 - 툴바 - cta 순서로 재배치 */
  #pm-right-after { display: contents; }
  #pm-right-after .modal-header { order: 1; }
  #pm-right-after #pm-after-guide { order: 2; }
  #pm-canvas-col { order: 3; }
  #pm-right-after .pm-toolbar { order: 4; }
  #pm-right-after #pm-after-cta { order: 5; }
}

.pm-toolbar {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem 1.5rem; flex-shrink: 0;
}
@media (min-width: 64rem) {
  .pm-toolbar { padding: 0.625rem 1.25rem 0.25rem; }
}

.pm-toggle-wrap {
  display: flex; align-items: center; gap: 0.375rem; margin-right: auto;
  cursor: pointer; font-size: 0.9375rem; color: var(--text-default); user-select: none;
}
.pm-toggle { width: 1.625rem; height: 1rem; border-radius: 999px; background: #D7D7D7; position: relative; transition: background 0.2s; padding: 0; flex-shrink: 0; }
.pm-toggle.on { background: var(--surface-primary); }
.pm-toggle-knob { position: absolute; top: 0.188rem; left: 0.188rem; width: 0.625rem; height: 0.625rem; border-radius: 50%; background: #fff; transition: transform 0.2s; display: block; }
.pm-toggle.on .pm-toggle-knob { transform: translateX(0.625rem); }

.pm-tool-btns { display: flex; gap: 0.25rem; }
@media (min-width: 64rem) {
  .pm-tool-btns { flex: 1; gap: 0.5rem; }
  .pm-tool-btns .pm-tool-btn { flex: 1; justify-content: center; padding-left: 0.75rem; padding-right: 0.75rem; }
  .pm-tool-btn.btn-solid-white-medium2 { border: 1px solid var(--border-gray-dark2); transition: border-color 0.15s; }
  .pm-tool-btn.btn-solid-white-medium2:hover { border-color: var(--border-gray-dark); background: var(--surface-white); }
}

#pm-after-cta { display: flex; gap: 0.5rem; padding: 0.625rem 1.25rem; padding-bottom: max(env(safe-area-inset-bottom, 0px), 0.625rem); flex-shrink: 0; }
@media (min-width: 48rem) { #pm-after-cta { padding: 1.25rem; padding-bottom: max(env(safe-area-inset-bottom, 0px), 1.25rem); } }
@media (min-width: 64rem) { #pm-after-cta { padding: 1rem 1.25rem; padding-bottom: 1rem; } }
#pm-after-cta .btn-solid-black-large { flex: 1 1 0%; width: auto; }
`

/* ── State ── */
let S = {}
let _canvas = null, _ctx = null, _img = null

function _resetState(src, onSubmit) {
  S = {
    src, onSubmit,
    masks: [],
    isMasking: true,
    showExample: false,
    drawing: false,
    startX: 0, startY: 0,
    currentRect: null,
  }
}

/* ── Public ── */
function open(src, onSubmit) {
  _injectCSS()
  _resetState(src, onSubmit)
  _build()
  document.body.style.overflow = 'hidden'
  if (src) _showAfter(src)
}

function close() {
  const el = document.getElementById('pm-overlay')
  if (el) el.remove()
  document.body.style.overflow = ''
  _canvas = null; _ctx = null; _img = null
}

function _injectCSS() {
  if (document.getElementById('pm-styles')) return
  const s = document.createElement('style')
  s.id = 'pm-styles'
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ── DOM Build ── */
function _build() {
  const existing = document.getElementById('pm-overlay')
  if (existing) existing.remove()
  document.body.insertAdjacentHTML('beforeend', _template())
  _canvas = document.getElementById('pm-canvas')
  _ctx = _canvas.getContext('2d')
  _bindCanvasEvents()
}

function _template() {
  return `<div id="pm-overlay">

  <div id="pm-modal">

    <div id="pm-after">
      <div id="pm-canvas-col">
        <canvas id="pm-canvas"></canvas>
        <div id="pm-example-dim"></div>
        <img id="pm-example-overlay" src="./public/passport-ex.png" alt="여권 예시"/>
      </div>
      <div id="pm-right-after">
        <div class="modal-header">
          <span class="modal-title">여권 사본 제출하기</span>
          <button class="modal-close" onclick="PassportMask._closeAttempt()">
            <img src="./public/close_24.svg" width="24" height="24" alt="닫기"/>
          </button>
        </div>
        <div id="pm-after-guide">
          <div class="pm-notice">
            <img src="./public/mark-exclamation_o_16.svg" width="16" height="16" alt="" style="flex-shrink:0;"/>
            <p class="ty-body3">이름, 생년월일, 국적, 발급일, 만료일을 <span class="pm-notice-em">제외한 <br class="pm-notice-break"/>모든 정보를 마스킹</span>합니다.</p>
          </div>
          <div class="pm-example-wrap">
            <img src="./public/passport-ex.png" alt="여권 예시" class="pm-example-img"/>
          </div>
        </div>
        <div class="pm-toolbar">
          <label class="pm-toggle-wrap pm-mobile-only" onclick="PassportMask._toggleExample()">
            <span>예시</span>
            <button id="pm-toggle" class="pm-toggle" onclick="event.stopPropagation();PassportMask._toggleExample()">
              <span class="pm-toggle-knob"></span>
            </button>
          </label>
          <div class="pm-tool-btns">
            <button class="btn-outlined-secondary-medium2 pm-tool-btn pm-pc-only" onclick="PassportMask._reattach()">
              <img src="./public/plus_20.svg" width="20" height="20" alt=""/>재첨부
            </button>
            <button class="btn-solid-white-medium2 pm-tool-btn" onclick="PassportMask._resetMasks()">
              <img src="./public/refresh_20.svg" width="20" height="20" alt=""/>초기화
            </button>
            <button id="pm-mask-btn" class="btn-solid-primary-medium2 pm-tool-btn" onclick="PassportMask._toggleMasking()">
              <img id="pm-mask-icon" src="./public/pencil_w_20.svg" width="20" height="20" alt=""/>마스킹
            </button>
          </div>
        </div>
        <div id="pm-after-cta">
          <button class="btn-solid-cancel-large pm-mobile-only" onclick="PassportMask._reattach()">재첨부</button>
          <button class="btn-solid-black-large" onclick="PassportMask._submit()">제출하기</button>
        </div>
      </div>
    </div>

    <input type="file" id="pm-file-input" accept="image/*" style="display:none;"
      onchange="PassportMask._onFileChange(this)"/>
  </div>

</div>`
}

/* ── State switch ── */
function _showAfter(src) {
  const img = new Image()
  img.onload = () => {
    _img = img
    const MAX = 1400
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
    _canvas.width  = Math.round(img.naturalWidth  * scale)
    _canvas.height = Math.round(img.naturalHeight * scale)
    S.masks = []
    S.currentRect = null
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

/* ── Canvas draw ── */
function _draw() {
  if (!_ctx) return
  const w = _canvas.width, h = _canvas.height
  _ctx.clearRect(0, 0, w, h)

  if (!_img) return

  _ctx.drawImage(_img, 0, 0, w, h)
  _ctx.fillStyle = '#F76E33'
  for (const r of S.masks) {
    _ctx.fillRect(r.x, r.y, r.w, r.h)
  }
  if (S.drawing && S.currentRect) {
    _ctx.fillRect(S.currentRect.x, S.currentRect.y, S.currentRect.w, S.currentRect.h)
  }
}

/* ── Canvas events ── */
function _bindCanvasEvents() {
  if (!_canvas) return
  _canvas.addEventListener('mousedown',  _onPointerDown, { passive: false })
  _canvas.addEventListener('mousemove',  _onPointerMove, { passive: false })
  _canvas.addEventListener('mouseup',    _onPointerUp)
  _canvas.addEventListener('mouseleave', _onPointerUp)
  _canvas.addEventListener('touchstart', _onPointerDown, { passive: false })
  _canvas.addEventListener('touchmove',  _onPointerMove, { passive: false })
  _canvas.addEventListener('touchend',   _onPointerUp)
}

function _getPos(e) {
  const rect = _canvas.getBoundingClientRect()
  const scaleX = _canvas.width  / rect.width
  const scaleY = _canvas.height / rect.height
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top)  * scaleY,
  }
}

function _onPointerDown(e) {
  if (!S.isMasking || S.showExample) return
  e.preventDefault()
  const pos = _getPos(e)
  S.drawing = true; S.startX = pos.x; S.startY = pos.y
  S.currentRect = { x: pos.x, y: pos.y, w: 0, h: 0 }
}

function _onPointerMove(e) {
  if (!S.drawing) return
  e.preventDefault()
  const pos = _getPos(e)
  S.currentRect = {
    x: Math.min(S.startX, pos.x), y: Math.min(S.startY, pos.y),
    w: Math.abs(pos.x - S.startX), h: Math.abs(pos.y - S.startY),
  }
  _draw()
}

function _onPointerUp() {
  if (!S.drawing) return
  S.drawing = false
  if (S.currentRect && S.currentRect.w > 4 && S.currentRect.h > 4) {
    S.masks.push({ ...S.currentRect })
  }
  S.currentRect = null
  _draw()
}

/* ── Controls ── */
function _toggleExample() {
  S.showExample = !S.showExample
  const btn     = document.getElementById('pm-toggle')
  const dim     = document.getElementById('pm-example-dim')
  const overlay = document.getElementById('pm-example-overlay')
  if (btn)     btn.classList.toggle('on', S.showExample)
  if (dim)     dim.style.display     = S.showExample ? 'block' : 'none'
  if (overlay) overlay.style.display = S.showExample ? 'block' : 'none'
  if (_canvas) _canvas.style.cursor = S.showExample ? 'default' : (S.isMasking ? 'crosshair' : 'default')
}

function _resetMasks() {
  S.masks = []; S.currentRect = null; _draw()
}

function _toggleMasking() {
  S.isMasking = !S.isMasking
  const btn  = document.getElementById('pm-mask-btn')
  const icon = document.getElementById('pm-mask-icon')
  if (btn) {
    btn.classList.toggle('btn-solid-primary-medium2', S.isMasking)
    btn.classList.toggle('btn-solid-white-medium2', !S.isMasking)
  }
  if (icon) icon.src = S.isMasking ? './public/pencil_w_20.svg' : './public/pencil_20.svg'
  if (_canvas) _canvas.style.cursor = S.isMasking ? 'crosshair' : 'default'
}

function _reattach() {
  document.getElementById('pm-file-input').click()
}

function _requireMasked() {
  if (S.masks.length || S.alreadyMasked) return true
  alert('이름, 생년월일, 국적, 발급일, 만료일을 제외한 모든 정보를 마스킹해 주세요.')
  return false
}

function _closeAttempt() {
  if (!_requireMasked()) return
  close()
}

function _submit() {
  if (!_img) return
  if (!_requireMasked()) return
  const out = document.createElement('canvas')
  out.width = _img.naturalWidth; out.height = _img.naturalHeight
  const octx = out.getContext('2d')
  octx.drawImage(_img, 0, 0)
  const scaleX = _img.naturalWidth  / _canvas.width
  const scaleY = _img.naturalHeight / _canvas.height
  octx.fillStyle = '#F76E33'
  for (const r of S.masks) octx.fillRect(r.x * scaleX, r.y * scaleY, r.w * scaleX, r.h * scaleY)
  const dataUrl = out.toDataURL('image/jpeg', 0.92)
  close()
  if (typeof S.onSubmit === 'function') S.onSubmit(dataUrl)
}

/* ── File handling ── */
function _onFileChange(input) {
  const file = input.files[0]
  if (file) _readFile(file)
  input.value = ''
}

function _readFile(file) {
  const reader = new FileReader()
  reader.onload = e => _showAfter(e.target.result)
  reader.readAsDataURL(file)
}

/* ── Public API ── */
return {
  open, close,
  _toggleExample, _resetMasks, _toggleMasking,
  _reattach, _submit, _closeAttempt,
  _onFileChange,
}

})()
