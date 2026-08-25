/* ============================================================
   Aslan Hukuk — script.js v2.0
   ============================================================ */

/* === INIT ============================================== */
document.addEventListener('DOMContentLoaded', function () {
  initHamburger();
  initFAQ();
  initAccordion();
  initKararAccordion();
  initMakaleFiltre();
  initServiceShowcase();
  initBolgeSSS();
  initScrollReveal();
  initSmoothScroll();
});

window.addEventListener('load', createFloatingButtons);

/* === HAMBURGER MENU ==================================== */
function initHamburger() {
  const toggle     = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobile');
  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', function () {
    const isOpen = mobileMenu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Menüyü kapat' : 'Menüyü aç');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menüyü aç');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menüyü aç');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* === FLOATING BUTTONS ================================== */
function createFloatingButtons() {
  if (document.querySelector('.floating-buttons')) return;
  var wrap = document.createElement('div');
  wrap.className = 'floating-buttons';
  wrap.innerHTML =
    '<a href="https://wa.me/905521057400?text=Merhaba%2C%20hukuki%20deste%C4%9Fe%20ihtiyac%C4%B1m%20var."' +
    ' target="_blank" rel="noopener noreferrer"' +
    ' class="float-btn float-wa"' +
    ' aria-label="WhatsApp ile mesaj gönderin">💬</a>' +
    '<a href="tel:+905521057400"' +
    ' class="float-btn float-phone"' +
    ' aria-label="Hemen arayın">📞</a>';
  document.body.appendChild(wrap);
}

/* === FAQ =============================================== */
function initFAQ() {
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var btn   = item.querySelector('.faq-btn');
    var panel = item.querySelector('.faq-panel');
    if (!btn || !panel) return;

    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach(function (i) {
        var b = i.querySelector('.faq-btn');
        var p = i.querySelector('.faq-panel');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (p) p.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });
}

/* === BÖLGE SAYFASI SSS =================================
   Bölge sayfalarındaki (*-avukat.html) SSS akordeonu. Daha önce her
   sayfanın kendi satır içi script'indeydi; buraya taşındı. */
function initBolgeSSS() {
  var butonlar = document.querySelectorAll('.sss-soru');
  if (!butonlar.length) return;

  butonlar.forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');

    var item  = btn.closest('.sss-item');
    var cevap = item ? item.querySelector('.sss-cevap') : null;
    if (cevap && !cevap.id) {
      cevap.id = 'sss-' + Math.random().toString(36).slice(2);
      btn.setAttribute('aria-controls', cevap.id);
    }

    btn.addEventListener('click', function () {
      var acik = item.classList.contains('open');

      document.querySelectorAll('.sss-item').forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.sss-soru');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!acik) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* === SCROLL REVEAL ===================================== */
/* AOS kütüphanesinin yerini alır — dış bağımlılık yok, CSP'ye uyar.
   Gizleme CSS tarafında @media (scripting: enabled) ile korunuyor, yani
   JS çalışmazsa içerik zaten görünür kalır; burada sadece görünür hale
   getiriyoruz. */
function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Hareket azaltma tercihinde CSS zaten gizlemiyor; gözlemciyi hiç kurma.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // IntersectionObserver desteklenmiyorsa hepsini görünür yap.
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  items.forEach(function (el) { observer.observe(el); });
}

/* === ACCORDION (Makaleler) ============================= */
function initAccordion() {
  var cards = document.querySelectorAll('.makale-accordion');
  cards.forEach(function (card) {
    var btn   = card.querySelector('.makale-acc-header');
    var panel = card.querySelector('.makale-acc-body');
    if (!btn || !panel) return;

    btn.setAttribute('aria-expanded', 'false');
    var id = 'acc-' + Math.random().toString(36).slice(2);
    panel.id = id;
    btn.setAttribute('aria-controls', id);

    btn.addEventListener('click', function () {
      var isOpen = card.classList.contains('open');

      // Tüm diğer accordion'ları kapat
      cards.forEach(function (c) {
        c.classList.remove('open');
        var b = c.querySelector('.makale-acc-header');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        card.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        // Açılan karta scroll et (hafif offset)
        setTimeout(function () {
          var top = card.getBoundingClientRect().top + window.pageYOffset - 88;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }, 40);
      }
    });
  });
}

/* === FİLTRE (Makaleler Kategorisi) ==================== */
function initMakaleFiltre() {
  var btns  = document.querySelectorAll('.filtre-btn');
  var cards = document.querySelectorAll('.makale-accordion');
  if (!btns.length) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var kat = btn.getAttribute('data-filtre');
      cards.forEach(function (card) {
        if (!kat || card.getAttribute('data-cat') === kat) {
          card.style.display = '';
        } else {
          card.classList.remove('open');
          var b = card.querySelector('.makale-acc-header');
          if (b) b.setAttribute('aria-expanded', 'false');
          card.style.display = 'none';
        }
      });
    });
  });
}

/* === KARAR ACCORDION (Services) ======================== */
function initKararAccordion() {
  var items = document.querySelectorAll('.karar-acc-item');
  items.forEach(function (item) {
    var btn   = item.querySelector('.karar-acc-btn');
    var panel = item.querySelector('.karar-acc-panel');
    if (!btn || !panel) return;

    var id = 'karar-' + Math.random().toString(36).slice(2);
    panel.id = id;
    btn.setAttribute('aria-controls', id);

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* === HİZMET VİTRİNİ (liste + detay paneli) ============== */
function initServiceShowcase() {
  var items  = document.querySelectorAll('.svc-item');
  var panels = document.querySelectorAll('.svc-panel');
  if (!items.length) return;

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      var target = item.getAttribute('data-target');

      items.forEach(function (i) {
        i.classList.remove('active');
        i.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) { p.classList.remove('active'); });

      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* === SMOOTH SCROLL ===================================== */
/* Önemli: preventDefault yalnızca gerçekten var olan bir hedef için çağrılır
   ve ardından odak hedefe taşınır. Odak taşınmazsa atlama bağlantısı
   (skip-link) klavye kullanıcısı için işlevsiz kalır. */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Odağı hedefe taşı
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });

      history.replaceState(null, '', href);
    });
  });
}
