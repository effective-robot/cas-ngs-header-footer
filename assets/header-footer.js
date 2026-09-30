/*!
 * CAS-NGS CORE HEADER & FOOTER — runtime engine (v1.0 · zero build step)
 *
 * Header:
 *   · spring/damping proximity dock — items scale toward the cursor with
 *     transform-only math, so the bar width never shifts (locked track)
 *   · dropdown submenus — hover-intent + click + keyboard + outside-close,
 *     with staggered link reveals
 *   · mobile drawer with accordion submenus (<768px)
 *   · ambient WebGL mote field inside the pill bar (Three.js r128 from cdnjs,
 *     loaded on demand; silently skipped if unavailable)
 *   · scroll state: the bar tightens after 8px of scroll
 *
 * Footer (.cas-footer):
 *   · waving DNA strands canvas + nanopore sequencing lane with base calls
 *   · live "bases called" counter, back-to-top
 *
 * Palette mirrors --sylva-t1…t5 in header-footer.css.
 * Diagnostics: window.CAS_DEBUG = true or ?cas-debug=1.
 */
(function () {
  "use strict";

  var VERSION = "1.0.0";
  var THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

  var C = {
    t1: "#865438",
    t2: "#af7853",
    t3: "#d4996e",
    t4: "#e6ccb2",
    t5: "#ede0d4"
  };

  function debugOn() {
    return !!window.CAS_DEBUG || (window.location && window.location.search.indexOf("cas-debug") !== -1);
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function ensureThree(cb) {
    if (window.THREE) return cb();
    var s = document.createElement("script");
    s.src = window.CAS_THREE_URL || THREE_URL;
    s.async = true;
    s.onload = function () { if (window.THREE) cb(); };
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     HEADER
     ══════════════════════════════════════════════════════════════════════════ */

  /* ── proximity dock: gaussian influence + spring integrator ──────────── */
  function initDock(dock) {
    var items = Array.prototype.slice.call(dock.querySelectorAll(".cas-dock-item"));
    if (!items.length) return;

    var SIGMA = 120; /* px — cursor reach */
    var GROW = 0.17; /* max scale added at zero distance */
    var DROP = 6; /* px drop-down at zero distance (positive = down) */
    var STIFFNESS = 0.16;
    var DAMPING = 0.72;

    var state = items.map(function () {
      return { s: 1, v: 0, target: 1, y: 0, yv: 0, yTarget: 0 };
    });
    var running = false;
    var raf = 0;

    function loop() {
      var alive = false;
      for (var i = 0; i < items.length; i++) {
        var st = state[i];
        st.v += (st.target - st.s) * STIFFNESS;
        st.v *= DAMPING;
        st.s += st.v;
        st.yv += (st.yTarget - st.y) * STIFFNESS;
        st.yv *= DAMPING;
        st.y += st.yv;
        if (Math.abs(st.v) > 0.0003 || Math.abs(st.target - st.s) > 0.0003 ||
            Math.abs(st.yv) > 0.02 || Math.abs(st.yTarget - st.y) > 0.02) {
          alive = true;
        }
        items[i].style.transform =
          "translate3d(0," + st.y.toFixed(2) + "px,0) scale(" + st.s.toFixed(4) + ")";
      }
      if (alive) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function kick() {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    }

    dock.addEventListener("mousemove", function (e) {
      if (reducedMotion()) return;
      for (var i = 0; i < items.length; i++) {
        var r = items[i].getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var influence = Math.exp(-(dx * dx) / (2 * SIGMA * SIGMA));
        state[i].target = 1 + GROW * influence;
        state[i].yTarget = DROP * influence; /* grow AND drop down */
      }
      kick();
    });

    dock.addEventListener("mouseleave", function () {
      for (var i = 0; i < items.length; i++) {
        state[i].target = 1;
        state[i].yTarget = 0;
      }
      kick();
    });
  }

  /* ── dropdowns ───────────────────────────────────────────────────────── */
  function initDropdowns(header) {
    var groups = Array.prototype.slice.call(header.querySelectorAll(".cas-dock-group"));
    if (!groups.length) return;

    function closeAll(except) {
      groups.forEach(function (g) {
        if (g === except) return;
        g.classList.remove("is-open");
        var btn = g.querySelector("[data-cas-toggle]");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    groups.forEach(function (group) {
      var btn = group.querySelector("[data-cas-toggle]");
      var openTimer = null;
      var closeTimer = null;

      function open() {
        clearTimeout(closeTimer);
        closeAll(group);
        group.classList.add("is-open");
        if (btn) btn.setAttribute("aria-expanded", "true");
      }
      function close() {
        group.classList.remove("is-open");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }

      /* hover intent: small delays so passing the cursor doesn't flicker */
      group.addEventListener("mouseenter", function () {
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(open, 110);
      });
      group.addEventListener("mouseleave", function () {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        closeTimer = setTimeout(close, 240);
      });

      if (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (group.classList.contains("is-open")) close();
          else open();
        });
        btn.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            open();
            var first = group.querySelector(".cas-dropdown__link");
            if (first) first.focus();
          }
        });
      }

      /* arrow-key travel inside the panel */
      var panel = group.querySelector("[data-cas-dropdown]");
      if (panel) {
        panel.addEventListener("keydown", function (e) {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          e.preventDefault();
          var links = Array.prototype.slice.call(panel.querySelectorAll(".cas-dropdown__link"));
          var idx = links.indexOf(document.activeElement);
          var next = e.key === "ArrowDown" ? Math.min(links.length - 1, idx + 1) : Math.max(0, idx - 1);
          if (links[next]) links[next].focus();
        });
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".cas-dock-group")) closeAll();
    });
  }

  /* ── mobile drawer + accordion ───────────────────────────────────────── */
  function initMobile(header) {
    var burger = header.querySelector("[data-cas-burger]");
    var panel = header.querySelector("[data-cas-mobile]");
    if (!burger || !panel) return;

    function setOpen(open) {
      header.classList.toggle("mobile-open", open);
      burger.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      document.documentElement.classList.toggle("cas-lock", open);
    }

    burger.addEventListener("click", function () {
      setOpen(!header.classList.contains("mobile-open"));
    });

    Array.prototype.forEach.call(panel.querySelectorAll("[data-cas-m-toggle]"), function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest(".cas-m-group");
        if (!group) return;
        var willOpen = !group.classList.contains("open");
        group.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("mobile-open")) setOpen(false);
    });

    /* unstick the drawer if the viewport grows past the breakpoint */
    if (window.matchMedia) {
      var mq = window.matchMedia("(min-width: 768px)");
      var onChange = function () { if (mq.matches) setOpen(false); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ── ambient WebGL mote field inside the pill bar ────────────────────── */
  function initAmbient(canvas) {
    if (!canvas || canvas.dataset.casAmbient) return;
    canvas.dataset.casAmbient = "1";
    if (reducedMotion()) return;

    ensureThree(function () {
      try {
        var THREE = window.THREE;
        var ratio = Math.min(window.devicePixelRatio || 1, 2);
        var w = canvas.clientWidth || 1;
        var h = canvas.clientHeight || 1;
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(ratio);
        renderer.setSize(w, h, false);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 30);
        camera.position.z = 6;

        var COUNT = 90;
        var positions = new Float32Array(COUNT * 3);
        var speeds = new Float32Array(COUNT);
        var phases = new Float32Array(COUNT);
        for (var i = 0; i < COUNT; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 14;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 3.2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
          speeds[i] = 0.08 + Math.random() * 0.22;
          phases[i] = Math.random() * Math.PI * 2;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        /* soft copper mote texture */
        var dot = document.createElement("canvas");
        dot.width = dot.height = 64;
        var dctx = dot.getContext("2d");
        var g = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, "rgba(175,120,83,0.95)");
        g.addColorStop(0.4, "rgba(212,153,110,0.4)");
        g.addColorStop(1, "rgba(212,153,110,0)");
        dctx.fillStyle = g;
        dctx.fillRect(0, 0, 64, 64);
        var tex = new THREE.CanvasTexture(dot);

        var mat = new THREE.PointsMaterial({
          size: 0.07,
          map: tex,
          color: 0xaf7853,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
          blending: THREE.NormalBlending,
          sizeAttenuation: true
        });
        var points = new THREE.Points(geo, mat);
        scene.add(points);

        var raf = 0;
        var running = false;
        var t0 = performance.now();

        function frame() {
          var t = (performance.now() - t0) / 1000;
          var attr = geo.getAttribute("position");
          for (var j = 0; j < COUNT; j++) {
            var y = attr.getY(j) + speeds[j] * 0.016;
            if (y > 1.8) y = -1.8;
            attr.setY(j, y);
            attr.setX(j, attr.getX(j) + Math.sin(t * 0.6 + phases[j]) * 0.0016);
          }
          attr.needsUpdate = true;
          points.rotation.z = Math.sin(t * 0.12) * 0.04;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(frame);
        }

        function start() {
          if (!running) { running = true; raf = requestAnimationFrame(frame); }
        }
        function stop() {
          running = false;
          cancelAnimationFrame(raf);
        }

        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) start();
              else stop();
            });
          }).observe(canvas);
        } else {
          start();
        }

        if ("ResizeObserver" in window) {
          new ResizeObserver(function () {
            var nw = canvas.clientWidth || 1;
            var nh = canvas.clientHeight || 1;
            renderer.setSize(nw, nh, false);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
          }).observe(canvas);
        }
      } catch (err) {
        console.error("[CAS Header] ambient canvas failed:", err);
      }
    });
  }

  /* ── scroll state ────────────────────────────────────────────────────── */
  function initScroll(header) {
    var ticking = false;
    function paint() {
      header.classList.toggle("scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    }, { passive: true });
    paint();
  }

  function normalizePath(url) {
    if (!url || url === "#" || url === "") return null;
    try {
      var parsed = new URL(url, window.location.href);
      if (["javascript:", "mailto:", "tel:"].indexOf(parsed.protocol.toLowerCase()) !== -1) return null;
      var path = parsed.pathname || "/";
      if (path.length > 1 && path.endsWith("/")) path = path.replace(/\/+$/, "");
      return path || "/";
    } catch (err) {
      return null;
    }
  }

  function syncCurrentPageState(header) {
    var currentPath = normalizePath(window.location.href);
    var items = Array.prototype.slice.call(header.querySelectorAll(".cas-dock-item[href], .cas-dock-parent__link, .cas-m-item[href]"));
    var matched = null;

    items.forEach(function (link) {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    Array.prototype.forEach.call(header.querySelectorAll(".cas-dock-item--parent"), function (item) {
      item.classList.remove("is-active");
    });

    if (!currentPath) return;

    for (var i = 0; i < items.length; i++) {
      var link = items[i];
      var href = link.getAttribute("href");
      var tabUrl = link.getAttribute("data-cas-tab-url");
      var target = href || tabUrl || "";
      var targetPath = normalizePath(target);
      if (targetPath && targetPath === currentPath) {
        matched = link;
        break;
      }
    }

    if (matched) {
      matched.classList.add("is-active");
      matched.setAttribute("aria-current", "page");
      var parentItem = matched.closest(".cas-dock-item--parent");
      if (parentItem) parentItem.classList.add("is-active");
    }
  }

  function initHeader(header) {
    if (header.dataset.casInit) return;
    header.dataset.casInit = "1";
    try {
      var dock = header.querySelector("[data-cas-dock]");
      if (dock) initDock(dock);
      initDropdowns(header);
      initMobile(header);
      initAmbient(header.querySelector(".cas-dock-canvas"));
      initScroll(header);
      syncCurrentPageState(header);
    } catch (err) {
      console.error("[CAS Header] initialisation failed:", err);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     FOOTER — strands, nanopore lane, counter
     ══════════════════════════════════════════════════════════════════════════ */

  var BASES = ["A", "C", "G", "T"];
  var BASE_LEVEL = { A: 22, C: 40, G: 12, T: 31 };
  var BASE_COLOR = { A: C.t2, C: C.t1, G: C.t3, T: "#9c6544" };
  var BASE_WIDTH = 34;
  var SCROLL_SPEED = 46;
  var SEQ_LENGTH = 256;

  function fitCanvas(canvas) {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[CAS Footer] canvas 2D context unavailable — animations disabled.");
      return null;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function drawStrands(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    function pair(baseY, amp, freq, speed, alpha, phase) {
      var y1 = [], y2 = [], step = 4, x;
      for (x = 0; x <= w; x += step) {
        var env = 0.55 + 0.45 * Math.sin(x * 0.004 + t * 0.35 + phase);
        var a = amp * env;
        y1.push(baseY + a * Math.sin(x * freq + t * speed + phase));
        y2.push(baseY + a * Math.sin(x * freq + t * speed + phase + Math.PI));
      }
      for (var i = 0; i < y1.length; i += 6) {
        if (Math.abs(y1[i] - y2[i]) > amp * 0.55) {
          ctx.strokeStyle = (Math.floor((i * step) / 24) + Math.floor(baseY)) % 2 === 0 ? C.t3 : C.t1;
          ctx.globalAlpha = alpha * 0.4;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(i * step, y1[i]);
          ctx.lineTo(i * step, y2[i]);
          ctx.stroke();
        }
      }
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = C.t2;
      ctx.beginPath();
      for (var j = 0; j < y1.length; j++) { if (j === 0) ctx.moveTo(0, y1[j]); else ctx.lineTo(j * step, y1[j]); }
      ctx.stroke();
      ctx.strokeStyle = C.t3;
      ctx.beginPath();
      for (var k = 0; k < y2.length; k++) { if (k === 0) ctx.moveTo(0, y2[k]); else ctx.lineTo(k * step, y2[k]); }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    pair(h * 0.24, 26, 0.021, 0.9, 0.75, 0);
    pair(h * 0.78, 32, 0.016, -0.7, 0.6, 2.4);
  }

  function createLane(canvas, lettersOn, reduced) {
    var seq = [];
    for (var i = 0; i < SEQ_LENGTH; i++) seq.push(BASES[Math.floor(Math.random() * 4)]);
    var letters = [], flashes = [], lastCrossed = -1;
    var startTime = performance.now();

    function levelAt(wx) {
      var idx = ((Math.floor(wx / BASE_WIDTH) % SEQ_LENGTH) + SEQ_LENGTH) % SEQ_LENGTH;
      var prev = ((idx - 1) % SEQ_LENGTH + SEQ_LENGTH) % SEQ_LENGTH;
      var into = ((wx % BASE_WIDTH) + BASE_WIDTH) % BASE_WIDTH;
      var blend = Math.min(1, into / (BASE_WIDTH * 0.18));
      blend = blend * blend * (3 - 2 * blend);
      var noise = Math.sin(wx * 0.9) * 1.1 + Math.sin(wx * 0.23 + 1.7) * 1.6 + Math.sin(wx * 2.7 + 0.4) * 0.5;
      return BASE_LEVEL[seq[prev]] + (BASE_LEVEL[seq[idx]] - BASE_LEVEL[seq[prev]]) * blend + noise;
    }

    function draw(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);
      var midY = h * 0.56;
      var scroll = t * SCROLL_SPEED;
      var poreX = w * 0.16;

      ctx.strokeStyle = C.t1;
      ctx.globalAlpha = 0.14;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      var idx = ((Math.floor(scroll / BASE_WIDTH) % SEQ_LENGTH) + SEQ_LENGTH) % SEQ_LENGTH;
      var x = 0;
      while (x < w + BASE_WIDTH) {
        var runStart = idx * BASE_WIDTH;
        var s = Math.max(scroll, runStart);
        var e2 = Math.min(scroll + w + BASE_WIDTH, runStart + BASE_WIDTH);
        ctx.strokeStyle = BASE_COLOR[seq[idx]];
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        var started = false;
        for (var wx = s; wx <= e2; wx += 3) {
          var px = wx - scroll;
          var py = midY - levelAt(wx) * 0.9;
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        x = e2 - scroll;
        idx = (idx + 1) % SEQ_LENGTH;
      }
      ctx.globalAlpha = 1;

      var gap = 26, barW = 5;
      ctx.fillStyle = C.t2;
      ctx.globalAlpha = 0.65;
      ctx.fillRect(poreX - barW / 2, 8, barW, midY - gap / 2 - 10);
      ctx.fillRect(poreX - barW / 2, midY + gap / 2 + 2, barW, h - midY - gap / 2 - 10);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = C.t3;
      ctx.globalAlpha = 0.35 + 0.12 * Math.sin(t * 3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(poreX, midY, gap * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (lettersOn && !reduced) {
        var boundary = Math.floor((scroll + poreX) / BASE_WIDTH);
        if (boundary !== lastCrossed) {
          lastCrossed = boundary;
          var b = seq[((boundary % SEQ_LENGTH) + SEQ_LENGTH) % SEQ_LENGTH];
          letters.push({ base: b, x: poreX, y: midY - gap * 0.7, born: t });
          flashes.push({ x: poreX, y: midY, born: t });
          if (letters.length > 24) letters.shift();
        }
      }

      ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      for (var li = letters.length - 1; li >= 0; li--) {
        var L = letters[li];
        var age = t - L.born;
        if (age > 1.5) { letters.splice(li, 1); continue; }
        var p = age / 1.5;
        ctx.globalAlpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
        ctx.fillStyle = BASE_COLOR[L.base];
        ctx.fillText(L.base, L.x + 14, L.y - p * 26);
      }
      for (var fi = flashes.length - 1; fi >= 0; fi--) {
        var F = flashes[fi];
        var fa = t - F.born;
        if (fa > 0.5) { flashes.splice(fi, 1); continue; }
        ctx.globalAlpha = (1 - fa / 0.5) * 0.45;
        ctx.strokeStyle = C.t1;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(F.x, F.y, 6 + fa * 34, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    return { draw: draw, start: startTime };
  }

  function initFooter(footer) {
    if (footer.dataset.casFInit) return;
    footer.dataset.casFInit = "1";

    try {
      var reduced = reducedMotion();
      var waveOn = footer.getAttribute("data-cas-wave") !== "off";
      var lettersOn = footer.getAttribute("data-cas-letters") !== "off";

      var strandCanvas = footer.querySelector(".cas-footer__wave canvas");
      var laneCanvas = footer.querySelector(".cas-footer__lane canvas");
      var strandFit = null, laneFit = null, lane = null;

      if (strandCanvas && waveOn) strandFit = fitCanvas(strandCanvas);
      if (laneCanvas) {
        laneFit = fitCanvas(laneCanvas);
        if (laneFit) lane = createLane(laneCanvas, lettersOn, reduced);
        else console.error("[CAS Footer] could not prepare the nanopore lane canvas — the lane stays empty.");
      }

      var raf = 0, running = false;
      function frame() {
        var t = (performance.now() - (lane ? lane.start : performance.now())) / 1000;
        if (strandFit) drawStrands(strandFit.ctx, strandFit.w, strandFit.h, t);
        if (lane && laneFit) lane.draw(laneFit.ctx, laneFit.w, laneFit.h, t);
        raf = requestAnimationFrame(frame);
      }
      function renderStatic() {
        if (strandFit) drawStrands(strandFit.ctx, strandFit.w, strandFit.h, 1.3);
        if (lane && laneFit) lane.draw(laneFit.ctx, laneFit.w, laneFit.h, 4);
      }
      function start() { if (!running && !reduced) { running = true; raf = requestAnimationFrame(frame); } }
      function stop() { running = false; cancelAnimationFrame(raf); }

      if (reduced) renderStatic();
      else if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting) start(); else stop(); });
        }, { rootMargin: "120px" }).observe(footer);
      } else start();

      if ("ResizeObserver" in window && (strandCanvas || laneCanvas)) {
        var timer = null;
        new ResizeObserver(function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            if (strandCanvas && waveOn) strandFit = fitCanvas(strandCanvas);
            if (laneCanvas) laneFit = fitCanvas(laneCanvas);
            if (reduced) renderStatic();
          }, 120);
        }).observe(footer);
      }

      var basesNode = footer.querySelector("[data-cas-bases]");
      if (basesNode) {
        var bases = 1284 + Math.floor(Math.random() * 300);
        var paint = function () { basesNode.textContent = bases.toLocaleString("en-US"); };
        paint();
        if (!reduced) {
          setInterval(function () {
            if (document.visibilityState === "visible" && running) {
              bases += 1 + Math.floor(Math.random() * 3);
              paint();
            }
          }, 160);
        }
      }

      var topBtn = footer.querySelector("[data-cas-top]");
      if (topBtn) {
        topBtn.addEventListener("click", function () {
          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        });
      }
    } catch (err) {
      console.error("[CAS Footer] initialisation failed:", err);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════════════════════════════ */

  function initAll() {
    var headers = document.querySelectorAll("[data-cas-header]");
    var footers = document.querySelectorAll(".cas-footer");
    Array.prototype.forEach.call(headers, initHeader);
    Array.prototype.forEach.call(footers, initFooter);
    if (debugOn()) {
      console.info(
        "[CAS Header & Footer] engine v" + VERSION + " — " +
        headers.length + " header(s), " + footers.length + " footer(s) found" +
        (headers.length || footers.length ? "" : " (idle: no markup on this page)")
      );
    }
  }

  ready(initAll);
  /* second pass for template parts injected after DOMContentLoaded */
  window.addEventListener("load", initAll);

  window.CasHeaderFooter = {
    version: VERSION,
    init: initAll,
    initHeader: initHeader,
    initFooter: initFooter
  };
})();
