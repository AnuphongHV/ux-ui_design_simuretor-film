/* ==========================================================================
   VIC FILM STUDIO — carousel การ์ดซีรีส์ฟิล์ม (cards.html)
   ใช้ตำแหน่งจาก CSS custom property ทั้งหมด JS แค่บอกว่าใบไหนอยู่ช่องไหน
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };

  var stage  = $('#cfStage');
  var track  = $('#cfTrack');
  var dotBox = $('#cfDots');
  var status = $('#cfStatus');
  var glowLayers = Array.prototype.slice.call(document.querySelectorAll('.cf-glow-l'));

  var state = { active: 0, glowSlot: 0 };

  /* ---------------------------------------------------------- เตรียมข้อมูล */
  var byId = {};
  SERIES.forEach(function (s) { byId[s.id] = s; });

  /* ค่าสีถูกยัดลง inline style จึงต้องกรองก่อน ไม่ปล่อยสตริงอิสระผ่าน */
  function hex(v) { return /^#[0-9a-f]{3,8}$/i.test(String(v)) ? String(v) : '#666666'; }

  /* path รูปก็ลงไปอยู่ใน src จึงต้องกรองด้วย allow-list เหมือนกัน */
  function img(v) {
    return /^assets\/img\/[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(String(v)) ? String(v) : '';
  }

  /* เลือกสีตัวอักษรบนแผ่นจากความสว่างจริงของสีแบรนด์ ไม่ฮาร์ดโค้ดรายซีรีส์
     ถ้าลูกค้าเปลี่ยนสีในตารางเมื่อไร ตัวอักษรจะพลิกตามเอง
     จุดตัด .1791 คือจุดที่ตัวอักษรดำกับขาวให้ contrast เท่ากันพอดี */
  function inkOn(h) {
    var s = h.slice(1);
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    if (s.length < 6) return '#fff';
    var y = [0, 2, 4].map(function (i) {
      var v = parseInt(s.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return (0.2126 * y[0] + 0.7152 * y[1] + 0.0722 * y[2]) > 0.1791 ? '#000' : '#fff';
  }

  var ITEMS = CARD_ORDER.map(function (id) {
    var s = byId[id], c = CARD_COPY[id];
    /* แสดงเฉพาะท่อนแรก ตัดที่จุลภาคตัวแรก
       ท่อนหลังยังอยู่ครบใน CARD_COPY[].define เผื่ออยากเอากลับมา */
    var cut  = c.define.indexOf(',');
    var lead = (cut < 0 ? c.define : c.define.slice(0, cut)).trim();
    var brand = hex(c.brand);
    return {
      id: id,
      title: s.name.indexOf('VIC ') === 0 ? s.name : 'VIC ' + s.name,
      brand: brand,
      ink: inkOn(brand),         /* สีตัวอักษรบนแผ่น พลิกตามความสว่างของสีแบรนด์ */
      photo: img(c.photo),
      eyebrow: s.badge,          /* ใช้ของเดิมจาก SERIES ไม่สร้างซ้ำ */
      lead: lead,
      best: !!c.best,
      fit: c.fit,
      highlight: c.highlight,
      tags: c.tags.slice(1)      /* ตัวแรกคือชื่อซีรีส์ ซ้ำกับ eyebrow ด้านบน */
    };
  });

  var N = ITEMS.length;
  var cards = [], dots = [];

  /* ------------------------------------------------------------- สร้าง DOM */
  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  function build() {
    track.innerHTML = ITEMS.map(function (it, i) {
      return '<li class="cf-card" data-i="' + i + '" data-mag="3" style="--brand:' + it.brand + ';--ink:' + it.ink + '">' +
        (it.photo
          ? '<img class="cf-photo" src="' + esc(it.photo) + '" alt="" loading="lazy" decoding="async">'
          : '') +
        '<button type="button" class="cf-pick" data-go="' + i + '" aria-label="ดูซีรีส์ ' + esc(it.title) + '"></button>' +
        '<div class="cf-body">' +
          /* แถวเดียว: กรอบคำจำกัดความชิดซ้าย ป้ายชิดขวา
             ใช้ flex แทน absolute เพื่อให้กรอบเริ่มระดับเดียวกันทุกใบ
             และให้ flexbox กันการทับกันเองที่จอแคบ */
          '<div class="cf-head">' +
            '<div class="cf-top">' +
              '<span class="cf-eyebrow">' + esc(it.eyebrow) + '</span>' +
              '<p class="cf-tagline">' + esc(it.lead) + '</p>' +
            '</div>' +
            (it.best
              ? '<span class="cf-flag">' +
                  '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>' +
                  'BEST SELLER' +
                '</span>'
              : '') +
          '</div>' +
          '<div class="cf-info">' +
            '<h2 class="cf-name">' + esc(it.title) + '</h2>' +
            '<div class="cf-detail"><div class="cf-detail-in">' +
              '<p class="cf-label">เหมาะกับ</p>' +
              '<p class="cf-value">' + esc(it.fit) + '</p>' +
              '<p class="cf-label">จุดเด่น</p>' +
              '<p class="cf-value">' + esc(it.highlight) + '</p>' +
              '<ul class="cf-tags">' + it.tags.map(function (t) {
                return '<li>' + esc(t) + '</li>';
              }).join('') + '</ul>' +
            '</div></div>' +
            '<a class="cf-cta" href="index.html#step3">ดูรุ่นนี้ ' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</li>';
    }).join('');

    dotBox.innerHTML = ITEMS.map(function (it, i) {
      return '<button type="button" class="cf-dot" role="tab" data-go="' + i + '"' +
             ' aria-selected="false" tabindex="-1" aria-label="' + esc(it.title) + '"></button>';
    }).join('');

    cards = Array.prototype.slice.call(track.children);
    dots  = Array.prototype.slice.call(dotBox.children);
  }

  /* ----------------------------------------------------------------- วาดผล */
  function paintGlow(hex) {
    state.glowSlot ^= 1;
    var incoming = glowLayers[state.glowSlot];
    var outgoing = glowLayers[state.glowSlot ^ 1];
    /* ทาสีตอนชั้นนี้ยัง opacity:0 → เบลอถูก rasterize ครั้งเดียวโดยไม่มีใครเห็น
       ช่วงเปลี่ยนสีจึงขยับแค่ opacity (compositor ล้วน ไม่ repaint) */
    incoming.style.setProperty('--g', hex);
    incoming.classList.add('is-on');
    if (outgoing) { outgoing.classList.remove('is-on'); }
  }

  function render() {
    cards.forEach(function (el, i) {
      var d = i - state.active;
      if (d >  N / 2) { d -= N; }
      if (d < -N / 2) { d += N; }

      var mag = Math.min(3, Math.abs(d));
      var dir = d === 0 ? 0 : (d > 0 ? 1 : -1);
      var prevDir = Number(el.style.getPropertyValue('--dir') || 0);

      /* ข้ามจากฝั่งหนึ่งไปอีกฝั่ง = เทเลพอร์ต ต้องปิด transition ไม่ให้วิ่งข้ามจอ */
      var jump = prevDir !== 0 && dir !== 0 && prevDir !== dir;
      if (jump) { el.classList.add('is-jump'); void el.offsetWidth; }

      el.style.setProperty('--dir', dir);
      el.dataset.mag = String(mag);

      if (jump) {
        void el.offsetWidth;
        requestAnimationFrame(function () { el.classList.remove('is-jump'); });
      }

      var hidden = mag >= 3;
      var pick = el.querySelector('.cf-pick');
      var cta  = el.querySelector('.cf-cta');
      pick.disabled = hidden;
      pick.tabIndex = (mag === 0 || hidden) ? -1 : 0;
      cta.tabIndex  = mag === 0 ? 0 : -1;
      el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });

    dots.forEach(function (d, i) {
      var on = i === state.active;
      d.setAttribute('aria-selected', on ? 'true' : 'false');
      d.tabIndex = on ? 0 : -1;
    });

    var cur = ITEMS[state.active];
    paintGlow(cur.brand);
    status.textContent = (state.active + 1) + ' จาก ' + N + ' — ' + cur.title;
  }

  function go(i) {
    var next = ((i % N) + N) % N;
    if (next === state.active) { return; }
    state.active = next;
    render();
  }

  /* ------------------------------------------------------------- ปฏิสัมพันธ์ */
  var drag = { on: false, x: 0, moved: 0, id: null, captured: false };

  function wire() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-go]');
      if (!btn) { return; }
      if (Math.abs(drag.moved) > 8) { return; }   /* ลากอยู่ ไม่ใช่คลิก */
      go(Number(btn.dataset.go));
    });

    /* ปุ่มลูกศรในหัวเรื่อง — ใช้ go() ตัวเดียวกับ dot/คีย์บอร์ด ไม่สร้างทางเดินใหม่ */
    document.addEventListener('click', function (ev) {
      var nav = ev.target.closest('[data-nav]');
      if (!nav) { return; }
      go(state.active + (nav.dataset.nav === 'next' ? 1 : -1));
    });

    function keyNav(ev) {
      var k = ev.key;
      if (k === 'ArrowLeft')  { go(state.active - 1); ev.preventDefault(); }
      else if (k === 'ArrowRight') { go(state.active + 1); ev.preventDefault(); }
      else if (k === 'Home')  { go(0); ev.preventDefault(); }
      else if (k === 'End')   { go(N - 1); ev.preventDefault(); }
      else { return; }
      if (document.activeElement && document.activeElement.classList.contains('cf-dot')) {
        dots[state.active].focus();
      }
    }
    stage.addEventListener('keydown', keyNav);
    dotBox.addEventListener('keydown', keyNav);

    /* จับ pointer เฉพาะตอนที่ลากจริงเท่านั้น
       ถ้า setPointerCapture ตั้งแต่ pointerdown เบราว์เซอร์จะย้าย target ของ
       event click มาที่ตัวเวที ปุ่มบนการ์ดใบข้างจึงกดไม่ติด */
    stage.addEventListener('pointerdown', function (ev) {
      if (ev.button) { return; }
      drag.on = true; drag.x = ev.clientX; drag.moved = 0;
      drag.id = ev.pointerId; drag.captured = false;
    });
    stage.addEventListener('pointermove', function (ev) {
      if (!drag.on) { return; }
      drag.moved = ev.clientX - drag.x;
      if (!drag.captured && Math.abs(drag.moved) > 8) {
        drag.captured = true;
        try { stage.setPointerCapture(drag.id); } catch (e) {}
      }
    });
    stage.addEventListener('pointerup', function () {
      if (!drag.on) { return; }
      drag.on = false;
      if (Math.abs(drag.moved) > 40) { go(state.active + (drag.moved < 0 ? 1 : -1)); }
    });
    stage.addEventListener('pointercancel', function () {
      drag.on = false; drag.captured = false; drag.moved = 0;
    });
  }

  /* ------------------------------------------------------------------- init */
  build();
  wire();
  render();
})();
