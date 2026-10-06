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

  var ITEMS = CARD_ORDER.map(function (id) {
    var s = byId[id], c = CARD_COPY[id];
    return {
      id: id,
      title: s.name.indexOf('VIC ') === 0 ? s.name : 'VIC ' + s.name,
      brand: c.brand,
      kicker: c.kicker,
      fit: c.fit,
      highlight: c.highlight,
      tags: c.tags
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
      return '<li class="cf-card" data-i="' + i + '" data-mag="3" style="--brand:' + it.brand + '">' +
        '<button type="button" class="cf-pick" data-go="' + i + '" aria-label="ดูซีรีส์ ' + esc(it.title) + '"></button>' +
        '<div class="cf-body">' +
          '<span class="cf-kicker">' + esc(it.kicker) + '</span>' +
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
  var drag = { on: false, x: 0, moved: 0 };

  function wire() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-go]');
      if (!btn) { return; }
      if (Math.abs(drag.moved) > 8) { return; }   /* ลากอยู่ ไม่ใช่คลิก */
      go(Number(btn.dataset.go));
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

    stage.addEventListener('pointerdown', function (ev) {
      if (ev.button) { return; }
      drag.on = true; drag.x = ev.clientX; drag.moved = 0;
      try { stage.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    stage.addEventListener('pointermove', function (ev) {
      if (drag.on) { drag.moved = ev.clientX - drag.x; }
    });
    stage.addEventListener('pointerup', function () {
      if (!drag.on) { return; }
      drag.on = false;
      if (Math.abs(drag.moved) > 40) { go(state.active + (drag.moved < 0 ? 1 : -1)); }
    });
    stage.addEventListener('pointercancel', function () { drag.on = false; drag.moved = 0; });
  }

  /* ------------------------------------------------------------------- init */
  build();
  wire();
  render();
})();
