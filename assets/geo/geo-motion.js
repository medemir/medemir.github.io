/* Geo-animaties. Werkt zonder afhankelijkheden; respecteert reduced motion. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }

  function divider(width) {
    var W = Math.max(280, Math.round(width || 1000)), y = 24, svg = el('svg', { class: 'geo-divider', viewBox: '0 0 ' + W + ' 46', 'aria-hidden': 'true', focusable: 'false' });
    el('path', { class: 'base', d: 'M14 ' + y + 'H' + (W - 14), pathLength: 1 }, svg);
    for (var i = 0; i <= 10; i++) {
      var x = 14 + (W - 28) * i / 10, big = i % 5 === 0;
      var t = el('path', { class: 'tick', d: 'M' + x + ' ' + (y - (big ? 7 : 4)) + 'V' + (y + (big ? 7 : 4)) }, svg);
      t.style.transitionDelay = (0.12 * i) + 's';
      if (big) { var tx = el('text', { class: 'km', x: x, y: y + 20, 'text-anchor': 'middle' }, svg); tx.textContent = '0+' + ('00' + i * 10).slice(-3); tx.style.transitionDelay = (0.12 * i) + 's'; }
    }
    [14, W - 14].forEach(function (x, j) {
      var tri = el('path', { class: 'tp', d: 'M' + x + ' ' + (y - 9) + 'L' + (x + 8) + ' ' + (y + 5) + 'L' + (x - 8) + ' ' + (y + 5) + 'Z' }, svg);
      var dot = el('circle', { class: 'tpdot', cx: x, cy: y + 1, r: 1.8 }, svg);
      tri.style.transitionDelay = dot.style.transitionDelay = (j ? 1.35 : 0) + 's';
    });
    var pr = el('circle', { class: 'prism', cx: 14, cy: y, r: 4 }, svg);
    pr.style.setProperty('--run', (W - 28) + 'px');
    return svg;
  }

  function digit() {
    var svg = el('svg', { class: 'geo-digit', viewBox: '0 0 150 14', 'aria-hidden': 'true', focusable: 'false' });
    var pts = [[3, 9], [38, 5], [74, 10], [110, 4], [147, 8]];
    el('path', { class: 'ln', d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L'), pathLength: 1 }, svg);
    pts.forEach(function (p, i) { var r = el('rect', { class: 'vx', x: p[0] - 3, y: p[1] - 3, width: 6, height: 6 }, svg); r.style.transitionDelay = (0.08 * i) + 's'; });
    return svg;
  }

  var targets = [];
  // Scheiders tussen secties die direct op elkaar volgen (homepage)
  document.querySelectorAll('main > section + section, main section + section').forEach(function (s) {
    if (s.classList.contains('contact') || s.querySelector(':scope > .geo-divider')) return;
    var wrap = s.querySelector(':scope > .wrap') || s; var cs = getComputedStyle(wrap); var d = divider(wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    var holder = document.createElement('div'); holder.className = wrap === s ? '' : 'wrap'; holder.appendChild(d); s.insertBefore(holder, s.firstChild); s.style.borderTop = '0'; s.style.paddingTop = '48px'; targets.push(d);
  });
  // Projectblokken in het portfolio
  document.querySelectorAll('.project-block').forEach(function (b) { var d = divider(b.clientWidth); b.style.borderTop = '0'; b.insertBefore(d, b.firstChild); targets.push(d); });
  // Gedigitaliseerde lijn onder de hoofdkoppen
  document.querySelectorAll('.section-head h2, article.note > h2, .page-head h1').forEach(function (h) {
    if (h.closest('.aside')) return; var d = digit(); h.appendChild(d); targets.push(d);
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { targets.forEach(function (t) { t.classList.add('on'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { threshold: 0.6 });
  targets.forEach(function (t) { io.observe(t); });
})();
