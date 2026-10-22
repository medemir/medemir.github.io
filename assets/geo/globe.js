/* Draaiende wereldbol op de homepage. d3-geo + topojson, data: Natural Earth via world-atlas. */
(function () {
  var fig = document.getElementById('globe'); if (!fig || !window.d3 || !window.topojson) return;
  var cv = fig.querySelector('canvas'), ctx = cv.getContext('2d');
  var INK = '#14213d', GREEN = '#2f6f4e', LAND = '#dfeae2', SEA = '#ffffff', GRID = '#e6eaec', BORDER = '#b9c9bf', RED = '#c0392b';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var places = [
    { n: 'Izmir', c: [27.14, 38.42], label: true },
    { n: 'Groningen', c: [6.57, 53.22] }, { n: 'Assen', c: [6.56, 52.99] }, { n: 'Almere', c: [5.21, 52.37] },
    { n: 'Rotterdam', c: [4.48, 51.92] }, { n: 'Zevenaar', c: [6.07, 51.93] }, { n: 'Nederland', c: [5.6, 52.6], label: true, hidden: true }
  ];
  var arc = { type: 'LineString', coordinates: [[27.14, 38.42], [5.21, 52.37]] };
  var proj = d3.geoOrthographic().clipAngle(90).precision(0.3), path = d3.geoPath(proj, ctx), grat = d3.geoGraticule10();
  var rot = [-12, -38, 0], land = null, borders = null, S = 0, dpr = 1, last = 0, running = false, dragging = false, visible = true;

  function size() {
    S = Math.round(fig.clientWidth); dpr = window.devicePixelRatio || 1;
    cv.width = S * dpr; cv.height = S * dpr; cv.style.width = cv.style.height = S + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    proj.translate([S / 2, S / 2]).scale(S / 2 - 4);
  }
  function draw() {
    proj.rotate(rot);
    ctx.clearRect(0, 0, S, S);
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = SEA; ctx.fill();
    ctx.beginPath(); path(grat); ctx.strokeStyle = GRID; ctx.lineWidth = 0.8; ctx.stroke();
    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = LAND; ctx.fill(); ctx.strokeStyle = GREEN; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.beginPath(); path(borders); ctx.strokeStyle = BORDER; ctx.lineWidth = 0.6; ctx.stroke();
    }
    ctx.beginPath(); path(arc); ctx.setLineDash([5, 4]); ctx.strokeStyle = RED; ctx.lineWidth = 1.8; ctx.stroke(); ctx.setLineDash([]);
    var centre = [-rot[0], -rot[1]];
    places.forEach(function (p) {
      if (d3.geoDistance(p.c, centre) > Math.PI / 2 - 0.05) return;
      var xy = proj(p.c);
      if (!p.hidden) { ctx.beginPath(); ctx.arc(xy[0], xy[1], 3.4, 0, 7); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      if (p.label) { ctx.font = '600 13px Archivo, system-ui, sans-serif'; var w = ctx.measureText(p.n).width, lx = xy[0] + 8 + w > S - 4 ? xy[0] - 8 - w : xy[0] + 8; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.strokeText(p.n, lx, xy[1] - 6); ctx.fillStyle = INK; ctx.fillText(p.n, lx, xy[1] - 6); }
    });
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  }
  function tick(t) {
    if (!running) return;
    var dt = last ? Math.min(50, t - last) : 16; last = t;
    if (!dragging) rot[0] = (rot[0] + dt * 0.006) % 360;
    draw(); requestAnimationFrame(tick);
  }
  function start() { if (running || reduce || !visible || document.hidden) return; running = true; last = 0; requestAnimationFrame(tick); }
  function stop() { running = false; }

  // Slepen om te draaien
  var px = 0, py = 0;
  cv.addEventListener('pointerdown', function (e) { dragging = true; px = e.clientX; py = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) {
    if (!dragging) return; var k = 180 / S;
    rot[0] += (e.clientX - px) * k; rot[1] = Math.max(-70, Math.min(70, rot[1] - (e.clientY - py) * k)); px = e.clientX; py = e.clientY;
    if (!running) draw();
  });
  ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { dragging = false; }); });

  window.addEventListener('resize', function () { size(); draw(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(fig);

  size(); draw();
  fetch(fig.dataset.src).then(function (r) { return r.json(); }).then(function (w) {
    land = topojson.feature(w, w.objects.land);
    borders = topojson.mesh(w, w.objects.countries, function (a, b) { return a !== b; });
    draw(); start();
  }).catch(function () { start(); });
})();
