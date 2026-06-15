/* ============================================================
   SaqtaGo — Прототип: навигация и интеракции (vanilla)
   ============================================================ */

/* ---------- масштабирование устройства ---------- */
function scaleDevice() {
  const d = document.getElementById('device');
  if (!d) return;
  const pad = 20;
  const s = Math.min((window.innerWidth - pad * 2) / 418, (window.innerHeight - pad * 2) / 872, 1);
  d.style.transform = 'scale(' + s + ')';
}
window.addEventListener('resize', scaleDevice);

/* ---------- утилиты ---------- */
const money = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';

/* ---------- данные главной ---------- */
const HOME_BOXES = [
  { img:'photo-1509440159596-0249088772ff', disc:'−70%', tag:'осталось 3', logo:'ТН', name:'Пекарня «Тары-нан»', title:'Пекарский сюрприз', dist:'1,2 км', rating:'4,8', price:'990 ₸', old:'3 300 ₸', win:'20:00–21:30', go:'box' },
  { img:'photo-1517248135467-4c7edcad34c4', disc:'−65%', warn:true, logo:'Д', name:'Кофейня «Дала»', title:'Кофе + выпечка', dist:'650 м', rating:'4,9', price:'1 500 ₸', old:'4 200 ₸', win:'18:00–19:00', go:'box' },
  { img:'photo-1565958011703-44f9829ba187', disc:'−60%', tag:'осталось 2', logo:'А', name:'Ресторан «Алма»', title:'Десертный набор', dist:'1,8 км', rating:'4,7', price:'1 030 ₸', old:'2 600 ₸', win:'21:00–22:00', go:'box' },
  { img:'photo-1542838132-92c53300491e', disc:'−60%', sold:true, logo:'ГМ', name:'«Грин Маркет»', title:'Овощной бокс', dist:'2,1 км', rating:'4,6', price:'1 200 ₸', old:'3 000 ₸', win:'19:00–20:30', go:'box-soldout' },
];

function boxCardHTML(b) {
  const badge = b.warn
    ? '<span class="badge badge-warning glass glass-spec" style="background:var(--glass-tint-strong)"><span class="d"></span>Скоро закроется</span>'
    : '<span class="badge glass glass-spec" style="background:var(--glass-tint-strong)">' + (b.tag || '') + '</span>';
  return '<div class="boxcard ' + (b.sold ? 'sold' : '') + '" data-go="' + b.go + '" style="cursor:pointer;margin-bottom:14px">' +
    '<div class="photo">' +
      '<img src="https://images.unsplash.com/' + b.img + '?auto=format&fit=crop&w=700&q=72" alt="">' +
      '<div class="grad"></div>' +
      '<div class="disc"><span class="discount">' + b.disc + '</span></div>' +
      '<div class="stock">' + badge + '</div>' +
      '<div class="merchant"><span class="ava">' + b.logo + '</span><span class="nm">' + b.name + '</span></div>' +
      '<div class="sold-ov"><span>Распродан</span></div>' +
    '</div>' +
    '<div class="body">' +
      '<div class="row1"><span class="ttl">' + b.title + '</span></div>' +
      '<div class="meta"><span class="mi"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + b.dist + '</span><span class="dot"></span><span class="rating">★ ' + b.rating + '</span></div>' +
      '<div class="priceline"><span class="price">' + b.price + '</span><span class="old">' + b.old + '</span><span class="window">🕒 ' + b.win + '</span></div>' +
    '</div></div>';
}

function renderHome() {
  document.getElementById('homeList').innerHTML = HOME_BOXES.map(boxCardHTML).join('');
  // Избранное — пара сохранённых заведений
  const favEl = document.getElementById('favList');
  if (favEl) favEl.innerHTML = [HOME_BOXES[0], HOME_BOXES[2]].map(boxCardHTML).join('');
  let sk = '';
  for (let i = 0; i < 3; i++) {
    sk += '<div style="border:1px solid var(--border);border-radius:var(--r-card);overflow:hidden;margin-bottom:14px;background:var(--surface)">' +
      '<div class="skel" style="aspect-ratio:4/3;border-radius:0"></div>' +
      '<div style="padding:14px"><div class="skel" style="height:16px;width:65%"></div><div class="skel" style="height:13px;width:40%;margin-top:8px"></div><div class="skel" style="height:18px;width:50%;margin-top:12px"></div></div></div>';
  }
  document.getElementById('homeSkel').innerHTML = sk;
}

/* ---------- система экранов ---------- */
const screensEl = document.getElementById('screens');
let current = null;
const navStack = [];

function updateChrome(scr) {
  document.getElementById('statusbar').classList.toggle('light', scr.dataset.statusbar === 'light');
  const tab = scr.dataset.tab;
  const tb = document.getElementById('tabbar');
  tb.classList.toggle('show', !!tab);
  if (tab) tb.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.go === tab));
}

function showScreen(id, opts) {
  opts = opts || {};
  const next = screensEl.querySelector('[data-screen="' + id + '"]');
  if (!next) return;
  const prev = screensEl.querySelector('.screen.active');
  if (prev && prev !== next) {
    if (opts.push !== false && current) navStack.push(current);
    prev.classList.remove('active');
  }
  next.classList.add('active');
  next.scrollTop = 0;
  updateChrome(next);
  current = id;
  try { localStorage.setItem('saqtago_screen', id); } catch (e) {}
  onEnter(id);
}

function goBack() {
  const prev = navStack.pop();
  if (prev) showScreen(prev, { push: false });
}

/* ---------- хуки входа на экран ---------- */
let otpTimer = null, resendTimer = null;
function onEnter(id) {
  if (id === 'splash') setTimeout(() => { if (current === 'splash') showScreen('onboarding', { push: false }); }, 1600);
  if (id === 'home-loading') setTimeout(() => { if (current === 'home-loading') showScreen('home', { push: false }); }, 1200);
  if (id === 'otp') runOtp();
}

function runOtp() {
  const cells = document.querySelectorAll('#otpCells .cell');
  const code = ['4', '8', '2', '7'];
  cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
  if (cells[0]) cells[0].classList.add('cur');
  let i = 0;
  clearInterval(otpTimer);
  otpTimer = setInterval(() => {
    if (i >= 4) { clearInterval(otpTimer); return; }
    cells[i].textContent = code[i];
    cells[i].classList.remove('cur');
    cells[i].classList.add('filled');
    if (cells[i + 1]) cells[i + 1].classList.add('cur');
    i++;
  }, 420);
  // resend countdown
  let t = 42;
  const el = document.getElementById('resendTimer');
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    t--; if (t < 0) { clearInterval(resendTimer); el.textContent = 'Отправить снова'; el.style.color = 'var(--brand-primary)'; el.style.fontWeight = '600'; return; }
    el.textContent = 'Отправить снова через 0:' + String(t).padStart(2, '0');
  }, 1000);
}

/* ---------- тосты ---------- */
function showToast(msg, type) {
  const host = document.getElementById('toastHost');
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'success' ? ' toast-success' : type === 'danger' ? ' toast-danger' : '');
  const ic = type === 'success' ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : type === 'danger' ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  t.innerHTML = '<span class="ic">' + ic + '</span>' + msg;
  t.style.transform = 'translateY(12px)'; t.style.opacity = '0'; t.style.transition = 'all .26s';
  host.innerHTML = ''; host.appendChild(t);
  requestAnimationFrame(() => { t.style.transform = 'none'; t.style.opacity = '1'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; setTimeout(() => t.remove(), 300); }, 2200);
}

/* ---------- overlays ---------- */
function openOverlay(id) { document.getElementById(id).classList.add('show'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('show'); }

/* ---------- бронирование: сумма ---------- */
let qty = 1;
const UNIT = 990;
function updateSum() {
  const base = qty * UNIT, fee = Math.round(base * 0.03), total = base + fee;
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('qtyVal', qty); set('sumQty', qty);
  set('sumBase', money(base)); set('sumFee', money(fee));
  set('sumTotal', money(total)); set('ctaTotal', money(total));
  const pb = document.getElementById('payBtn'); if (pb) pb.textContent = 'Оплатить ' + money(total);
}

/* ---------- делегирование кликов ---------- */
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  const back = e.target.closest('[data-back]');
  const open = e.target.closest('[data-open]');
  const close = e.target.closest('[data-close]');
  const toastEl = e.target.closest('[data-toast]');

  // qty stepper
  const q = e.target.closest('[data-qty]');
  if (q) { qty = Math.max(1, Math.min(3, qty + parseInt(q.dataset.qty, 10))); updateSum();
    document.querySelector('#qtyStepper [data-qty="-1"]').disabled = qty <= 1;
    document.querySelector('#qtyStepper [data-qty="1"]').disabled = qty >= 3; return; }

  // payment
  if (e.target.closest('[data-pay]')) {
    const b = document.getElementById('payBtn');
    b.innerHTML = '<span class="spin"></span>Оплата…'; b.disabled = true;
    setTimeout(() => { b.disabled = false; b.textContent = 'Оплатить'; showScreen('success'); }, 1300);
    return;
  }

  // выбор способа оплаты
  const pm = e.target.closest('.paymethod');
  if (pm) { document.querySelectorAll('.paymethod').forEach(x => x.classList.remove('sel')); pm.classList.add('sel'); return; }

  // pickup demo
  if (e.target.closest('[data-pickup]')) {
    const badge = document.getElementById('orderBadge');
    badge.className = 'badge badge-success'; badge.innerHTML = '<span class="d"></span>Выдан';
    e.target.closest('[data-pickup]').style.display = 'none';
    document.getElementById('ratePrompt').style.display = 'block';
    showToast('Заказ выдан · можно оценить', 'success');
    return;
  }

  // rating stars
  const star = e.target.closest('[data-star]');
  if (star) {
    const n = parseInt(star.dataset.star, 10);
    document.querySelectorAll('#rateStars span').forEach((s, idx) => s.classList.toggle('on', idx < n));
    document.getElementById('ratingLow').style.display = n <= 3 ? 'block' : 'none';
    return;
  }

  // photo uploader
  if (e.target.closest('[data-addphoto]')) {
    const up = document.getElementById('uploader');
    const wrap = document.createElement('div'); wrap.className = 'thumb';
    wrap.innerHTML = '<img class="ph" src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=60"><span class="x" data-rmphoto><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>';
    up.insertBefore(wrap, up.querySelector('[data-addphoto]'));
    document.getElementById('photoErr').style.display = 'none';
    return;
  }
  if (e.target.closest('[data-rmphoto]')) { e.target.closest('.thumb').remove(); return; }

  // submit complaint
  if (e.target.closest('#submitComplaint')) {
    const hasPhoto = document.querySelectorAll('#uploader .thumb').length > 0;
    if (!hasPhoto) { document.getElementById('photoErr').style.display = 'block'; return; }
    showToast('Жалоба принята, рассмотрим', 'success');
    setTimeout(() => showScreen('orders'), 600);
    return;
  }

  // orders tabs
  const otab = e.target.closest('[data-otab]');
  if (otab) {
    document.querySelectorAll('#ordersTabs button').forEach(b => b.classList.toggle('active', b === otab));
    document.getElementById('ordersActive').style.display = otab.dataset.otab === 'active' ? 'block' : 'none';
    document.getElementById('ordersHistory').style.display = otab.dataset.otab === 'history' ? 'block' : 'none';
    return;
  }

  // language
  const lang = e.target.closest('[data-lang]');
  if (lang) { document.querySelectorAll('#langSeg button').forEach(b => b.classList.toggle('active', b === lang));
    showToast(lang.dataset.lang === 'kk' ? 'Тіл: Қазақша' : 'Язык: Русский'); return; }

  // home segment list/map handled by data-go; chips single-select
  const chip = e.target.closest('.chip');
  if (chip && chip.parentElement) {
    chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    // не return — чип может также иметь data-go
  }

  if (toastEl) { showToast(toastEl.dataset.toast, toastEl.dataset.toastType); }
  if (open) { openOverlay(open.dataset.open); return; }
  if (close) { closeOverlay(close.dataset.close); return; }
  if (back) { goBack(); return; }
  if (go) {
    if (go.dataset.go === 'booking') { qty = 1; updateSum(); }
    showScreen(go.dataset.go);
    return;
  }
});

/* закрытие overlay по тапу на затемнение */
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('show'); }));

/* ---------- карта экранов (помощник) ---------- */
const SCREEN_MAP = {
  mapGroup1: [['splash','Splash'],['onboarding','Онбординг'],['phone','Телефон'],['otp','OTP'],['permissions','Разрешения']],
  mapGroup2: [['home','Главная'],['map','Карта'],['box','Карточка бокса'],['booking','Бронь + 3%'],['payment','Оплата'],['success','Успех'],['order','Код выдачи']],
  mapGroup3: [['orders','Заказы'],['favorites','Избранное'],['order-details','Детали заказа'],['rating','Оценка'],['complaint','Жалоба + фото'],['profile','Профиль']],
  mapGroup4: [['home-loading','Главная · Loading'],['home-empty','Главная · Empty'],['home-error','Главная · Error'],['orders-empty','Заказы · Empty'],['box-soldout','Карточка · Распродан']],
};
Object.keys(SCREEN_MAP).forEach(g => {
  document.getElementById(g).innerHTML = SCREEN_MAP[g].map(([id, l]) => '<button data-jump="' + id + '">' + l + '</button>').join('');
});
document.getElementById('aidMap').onclick = () => document.getElementById('mapsheet').classList.add('show');
document.getElementById('aidRestart').onclick = () => { navStack.length = 0; showScreen('splash', { push: false }); };
document.getElementById('mapsheet').addEventListener('click', e => {
  if (e.target.closest('[data-mapclose]') || e.target.id === 'mapsheet') { document.getElementById('mapsheet').classList.remove('show'); return; }
  const j = e.target.closest('[data-jump]');
  if (j) { document.getElementById('mapsheet').classList.remove('show'); navStack.length = 0; showScreen(j.dataset.jump, { push: false }); }
});

/* ---------- поиск: разворачивание/сворачивание ---------- */
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-search-open]')) {
    document.querySelectorAll('.home-head').forEach(h => h.setAttribute('data-search', 'on'));
    return;
  }
  if (e.target.closest('[data-search-close]')) {
    document.querySelectorAll('.home-head').forEach(h => h.setAttribute('data-search', 'off'));
    return;
  }
});

/* ---------- коллапс шапки при скролле вниз; показ — при любом скролле вверх ---------- */
(function setupHomeCollapse() {
  const home = screensEl.querySelector('[data-screen="home"]');
  if (!home) return;
  const head = home.querySelector('.home-head');
  if (!head) return;
  let lastY = 0, raf = null;
  function update() {
    raf = null;
    if (head.dataset.search === 'on') return;
    const y = home.scrollTop;
    const dy = y - lastY;
    if (y <= 4) {
      // покой: показано, без блюра
      head.dataset.collapsed = 'false';
      head.dataset.blur = 'off';
    } else if (dy < -4) {
      // скрол вверх в любой точке (не на самом верху): показано + лёгкий блюр
      head.dataset.collapsed = 'false';
      head.dataset.blur = 'on';
    } else if (dy > 4 && y > 56) {
      // скрол вниз ниже порога: скрыто
      head.dataset.collapsed = 'true';
      head.dataset.blur = 'off';
    }
    lastY = y;
  }
  home.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
})();

/* ---------- init ---------- */
renderHome();
updateSum();
scaleDevice();
showScreen('splash', { push: false });
