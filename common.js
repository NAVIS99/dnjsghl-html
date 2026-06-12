/* ── Shared constants ── */
const EMAIL_DOMAINS = ['@naver.com','@daum.com','@gmail.com','@outlook.com','@hotmail.com','@icloud.com']

/* ── Email & Birth utils ── */
window.isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
window.fmtBirth = (b) => b.length <= 4 ? b : b.length <= 6 ? `${b.slice(0,4)}.${b.slice(4)}` : `${b.slice(0,4)}.${b.slice(4,6)}.${b.slice(6)}`
window.getEmailSuggestions = (email) => {
  const atIdx = email.indexOf('@')
  if (atIdx < 0) return []
  const after = email.slice(atIdx)
  return EMAIL_DOMAINS.filter(d => d.startsWith(after) && d !== after)
}

/* ── Toast ── */
;(function(){
  let _t1, _t2
  window.showToast = function(msg) {
    const wrap = document.getElementById('toast-wrap')
    const el   = document.getElementById('toast-msg')
    if (!wrap || !el) return
    el.textContent = msg
    el.className = 'toast toast-enter'
    wrap.style.display = 'flex'
    clearTimeout(_t1); clearTimeout(_t2)
    _t1 = setTimeout(function(){ el.className = 'toast toast-leave' }, 2700)
    _t2 = setTimeout(function(){ wrap.style.display = 'none' }, 3100)
  }
})()

/* ── Sticky CTA detection ── */
;(function(){
  function checkSticky() {
    document.querySelectorAll('.sticky-cta, .inline-btn-wrap, .btn-sticky').forEach(function(el) {
      el.classList.toggle('is-stuck', Math.round(el.getBoundingClientRect().bottom) >= window.innerHeight)
    })
  }
  window.addEventListener('scroll', checkSticky, { passive: true })
  window.addEventListener('resize', checkSticky, { passive: true })
  new MutationObserver(checkSticky).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] })
  checkSticky()
})()
