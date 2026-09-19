/* ==========================================================================
   VIC FILM STUDIO — Film Simulator (frontend demo)
   ปฏิสัมพันธ์ทั้งหมดทำงานฝั่งหน้าเว็บ ไม่มีการเรียก API
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var state = {
    need: 'balanced',
    carType: 'sedan-m',
    pos: 'both',
    sunroof: 'no',
    angle: '45',
    phase: 'after',      /* before | after */
    front: 'ECO60',
    around: 'MC80',
    target: 'front',     /* ปลายทางของ popup Price List */
    tod: 'day',
    split: 0.5
  };

  /* ---------------------------------------------------------------- helpers */
  function entry(code) { return BY_ID[code]; }
  function angleDef(id) { return ANGLES.filter(function (a) { return a.id === id; })[0]; }
  function needDef(id) { return NEEDS.filter(function (n) { return n.id === id; })[0]; }

  /* ความทึบของกระจก: VLT ต่ำ = ทึบมาก */
  function alphaFor(vlt) { return Math.min(0.94, Math.max(0.12, 1 - vlt / 100)); }

  function paint(vlt, tone) {
    var a = alphaFor(vlt);
    return 'rgba(' + tone[0] + ',' + tone[1] + ',' + tone[2] + ',' + a.toFixed(3) + ')';
  }

  /* สีชิปตัวอย่าง = ผลลัพธ์แบบ multiply บนพื้นเทาอ่อน */
  function chipColor(vlt, tone) {
    var a = alphaFor(vlt), base = [200, 203, 207];
    return 'rgb(' + base.map(function (b, i) {
      return Math.round(b * (1 - a) + (b * tone[i] / 255) * a);
    }).join(',') + ')';
  }

  /* ฟิล์มที่ใช้จริงบนแต่ละตำแหน่ง โดยคิดจาก "ตำแหน่งที่จะติด" ในขั้นที่ 2 */
  function active(side) {
    var wanted = (side === 'front') ? (state.pos !== 'around') : (state.pos !== 'front');
    if (!wanted || state.phase === 'before') {
      return { series: { tone: FACTORY_GLASS.tone, badge: '', name: FACTORY_GLASS.name, warranty: 0, price: '—' },
               model: FACTORY_GLASS, applied: false };
    }
    var e = entry(side === 'front' ? state.front : state.around);
    return { series: e.series, model: e.model, applied: true };
  }

  function enabledSide(side) {
    return (side === 'front') ? (state.pos !== 'around') : (state.pos !== 'front');
  }

  /* ---------------------------------------------------------------- step 1 */
  var SPARK = '<svg class="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"/></svg>';

  function buildNeeds() {
    $('#needGrid').innerHTML = NEEDS.map(function (n) {
      return '<label class="choice">' +
        '<input type="radio" name="need" value="' + n.id + '"' + (n.id === state.need ? ' checked' : '') + '>' +
        '<span class="choice-body">' + (n.sparkle ? SPARK : '') +
          '<h3>' + n.title + '</h3><p>' + n.desc + '</p>' +
        '</span></label>';
    }).join('');
  }

  function renderReco() {
    var n = needDef(state.need);
    var f = entry(n.front.model), r = entry(n.rear.model);
    $('#recoFrontDensity').textContent = 'ความเข้มฟิล์มแนะนำ ' + n.front.density;
    $('#recoFrontModel').textContent  = 'รุ่นฟิล์มแนะนำ ' + n.front.label + ' · แสงส่องผ่าน ' + f.model.vlt + '%';
    $('#recoRearDensity').textContent = 'ความเข้มฟิล์มแนะนำ ' + n.rear.density;
    $('#recoRearModel').textContent   = 'รุ่นฟิล์มแนะนำ ' + n.rear.label + ' · แสงส่องผ่าน ' + r.model.vlt + '%';
  }

  /* ---------------------------------------------------------------- step 2 */
  function buildCarTypes() {
    $('#carType').innerHTML = CAR_TYPES.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === state.carType ? ' selected' : '') + '>' + c.name + '</option>';
    }).join('');
  }

  /* ---------------------------------------------------------------- step 3 */
  function buildAngles() {
    $('#angleBar').innerHTML = ANGLES.map(function (a) {
      return '<button type="button" class="angle-btn" data-angle="' + a.id + '" aria-pressed="' +
             (a.id === state.angle) + '">' + a.label + '</button>';
    }).join('');
  }

  function buildSwatches(side) {
    var box = $('[data-swatches="' + side + '"]');
    var cur = entry(side === 'front' ? state.front : state.around);
    var items = [{ code: FACTORY_GLASS.code, vlt: FACTORY_GLASS.vlt, tone: FACTORY_GLASS.tone, factory: true }]
      .concat(cur.series.models.map(function (m) { return { code: m.code, vlt: m.vlt, tone: cur.series.tone }; }));

    box.innerHTML = items.map(function (it, i) {
      var checked = it.factory ? (state.phase === 'before') : (!!(!it.factory && it.code === cur.model.code && state.phase === 'after'));
      return '<label class="swatch">' +
        '<input type="radio" name="sw-' + side + '" value="' + it.code + '" data-side="' + side + '" data-idx="' + i + '"' +
          (checked ? ' checked' : '') + (enabledSide(side) ? '' : ' disabled') + '>' +
        '<span class="swatch-body">' +
          '<span class="swatch-chip" style="background:' + chipColor(it.vlt, it.tone) + '">' +
            '<span class="tick"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16161a" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5"/></svg></span>' +
          '</span>' +
          '<span class="swatch-meta"><b class="c">' + it.code + '</b><span class="v">' +
            (it.factory ? '~' : '') + it.vlt + '% VLT</span></span>' +
        '</span></label>';
    }).join('');

    var idx = items.findIndex(function (it) { return it.code === (state.phase === 'before' ? FACTORY_GLASS.code : cur.model.code); });
    var range = $('[data-range="' + side + '"]');
    range.max = items.length - 1;
    range.value = idx < 0 ? 0 : idx;
    range.disabled = !enabledSide(side);
  }

  function renderStage() {
    var a = angleDef(state.angle);
    var img = $('#carPhoto');
    if (img.getAttribute('src') !== a.img) { img.src = a.img; }
    img.alt = 'ภาพรถมุม ' + a.label + ' สำหรับจำลองผลของฟิล์ม';

    ['front', 'around'].forEach(function (side) {
      var g = $(side === 'front' ? '#tintFront' : '#tintAround');
      var act = active(side);
      var fill = paint(act.model.vlt, act.series.tone || FACTORY_GLASS.tone);
      g.innerHTML = a[side === 'front' ? 'front' : 'around'].map(function (pts) {
        return '<polygon points="' + pts + '" fill="' + fill + '"></polygon>';
      }).join('');
    });

    $$('#angleBar .angle-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.angle === state.angle));
    });

    var visNote = 'มุมนี้เห็น: ' + a.visible;
    var f = active('front'), r = active('around');
    $('#stageNote').textContent = visNote + ' · ' +
      (state.phase === 'before' ? 'กำลังแสดงกระจกเดิมก่อนติดฟิล์ม'
        : 'บานหน้า ' + (f.applied ? f.model.code : 'ไม่ติด') + ' · รอบคัน ' + (r.applied ? r.model.code : 'ไม่ติด'));
  }

  function renderBadges() {
    var f = active('front'), r = active('around');
    $('#badgeFront').innerHTML  = 'กำลังปรับบานหน้า · <b>' + (f.applied ? f.model.code : 'ไม่ติด') + '</b>';
    $('#badgeAround').innerHTML = 'กำลังปรับรอบคัน · <b>' + (r.applied ? r.model.code : 'ไม่ติด') + '</b>';
  }

  function renderSpecs() {
    [['front', '#specFrontTitle', '#specFrontList', 'บานหน้า'],
     ['around', '#specAroundTitle', '#specAroundList', 'รอบคัน']].forEach(function (row) {
      var act = active(row[0]);
      var m = act.model;
      $(row[1]).innerHTML = (act.applied ? m.code + ' · ' + m.density + '%' : 'กระจกเดิม') +
                            ' <small>' + row[3] + '</small>';
      $(row[2]).innerHTML = act.applied
        ? '<li>ลดความร้อน TSER ' + m.tser + '%</li><li>แสงส่องผ่าน VLT ' + m.vlt + '%</li><li>ป้องกัน UV 99%</li>'
        : '<li>แสงส่องผ่าน ~' + FACTORY_GLASS.vlt + '%</li><li>ยังไม่ได้ติดฟิล์ม</li><li>—</li>';
    });
  }

  function renderPickerFeet() {
    ['front', 'around'].forEach(function (side) {
      var foot = $(side === 'front' ? '#footFront' : '#footAround');
      var picker = $('.picker[data-target="' + side + '"]');
      picker.style.opacity = enabledSide(side) ? '' : '.45';
      picker.querySelector('button[data-open-pricelist]').disabled = !enabledSide(side);
      if (!enabledSide(side)) { foot.textContent = 'ไม่ได้เลือกติดตำแหน่งนี้'; return; }
      var e = entry(side === 'front' ? state.front : state.around);
      foot.innerHTML = '<b>' + e.model.code + '</b> · รับประกัน ' + e.series.warranty + ' ปี';
    });
  }

  /* ---------------------------------------------------------------- step 4 */
  function renderSummary() {
    ['front', 'around'].forEach(function (side) {
      var on = enabledSide(side);
      var e = entry(side === 'front' ? state.front : state.around);
      var pfx = side === 'front' ? '#sumFront' : '#sumAround';
      $(pfx + 'Vlt').textContent  = on ? e.model.vlt + '%' : 'ไม่ได้ติด';
      $(pfx + 'Tser').textContent = on ? e.model.tser + '%' : '—';
      $(pfx + 'Code').textContent = on ? e.model.code : '—';
    });

    var fe = entry(state.front), re = entry(state.around);
    var both = state.pos === 'both';
    var note;
    if (!both) {
      note = 'เลือกติดเฉพาะ' + (state.pos === 'front' ? 'บานหน้า' : 'รอบคัน') + ' ราคาต้องให้เจ้าหน้าที่คำนวณตามขนาดรถ';
    } else if (fe.series.id !== re.series.id) {
      note = 'บานหน้าและรอบคันเป็นคนละซีรี่ส์ ราคารวมต้องให้เจ้าหน้าที่คำนวณให้';
    } else {
      note = 'ทั้งคันเป็นซีรี่ส์ ' + fe.series.badge + ' (' + fe.series.price + ') ราคาจริงขึ้นกับขนาดรถ';
    }
    if (state.sunroof === 'yes') { note += ' · มีซันรูฟ คิดเพิ่มแยกรายการ'; }
    $('#priceNote').textContent = note;
  }

  function summaryText() {
    var car = CAR_TYPES.filter(function (c) { return c.id === state.carType; })[0];
    var n = needDef(state.need);
    var L = ['สรุปชุดฟิล์ม — VIC Film Studio',
             'รถ: ' + car.name + (state.sunroof === 'yes' ? ' (มีซันรูฟ)' : ' (ไม่มีซันรูฟ)'),
             'ความต้องการ: ' + n.title,
             'ตำแหน่ง: ' + ({ front: 'เฉพาะบานหน้า', around: 'รอบคัน', both: 'บานหน้า + รอบคัน' })[state.pos]];
    ['front', 'around'].forEach(function (side) {
      if (!enabledSide(side)) { return; }
      var e = entry(side === 'front' ? state.front : state.around);
      L.push((side === 'front' ? 'บานหน้า' : 'รอบคัน') + ': ' + e.series.badge + ' ' + e.model.code +
             ' · แสงผ่าน ' + e.model.vlt + '% · TSER ' + e.model.tser + '% · UV 99% · รับประกัน ' + e.series.warranty + ' ปี');
    });
    L.push('ราคา: รบกวนเจ้าหน้าที่คำนวณตามขนาดรถ');
    L.push('(ข้อมูลจากหน้าเว็บตัวอย่าง ตัวเลขเป็นข้อมูลสมมติ)');
    return L.join('\n');
  }

  /* ---------------------------------------------------------- popup: ราคา */
  function buildPricelist() {
    $('#pricelistBody').innerHTML = SERIES.map(function (s, i) {
      return '<section class="series">' +
        '<button type="button" class="series-head" data-series="' + s.id + '" aria-expanded="false" aria-controls="ms-' + s.id + '">' +
          '<span class="sh-txt"><span class="badge">' + s.badge + '</span><span class="nm">' + s.name + '</span><span class="pr">' + s.price + '</span></span>' +
          '<span class="chev" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span>' +
        '</button>' +
        '<div class="series-models" id="ms-' + s.id + '" hidden>' +
          '<p class="series-note">' + s.note + ' · รับประกัน ' + s.warranty + ' ปี</p>' +
          s.models.map(function (m) {
            return '<button type="button" class="model" data-model="' + m.code + '">' +
              '<span class="sw" style="background:' + chipColor(m.vlt, s.tone) + '"></span>' +
              '<span class="md-txt"><span class="mc">' + m.code + '</span><span class="mv">ความเข้ม ' + m.density + '% · แสงผ่าน ' + m.vlt + '%</span></span>' +
              '<span class="mt"><b>TSER ' + m.tser + '%</b>UV 99%</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</section>';
    }).join('');
    markCurrentModel();
  }

  function markCurrentModel() {
    var cur = state.target === 'front' ? state.front : state.around;
    $$('#pricelistBody .model').forEach(function (b) {
      b.setAttribute('aria-current', String(b.dataset.model === cur));
    });
  }

  function openPricelist(side) {
    state.target = side;
    $('#pricelistFor').textContent = side === 'front' ? 'บานหน้า' : 'รอบคัน';
    markCurrentModel();
    /* เปิดซีรี่ส์ของรุ่นที่ใช้อยู่ให้อัตโนมัติ */
    var curSeries = entry(side === 'front' ? state.front : state.around).series.id;
    $$('#pricelistBody .series-head').forEach(function (h) { setSeriesOpen(h, h.dataset.series === curSeries); });
    $('#pricelist').showModal();
  }

  function setSeriesOpen(head, open) {
    head.setAttribute('aria-expanded', String(open));
    $('#ms-' + head.dataset.series).hidden = !open;
  }

  /* ------------------------------------------------------ popup: ภายในรถ */
  var TOD = {
    day:   { sky0: '#7fb6e6', sky1: '#d9ebf7', orb: '#fff6d8', orbR: 30, orbX: 720, orbY: 130,
             hills: '#9db98f', field: '#b6c9a3', road0: '#8d8d92', road1: '#5c5c62', dash: '#f0e6c8', edge: .85, lamps: 0 },
    night: { sky0: '#070d20', sky1: '#182543', orb: '#e8eef8', orbR: 17, orbX: 762, orbY: 108,
             hills: '#141d33', field: '#101725', road0: '#282d3a', road1: '#171b24', dash: '#48526a', edge: .34, lamps: .17 }
  };

  function renderInterior() {
    var t = TOD[state.tod];
    $('#sky0').setAttribute('stop-color', t.sky0);
    $('#sky1').setAttribute('stop-color', t.sky1);
    var orb = $('#sunMoon');
    orb.setAttribute('fill', t.orb); orb.setAttribute('r', t.orbR);
    orb.setAttribute('cx', t.orbX);  orb.setAttribute('cy', t.orbY);
    $('#hills').setAttribute('fill', t.hills);
    $('#field').setAttribute('fill', t.field);
    $('#road0').setAttribute('stop-color', t.road0);
    $('#road1').setAttribute('stop-color', t.road1);
    $('#dashes').setAttribute('fill', t.dash);
    $('#edgeL').setAttribute('opacity', t.edge);
    $('#edgeR').setAttribute('opacity', t.edge);
    var lamps = $('#headlights'); if (lamps) { lamps.setAttribute('opacity', t.lamps); }

    /* ชั้นฟิล์ม — ใช้ฟิล์มบานหน้าที่เลือกไว้ */
    var e = entry(state.front);
    var on = enabledSide('front');
    var film = $('#tintFilm');
    var x = Math.round(state.split * 960);
    film.setAttribute('x', x);
    film.setAttribute('width', Math.max(0, 960 - x));
    film.setAttribute('fill', 'rgb(' + e.series.tone.join(',') + ')');
    film.setAttribute('opacity', on ? alphaFor(e.model.vlt).toFixed(3) : '0');

    $('#compareLine').style.left = (state.split * 100) + '%';
    $('#compareHandle').style.left = (state.split * 100) + '%';

    $('#intBadgeFront').innerHTML  = 'กำลังปรับบานหน้า · <b>' + (on ? entry(state.front).model.code : 'ไม่ติด') + '</b>';
    $('#intBadgeAround').innerHTML = 'กำลังปรับรอบคัน · <b>' + (enabledSide('around') ? entry(state.around).model.code : 'ไม่ติด') + '</b>';
    $('#intTagCode').textContent = on ? e.model.code + ' · TSER ' + e.model.tser + '%' : 'ยังไม่ติดบานหน้า';
    $('#compareCapRight').textContent = on ? 'ขวา · หลังติด ' + e.model.code : 'ขวา · ไม่ได้ติดบานหน้า';
  }

  function dragSplit(clientX) {
    var box = $('#compare').getBoundingClientRect();
    state.split = Math.min(0.96, Math.max(0.04, (clientX - box.left) / box.width));
    renderInterior();
  }

  /* ------------------------------------------------------------- render all */
  function render() {
    renderReco();
    buildSwatches('front');
    buildSwatches('around');
    renderStage();
    renderBadges();
    renderSpecs();
    renderPickerFeet();
    renderSummary();
    if ($('#interior').open) { renderInterior(); }
  }

  /* -------------------------------------------------------------- listeners */
  function wire() {
    document.addEventListener('change', function (ev) {
      var el = ev.target;
      if (el.name === 'need')    { state.need = el.value; renderReco(); return; }
      if (el.id === 'carType')   { state.carType = el.value; renderSummary(); return; }
      if (el.name === 'pos')     { state.pos = el.value; render(); return; }
      if (el.name === 'sunroof') { state.sunroof = el.value; renderSummary(); return; }
      if (el.name === 'ba')      { state.phase = el.value; render(); return; }
      if (el.name === 'tod')     { state.tod = el.value; renderInterior(); return; }

      if (el.dataset.side) {                       /* swatch */
        if (el.value === FACTORY_GLASS.code) { state.phase = 'before'; }
        else { state.phase = 'after'; state[el.dataset.side === 'front' ? 'front' : 'around'] = el.value; }
        syncPhaseRadio(); render(); return;
      }
    });

    document.addEventListener('input', function (ev) {
      var el = ev.target;
      if (!el.dataset.range) { return; }
      var side = el.dataset.range;
      var cur = entry(side === 'front' ? state.front : state.around);
      var i = Number(el.value);
      if (i === 0) { state.phase = 'before'; }
      else { state.phase = 'after'; state[side] = cur.series.models[i - 1].code; }
      syncPhaseRadio(); render();
    });

    document.addEventListener('click', function (ev) {
      var t = ev.target;

      var angleBtn = t.closest('[data-angle]');
      if (angleBtn) { state.angle = angleBtn.dataset.angle; renderStage(); return; }

      var openBtn = t.closest('[data-open-pricelist]');
      if (openBtn) { openPricelist(openBtn.dataset.openPricelist); return; }

      var head = t.closest('.series-head');
      if (head) { setSeriesOpen(head, head.getAttribute('aria-expanded') !== 'true'); return; }

      var model = t.closest('.model');
      if (model) {
        state.phase = 'after';
        state[state.target] = model.dataset.model;
        syncPhaseRadio(); markCurrentModel(); render();
        $('#pricelist').close();
        return;
      }

      if (t.closest('#pricelistExpandAll')) {
        var heads = $$('#pricelistBody .series-head');
        var anyClosed = heads.some(function (h) { return h.getAttribute('aria-expanded') !== 'true'; });
        heads.forEach(function (h) { setSeriesOpen(h, anyClosed); });
        return;
      }

      if (t.closest('[data-close-dialog]')) { t.closest('dialog').close(); return; }

      if (t.closest('#tabInterior')) {
        $('#tabInterior').setAttribute('aria-pressed', 'true');
        $('#tabExterior').setAttribute('aria-pressed', 'false');
        renderInterior();
        $('#interior').showModal();
        return;
      }
      if (t.closest('#tabExterior')) {
        $('#tabExterior').setAttribute('aria-pressed', 'true');
        $('#tabInterior').setAttribute('aria-pressed', 'false');
        return;
      }

      if (t.closest('#applyReco')) {
        var n = needDef(state.need);
        state.front = n.front.model; state.around = n.rear.model; state.phase = 'after';
        syncPhaseRadio(); render();
        $('#step3').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (t.closest('#copyBtn')) { doCopy(); return; }
    });

    /* ปิด popup เมื่อคลิกนอกกล่อง */
    $$('dialog').forEach(function (d) {
      d.addEventListener('click', function (ev) { if (ev.target === d) { d.close(); } });
      d.addEventListener('close', function () {
        if (d.id === 'interior') {
          $('#tabExterior').setAttribute('aria-pressed', 'true');
          $('#tabInterior').setAttribute('aria-pressed', 'false');
        }
      });
    });

    /* ลากเส้นเทียบภาพภายใน */
    var handle = $('#compareHandle'), dragging = false;
    handle.addEventListener('pointerdown', function (ev) {
      dragging = true; handle.setPointerCapture(ev.pointerId); ev.preventDefault();
    });
    handle.addEventListener('pointermove', function (ev) { if (dragging) { dragSplit(ev.clientX); } });
    handle.addEventListener('pointerup', function () { dragging = false; });
    handle.addEventListener('keydown', function (ev) {
      var step = ev.shiftKey ? 0.1 : 0.04;
      if (ev.key === 'ArrowLeft')  { state.split = Math.max(0.04, state.split - step); renderInterior(); ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { state.split = Math.min(0.96, state.split + step); renderInterior(); ev.preventDefault(); }
    });
    $('#compare').addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.compare-handle, .compare-foot')) { return; }
      dragSplit(ev.clientX);
    });
  }

  function syncPhaseRadio() {
    $$('input[name="ba"]').forEach(function (r) { r.checked = (r.value === state.phase); });
  }

  function doCopy() {
    var text = summaryText(), note = $('#copyNote');
    var done = function () { note.textContent = 'คัดลอกข้อความสรุปแล้ว'; setTimeout(function () { note.textContent = ''; }, 2600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { note.textContent = 'คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง'; }
      document.body.removeChild(ta);
    }
  }

  /* ------------------------------------------------------------------- init */
  buildNeeds();
  buildCarTypes();
  buildAngles();
  buildPricelist();
  wire();
  render();
})();
