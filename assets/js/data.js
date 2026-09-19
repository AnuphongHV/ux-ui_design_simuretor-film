/* ============================================================
   VIC FILM STUDIO — Simulator demo data
   ------------------------------------------------------------
   ตัวเลข VLT / TSER / UV และช่วงราคาในไฟล์นี้เป็น "ข้อมูลตัวอย่าง"
   สำหรับสาธิต UX/UI เท่านั้น ให้แทนที่ด้วยข้อมูลจริงก่อนใช้งาน
   ============================================================ */

/* กระจกโรงงาน (ยังไม่ติดฟิล์ม) */
const FACTORY_GLASS = { code: 'เดิม', name: 'กระจกเดิมจากโรงงาน', vlt: 78, tser: 22, uv: 25, tone: [120, 128, 124] };

/* 6 ซีรี่ส์ตาม Price List
   tone = โทนสีของเนื้อฟิล์มเวลาส่องผ่าน (r,g,b) ใช้เรนเดอร์ภาพจำลอง */
const SERIES = [
  {
    id: 'snc', badge: 'S-NC SERIES', name: 'VIC Ultra Titanium X',
    price: '13,000–47,500 บาท', warranty: 10, tone: [28, 42, 58],
    note: 'ซีรี่ส์สูงสุด กันร้อนสูง ไม่กวนสัญญาณ',
    models: [
      { code: 'S-NC20', density: 20, vlt: 50, tser: 76 },
      { code: 'S-NC40', density: 40, vlt: 30, tser: 80 },
      { code: 'S-NC60', density: 60, vlt: 10, tser: 84 },
      { code: 'S-NC80', density: 80, vlt: 3,  tser: 88 }
    ]
  },
  {
    id: 'ncs', badge: 'NCS SERIES', name: 'Nano Ceramic Sputtering',
    price: '10,000–36,500 บาท', warranty: 8, tone: [30, 44, 52],
    note: 'เซรามิกสปัตเตอร์ เนื้อฟิล์มใส มองกลางคืนชัด',
    models: [
      { code: 'NCS20', density: 20, vlt: 55, tser: 72 },
      { code: 'NCS40', density: 40, vlt: 35, tser: 77 },
      { code: 'NCS60', density: 60, vlt: 15, tser: 81 },
      { code: 'NCS80', density: 80, vlt: 5,  tser: 85 }
    ]
  },
  {
    id: 'mc', badge: 'MC SERIES', name: 'Nano Titanium Mega Clear',
    price: '7,500–31,000 บาท', warranty: 7, tone: [38, 44, 46],
    note: 'เน้นความใส ทัศนวิสัยกลางคืนดีที่สุด',
    models: [
      { code: 'MC20', density: 20, vlt: 68, tser: 62 },
      { code: 'MC40', density: 40, vlt: 42, tser: 68 },
      { code: 'MC60', density: 60, vlt: 20, tser: 73 },
      { code: 'MC80', density: 80, vlt: 6,  tser: 78 }
    ]
  },
  {
    id: 'eco', badge: 'ECO SERIES', name: 'Ceramic ECO',
    price: '5,500–20,000 บาท', warranty: 5, tone: [40, 40, 42],
    note: 'เซรามิกคุ้มค่า ครบทุกความเข้ม',
    models: [
      { code: 'ECO20', density: 20, vlt: 62, tser: 54 },
      { code: 'ECO40', density: 40, vlt: 39, tser: 60 },
      { code: 'ECO60', density: 60, vlt: 18, tser: 66 },
      { code: 'ECO80', density: 80, vlt: 3,  tser: 72 }
    ]
  },
  {
    id: 'sq', badge: 'SQ SERIES', name: 'Ceramic Carbon',
    price: '6,000–26,000 บาท', warranty: 7, tone: [44, 40, 38],
    note: 'คาร์บอนเซรามิก โทนดำนิ่ง ไม่สะท้อน',
    models: [
      { code: 'SQ20', density: 20, vlt: 58, tser: 58 },
      { code: 'SQ40', density: 40, vlt: 36, tser: 64 },
      { code: 'SQ60', density: 60, vlt: 16, tser: 69 },
      { code: 'SQ80', density: 80, vlt: 4,  tser: 74 }
    ]
  },
  {
    id: 'vb', badge: 'VB SERIES', name: 'VIC Black',
    price: '2,800–15,000 บาท', warranty: 3, tone: [46, 46, 48],
    note: 'รุ่นเริ่มต้น เน้นความเป็นส่วนตัว',
    models: [
      { code: 'VB20', density: 20, vlt: 60, tser: 38 },
      { code: 'VB40', density: 40, vlt: 38, tser: 44 },
      { code: 'VB60', density: 60, vlt: 17, tser: 50 },
      { code: 'VB80', density: 80, vlt: 5,  tser: 56 }
    ]
  }
];

/* ขั้นที่ 1 — ความต้องการ → ชุดที่ระบบแนะนำ */
const NEEDS = [
  {
    id: 'heat', title: 'เน้นกันร้อน',
    desc: 'อยากลดความร้อนจากแสงแดดให้ได้มากที่สุด',
    front: { series: 'snc', model: 'S-NC40', label: 'S-NC40-60', density: '40% / 60%' },
    rear:  { series: 'snc', model: 'S-NC60', label: 'S-NC60-80', density: '60% / 80%' }
  },
  {
    id: 'night', title: 'ขับกลางคืนบ่อย',
    desc: 'อยากมองออกจากรถได้ชัด และไม่ต้องการฟิล์มมืดเกินไป',
    front: { series: 'mc', model: 'MC20', label: 'MC20-40', density: '20% / 40%' },
    rear:  { series: 'mc', model: 'MC40', label: 'MC40-60', density: '40% / 60%' }
  },
  {
    id: 'privacy', title: 'เน้นความเป็นส่วนตัว',
    desc: 'ต้องการกระจกที่เข้ม และลดการมองเข้าจากภายนอก',
    front: { series: 'sq', model: 'SQ40', label: 'SQ40-60', density: '40% / 60%' },
    rear:  { series: 'sq', model: 'SQ80', label: 'SQ80', density: '80%' }
  },
  {
    id: 'clear', title: 'อยากได้ฟิล์มใส', sparkle: true,
    desc: 'อยากให้กระจกดูใส แต่ยังต้องการประสิทธิภาพลดความร้อน',
    front: { series: 'mc', model: 'MC20', label: 'MC20', density: '20%' },
    rear:  { series: 'mc', model: 'MC40', label: 'MC40', density: '40%' }
  },
  {
    id: 'balanced', title: 'เอาแบบสมดุล',
    desc: 'อยากได้ความใส ความเป็นส่วนตัว และการลดความร้อนในระดับสมดุล',
    front: { series: 'snc', model: 'S-NC40', label: 'S-NC40-60', density: '40% / 60%' },
    rear:  { series: 'snc', model: 'S-NC60', label: 'S-NC60-80', density: '60% / 80%' }
  }
];

/* ขั้นที่ 2 — ประเภท / ขนาดรถ */
const CAR_TYPES = [
  { id: 'eco', name: 'รถเก๋ง ขนาดเล็ก (Eco car)' },
  { id: 'sedan-m', name: 'รถเก๋ง ขนาดกลาง' },
  { id: 'sedan-l', name: 'รถเก๋ง ขนาดใหญ่' },
  { id: 'suv', name: 'รถอเนกประสงค์ SUV' },
  { id: 'pickup-cab', name: 'กระบะ แค็บ' },
  { id: 'pickup-4d', name: 'กระบะ 4 ประตู' },
  { id: 'van', name: 'รถตู้' },
  { id: 'ev', name: 'รถยนต์ EV' },
  { id: 'sport', name: 'รถสปอร์ต / คูเป้' }
];

/* มุมกล้อง 3 มุม + ตำแหน่งกระจกบนภาพ (viewBox 1000 x 558) */
const ANGLES = [
  {
    id: '45', label: '45 องศา', img: 'assets/img/car-45.jpg',
    visible: 'บานหน้า + รอบคัน',
    front: ['470,141 506,140 548,148 590,161 626,178 640,193 596,202 545,209 497,212 477,208'],
    around: [
      '314,146 344,143 374,141 402,141 402,190 366,191 321,190',
      '213,180 232,168 256,156 279,148 296,144 296,189 252,188 219,184'
    ]
  },
  {
    id: '0', label: '0 องศา', img: 'assets/img/car-0.jpg',
    visible: 'บานหน้า',
    front: ['364,147 412,143 460,141 510,140 560,141 600,145 622,150 644,166 660,184 668,196 640,203 600,207 540,208 470,208 400,207 348,203 322,196 330,178 344,162'],
    around: []
  },
  {
    id: '135', label: '135 องศา', img: 'assets/img/car-135.jpg',
    visible: 'รอบคัน',
    front: [],
    around: [
      '510,218 524,206 540,194 558,182 578,171 600,164 626,161 652,165 674,174 688,186 690,198 674,208 644,214 610,218 574,220 540,221 518,222',
      '266,190 280,178 300,167 326,159 358,153 394,150 428,151 458,156 478,163 484,171 462,180 436,190 408,199 378,206 344,210 308,209 282,205 268,197'
    ]
  }
];

const BY_ID = {};
SERIES.forEach(function (s) { s.models.forEach(function (m) { BY_ID[m.code] = { series: s, model: m }; }); });
