/* =====================================================================
   ART — everything visual is drawn as inline SVG strings.
   A hand-drawn cartoon look: thick ink outlines, flat colours and a
   subtle displacement filter that makes every edge a little wobbly.
   ===================================================================== */
const Art = (() => {
  const OUT = '#2b2136';
  const SW = 3;

  // ---------- tiny helpers ----------
  const attrs = (o) => Object.entries(o).map(([k, v]) => ` ${k}="${v}"`).join('');
  const el = (tag, o, inner = '') => `<${tag}${attrs(o)}>${inner}</${tag}>`;
  const rect = (x, y, w, h, fill, o = {}) => el('rect', { x, y, width: w, height: h, fill, stroke: OUT, 'stroke-width': SW, rx: o.rx ?? 4, ...o });
  const circle = (cx, cy, r, fill, o = {}) => el('circle', { cx, cy, r, fill, stroke: OUT, 'stroke-width': SW, ...o });
  const ellipse = (cx, cy, rx, ry, fill, o = {}) => el('ellipse', { cx, cy, rx, ry, fill, stroke: OUT, 'stroke-width': SW, ...o });
  const path = (d, fill, o = {}) => el('path', { d, fill, stroke: OUT, 'stroke-width': SW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });
  const line = (x1, y1, x2, y2, o = {}) => el('line', { x1, y1, x2, y2, stroke: OUT, 'stroke-width': SW, 'stroke-linecap': 'round', ...o });
  const poly = (pts, fill, o = {}) => el('polygon', { points: pts.map(p => p.join(',')).join(' '), fill, stroke: OUT, 'stroke-width': SW, 'stroke-linejoin': 'round', ...o });
  const text = (x, y, str, size, fill, o = {}) => el('text', { x, y, 'font-size': size, fill, 'text-anchor': 'middle', 'font-family': "'Patrick Hand', cursive", ...o }, str);
  const g = (o, inner) => el('g', o, inner);
  const noStroke = { stroke: 'none' };

  const DEFS = `
  <defs>
    <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3d2b63"/><stop offset=".5" stop-color="#b85c86"/><stop offset="1" stop-color="#f4bf83"/>
    </linearGradient>
    <linearGradient id="skyFog" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8ea2b8"/><stop offset="1" stop-color="#dfe6ea"/>
    </linearGradient>
    <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5aa9d6"/><stop offset="1" stop-color="#cfe9f5"/>
    </linearGradient>
    <linearGradient id="skyMarsh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5c6f8a"/><stop offset="1" stop-color="#c8c3a3"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2f7a9c"/><stop offset="1" stop-color="#4fa3bd"/>
    </linearGradient>
    <linearGradient id="tunnelWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1526"/><stop offset="1" stop-color="#3a2d4c"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4b6d6a"/><stop offset="1" stop-color="#7f9d8a"/>
    </linearGradient>
    <radialGradient id="lampGlow"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="greenGlow"><stop offset="0" stop-color="#9dffd0" stop-opacity=".8"/><stop offset="1" stop-color="#9dffd0" stop-opacity="0"/></radialGradient>
    <pattern id="planks" width="60" height="22" patternUnits="userSpaceOnUse">
      <rect width="60" height="22" fill="#a97b4f"/><rect y="20" width="60" height="2" fill="#6b4a2b"/><rect x="29" width="2" height="22" fill="#6b4a2b"/>
    </pattern>
    <pattern id="bricks" width="60" height="30" patternUnits="userSpaceOnUse">
      <rect width="60" height="30" fill="#3a2d4c"/>
      <rect x="1" y="1" width="27" height="13" fill="#463a5a" rx="2"/><rect x="31" y="1" width="27" height="13" fill="#42355a" rx="2"/>
      <rect x="-14" y="16" width="27" height="13" fill="#42355a" rx="2"/><rect x="16" y="16" width="27" height="13" fill="#463a5a" rx="2"/><rect x="46" y="16" width="27" height="13" fill="#42355a" rx="2"/>
    </pattern>
    <pattern id="wallpaper" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#efe1c2"/><circle cx="10" cy="10" r="3" fill="#dcc79a"/><circle cx="30" cy="30" r="3" fill="#dcc79a"/>
    </pattern>
  </defs>`;

  // ---------- reusable props ----------
  const cloud = (x, y, s = 1, fill = '#ffffff', op = .9) => g({ transform: `translate(${x},${y}) scale(${s})`, opacity: op },
    ellipse(0, 0, 60, 24, fill, noStroke) + ellipse(-30, 6, 36, 20, fill, noStroke) + ellipse(30, 4, 40, 22, fill, noStroke) + ellipse(0, -14, 34, 22, fill, noStroke));
  const reeds = (x, y, n, h = 60, fill = '#4f6a3a') => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const rx = x + i * 9 + ((i * 37) % 7);
      const rh = h + ((i * 53) % 25);
      s += path(`M${rx},${y} q${(i % 2 ? 6 : -6)},${-rh / 2} ${(i % 3) * 3 - 3},${-rh}`, 'none', { stroke: fill, 'stroke-width': 3 });
      if (i % 3 === 0) s += ellipse(rx + ((i % 3) * 3 - 3), y - rh - 6, 4, 12, '#6b4a2b', noStroke);
    }
    return s;
  };
  const bulbs = (x1, y, x2, n, colors = ['#ffd75e', '#ff8a65', '#7fd8be', '#f6a5d7']) => {
    let s = path(`M${x1},${y} Q${(x1 + x2) / 2},${y + 30} ${x2},${y}`, 'none', { stroke: OUT, 'stroke-width': 2 });
    for (let i = 0; i <= n; i++) {
      const t = i / n, bx = x1 + (x2 - x1) * t, by = y + 30 * 4 * t * (1 - t) * .5 + 6;
      s += circle(bx, by, 6, colors[i % colors.length], { stroke: OUT, 'stroke-width': 2, filter: 'url(#glow)' });
    }
    return s;
  };
  const puddle = (x, y, rx, ry, fill = '#5f7f8a', op = .7) => ellipse(x, y, rx, ry, fill, { stroke: 'none', opacity: op });
  const tape = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    let stripes = '';
    for (let i = 0; i < len; i += 40) stripes += rect(i + 10, 0, 16, 18, OUT, { stroke: 'none', rx: 0 });
    return g({ transform: `translate(${x1},${y1}) rotate(${ang})` }, rect(0, 0, len, 18, '#f4d03f', { rx: 2 }) + stripes);
  };
  const signBoard = (x, y, w, h, label, size, fill = '#f6ecd4', textFill = OUT, o = {}) =>
    rect(x, y, w, h, fill, { rx: 8, ...o }) + text(x + w / 2, y + h / 2 + size * .35, label, size, textFill, { 'font-weight': 'bold' });
  const arrow = (x, y, dir = 'right') => {
    const r = { right: 0, left: 180, up: -90, down: 90 }[dir];
    return g({ transform: `translate(${x},${y})` }, g({ class: 'exit-arrow' }, g({ transform: `rotate(${r})` }, path('M-18,-14 L10,-14 L10,-26 L30,0 L10,26 L10,14 L-18,14 Z', '#f6ecd4', { 'stroke-width': 3 }))));
  };
  const lantern = (x, y, s = 1, lit = true, dented = false) => g({ transform: `translate(${x},${y}) scale(${s})` },
    (lit ? circle(0, 0, 60, 'url(#lampGlow)', noStroke) : '') +
    rect(-14, -32, 28, 8, '#a8792f') + path('M-8,-32 Q0,-46 8,-32', 'none', { 'stroke-width': 4 }) +
    path(dented ? 'M-16,-24 L16,-24 L18,18 L-10,22 L-18,10 Z' : 'M-16,-24 L16,-24 L16,18 L-16,18 Z', lit ? '#ffe08a' : '#8fb3c9', { 'stroke-width': 3 }) +
    line(-6, -24, -6, 18, { 'stroke-width': 2 }) + line(6, -24, 6, 18, { 'stroke-width': 2 }) +
    rect(-18, 18, 36, 8, '#a8792f') + (lit ? ellipse(0, -2, 6, 10, '#fff7c9', { stroke: 'none', filter: 'url(#glow)' }) : ''));
  const ghostFace = (x, y, s = 1) => g({ transform: `translate(${x},${y}) scale(${s})` },
    path('M-80,60 C-90,-40 -50,-80 0,-80 C50,-80 90,-40 80,60 L60,40 L40,70 L20,45 L0,75 L-20,45 L-40,70 L-60,40 Z', '#e9e4f5') +
    ellipse(-28, -20, 14, 20, OUT, noStroke) + ellipse(28, -20, 14, 20, OUT, noStroke) + ellipse(0, 20, 18, 14, OUT, noStroke));

  // ---------- CHARACTERS ----------
  // Local coordinate space: feet at (0,0), head top around y=-285.
  function character(c, x = 0, y = 0, scale = 1, facing = 1, opts = {}) {
    const p = [];
    const skin = c.skin || '#f3c9a3';
    const top = c.top || '#6b8fb8';
    const bottom = c.bottom || '#3d3a5c';
    const shape = c.shape || 'normal';
    const bw = { normal: 56, round: 78, thin: 44, stout: 66 }[shape];
    const shoeFill = c.shoes || '#2b2136';
    const f = 1; // features drawn mirrored via transform

    // legs & shoes
    const legY = shape === 'round' ? -96 : -100;
    p.push(rect(-30, legY, 26, 92, bottom, { rx: 8 }), rect(4, legY, 26, 92, bottom, { rx: 8 }));
    if (c.heels) {
      p.push(ellipse(-17, -6, 20, 8, shoeFill), ellipse(17, -6, 20, 8, shoeFill), rect(-30, -8, 8, 8, shoeFill, { rx: 1 }), rect(22, -8, 8, 8, shoeFill, { rx: 1 }));
    } else {
      p.push(ellipse(-17, -6, 22, 9, shoeFill), ellipse(17, -6, 22, 9, shoeFill));
    }
    if (c.muddy) p.push(ellipse(-17, -4, 16, 5, '#6b5233', noStroke), ellipse(19, -3, 14, 5, '#6b5233', noStroke));

    // body
    if (shape === 'round') p.push(ellipse(0, -150, bw, 68, top));
    else p.push(path(`M${-bw},-185 Q${-bw},-200 ${-bw + 16},-200 L${bw - 16},-200 Q${bw},-200 ${bw},-185 L${bw - 6},-95 Q${bw - 6},-88 ${bw - 14},-88 L${-bw + 14},-88 Q${-bw + 6},-88 ${-bw + 6},-95 Z`, top));
    // garment details
    if (c.overalls) p.push(path(`M-24,-190 L-24,-95 L24,-95 L24,-190 Z`, c.overalls, { 'stroke-width': 2 }), rect(-10, -160, 20, 24, '#2b2136', { rx: 3, 'stroke-width': 2 }), line(-24, -190, -24, -200), line(24, -190, 24, -200));
    if (c.coat) p.push(line(0, -195, 0, -95, { 'stroke-width': 2 }), path(`M-20,-200 L0,-165 L20,-200`, c.coat, { 'stroke-width': 2 }), circle(0, -150, 3, OUT), circle(0, -125, 3, OUT));
    if (c.tie) p.push(path('M-8,-195 L8,-195 L4,-185 L8,-130 L0,-118 L-8,-130 L-4,-185 Z', c.tie, { 'stroke-width': 2 }));
    if (c.cardigan) p.push(path(`M-${bw},-185 L-14,-200 L-4,-100 L4,-100 L14,-200 L${bw},-185`, 'none', { 'stroke-width': 2.5 }), circle(0, -160, 3.5, '#fff'), circle(0, -140, 3.5, '#fff'), circle(0, -120, 3.5, '#fff'));
    if (c.apron) p.push(path(`M-30,-160 L30,-160 L34,-92 L-34,-92 Z`, c.apron, { 'stroke-width': 2 }));
    if (c.badge) p.push(path('M0,-175 L4,-165 L14,-164 L7,-157 L9,-147 L0,-152 L-9,-147 L-7,-157 L-14,-164 L-4,-165 Z', '#f2b134', { 'stroke-width': 2, transform: 'translate(-28,0)' }));
    if (c.buttons) p.push(circle(-14, -165, 3.5, '#f2b134'), circle(14, -165, 3.5, '#f2b134'), circle(-14, -140, 3.5, '#f2b134'), circle(14, -140, 3.5, '#f2b134'), circle(-14, -115, 3.5, '#f2b134'), circle(14, -115, 3.5, '#f2b134'));
    if (c.belt) p.push(rect(-bw + 6, -108, bw * 2 - 12, 12, c.belt, { rx: 2 }), rect(-8, -111, 16, 18, '#c9a24b', { rx: 3 }));
    if (c.keys) p.push(circle(bw - 8, -96, 9, 'none', { 'stroke-width': 3 }), rect(bw - 12, -92, 5, 16, '#c9a24b', { rx: 1, 'stroke-width': 2 }), rect(bw - 4, -90, 5, 14, '#c9a24b', { rx: 1, 'stroke-width': 2 }));
    if (c.toolbelt) p.push(rect(-bw + 4, -110, bw * 2 - 8, 14, '#6b4a2b', { rx: 3 }), rect(-bw + 8, -102, 18, 22, '#8b6b4a', { rx: 3 }), rect(bw - 26, -102, 18, 22, '#8b6b4a', { rx: 3 }), line(-bw + 12, -100, -bw + 12, -110, { 'stroke-width': 4 }), line(bw - 17, -100, bw - 17, -114, { 'stroke-width': 4, stroke: '#9aa3ad' }));

    // arms
    const armSpec = c.arms || 'down';
    const shoulderX = bw - 8, shoulderY = -180;
    const arm = (side, mode) => {
      const sx = side * shoulderX;
      let hx, hy, mid;
      if (mode === 'down') { hx = side * (bw + 14); hy = -100; mid = `${side * (bw + 10)},-140`; }
      else if (mode === 'hips') { hx = side * (bw - 18); hy = -108; mid = `${side * (bw + 30)},-150`; }
      else if (mode === 'fold') { hx = -side * 10; hy = -150; mid = `${side * (bw + 20)},-150`; }
      else if (mode === 'point') { hx = side * (bw + 60); hy = -190; mid = `${side * (bw + 30)},-170`; }
      else if (mode === 'wave') { hx = side * (bw + 30); hy = -230; mid = `${side * (bw + 34)},-190`; }
      else if (mode === 'chin') { hx = side * 22; hy = -200; mid = `${side * (bw + 24)},-150`; }
      else { hx = side * (bw + 14); hy = -100; mid = `${side * (bw + 10)},-140`; }
      return path(`M${sx},${shoulderY} Q${mid} ${hx},${hy}`, 'none', { stroke: OUT, 'stroke-width': 22 }) +
        path(`M${sx},${shoulderY} Q${mid} ${hx},${hy}`, 'none', { stroke: c.sleeves || top, 'stroke-width': 16 }) +
        circle(hx, hy, 11, skin);
    };
    const [lm, rm] = Array.isArray(armSpec) ? armSpec : [armSpec, armSpec === 'point' || armSpec === 'wave' ? 'down' : armSpec];
    p.push(arm(-1, lm), arm(1, rm));
    if (c.cane) p.push(line(bw + 14, -100, bw + 20, 0, { 'stroke-width': 5 }), circle(bw + 13, -104, 7, '#c9a24b'));
    if (c.shawl) p.push(path(`M-${bw + 8},-190 L${bw + 8},-190 L${bw + 2},-150 L0,-105 L-${bw + 2},-150 Z`, c.shawl));
    if (c.shawl) { for (let i = 0; i <= 8; i++) { const t = i / 8; const px = -(bw + 8) + t * (bw + 8) * 2; const py = -190 + (1 - Math.abs(t - .5) * 2) * 85 + 2; p.push(line(px * .95, py, px * .95, py + 10, { 'stroke-width': 2, stroke: c.shawl })); } }
    if (c.camera) p.push(path(`M-${bw - 10},-195 Q0,-160 ${bw - 10},-195`, 'none', { 'stroke-width': 3 }), rect(-22, -160, 44, 30, '#3b3b48', { rx: 5 }), circle(0, -145, 10, '#1b1b26'), circle(0, -145, 5, '#5fa8d3', { 'stroke-width': 2 }), rect(8, -166, 10, 6, '#8a8a95', { rx: 1, 'stroke-width': 2 }));
    if (c.notepad) p.push(rect(-bw - 26, -112, 24, 30, '#fff8e6', { rx: 2, 'stroke-width': 2 }), line(-bw - 22, -104, -bw - 6, -104, { 'stroke-width': 1.5 }), line(-bw - 22, -96, -bw - 6, -96, { 'stroke-width': 1.5 }));
    if (c.ticketRoll) p.push(circle(bw + 14, -100, 14, '#f4a7c1'), circle(bw + 14, -100, 4, '#fff'));

    // neck & head
    p.push(rect(-12, -215, 24, 34, skin, { rx: 6 }));
    const hy = -240, hr = 50;
    // ears
    p.push(circle(-hr + 2, hy + 4, 9, skin), circle(hr - 2, hy + 4, 9, skin));
    p.push(circle(0, hy, hr, skin));
    // hair (behind hat)
    const hair = c.hair || '#5a3a2a';
    const hairStyle = c.hairStyle || 'short';
    if (hairStyle === 'bun' || hairStyle === 'short' || hairStyle === 'slick' || hairStyle === 'wild' || hairStyle === 'long' || hairStyle === 'curly') {
      if (hairStyle === 'curly') {
        for (let i = -4; i <= 4; i++) p.push(circle(i * 12, hy - 40 - Math.cos(i / 4 * 1.4) * 10 + (Math.abs(i) > 3 ? 12 : 0), 15, hair));
      } else if (hairStyle === 'wild') {
        p.push(path(`M${-hr + 4},${hy - 10} L${-hr - 8},${hy - 40} L${-30},${hy - 38} L${-24},${hy - 66} L${-8},${hy - 44} L${4},${hy - 70} L${16},${hy - 46} L${32},${hy - 62} L${34},${hy - 36} L${hr + 6},${hy - 42} L${hr - 4},${hy - 10} Q0,${hy - 38} ${-hr + 4},${hy - 10} Z`, hair));
      } else {
        p.push(path(`M${-hr + 2},${hy - 8} A${hr},${hr} 0 0 1 ${hr - 2},${hy - 8} Q${hr - 20},${hy - 24} ${0},${hy - 30} Q${-hr + 20},${hy - 24} ${-hr + 2},${hy - 8} Z`, hair));
        if (hairStyle === 'slick') p.push(path(`M${-30},${hy - 40} Q${-10},${hy - 46} ${10},${hy - 40}`, 'none', { stroke: '#ffffff', 'stroke-width': 2.5, opacity: .6 }));
      }
      if (hairStyle === 'bun') p.push(circle(0, hy - 62, 18, hair));
      if (hairStyle === 'long') p.push(path(`M${-hr + 2},${hy - 8} L${-hr - 6},${hy + 70} L${-hr + 18},${hy + 60} L${-hr + 10},${hy}`, hair), path(`M${hr - 2},${hy - 8} L${hr + 6},${hy + 70} L${hr - 18},${hy + 60} L${hr - 10},${hy}`, hair));
    } else if (hairStyle === 'bald') {
      p.push(path(`M${-hr + 4},${hy - 12} q-10,-14 -4,-22`, 'none', { stroke: hair, 'stroke-width': 3 }), path(`M${hr - 4},${hy - 12} q10,-14 4,-22`, 'none', { stroke: hair, 'stroke-width': 3 }));
    } else if (hairStyle === 'sideburns') {
      p.push(path(`M${-hr + 2},${hy - 8} A${hr},${hr} 0 0 1 ${hr - 2},${hy - 8} Q0,${hy - 20} ${-hr + 2},${hy - 8} Z`, hair), rect(-hr - 2, hy - 6, 12, 34, hair, { rx: 3 }), rect(hr - 10, hy - 6, 12, 34, hair, { rx: 3 }));
    }

    // face
    const eyeY = hy - 6, eyeDX = 18;
    const eyeStyle = c.eyes || 'normal';
    const pupilDX = 3;
    if (eyeStyle === 'squint') {
      p.push(path(`M${-eyeDX - 10},${eyeY} Q${-eyeDX},${eyeY - 8} ${-eyeDX + 10},${eyeY}`, 'none', { 'stroke-width': 4 }), path(`M${eyeDX - 10},${eyeY} Q${eyeDX},${eyeY - 8} ${eyeDX + 10},${eyeY}`, 'none', { 'stroke-width': 4 }));
    } else {
      const ry = eyeStyle === 'wide' ? 13 : eyeStyle === 'sleepy' ? 7 : 10;
      p.push(ellipse(-eyeDX, eyeY, 10, ry, '#fff'), ellipse(eyeDX, eyeY, 10, ry, '#fff'));
      p.push(circle(-eyeDX + pupilDX, eyeY + 1, eyeStyle === 'wide' ? 5.5 : 4.5, OUT, noStroke), circle(eyeDX + pupilDX, eyeY + 1, eyeStyle === 'wide' ? 5.5 : 4.5, OUT, noStroke));
      p.push(circle(-eyeDX + pupilDX + 2, eyeY - 1, 1.5, '#fff', noStroke), circle(eyeDX + pupilDX + 2, eyeY - 1, 1.5, '#fff', noStroke));
      if (eyeStyle === 'sleepy') p.push(path(`M${-eyeDX - 10},${eyeY - 4} L${-eyeDX + 10},${eyeY - 4}`, 'none', { 'stroke-width': 3 }), path(`M${eyeDX - 10},${eyeY - 4} L${eyeDX + 10},${eyeY - 4}`, 'none', { 'stroke-width': 3 }));
    }
    // brows
    const brow = c.brows || 'normal';
    const bY = eyeY - 18;
    if (brow === 'angry') p.push(path(`M${-eyeDX - 12},${bY - 4} L${-eyeDX + 12},${bY + 4}`, 'none', { 'stroke-width': 4 }), path(`M${eyeDX - 12},${bY + 4} L${eyeDX + 12},${bY - 4}`, 'none', { 'stroke-width': 4 }));
    else if (brow === 'worried') p.push(path(`M${-eyeDX - 12},${bY + 4} L${-eyeDX + 12},${bY - 2}`, 'none', { 'stroke-width': 4 }), path(`M${eyeDX - 12},${bY - 2} L${eyeDX + 12},${bY + 4}`, 'none', { 'stroke-width': 4 }));
    else if (brow === 'raised') p.push(path(`M${-eyeDX - 12},${bY - 4} Q${-eyeDX},${bY - 12} ${-eyeDX + 12},${bY - 4}`, 'none', { 'stroke-width': 4 }), path(`M${eyeDX - 12},${bY - 2} Q${eyeDX},${bY - 10} ${eyeDX + 12},${bY - 2}`, 'none', { 'stroke-width': 4 }));
    else if (brow === 'bushy') p.push(path(`M${-eyeDX - 14},${bY} Q${-eyeDX},${bY - 10} ${-eyeDX + 14},${bY}`, hair, { 'stroke-width': 3 }), path(`M${eyeDX - 14},${bY} Q${eyeDX},${bY - 10} ${eyeDX + 14},${bY}`, hair, { 'stroke-width': 3 }));
    else p.push(path(`M${-eyeDX - 11},${bY} Q${-eyeDX},${bY - 5} ${-eyeDX + 11},${bY}`, 'none', { 'stroke-width': 3.5 }), path(`M${eyeDX - 11},${bY} Q${eyeDX},${bY - 5} ${eyeDX + 11},${bY}`, 'none', { 'stroke-width': 3.5 }));
    // nose
    const noseStyle = c.nose || 'button';
    if (noseStyle === 'button') p.push(circle(6, hy + 10, 7, skin));
    else if (noseStyle === 'pointy') p.push(path(`M2,${hy} L22,${hy + 14} L4,${hy + 16}`, skin));
    else if (noseStyle === 'big') p.push(ellipse(8, hy + 10, 12, 10, skin));
    else p.push(path(`M4,${hy + 2} q10,10 0,16`, 'none', { 'stroke-width': 3 }));
    // cheeks
    if (c.cheeks) p.push(circle(-30, hy + 14, 8, c.cheeks, noStroke), circle(30, hy + 14, 8, c.cheeks, noStroke));
    if (c.freckles) for (let i = 0; i < 6; i++) p.push(circle(-30 + (i % 3) * 8 + (i > 2 ? 46 : 0), hy + 12 + Math.floor(i / 3) * 0 + (i % 2) * 5, 1.6, '#b0784f', noStroke));
    if (c.smudge) p.push(ellipse(-26, hy + 22, 9, 4, '#5a5a66', { stroke: 'none', opacity: .7 }));
    // mouth
    const mouth = c.mouth || 'smile', mY = hy + 30;
    if (mouth === 'smile') p.push(path(`M-16,${mY - 4} Q0,${mY + 12} 16,${mY - 4}`, 'none', { 'stroke-width': 3.5 }));
    else if (mouth === 'grin') p.push(path(`M-20,${mY - 6} Q0,${mY + 18} 20,${mY - 6} Z`, '#fff', { 'stroke-width': 3 }), line(-20, mY - 6, 20, mY - 6, { 'stroke-width': 2 }));
    else if (mouth === 'frown') p.push(path(`M-16,${mY + 6} Q0,${mY - 8} 16,${mY + 6}`, 'none', { 'stroke-width': 3.5 }));
    else if (mouth === 'flat') p.push(line(-14, mY, 14, mY, { 'stroke-width': 3.5 }));
    else if (mouth === 'open') p.push(ellipse(0, mY + 2, 9, 11, '#7a2d3a', { 'stroke-width': 3 }));
    else if (mouth === 'smirk') p.push(path(`M-14,${mY} Q4,${mY + 10} 18,${mY - 6}`, 'none', { 'stroke-width': 3.5 }));
    // facial hair
    if (c.moustache) p.push(path(`M-4,${hy + 20} Q-16,${hy + 10} -30,${hy + 24} Q-14,${hy + 30} -4,${hy + 22} Z`, c.moustache), path(`M4,${hy + 20} Q16,${hy + 10} 30,${hy + 24} Q14,${hy + 30} 4,${hy + 22} Z`, c.moustache));
    if (c.beard) p.push(path(`M${-hr + 6},${hy + 10} Q${-hr + 4},${hy + 70} 0,${hy + 78} Q${hr - 4},${hy + 70} ${hr - 6},${hy + 10} Q${hr - 20},${hy + 34} 0,${hy + 40} Q${-hr + 20},${hy + 34} ${-hr + 6},${hy + 10} Z`, c.beard));
    if (c.glasses) p.push(circle(-eyeDX, eyeY, 15, 'none', { 'stroke-width': 3.5, stroke: c.glasses }), circle(eyeDX, eyeY, 15, 'none', { 'stroke-width': 3.5, stroke: c.glasses }), line(-3, eyeY, 3, eyeY, { 'stroke-width': 3, stroke: c.glasses }));
    if (c.monocle) p.push(circle(eyeDX, eyeY, 15, 'none', { 'stroke-width': 3, stroke: '#c9a24b' }), path(`M${eyeDX + 10},${eyeY + 10} Q${eyeDX + 30},${eyeY + 40} ${bw - 20},${hy + 90}`, 'none', { 'stroke-width': 1.5, stroke: '#c9a24b' }));

    // hats
    const hat = c.hat || 'none', hc = c.hatColor || '#3d3a5c';
    const top0 = hy - hr;
    if (hat === 'flatcap') p.push(path(`M${-hr - 4},${hy - 22} Q0,${hy - 80} ${hr + 4},${hy - 22} Z`, hc), path(`M${-hr - 4},${hy - 22} L${hr + 4},${hy - 22} L${hr + 26},${hy - 14} L${-hr - 4},${hy - 18} Z`, hc));
    else if (hat === 'helmet') p.push(path(`M${-hr + 2},${hy - 20} Q${-hr},${hy - 100} 0,${hy - 110} Q${hr},${hy - 100} ${hr - 2},${hy - 20} Z`, hc), ellipse(0, hy - 20, hr + 6, 9, hc), circle(0, hy - 112, 6, '#c9c9d9'), path(`M-10,${hy - 70} L10,${hy - 70} L10,${hy - 50} L0,${hy - 42} L-10,${hy - 50} Z`, '#c9c9d9', { 'stroke-width': 2 }));
    else if (hat === 'tophat') p.push(rect(-hr + 10, hy - 130, hr * 2 - 20, 92, hc, { rx: 4 }), ellipse(0, hy - 38, hr + 12, 12, hc), rect(-hr + 10, hy - 60, hr * 2 - 20, 12, '#8a2d4a', { stroke: 'none' }));
    else if (hat === 'bowler') p.push(path(`M${-hr + 6},${hy - 30} Q${-hr + 2},${hy - 96} 0,${hy - 98} Q${hr - 2},${hy - 96} ${hr - 6},${hy - 30} Z`, hc), ellipse(0, hy - 30, hr + 14, 10, hc), rect(-hr + 6, hy - 48, hr * 2 - 12, 8, '#5a2d3a', { stroke: 'none' }));
    else if (hat === 'deerstalker') p.push(path(`M${-hr + 2},${hy - 24} Q0,${hy - 92} ${hr - 2},${hy - 24} Z`, hc), path(`M${-hr - 2},${hy - 24} L${-hr - 24},${hy - 10} L${-hr + 2},${hy - 14} Z`, hc), path(`M${hr + 2},${hy - 24} L${hr + 24},${hy - 10} L${hr - 2},${hy - 14} Z`, hc), path(`M${-hr + 2},${hy - 22} L${hr - 2},${hy - 22} L${hr - 2},${hy - 12} Q0,${hy - 4} ${-hr + 2},${hy - 12} Z`, hc), rect(-hr + 20, hy - 60, hr * 2 - 40, 8, '#8a6a3a', { 'stroke-width': 2, rx: 2 }));
    else if (hat === 'beanie') { p.push(path(`M${-hr - 2},${hy - 20} Q0,${hy - 100} ${hr + 2},${hy - 20} Z`, hc), rect(-hr - 4, hy - 30, hr * 2 + 8, 16, hc, { rx: 4 }), circle(0, hy - 98, 8, hc)); if (c.headlamp) p.push(rect(-hr - 8, hy - 34, hr * 2 + 16, 8, '#2b2136', { rx: 2 }), rect(-14, hy - 40, 28, 20, '#4a4a58', { rx: 4 }), circle(0, hy - 30, 6, '#ffe97a', { 'stroke-width': 2, filter: 'url(#glow)' })); }
    else if (hat === 'headscarf') p.push(path(`M${-hr - 2},${hy - 12} Q0,${hy - 90} ${hr + 2},${hy - 12} L${hr + 6},${hy + 10} L${hr - 8},${hy - 8} Q0,${hy - 60} ${-hr + 8},${hy - 8} L${-hr - 6},${hy + 10} Z`, hc));

    const inner = g({ transform: `scale(${facing},1)` }, p.join(''));
    return g({ transform: `translate(${x},${y}) scale(${scale})`, ...(opts.attrs || {}) }, inner);
  }

  function portrait(c, size = 200, extraClass = '') {
    const box = c.portraitBox || '-78 -345 156 170';
    return `<svg viewBox="${box}" width="${size}" height="${size}" class="portrait ${extraClass}" xmlns="http://www.w3.org/2000/svg">${character(c, 0, 0, 1, 1)}</svg>`;
  }

  // ---------- SCENES (960 x 540) ----------
  const W = 960, H = 540;

  function sceneEntrance() {
    let s = rect(-30, -30, W + 60, H + 60, 'url(#skyDusk)', noStroke);
    s += circle(760, 120, 44, '#fff3c4', { stroke: 'none', filter: 'url(#glow)' });
    s += cloud(150, 90, 1, '#f9d7d0', .8) + cloud(520, 60, .7, '#f9d7d0', .7) + cloud(860, 200, .8, '#ffd9c2', .6);
    // distant marsh
    s += path(`M0,330 Q120,300 240,325 T480,318 T720,326 T960,315 L960,360 L0,360 Z`, '#5a4c72', noStroke);
    s += reeds(300, 340, 12, 28, '#3f3552') + reeds(600, 345, 14, 24, '#3f3552');
    // ghost train silhouette far back
    s += path('M420,335 L420,250 Q470,190 520,250 L520,335 Z', '#46395f', noStroke) + circle(470, 250, 26, '#3a2d4c', noStroke);
    s += rect(560, 260, 90, 75, '#46395f', { stroke: 'none' }) + circle(605, 250, 38, '#54476b', { stroke: 'none' }); // big wheel-ish blob
    // ground
    s += rect(-30, 355, W + 60, 230, '#8b6b4a', noStroke);
    s += path('M0,355 Q240,345 480,358 T960,352 L960,380 L0,380 Z', '#9c7b56', noStroke);
    s += puddle(380, 470, 70, 14, '#6d5d8a', .5) + puddle(700, 500, 90, 16, '#6d5d8a', .5);
    s += path('M0,420 Q480,400 960,425', 'none', { stroke: '#7a5b3d', 'stroke-width': 2 }) + path('M0,480 Q480,470 960,490', 'none', { stroke: '#7a5b3d', 'stroke-width': 2 });
    // fence
    for (let x = 40; x < 960; x += 46) { if (x > 300 && x < 660) continue; s += rect(x, 300, 12, 70, '#c9b38f', { rx: 2 }); }
    s += rect(0, 318, 300, 8, '#c9b38f') + rect(660, 318, 300, 8, '#c9b38f');
    // gate arch
    s += rect(310, 130, 34, 240, '#c94f5a', { rx: 6 }) + rect(616, 130, 34, 240, '#c94f5a', { rx: 6 });
    s += path('M300,150 Q480,20 660,150 L660,190 Q480,80 300,190 Z', '#f2b134');
    s += path('M330,168 Q480,70 630,168', 'none', { stroke: '#fff2c4', 'stroke-width': 3, 'stroke-dasharray': '2 14', 'stroke-linecap': 'round' });
    s += rect(360, 100, 240, 60, '#3d2b63', { rx: 10 }) + text(480, 140, 'MARSHLIGHT FAIR', 34, '#ffe08a', { 'font-weight': 'bold', 'letter-spacing': '2' });
    s += bulbs(344, 172, 616, 14);
    s += rect(400, 165, 160, 26, '#f6ecd4', { rx: 6 }) + text(480, 184, 'closed for the season (and other reasons)', 12, OUT);
    // ticket booth (left)
    s += rect(60, 200, 220, 170, '#5aa3a0', { rx: 8 });
    s += path('M40,205 L300,205 L280,160 L60,160 Z', '#c94f5a');
    for (let i = 0; i < 6; i++) s += rect(60 + i * 40, 160, 20, 45, '#f6ecd4', { stroke: 'none', rx: 0 });
    s += rect(40, 200, 260, 14, '#3d2b63', { rx: 3 });
    s += rect(150, 120, 40, 60, '#f6ecd4', { rx: 6 }) + text(170, 158, '£', 30, OUT, { 'font-weight': 'bold' });
    s += rect(90, 230, 160, 90, '#1f2a44', { rx: 6 }); // window (character shows here)
    s += `%%MARIGOLD%%`;
    s += rect(80, 316, 180, 24, '#3d2b63', { rx: 4 }) + text(170, 334, 'TICKETS', 18, '#ffe08a', { 'font-weight': 'bold' });
    s += rect(84, 340, 172, 30, '#4a8a88', { rx: 2 }) + rect(150, 345, 60, 8, '#f6ecd4', { rx: 2 }) + rect(110, 350, 24, 10, '#f4a7c1', { rx: 2 });
    // poster board (right)
    s += rect(700, 240, 10, 130, '#6b4a2b') + rect(870, 240, 10, 130, '#6b4a2b');
    s += rect(690, 230, 200, 110, '#8b6b4a', { rx: 6 });
    s += rect(705, 240, 170, 92, '#1b1526', { rx: 4 });
    s += ghostFace(790, 292, .35) + text(790, 262, 'SEE THE', 12, '#ffe08a') + text(790, 326, 'MARSH WRAITH!', 15, '#9dffd0', { 'font-weight': 'bold' });
    s += rect(710, 248, 34, 16, '#f2b134', { rx: 3, transform: 'rotate(-12 727 256)', 'stroke-width': 2 }) + text(727, 260, 'NEW!', 10, OUT, { transform: 'rotate(-12 727 256)', 'font-weight': 'bold' });
    // bin
    s += rect(900, 320, 44, 60, '#5aa3a0', { rx: 6 }) + rect(896, 314, 52, 12, '#3d2b63', { rx: 4 }) + rect(912, 300, 20, 16, '#f6ecd4', { rx: 2, 'stroke-width': 2 });
    // lamppost
    s += rect(24, 120, 10, 250, '#3d2b63') + rect(10, 100, 38, 30, '#f6ecd4', { rx: 4 }) + circle(29, 115, 24, 'url(#lampGlow)', noStroke);
    return s;
  }

  function sceneGhostTrain(showTape = true) {
    let s = rect(-30, -30, W + 60, H + 60, 'url(#skyFog)', noStroke);
    s += cloud(120, 80, 1.2, '#f2f5f8', .9) + cloud(800, 60, 1, '#f2f5f8', .9) + cloud(500, 40, .8, '#f2f5f8', .7);
    // ground
    s += rect(-30, 400, W + 60, 180, '#7a6a5a', noStroke) + path('M0,400 Q480,392 960,400 L960,420 L0,420 Z', '#8a7a68', noStroke);
    s += puddle(150, 480, 80, 14, '#a9b8c4', .7) + puddle(820, 500, 70, 12, '#a9b8c4', .7);
    // rails leading in
    s += path('M440,540 L470,400 M520,540 L490,400', 'none', { stroke: '#5a5a66', 'stroke-width': 6 });
    for (let i = 0; i < 7; i++) s += line(440 + i * 5, 528 - i * 20, 520 - i * 5, 528 - i * 20, { stroke: '#6b4a2b', 'stroke-width': 8 });
    // building
    s += path('M170,400 L170,160 Q170,120 210,110 L260,60 L300,110 L660,110 L700,60 L750,110 Q790,120 790,160 L790,400 Z', '#4a3a6a');
    s += rect(190, 180, 580, 220, 'url(#bricks)', { rx: 4 });
    s += path('M150,150 L810,150 L790,120 L170,120 Z', '#5a3d7a') + path('M170,120 L790,120', 'none', { 'stroke-width': 3 });
    // roof turrets
    s += path('M230,110 L260,40 L290,110 Z', '#6b4a8a') + path('M670,110 L700,40 L730,110 Z', '#6b4a8a');
    s += circle(260, 40, 8, '#f2b134') + circle(700, 40, 8, '#f2b134');
    // sign
    s += rect(310, 50, 340, 70, '#1b1526', { rx: 12 }) + text(480, 100, 'GHOST TRAIN', 48, '#9dffd0', { 'font-weight': 'bold', filter: 'url(#glow)' });
    s += bulbs(320, 125, 640, 12, ['#9dffd0', '#c58cff', '#ffe08a']);
    // giant ghost face around entrance
    s += g({ transform: 'translate(480,300)' },
      path('M-150,100 C-170,-60 -110,-130 0,-130 C110,-130 170,-60 150,100 L120,70 L90,100 L60,70 L30,100 L0,70 L-30,100 L-60,70 L-90,100 L-120,70 Z', '#e9e4f5') +
      ellipse(-60, -50, 24, 34, OUT, noStroke) + ellipse(60, -50, 24, 34, OUT, noStroke) +
      circle(-54, -58, 8, '#9dffd0', { stroke: 'none', filter: 'url(#glow)' }) + circle(66, -58, 8, '#9dffd0', { stroke: 'none', filter: 'url(#glow)' }) +
      path('M-60,-100 Q-40,-115 -20,-100', 'none', { 'stroke-width': 4 }) + path('M20,-100 Q40,-115 60,-100', 'none', { 'stroke-width': 4 }));
    // entrance (the mouth)
    s += path('M400,400 L400,300 Q480,220 560,300 L560,400 Z', '#0d0a14');
    s += path('M410,398 L410,305 Q480,240 550,305 L550,398', 'none', { stroke: '#3a2d4c', 'stroke-width': 3, 'stroke-dasharray': '6 8' });
    s += circle(430, 330, 3, '#9dffd0', { stroke: 'none', filter: 'url(#glow)', opacity: .7 }) + circle(520, 350, 3, '#9dffd0', { stroke: 'none', filter: 'url(#glow)', opacity: .7 });
    s += path('M380,400 L580,400 L590,415 L370,415 Z', '#5a3d7a'); // step
    s += rect(560, 330, 60, 30, '#f6ecd4', { rx: 6, transform: 'rotate(6 590 345)' }) + text(590, 350, 'Dare you?', 12, OUT, { transform: 'rotate(6 590 345)' });
    // fog wisps
    s += ellipse(480, 405, 140, 14, '#e9eef2', { stroke: 'none', opacity: .8, filter: 'url(#softglow)' }) + ellipse(300, 440, 120, 12, '#e9eef2', { stroke: 'none', opacity: .5, filter: 'url(#softglow)' });
    // side props
    s += rect(200, 330, 90, 70, '#c94f5a', { rx: 6 }) + text(245, 372, 'RIDE', 20, '#f6ecd4', { 'font-weight': 'bold' }) + text(245, 392, 'OPERATOR', 11, '#f6ecd4'); // control hut
    s += rect(210, 300, 70, 32, '#2b2136', { rx: 4 }) + rect(216, 306, 58, 20, '#4fa3bd', { rx: 2, 'stroke-width': 2 });
    // toolbox
    s += rect(800, 445, 70, 40, '#c94f5a', { rx: 6 }) + rect(795, 440, 80, 10, '#8a2d3a', { rx: 3 }) + path('M820,440 Q835,420 850,440', 'none', { 'stroke-width': 4 }) + rect(826, 448, 18, 14, '#f2b134', { rx: 2, 'stroke-width': 2 });
    s += rect(878, 470, 30, 8, '#9aa3ad', { rx: 2, 'stroke-width': 2 }) + rect(876, 462, 8, 24, '#9aa3ad', { rx: 2, 'stroke-width': 2 }); // spanner
    if (showTape) s += tape(360, 340, 600, 372);
    s += `%%CHARS%%`;
    return s;
  }

  function sceneTunnel() {
    let s = rect(-30, -30, W + 60, H + 60, '#100c17', noStroke);
    // arched tunnel walls
    s += rect(0, 0, W, 380, 'url(#bricks)', { stroke: 'none' });
    s += path('M0,0 L0,380 L120,380 Q120,120 480,100 Q840,120 840,380 L960,380 L960,0 Z', '#14101c', { stroke: 'none', opacity: .55 });
    s += path('M120,380 Q120,120 480,100 Q840,120 840,380', 'none', { stroke: '#5a4a72', 'stroke-width': 5 });
    // back wall
    s += path('M120,380 Q120,120 480,100 Q840,120 840,380 Z', '#2a2138');
    s += rect(130, 130, 700, 250, 'url(#bricks)', { stroke: 'none', opacity: .6, rx: 120 });
    // floor (flooded)
    s += rect(-30, 380, W + 60, 200, '#3a3346', noStroke);
    s += path('M0,400 Q240,385 480,398 T960,392 L960,540 L0,540 Z', 'url(#water)', { stroke: 'none', opacity: .8 });
    s += path('M60,470 q60,-6 120,2 M300,500 q80,-8 160,0 M700,460 q60,-6 120,4', 'none', { stroke: '#a9c9c4', 'stroke-width': 2, opacity: .4 });
    // rails
    s += path('M380,540 L440,380 M580,540 L520,380', 'none', { stroke: '#6a6a78', 'stroke-width': 6 });
    for (let i = 0; i < 8; i++) s += line(380 + i * 7.5, 530 - i * 20, 580 - i * 7.5, 530 - i * 20, { stroke: '#5a4a3a', 'stroke-width': 8 });
    // ride cart
    s += g({ transform: 'translate(430,300) scale(.9)' },
      path('M-60,60 L-70,10 Q-70,-10 -50,-10 L50,-10 Q70,-10 70,10 L60,60 Z', '#c94f5a') + rect(-55, -40, 110, 34, '#3d2b63', { rx: 8 }) +
      circle(-40, 62, 14, '#2b2136') + circle(40, 62, 14, '#2b2136') + circle(-40, 62, 5, '#9aa3ad') + circle(40, 62, 5, '#9aa3ad') +
      text(0, 40, '13', 26, '#ffe08a', { 'font-weight': 'bold' }));
    // the Wraith animatronic (hanging right)
    s += line(700, 100, 700, 150, { stroke: '#9aa3ad', 'stroke-width': 3 });
    s += g({ transform: 'translate(700,260)' },
      circle(0, -40, 70, 'url(#greenGlow)', noStroke) +
      path('M-60,110 C-70,-20 -40,-110 0,-110 C40,-110 70,-20 60,110 L40,80 L20,115 L0,85 L-20,115 L-40,80 Z', '#cfd7e6') +
      path('M-50,-10 L-90,40 L-70,60 L-40,20', '#cfd7e6') +
      ellipse(-20, -50, 10, 16, OUT, noStroke) + ellipse(20, -50, 10, 16, OUT, noStroke) +
      circle(-18, -54, 4, '#9dffd0', { stroke: 'none', filter: 'url(#glow)' }) + circle(22, -54, 4, '#9dffd0', { stroke: 'none', filter: 'url(#glow)' }) +
      ellipse(0, -10, 12, 16, OUT, noStroke) +
      path('M-88,44 L-96,70', 'none', { 'stroke-width': 3 }) + text(0, 40, 'BOO', 12, '#8a92a5', { opacity: .6 }));
    s += rect(640, 340, 120, 24, '#f6ecd4', { rx: 4, transform: 'rotate(-3 700 352)' }) + text(700, 357, 'do not touch the wraith', 11, OUT, { transform: 'rotate(-3 700 352)' });
    // maintenance door (back right)
    s += rect(790, 210, 90, 170, '#4b5566', { rx: 6 }) + rect(798, 218, 74, 154, '#5c6778', { rx: 4 }) + circle(866, 300, 6, '#c9a24b') + rect(858, 292, 10, 24, '#3a3a48', { rx: 2, 'stroke-width': 2 });
    s += rect(800, 232, 70, 22, '#f2b134', { rx: 3 }) + text(835, 248, 'MAINTENANCE', 9, OUT, { 'font-weight': 'bold' });
    s += rect(800, 260, 70, 60, '#9aa3ad', { rx: 2, 'stroke-width': 2, opacity: .3 });
    // control panel (left wall)
    s += rect(150, 220, 90, 110, '#4b5566', { rx: 6 }) + rect(160, 230, 70, 40, '#2b2136', { rx: 4 });
    s += circle(175, 250, 6, '#c94f5a') + circle(195, 250, 6, '#7fd8be') + circle(215, 250, 6, '#f2b134');
    s += rect(165, 280, 20, 36, '#9aa3ad', { rx: 3 }) + rect(200, 280, 26, 36, '#9aa3ad', { rx: 3 });
    s += path('M200,330 q10,30 -6,60 q-6,20 4,40', 'none', { stroke: '#c94f5a', 'stroke-width': 5 }) + path('M226,330 q-8,26 8,40', 'none', { stroke: '#c94f5a', 'stroke-width': 5 });
    s += path('M198,430 l-8,-8 l14,-2', 'none', { stroke: '#f2b134', 'stroke-width': 3 }) + circle(196, 428, 8, '#ffe08a', { stroke: 'none', filter: 'url(#glow)', opacity: .6 });
    // fog machine (front left)
    s += rect(60, 400, 120, 60, '#3d3a5c', { rx: 8 }) + rect(70, 410, 60, 24, '#2b2136', { rx: 4 }) + text(100, 428, '21:30', 16, '#7fd8be', { 'font-family': 'monospace' });
    s += circle(160, 420, 8, '#c94f5a', { filter: 'url(#glow)' }) + rect(150, 440, 24, 14, '#9aa3ad', { rx: 3 }) + ellipse(210, 440, 50, 14, '#dfe6ea', { stroke: 'none', opacity: .5, filter: 'url(#softglow)' });
    s += text(120, 455, 'FOG-O-MATIC', 10, '#f6ecd4');
    // chalk outline of body
    s += path('M560,440 q10,-30 40,-28 q30,2 32,28 q20,10 50,30 q12,14 -4,24 q-20,6 -50,-6 q-14,20 -10,44 q-6,22 -30,14 q-6,-26 -2,-46 q-30,10 -50,-6 q-16,-10 -6,-22 q26,-16 30,-32 Z', 'none', { stroke: '#f6ecd4', 'stroke-width': 3, 'stroke-dasharray': '10 8', opacity: .9 });
    // lantern on the floor
    s += lantern(690, 470, 1, false, true);
    s += ellipse(690, 496, 26, 6, '#1b1526', { stroke: 'none', opacity: .5 });
    // footprints toward door
    const fp = (x, y, r) => g({ transform: `translate(${x},${y}) rotate(${r})` }, ellipse(0, -8, 7, 11, '#5a4a3a', noStroke) + path('M-7,10 a7,5 0 1,0 14,0 a4,3 0 1,1 -4,-6 a4,3 0 1,1 -6,0 a4,3 0 1,1 -4,6 Z', '#5a4a3a', noStroke));
    s += fp(730, 480, -30) + fp(760, 455, -40) + fp(780, 430, -45) + fp(806, 405, -50) + fp(820, 385, -55);
    // glass shards
    s += poly([[705, 495], [715, 490], [712, 500]], '#bfe6ff', { 'stroke-width': 1.5 }) + poly([[655, 500], [662, 494], [665, 504]], '#bfe6ff', { 'stroke-width': 1.5 });
    // drips
    s += path('M300,100 q4,30 0,60', 'none', { stroke: '#7fd8be', 'stroke-width': 2, opacity: .5 }) + path('M620,105 q3,40 -2,70', 'none', { stroke: '#7fd8be', 'stroke-width': 2, opacity: .5 });
    s += `%%CHARS%%`;
    return s;
  }

  function scenePier() {
    let s = rect(-30, -30, W + 60, H + 60, 'url(#skyDay)', noStroke);
    s += circle(160, 90, 40, '#fff8d6', { stroke: 'none', filter: 'url(#glow)' });
    s += cloud(400, 70, 1, '#fff', .95) + cloud(760, 110, .8, '#fff', .9);
    // sea
    s += rect(0, 250, W, 140, 'url(#sea)', noStroke);
    for (let i = 0; i < 12; i++) s += path(`M${i * 90 - 20},${270 + (i % 3) * 30} q20,-8 40,0 t40,0`, 'none', { stroke: '#dff3fa', 'stroke-width': 2, opacity: .7 });
    // lighthouse far
    s += rect(850, 150, 40, 110, '#f6ecd4') + rect(850, 150, 40, 22, '#c94f5a', { stroke: 'none' }) + rect(850, 194, 40, 22, '#c94f5a', { stroke: 'none' }) + rect(856, 130, 28, 24, '#2b2136', { rx: 4 }) + circle(870, 142, 8, '#ffe08a', { filter: 'url(#glow)' }) + path('M846,130 L894,130 L870,112 Z', '#c94f5a');
    // boardwalk
    s += rect(-30, 380, W + 60, 200, 'url(#planks)', noStroke) + line(-30, 380, W + 30, 380, { 'stroke-width': 4 });
    // railing
    for (let x = 30; x < W; x += 70) s += rect(x, 320, 12, 70, '#f6ecd4', { rx: 2 });
    s += rect(0, 322, W, 10, '#f6ecd4') + rect(0, 355, W, 8, '#f6ecd4');
    // aquarium (left)
    s += rect(30, 130, 300, 260, '#3f8f8a', { rx: 10 }) + path('M20,140 L340,140 L320,100 L40,100 Z', '#2f6f6c');
    s += rect(60, 60, 240, 50, '#f6ecd4', { rx: 10 }) + text(180, 96, "BELLWETHER'S AQUARIUM", 20, '#2f6f6c', { 'font-weight': 'bold' });
    s += circle(180, 210, 60, '#8fd3e8') + path('M150,210 q20,-24 40,0 q-20,24 -40,0 Z', '#f2b134') + poly([[190, 210], [206, 198], [206, 222]], '#f2b134') + circle(162, 206, 3, OUT, noStroke);
    s += circle(120, 300, 6, '#dff3fa') + circle(230, 260, 5, '#dff3fa') + circle(212, 160, 4, '#dff3fa');
    s += rect(240, 300, 70, 90, '#2b2136', { rx: 6 }) + circle(255, 345, 4, '#c9a24b');
    s += rect(40, 150, 70, 70, '#f6ecd4', { rx: 6 }) + text(75, 178, 'SEVEN', 12, '#2f6f6c') + text(75, 194, 'TANKS', 12, '#2f6f6c') + text(75, 210, 'ONE OCTOPUS', 8, '#2f6f6c');
    // pub (right back)
    s += rect(620, 170, 230, 220, '#8b6b4a', { rx: 8 }) + path('M600,175 L870,175 L850,130 L620,130 Z', '#5a3d2a');
    s += rect(640, 190, 190, 40, '#2b2136', { rx: 8 }) + text(735, 218, 'The Drowned Duck', 20, '#ffe08a');
    s += rect(660, 250, 50, 50, '#ffe08a', { rx: 4 }) + rect(790, 250, 50, 50, '#ffe08a', { rx: 4 }) + line(685, 250, 685, 300) + line(660, 275, 710, 275) + line(815, 250, 815, 300) + line(790, 275, 840, 275);
    s += rect(715, 290, 60, 100, '#5a3d2a', { rx: 4 }) + circle(765, 345, 4, '#c9a24b');
    s += rect(720, 300, 50, 60, '#f6ecd4', { rx: 3 }) + text(745, 316, 'QUIZ NIGHT', 8, OUT, { 'font-weight': 'bold' }) + text(745, 328, 'RESULTS', 8, OUT) + line(726, 336, 764, 336, { 'stroke-width': 1.5 }) + line(726, 344, 764, 344, { 'stroke-width': 1.5 }) + line(726, 352, 758, 352, { 'stroke-width': 1.5 });
    s += circle(630, 150, 14, '#f2b134') + ellipse(630, 150, 10, 6, '#c94f5a', { 'stroke-width': 2 }); // duck sign
    // tea room sign post
    s += rect(560, 260, 8, 130, '#6b4a2b') + path('M520,262 L610,262 L626,280 L610,298 L520,298 Z', '#f6ecd4') + text(566, 276, 'LIGHTHOUSE', 10, OUT, { 'font-weight': 'bold' }) + text(566, 290, 'TEA ROOM →', 10, OUT);
    s += rect(522, 302, 90, 40, '#fff', { rx: 3, 'stroke-width': 2 }) + text(566, 316, 'Open 10am–8pm', 9, OUT) + text(566, 328, 'SHARP.', 10, '#c94f5a', { 'font-weight': 'bold' }) + text(566, 338, 'yes, that means you', 6, OUT);
    // bench
    s += rect(40, 330, 120, 14, '#6b4a2b', { rx: 3 }) + rect(40, 350, 120, 12, '#6b4a2b', { rx: 3 }) + rect(48, 360, 10, 30, '#3d3a5c') + rect(142, 360, 10, 30, '#3d3a5c');
    // telescope
    s += rect(890, 300, 8, 90, '#3d3a5c') + path('M870,290 L930,270 L936,284 L876,304 Z', '#c9a24b') + circle(894, 296, 7, '#3d3a5c');
    s += rect(880, 395, 30, 14, '#f6ecd4', { rx: 2, 'stroke-width': 2 }) + text(895, 405, '20p', 8, OUT);
    // seagull
    s += g({ transform: 'translate(440,300)' }, ellipse(0, 0, 16, 10, '#fff') + circle(14, -8, 8, '#fff') + path('M20,-8 l8,2 l-8,2 Z', '#f2b134') + circle(16, -10, 1.5, OUT, noStroke) + line(-4, 8, -6, 18) + line(4, 8, 6, 18));
    s += `%%CHARS%%`;
    return s;
  }

  function sceneCaravan() {
    let s = rect(-30, -30, W + 60, H + 60, '#c9b38f', noStroke);
    // curved caravan interior
    s += path('M-30,580 L-30,120 Q-30,40 80,40 L880,40 Q990,40 990,120 L990,580 Z', 'url(#wallpaper)');
    s += path('M0,140 L960,140', 'none', { stroke: '#8b6b4a', 'stroke-width': 6 }) + path('M0,60 Q480,30 960,60', 'none', { stroke: '#8b6b4a', 'stroke-width': 4 });
    // floor
    s += rect(-30, 400, W + 60, 180, '#8b6b4a', noStroke) + rect(-30, 400, W + 60, 180, 'url(#planks)', { stroke: 'none', opacity: .8 }) + line(-30, 400, W + 30, 400, { 'stroke-width': 4 });
    s += ellipse(480, 470, 200, 40, '#a24f5a', { 'stroke-width': 3 }) + ellipse(480, 470, 150, 28, '#c96f7a', { 'stroke-width': 2 }); // rug
    // window
    s += rect(360, 160, 240, 150, '#6b4a2b', { rx: 8 }) + rect(372, 172, 216, 126, 'url(#skyMarsh)', { rx: 4 });
    s += path('M372,262 Q420,250 480,260 T588,256 L588,298 L372,298 Z', '#5a6b4a', noStroke) + reeds(400, 298, 18, 22, '#3f4a2a');
    s += line(480, 172, 480, 298) + line(372, 235, 588, 235);
    s += rect(350, 150, 24, 170, '#c94f5a', { rx: 3 }) + rect(586, 150, 24, 170, '#c94f5a', { rx: 3 }); // curtains
    // desk
    s += rect(60, 300, 260, 24, '#6b4a2b', { rx: 4 }) + rect(70, 324, 240, 80, '#8b6b4a', { rx: 4 }) + rect(80, 334, 100, 28, '#6b4a2b', { rx: 3 }) + rect(200, 334, 100, 28, '#6b4a2b', { rx: 3 }) + circle(130, 348, 4, '#c9a24b') + circle(250, 348, 4, '#c9a24b');
    s += rect(80, 366, 100, 28, '#6b4a2b', { rx: 3 }) + rect(200, 366, 100, 28, '#6b4a2b', { rx: 3 }) + circle(130, 380, 4, '#c9a24b') + circle(250, 380, 4, '#c9a24b');
    // papers & lamp on desk
    s += rect(90, 276, 70, 30, '#fff8e6', { rx: 2, transform: 'rotate(-6 125 291)', 'stroke-width': 2 }) + rect(110, 282, 70, 28, '#fff8e6', { rx: 2, transform: 'rotate(4 145 296)', 'stroke-width': 2 });
    s += line(122, 290, 165, 290, { 'stroke-width': 1.5 }) + line(124, 298, 160, 298, { 'stroke-width': 1.5 });
    s += rect(240, 230, 8, 70, '#3d3a5c') + path('M210,240 L280,240 L266,205 L224,205 Z', '#3f8f8a') + circle(245, 240, 30, 'url(#lampGlow)', noStroke);
    s += rect(180, 270, 40, 30, '#3d3a5c', { rx: 3 }) + rect(184, 274, 32, 18, '#c9a24b', { rx: 2, 'stroke-width': 2 }); // cash tin
    // safe under desk
    s += rect(200, 404, 0, 0, 'none', noStroke);
    // framed photo on wall
    s += rect(120, 170, 130, 100, '#6b4a2b', { rx: 4 }) + rect(130, 180, 110, 80, '#e0d2b4', { rx: 2 });
    s += g({ transform: 'translate(160,258) scale(.22)' }, character({ skin: '#f3c9a3', top: '#c94f5a', bottom: '#3d3a5c', hairStyle: 'wild', hair: '#5a3a2a', mouth: 'grin', shape: 'thin' }, 0, 0, 1, 1)) + g({ transform: 'translate(210,258) scale(.22)' }, character({ skin: '#f3c9a3', top: '#5a3d7a', bottom: '#3d3a5c', hairStyle: 'bun', hair: '#5a3a2a', mouth: 'flat', brows: 'angry' }, 0, 0, 1, 1));
    s += path('M140,205 L160,190 L180,200 L200,186 L230,205', 'none', { stroke: '#9aa3ad', 'stroke-width': 2 });
    s += text(185, 268, 'Barty & Doreen, 1987', 8, OUT);
    // key board
    s += rect(640, 170, 140, 90, '#6b4a2b', { rx: 6 }) + rect(648, 178, 124, 74, '#c9b38f', { rx: 3 });
    s += text(710, 194, 'KEYS', 12, OUT, { 'font-weight': 'bold' });
    s += rect(656, 202, 50, 12, '#fff8e6', { rx: 2, 'stroke-width': 1.5 }) + text(681, 211, 'OFFICE', 7, OUT) + circle(681, 224, 3, OUT) + rect(677, 226, 8, 18, '#c9a24b', { rx: 1, 'stroke-width': 1.5 });
    s += rect(714, 202, 50, 12, '#fff8e6', { rx: 2, 'stroke-width': 1.5 }) + text(739, 211, 'TUNNEL-MAINT', 6, OUT) + circle(739, 224, 3, OUT);
    // coat rack with shawl
    s += rect(840, 160, 8, 240, '#6b4a2b') + line(820, 176, 868, 176, { 'stroke-width': 4 }) + path('M810,176 L850,176 L880,330 Q844,346 812,330 Z', '#5a3d7a') + path('M816,330 Q844,344 876,330', 'none', { stroke: '#8a6a9a', 'stroke-width': 4, 'stroke-dasharray': '3 6' });
    // boots by door
    const boot = (x, y) => g({ transform: `translate(${x},${y})` }, path('M0,0 L0,-50 L26,-50 L26,-10 L46,-10 L46,0 Z', '#3d2b63') + rect(-2, -6, 26, 8, '#5a4a3a', { rx: 2 }) + path('M2,-4 a10,6 0 1,0 20,0', 'none', { stroke: '#f6ecd4', 'stroke-width': 2 }) + ellipse(20, 2, 26, 5, '#6b5233', noStroke) + path('M20,-8 q8,-4 14,2', 'none', { stroke: '#6b5233', 'stroke-width': 3 }));
    // door (right)
    s += rect(890, 150, 60, 250, '#c94f5a', { rx: 6 }) + circle(900, 280, 5, '#c9a24b') + rect(900, 170, 40, 60, '#f6ecd4', { rx: 3, 'stroke-width': 2 });
    s += boot(872, 444) + boot(908, 448);
    // bin
    s += rect(560, 350, 44, 50, '#9aa3ad', { rx: 6 }) + rect(556, 344, 52, 10, '#6a6a78', { rx: 3 }) + path('M570,350 l6,-14 l14,4 l4,10', '#fff8e6', { 'stroke-width': 2 });
    // stove & kettle
    s += rect(400, 330, 110, 70, '#3d3a5c', { rx: 6 }) + rect(410, 340, 90, 8, '#2b2136', { rx: 2 }) + circle(430, 344, 12, '#2b2136') + circle(480, 344, 12, '#2b2136');
    s += path('M414,336 Q414,300 446,300 Q478,300 478,336 Z', '#c9a24b') + path('M446,300 L446,290', 'none', { 'stroke-width': 3 }) + path('M478,320 q16,-4 10,-16', 'none', { 'stroke-width': 4 }) + path('M400,320 q-14,10 0,20', 'none', { 'stroke-width': 4 });
    s += path('M490,290 q6,-16 -2,-30', 'none', { stroke: '#dfe6ea', 'stroke-width': 3, opacity: .7 });
    // poster
    s += rect(660, 280, 110, 70, '#1b1526', { rx: 4 }) + ghostFace(715, 320, .2) + text(715, 344, 'MARSH WRAITH', 9, '#9dffd0');
    s += `%%CHARS%%`;
    return s;
  }

  function sceneBoathouse(pipOut = false) {
    let s = rect(-30, -30, W + 60, H + 60, 'url(#skyMarsh)', noStroke);
    s += cloud(200, 90, 1.1, '#d8dde4', .7) + cloud(700, 60, .9, '#d8dde4', .6);
    // distant fairground silhouette
    s += path('M40,250 L40,200 Q80,150 120,200 L120,250 Z', '#5f5b7a', noStroke) + circle(200, 210, 34, '#5f5b7a', noStroke) + rect(190, 210, 20, 40, '#5f5b7a', { stroke: 'none' }) + rect(250, 225, 60, 25, '#5f5b7a', { stroke: 'none' });
    s += circle(80, 206, 4, '#ffe08a', { stroke: 'none', filter: 'url(#glow)' });
    // marsh water
    s += rect(0, 250, W, 300, 'url(#water)', noStroke);
    s += ellipse(480, 400, 700, 140, '#9fb3a0', { stroke: 'none', opacity: .35, filter: 'url(#softglow)' }); // mist
    for (let i = 0; i < 10; i++) s += path(`M${i * 100},${300 + (i % 4) * 40} q30,-4 60,0`, 'none', { stroke: '#c7d6c6', 'stroke-width': 2, opacity: .5 });
    // grassy bank foreground
    s += path('M-30,580 L-30,440 Q200,420 400,450 T990,440 L990,580 Z', '#5a6b4a', noStroke);
    s += reeds(20, 445, 20, 60) + reeds(300, 455, 16, 50) + reeds(720, 448, 22, 58);
    s += reeds(560, 320, 14, 40, '#6f8560') + reeds(120, 300, 12, 36, '#6f8560');
    // boathouse on stilts
    s += rect(560, 330, 14, 120, '#5a3d2a') + rect(860, 330, 14, 120, '#5a3d2a') + rect(700, 330, 14, 120, '#5a3d2a');
    s += rect(540, 180, 350, 160, '#8b6b4a', { rx: 4 }) + rect(540, 180, 350, 160, 'url(#planks)', { stroke: 'none', opacity: .5, rx: 4 });
    s += path('M520,190 L910,190 L715,90 Z', '#5a3d2a') + rect(560, 340, 320, 12, '#6b4a2b', { rx: 2 });
    s += rect(600, 220, 60, 50, '#3d3a5c', { rx: 4 }) + circle(630, 245, 24, 'url(#lampGlow)', noStroke) + rect(604, 224, 52, 42, '#ffe08a', { rx: 2, opacity: .7, 'stroke-width': 2 });
    // door
    s += rect(740, 220, 90, 120, '#5a3d2a', { rx: 4 }) + circle(752, 284, 5, '#c9a24b');
    s += rect(748, 228, 74, 30, '#f6ecd4', { rx: 3, 'stroke-width': 2, transform: 'rotate(-3 785 243)' }) + text(785, 247, 'KEEP OUT (please)', 9, OUT, { transform: 'rotate(-3 785 243)' });
    // sightings map pinned outside
    s += rect(850, 210, 60, 70, '#fff8e6', { rx: 2, 'stroke-width': 2 }) + text(880, 224, 'SIGHTINGS', 7, OUT, { 'font-weight': 'bold' }) + path('M858,240 q12,-10 20,4 t18,-6', 'none', { stroke: '#3f8f8a', 'stroke-width': 1.5 }) + text(872, 260, '✕', 10, '#c94f5a') + text(890, 250, '✕', 10, '#c94f5a') + text(866, 272, '✕', 10, '#c94f5a') + circle(893, 268, 3, '#c94f5a', noStroke);
    // jetty
    s += rect(420, 380, 200, 70, 'url(#planks)', { rx: 2 }) + rect(420, 378, 200, 8, '#6b4a2b') + rect(430, 450, 10, 60, '#5a3d2a') + rect(600, 450, 10, 60, '#5a3d2a');
    // tripod camera
    s += line(300, 470, 330, 380) + line(360, 470, 330, 380) + line(330, 470, 330, 380) + rect(305, 350, 50, 34, '#3b3b48', { rx: 5 }) + circle(360, 367, 12, '#1b1b26') + circle(360, 367, 6, '#5fa8d3', { 'stroke-width': 2 }) + rect(315, 340, 14, 10, '#8a8a95', { rx: 2, 'stroke-width': 2 });
    s += text(330, 500, 'property of P. Larkspur, ghost hunter', 9, '#f6ecd4');
    // rowing boat
    s += path('M120,400 Q170,440 260,400 L250,380 L130,380 Z', '#6b4a2b') + rect(140, 372, 100, 10, '#8b6b4a', { rx: 2 }) + line(190, 372, 200, 330, { 'stroke-width': 4 });
    // will-o'-wisps
    s += circle(700, 420, 5, '#9dffd0', { stroke: 'none', filter: 'url(#glow)', opacity: .8 }) + circle(760, 445, 3, '#9dffd0', { stroke: 'none', filter: 'url(#glow)', opacity: .8 }) + circle(450, 320, 4, '#9dffd0', { stroke: 'none', filter: 'url(#glow)', opacity: .7 });
    s += `%%CHARS%%`;
    return s;
  }

  const SCENES = { entrance: sceneEntrance, ghosttrain: sceneGhostTrain, tunnel: sceneTunnel, pier: scenePier, caravan: sceneCaravan, boathouse: sceneBoathouse };

  // ---------- MAP ----------
  function mapArt(locations, current, unlocked) {
    let s = rect(0, 0, 960, 540, '#e7d7b3', noStroke);
    s += rect(14, 14, 932, 512, 'none', { rx: 18, 'stroke-width': 4, 'stroke-dasharray': '14 8' });
    // sea (right), marsh (bottom)
    s += path('M700,0 Q760,140 720,260 T760,540 L960,540 L960,0 Z', '#8fc9dc', noStroke);
    for (let i = 0; i < 8; i++) s += path(`M${790 + (i % 2) * 40},${60 + i * 60} q14,-6 28,0 t28,0`, 'none', { stroke: '#dff3fa', 'stroke-width': 2 });
    s += path('M0,340 Q200,300 380,360 T720,400 L740,540 L0,540 Z', '#a8b78a', noStroke);
    s += reeds(80, 470, 10, 30, '#6f8560') + reeds(300, 500, 8, 26, '#6f8560') + reeds(520, 480, 10, 30, '#6f8560');
    s += ellipse(220, 440, 90, 26, '#7f9d8a', { stroke: 'none', opacity: .8 }) + ellipse(450, 470, 70, 20, '#7f9d8a', { stroke: 'none', opacity: .8 });
    // paths
    s += path('M160,300 Q300,240 480,200 T700,300', 'none', { stroke: '#b8a07a', 'stroke-width': 10, 'stroke-linecap': 'round' });
    s += path('M160,300 Q300,240 480,200 T700,300', 'none', { stroke: '#8b6b4a', 'stroke-width': 3, 'stroke-dasharray': '10 10' });
    s += path('M480,200 Q560,120 640,90', 'none', { stroke: '#8b6b4a', 'stroke-width': 3, 'stroke-dasharray': '10 10' });
    s += path('M480,200 Q420,300 380,420', 'none', { stroke: '#8b6b4a', 'stroke-width': 3, 'stroke-dasharray': '10 10' });
    s += path('M480,200 Q560,220 620,200', 'none', { stroke: '#8b6b4a', 'stroke-width': 3, 'stroke-dasharray': '10 10' });
    // compass & title
    s += g({ transform: 'translate(80,80)' }, circle(0, 0, 34, '#f6ecd4') + poly([[0, -28], [8, 0], [0, 28], [-8, 0]], '#c94f5a') + poly([[-28, 0], [0, -8], [28, 0], [0, 8]], '#f6ecd4') + text(0, -40, 'N', 16, OUT, { 'font-weight': 'bold' }));
    s += text(480, 520, 'Pellow Marsh — "Mind the wraith. Mind the mud more."', 16, '#5a4a3a');
    s += text(840, 500, 'The Sea', 22, '#2f6f8c', { transform: 'rotate(-80 840 500)' });
    // pins (not wobbled, so they stay crisp and clickable)
    let pins = '';
    for (const loc of locations) {
      const un = unlocked.has(loc.id), cur = loc.id === current;
      const cls = `map-pin${un ? '' : ' locked'}${cur ? ' current' : ''}`;
      pins += g({ class: cls, 'data-scene': loc.id },
        rect(loc.mx - 70, loc.my - 24, 140, 30, un ? '#f6ecd4' : '#d0c4b0', { rx: 8 }) +
        text(loc.mx, loc.my - 3, un ? loc.name : '???', 16, OUT, { 'font-weight': 'bold' }) +
        g({ transform: `translate(${loc.mx},${loc.my + 62})` }, g({ class: 'pin-body' },
          path('M0,0 L-16,-30 A18,18 0 1,1 16,-30 Z', cur ? '#c94f5a' : un ? '#3f8f8a' : '#8a8a95') + circle(0, -34, 7, '#fff'))) +
        rect(loc.mx - 70, loc.my - 28, 140, 90, 'transparent', { stroke: 'none' }));
    }
    return `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg"><g filter="url(#wobble)">${s}</g>${pins}</svg>`;
  }

  // ---------- CLUE ICONS (viewBox 0 0 64 64) ----------
  const ICONS = {
    poster: () => rect(12, 6, 40, 52, '#1b1526', { rx: 3 }) + ghostFace(32, 30, .18) + text(32, 52, 'WRAITH', 8, '#9dffd0'),
    slips: () => rect(10, 18, 40, 24, '#f4a7c1', { rx: 2, transform: 'rotate(-10 30 30)' }) + rect(16, 24, 40, 24, '#f6ecd4', { rx: 2, transform: 'rotate(6 36 36)' }) + text(36, 40, 'LOST', 9, '#c94f5a', { transform: 'rotate(6 36 36)', 'font-weight': 'bold' }),
    note: () => rect(12, 8, 40, 48, '#fff8e6', { rx: 2 }) + line(18, 20, 46, 20, { 'stroke-width': 2 }) + line(18, 28, 46, 28, { 'stroke-width': 2 }) + line(18, 36, 40, 36, { 'stroke-width': 2 }) + text(44, 50, '—B', 10, OUT),
    lantern: () => lantern(32, 34, .8, false, true),
    footprint: () => g({ transform: 'translate(22,30) rotate(-15)' }, ellipse(0, -8, 8, 12, '#5a4a3a') + path('M-8,10 a8,6 0 1,0 16,0 Z', '#5a4a3a')) + g({ transform: 'translate(42,38) rotate(-15)' }, ellipse(0, -8, 8, 12, '#5a4a3a') + path('M-8,10 a8,6 0 1,0 16,0 Z', '#5a4a3a')),
    door: () => rect(16, 6, 32, 54, '#4b5566', { rx: 3 }) + rect(20, 10, 24, 46, '#5c6778', { rx: 2, 'stroke-width': 2 }) + circle(42, 36, 3, '#c9a24b') + rect(22, 14, 20, 8, '#f2b134', { rx: 1, 'stroke-width': 1 }),
    timer: () => rect(8, 20, 48, 30, '#3d3a5c', { rx: 4 }) + rect(14, 26, 30, 14, '#2b2136', { rx: 2 }) + text(29, 37, '21:30', 9, '#7fd8be', { 'font-family': 'monospace' }) + circle(50, 33, 4, '#c94f5a') + ellipse(32, 14, 18, 6, '#dfe6ea', { stroke: 'none', opacity: .8 }),
    wire: () => path('M10,50 q10,-30 22,-20', 'none', { stroke: '#c94f5a', 'stroke-width': 6 }) + path('M54,14 q-10,10 -14,18', 'none', { stroke: '#c94f5a', 'stroke-width': 6 }) + path('M30,36 l-4,-6 l8,-1 M40,30 l4,6 l-8,1', 'none', { stroke: '#f2b134', 'stroke-width': 2.5 }),
    contract: () => rect(12, 6, 40, 52, '#fff8e6', { rx: 2 }) + text(32, 20, 'CONTRACT', 7, OUT, { 'font-weight': 'bold' }) + line(18, 28, 46, 28, { 'stroke-width': 1.5 }) + line(18, 34, 46, 34, { 'stroke-width': 1.5 }) + path('M18,48 q4,-8 8,0 t8,0', 'none', { stroke: '#2b2136', 'stroke-width': 2 }) + line(36, 50, 46, 50, { 'stroke-width': 1.5, 'stroke-dasharray': '2 2' }),
    receipt: () => path('M14,6 L50,6 L50,58 L46,54 L42,58 L38,54 L34,58 L30,54 L26,58 L22,54 L18,58 L14,54 Z', '#fff') + text(32, 20, 'PELLOW HW', 7, OUT, { 'font-weight': 'bold' }) + line(18, 28, 46, 28, { 'stroke-width': 1.5 }) + line(18, 34, 46, 34, { 'stroke-width': 1.5 }) + text(32, 48, '06:14', 8, OUT),
    boots: () => path('M12,54 L12,14 L30,14 L30,44 L44,44 L44,54 Z', '#3d2b63') + rect(10, 50, 22, 6, '#5a4a3a', { rx: 1 }) + path('M14,52 a7,4 0 1,0 14,0', 'none', { stroke: '#f6ecd4', 'stroke-width': 2 }) + ellipse(28, 56, 20, 4, '#6b5233', noStroke),
    hook: () => rect(10, 12, 44, 40, '#c9b38f', { rx: 3 }) + rect(16, 18, 14, 8, '#fff', { rx: 1, 'stroke-width': 1 }) + circle(23, 32, 2, OUT) + rect(20, 34, 6, 12, '#c9a24b', { rx: 1, 'stroke-width': 1.5 }) + rect(34, 18, 14, 8, '#fff', { rx: 1, 'stroke-width': 1 }) + circle(41, 32, 2, OUT) + text(41, 46, '?', 14, '#c94f5a', { 'font-weight': 'bold' }),
    sign: () => rect(30, 30, 4, 30, '#6b4a2b') + path('M8,10 L50,10 L58,22 L50,34 L8,34 Z', '#f6ecd4') + text(30, 26, '8pm SHARP', 8, '#c94f5a', { 'font-weight': 'bold' }),
    quiz: () => rect(12, 8, 40, 48, '#f6ecd4', { rx: 2 }) + text(32, 20, 'QUIZ', 9, OUT, { 'font-weight': 'bold' }) + text(32, 32, 'WINNERS', 7, OUT) + line(18, 40, 46, 40, { 'stroke-width': 1.5 }) + line(18, 46, 40, 46, { 'stroke-width': 1.5 }) + circle(44, 12, 8, '#f2b134') + text(44, 16, '1', 10, OUT, { 'font-weight': 'bold' }),
    cutters: () => path('M14,54 L30,30 M50,54 L34,30', 'none', { stroke: '#c94f5a', 'stroke-width': 6 }) + path('M30,30 L22,12 L32,20 L42,12 L34,30', '#9aa3ad', { 'stroke-width': 2 }) + circle(32, 30, 3, OUT) + text(48, 20, '?', 14, '#c94f5a', { 'font-weight': 'bold' }),
    photo: () => rect(8, 10, 48, 44, '#fff', { rx: 2 }) + rect(12, 14, 40, 30, '#14101c', { rx: 1 }) + path('M28,44 L28,30 Q32,20 36,30 L36,44 Z', '#5a3d7a', { 'stroke-width': 1 }) + circle(32, 33, 3, '#ffe08a', { stroke: 'none', filter: 'url(#glow)' }) + text(32, 52, '21:41', 7, OUT),
    idea: () => circle(32, 26, 16, '#ffe08a', { filter: 'url(#glow)' }) + rect(26, 42, 12, 8, '#9aa3ad', { rx: 2 }) + rect(28, 50, 8, 4, '#9aa3ad', { rx: 1 }) + path('M26,22 q6,-8 12,0', 'none', { 'stroke-width': 2 }),
    key: () => circle(22, 32, 10, 'none', { 'stroke-width': 4 }) + line(32, 32, 54, 32, { 'stroke-width': 5 }) + line(46, 32, 46, 40, { 'stroke-width': 4 }) + line(52, 32, 52, 38, { 'stroke-width': 4 }),
    ghost: () => ghostFace(32, 34, .3),
    money: () => rect(8, 18, 48, 28, '#7fd8be', { rx: 3 }) + circle(32, 32, 8, '#f6ecd4') + text(32, 36, '£', 12, OUT, { 'font-weight': 'bold' }),
    clock: () => circle(32, 32, 24, '#f6ecd4') + line(32, 32, 32, 16, { 'stroke-width': 3 }) + line(32, 32, 42, 38, { 'stroke-width': 3 }) + circle(32, 32, 2, OUT),
    glass: () => rect(16, 12, 32, 40, '#bfe6ff', { rx: 2, opacity: .9 }) + path('M20,48 L30,34 L26,26', 'none', { stroke: '#fff', 'stroke-width': 2 }) + rect(10, 6, 44, 8, '#a8792f', { rx: 2 }) + rect(10, 50, 44, 8, '#a8792f', { rx: 2 }),
  };
  function clueIcon(kind, size = 64) {
    const fn = ICONS[kind] || ICONS.idea;
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${fn()}</svg>`;
  }

  // Title / ending vignette: ghost train at dusk with the detective
  function titleArt(detective, suspects) {
    let s = sceneGhostTrain(false).replace('%%CHARS%%', '');
    s = s.replace('url(#skyFog)', 'url(#skyDusk)');
    s += ellipse(480, 405, 200, 18, '#c58cff', { stroke: 'none', opacity: .35, filter: 'url(#softglow)' });
    s += character(detective, 760, 530, .9, -1);
    return `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><g filter="url(#wobble)">${s}</g></svg>`;
  }

  return { DEFS, character, portrait, SCENES, mapArt, clueIcon, titleArt, helpers: { rect, circle, ellipse, path, line, poly, text, g, arrow, lantern, tape } };
})();
