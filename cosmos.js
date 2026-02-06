/* ========================================
   STRAY — Cosmos Canvas
   
   Micro-dust drifting at glacial speed.
   A signal beacon breathing in the dark.
   The universe is alive, but barely.
   ======================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('cosmos-canvas');
  if (!canvas) return;

  // Respect reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var ctx = canvas.getContext('2d');
  
  // Adaptive DPR: cap at 1.5 on mobile for performance
  var isMobile = window.innerWidth < 768;
  var maxDpr = isMobile ? 1.5 : 2;
  var dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  var w, h;

  // --- Particles: micro-dust drifting through the void ---
  var particles = [];
  var PARTICLE_COUNT = isMobile ? 15 : 25;

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.3 + Math.random() * 0.9,       // radius: 0.3 - 1.2px
      a: 0.06 + Math.random() * 0.16,     // alpha: 0.06 - 0.22
      vx: (Math.random() - 0.5) * 0.06,   // drift: barely perceptible
      vy: (Math.random() - 0.5) * 0.05,
      pulse: Math.random() * Math.PI * 2, // phase offset for breathing
      pulseSpeed: 0.0015 + Math.random() * 0.0035,
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  // --- Signal beacon: one point that breathes in the distance ---
  var beacon = {
    x: 0,
    y: 0,
    phase: 0,
  };

  function placeBeacon() {
    // Bottom-right quadrant, like a distant lighthouse
    beacon.x = w * (0.72 + Math.random() * 0.18);
    beacon.y = h * (0.55 + Math.random() * 0.3);
  }

  // --- Resize handler ---
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Scroll parallax ---
  var scrollY = 0;
  var PARALLAX = 0.015;

  window.addEventListener('scroll', function () {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }, { passive: true });

  // --- Animation state ---
  var lastTime = 0;
  var running = true;

  function frame(time) {
    if (!running) return;

    // Cap delta to prevent jumps after tab switch
    var dt = Math.min(time - lastTime, 50);
    lastTime = time;

    ctx.clearRect(0, 0, w, h);

    var offsetY = scrollY * PARALLAX;

    // Draw particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // Glacial drift
      p.x += p.vx * (dt * 0.05);
      p.y += p.vy * (dt * 0.05);

      // Wrap around edges
      if (p.x < -3) p.x = w + 3;
      if (p.x > w + 3) p.x = -3;
      if (p.y < -3) p.y = h + 3;
      if (p.y > h + 3) p.y = -3;

      // Breathing alpha
      p.pulse += p.pulseSpeed * dt;
      var breathe = Math.sin(p.pulse) * 0.35 + 0.65; // 0.3 - 1.0

      var drawY = p.y - offsetY;

      ctx.beginPath();
      ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(155, 165, 180, ' + (p.a * breathe).toFixed(4) + ')';
      ctx.fill();
    }

    // Draw signal beacon - slow, hypnotic pulse
    beacon.phase += 0.0005 * dt; // ~10 second full cycle
    var beaconAlpha = Math.sin(beacon.phase);
    beaconAlpha = beaconAlpha * beaconAlpha; // ease curve
    beaconAlpha = beaconAlpha * 0.22; // max brightness: subtle

    var beaconY = beacon.y - offsetY;

    // Outer glow (very faint)
    ctx.beginPath();
    ctx.arc(beacon.x, beaconY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90, 117, 128, ' + (beaconAlpha * 0.04).toFixed(5) + ')';
    ctx.fill();

    // Inner glow
    ctx.beginPath();
    ctx.arc(beacon.x, beaconY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90, 117, 128, ' + (beaconAlpha * 0.15).toFixed(5) + ')';
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(beacon.x, beaconY, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(110, 130, 145, ' + (beaconAlpha * 0.35).toFixed(5) + ')';
    ctx.fill();

    requestAnimationFrame(frame);
  }

  // --- Initialize ---
  function init() {
    resize();
    initParticles();
    placeBeacon();
    requestAnimationFrame(function (t) {
      lastTime = t;
      frame(t);
    });
  }

  // --- Handle resize (debounced) ---
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // Update mobile detection
      isMobile = window.innerWidth < 768;
      PARTICLE_COUNT = isMobile ? 15 : 25;
      
      resize();
      placeBeacon();
      
      // Reinitialize particles if count changed significantly
      if (Math.abs(particles.length - PARTICLE_COUNT) > 5) {
        initParticles();
      }
    }, 250);
  });

  // --- Visibility API: pause when tab is hidden ---
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(frame);
    }
  });

  init();
})();
