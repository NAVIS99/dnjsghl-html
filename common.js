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
  window.addEventListener('scroll', checkSticky, { passive: true })
  window.addEventListener('resize', checkSticky, { passive: true })
  new MutationObserver(checkSticky).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] })
  checkSticky()
})()
