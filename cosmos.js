/* ========================================
   STRAY — Cosmos Canvas
   Micro-dust, signal pulse, subtle parallax.
   The universe is alive, but barely.
   ======================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w, h;

  // --- Particles: micro-dust drifting at glacial speed ---
  var particles = [];
  var PARTICLE_COUNT = 22;

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.3 + Math.random() * 0.8,       // radius: 0.3 - 1.1px
        a: 0.08 + Math.random() * 0.15,      // alpha: 0.08 - 0.23
        vx: (Math.random() - 0.5) * 0.08,    // drift: barely perceptible
        vy: (Math.random() - 0.5) * 0.06,
        pulse: Math.random() * Math.PI * 2,   // phase offset for breathing
        pulseSpeed: 0.002 + Math.random() * 0.004,
      });
    }
  }

  // --- Signal beacon: one point that breathes ---
  var beacon = {
    x: 0,
    y: 0,
    phase: 0,
  };

  function placeBeacon() {
    // Bottom-right area, like a distant lighthouse
    beacon.x = w * (0.75 + Math.random() * 0.15);
    beacon.y = h * (0.6 + Math.random() * 0.25);
  }

  // --- Resize ---
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Parallax: track scroll for micro-offset ---
  var scrollY = 0;
  var PARALLAX = 0.018;

  window.addEventListener('scroll', function () {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }, { passive: true });

  // --- Animation loop ---
  var lastTime = 0;
  var running = true;

  function frame(time) {
    if (!running) return;

    var dt = Math.min(time - lastTime, 50); // cap delta
    lastTime = time;

    ctx.clearRect(0, 0, w, h);

    var offsetY = scrollY * PARALLAX;

    // Draw particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // Drift
      p.x += p.vx * (dt * 0.06);
      p.y += p.vy * (dt * 0.06);

      // Wrap
      if (p.x < -2) p.x = w + 2;
      if (p.x > w + 2) p.x = -2;
      if (p.y < -2) p.y = h + 2;
      if (p.y > h + 2) p.y = -2;

      // Breathing alpha
      p.pulse += p.pulseSpeed * dt;
      var breathe = Math.sin(p.pulse) * 0.4 + 0.6; // 0.2 - 1.0

      var drawY = p.y - offsetY;

      ctx.beginPath();
      ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 195, 215, ' + (p.a * breathe).toFixed(3) + ')';
      ctx.fill();
    }

    // Draw signal beacon
    beacon.phase += 0.0008 * dt; // ~7 second full cycle
    var beaconAlpha = Math.sin(beacon.phase) * 0.5 + 0.5; // 0 - 1
    beaconAlpha = beaconAlpha * beaconAlpha * 0.35; // ease + max 0.35
    var beaconY = beacon.y - offsetY;

    // Outer glow
    ctx.beginPath();
    ctx.arc(beacon.x, beaconY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90, 143, 168, ' + (beaconAlpha * 0.08).toFixed(4) + ')';
    ctx.fill();

    // Inner glow
    ctx.beginPath();
    ctx.arc(beacon.x, beaconY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90, 143, 168, ' + (beaconAlpha * 0.25).toFixed(4) + ')';
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(beacon.x, beaconY, 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(140, 190, 210, ' + (beaconAlpha * 0.5).toFixed(4) + ')';
    ctx.fill();

    requestAnimationFrame(frame);
  }

  // --- Init ---
  function init() {
    resize();
    initParticles();
    placeBeacon();
    requestAnimationFrame(function (t) {
      lastTime = t;
      frame(t);
    });
  }

  // Debounced resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      placeBeacon();
    }, 200);
  });

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    running = false;
    return;
  }

  init();
})();
