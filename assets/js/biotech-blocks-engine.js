/**
 * CAS-NGS Biotech Blocks — Unified Client Runtime & Render Engine
 *
 * Combines all 5 visual core sections:
 * 1. Act 0: Animated Top Dock Header (Spring-damping magnification & physics dropdowns)
 * 2. Act 1: Hero Sequencer Terminal (Real-time run timer & waveform simulator)
 * 3. Act 2: Bento Services Grid (Dorado GPU compute histogram & flowcell)
 * 4. Act 3: Process Timeline (Sample prep to research insight)
 * 5. Act 4: Conversion CTA Banner
 * 6. Background 3D DNA Model Simulation Engine (Three.js + GSAP 1-pose-per-section ScrollTrigger)
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.3.1
 */

(function () {
  'use strict';

  /* ==========================================================================
     SPRING-DAMPING PHYSICS UTILITIES (ThreeUI Controller Logic)
     ========================================================================== */
  var clamp = function (val, min, max) {
    return Math.max(min, Math.min(max, val));
  };

  function createTopDockController(root, getOptions) {
    var reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var precisionQuery = window.matchMedia("(hover:hover) and (pointer:fine)");
    var items = Array.prototype.slice.call(root.querySelectorAll("[data-dock-item]")).map(function (element) {
      return {
        element: element,
        baseWidth: 0,
        baseHeight: 0,
        value: 0,
        velocity: 0,
        target: 0
      };
    });

    var enabled = false;
    var pointerActive = false;
    var dirty = false;
    var frame = 0;

    var canAnimate = function () {
      return !reducedQuery.matches && root.clientWidth > 0 && window.innerWidth > 600 && precisionQuery.matches;
    };

    var measure = function () {
      enabled = canAnimate();
      var opts = getOptions();
      if (opts.lockTrack) root.style.width = "";
      items.forEach(function (state) {
        state.element.style.width = "";
        state.element.style.height = "";
        state.element.style.transform = "";
        state.element.dataset.dockNear = "false";
      });
      items.forEach(function (state) {
        var rect = state.element.getBoundingClientRect();
        state.baseWidth = rect.width;
        state.baseHeight = rect.height;
        state.value = 0;
        state.velocity = 0;
        state.target = 0;
      });
      pointerActive = false;
      dirty = false;
      if (opts.lockTrack) {
        root.style.width = root.getBoundingClientRect().width.toFixed(2) + "px";
      }
      root.dataset.dockState = enabled ? "idle" : "static";
      root.dataset.dockMax = "0.00";
    };

    var setTargets = function (clientX, clientY) {
      if (!enabled) return;
      var opts = getOptions();
      var rects = items.map(function (s) { return s.element.getBoundingClientRect(); });
      for (var i = 0; i < items.length; i++) {
        var r = rects[i];
        var center = r.left + r.width * 0.5;
        var prox = clamp(1 - Math.abs(clientX - center) / Math.max(1, opts.proximity), 0, 1);
        var influence = prox * prox * (3 - 2 * prox);
        items[i].target = influence;
        items[i].element.dataset.dockNear = influence > 0.08 ? "true" : "false";
      }
      pointerActive = true;
      dirty = true;
      root.dataset.dockState = "active";
    };

    var reset = function () {
      pointerActive = false;
      dirty = true;
      items.forEach(function (s) {
        s.target = 0;
        s.element.dataset.dockNear = "false";
      });
    };

    var applyLayout = function () {
      var opts = getOptions();
      for (var i = 0; i < items.length; i++) {
        var s = items[i];
        var val = clamp(s.value, 0, 1.08);
        var extraWidth = Math.min(opts.widthGrowth, s.baseWidth * 0.24);
        var extraHeight = opts.heightGrowth;
        s.element.style.width = (s.baseWidth + extraWidth * val).toFixed(2) + "px";
        s.element.style.height = (s.baseHeight + extraHeight * val).toFixed(2) + "px";
        s.element.style.transform = "translateY(" + (val * opts.drop).toFixed(2) + "px)";
      }
    };

    var draw = function () {
      if (enabled && dirty) {
        var opts = getOptions();
        var moving = false;
        var maxVal = 0;
        for (var i = 0; i < items.length; i++) {
          var s = items[i];
          s.velocity += (s.target - s.value) * opts.spring;
          s.velocity *= opts.damping;
          s.value += s.velocity;
          if (Math.abs(s.target - s.value) < 0.001 && Math.abs(s.velocity) < 0.001) {
            s.value = s.target;
            s.velocity = 0;
          } else {
            moving = true;
          }
          maxVal = Math.max(maxVal, clamp(s.value, 0, 1.08));
        }
        applyLayout();
        root.dataset.dockMax = maxVal.toFixed(2);
        if (!moving) {
          dirty = false;
          if (items.every(function (s) { return s.target === 0; })) {
            root.dataset.dockState = "idle";
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };

    var onPointerMove = function (e) { setTargets(e.clientX, e.clientY); };
    var onWindowPointerMove = function (e) {
      if (!pointerActive) return;
      var rootRect = root.getBoundingClientRect();
      var itemRects = items.map(function (s) { return s.element.getBoundingClientRect(); });
      var bottom = Math.max.apply(Math, [rootRect.bottom].concat(itemRects.map(function (r) { return r.bottom; })));
      var outside = e.clientX < rootRect.left || e.clientX > rootRect.right || e.clientY < rootRect.top || e.clientY > bottom + 25;
      if (outside) reset();
    };

    var resizeObs = new ResizeObserver(measure);
    resizeObs.observe(root.parentElement || root);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", reset);
    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    reducedQuery.addEventListener("change", measure);
    precisionQuery.addEventListener("change", measure);

    measure();
    frame = requestAnimationFrame(draw);

    return function () {
      cancelAnimationFrame(frame);
      resizeObs.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", reset);
      window.removeEventListener("pointermove", onWindowPointerMove);
    };
  }

  /* ==========================================================================
     IN-TAB DROPDOWN PHYSICS SYSTEM (Hover Intent, Click Toggle, ESC Dismiss)
     ========================================================================== */
  function initDockDropdowns(container) {
    var tabWrappers = container.querySelectorAll('.atd-tab-wrapper[data-has-dropdown="true"]');
    var closeTimers = {};
    var openTimers = {};

    var closeAllDropdowns = function () {
      tabWrappers.forEach(function (w) {
        var btn = w.querySelector('[data-dock-item]');
        var panel = w.querySelector('.atd-dropdown-panel');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (panel) panel.classList.remove('is-open');
      });
    };

    tabWrappers.forEach(function (wrap, idx) {
      var btn = wrap.querySelector('[data-dock-item]');
      var panel = wrap.querySelector('.atd-dropdown-panel');
      if (!btn || !panel) return;

      var openDropdown = function () {
        clearTimeout(closeTimers[idx]);
        openTimers[idx] = setTimeout(function () {
          // Close sibling dropdowns first
          tabWrappers.forEach(function (otherWrap, otherIdx) {
            if (otherIdx !== idx) {
              var oBtn = otherWrap.querySelector('[data-dock-item]');
              var oPanel = otherWrap.querySelector('.atd-dropdown-panel');
              if (oBtn) oBtn.setAttribute('aria-expanded', 'false');
              if (oPanel) oPanel.classList.remove('is-open');
            }
          });
          btn.setAttribute('aria-expanded', 'true');
          panel.classList.add('is-open');
        }, 150); // 150ms hover-intent delay
      };

      var closeDropdown = function () {
        clearTimeout(openTimers[idx]);
        closeTimers[idx] = setTimeout(function () {
          btn.setAttribute('aria-expanded', 'false');
          panel.classList.remove('is-open');
        }, 180);
      };

      // Hover intent triggers
      wrap.addEventListener('mouseenter', openDropdown);
      wrap.addEventListener('mouseleave', closeDropdown);

      // Click toggle
      btn.addEventListener('click', function (e) {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          panel.classList.remove('is-open');
        } else {
          closeAllDropdowns();
          btn.setAttribute('aria-expanded', 'true');
          panel.classList.add('is-open');
        }
      });
    });

    // Outside click dismiss
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    // Escape key dismiss
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeAllDropdowns();
      }
    });
  }

  /* ==========================================================================
     CORE BIOTECH BLOCKS APPLICATION ENGINE
     ========================================================================== */
  var BiotechBlocks = {
    init: function () {
      this.initHeaderDock();
      this.initPipelineHero();
      this.initWaveforms();
      this.initTimers();
      this.initHistograms();
      this.initScrollAnimations();
      this.initDnaBackground();
    },

    /* ── Act 0: Header Top Dock Controller ── */
    initHeaderDock: function () {
      var dockWrappers = document.querySelectorAll('.cas-header-dock-wrap, [data-cas-dock-wrapper]');
      dockWrappers.forEach(function (wrap) {
        if (wrap.getAttribute('data-dock-init') === 'true') return;
        wrap.setAttribute('data-dock-init', 'true');

        var dockNav = wrap.querySelector('[data-cas-dock-nav], .atd-modern__dock');
        if (dockNav) {
          createTopDockController(dockNav, function () {
            return {
              proximity: 122,
              spring: 0.19,
              damping: 0.70,
              widthGrowth: 17,
              heightGrowth: 16,
              drop: 3.5,
              lockTrack: true
            };
          });

          // Mount In-Tab Dropdown System
          initDockDropdowns(wrap);
        }
      });
    },

    
    /* ── Act 0: 4-Frame 3D Interactive Sequencing Pipeline Hero Engine ── */
    initPipelineHero: function () {
      var pipelineContainers = document.querySelectorAll('[data-cas-pipeline-hero="true"], .wp-block-cas-ngs-interactive-pipeline-hero');
      pipelineContainers.forEach(function (container) {
        if (container.getAttribute('data-pipeline-init') === 'true') return;
        container.setAttribute('data-pipeline-init', 'true');

        if (!window.THREE) {
          var fail = container.querySelector('.csi-fail');
          if (fail) fail.style.display = 'flex';
          return;
        }

        var stage = container.querySelector('.csi-stage');
        if (!stage) return;
        var rootEl = document.documentElement;

        var fxEnabled = container.getAttribute('data-fx-enabled') !== 'false';
        var canvasBgHex = container.getAttribute('data-canvas-bg') || '#f8f6f0';
        var modelUrl = container.getAttribute('data-model-url') || (window.casBioBlocksData && window.casBioBlocksData.defaultModelUrl) || '';
        if (!modelUrl) {
          modelUrl = '/wp-content/plugins/cas-ngs-biotech-blocks/assets/models/dna.glb';
        }

        var RAIL_NAMES = [
          container.getAttribute('data-rail-1') || '01 · Sample',
          container.getAttribute('data-rail-2') || '02 · Sequencing',
          container.getAttribute('data-rail-3') || '03 · Basecalling',
          container.getAttribute('data-rail-4') || '04 · Variants'
        ];
        var TICKER_STRINGS = [
          container.getAttribute('data-ticker-1') || 'SAMPLE CS-0427 · QC PASS · 2.4 ng/µL · LOADING FLOWCELL 04',
          container.getAttribute('data-ticker-2') || 'FOUR-CHANNEL OPTICS · SIGNAL ACQUIRED'
        ];

        var PAL = {
          bg: 0xf8f6f0, fogD: 0.018,
          dnaTint: 0x8c6d58,
          strandA: 0x8c6d58, strandB: 0xa0663d, strandDarkA: 0xe2d5c6, strandDarkB: 0xdcc9b4,
          base: [0x865438, 0xa0663d, 0x9e7b4f, 0xd4996e],
          wave: [0x2b2522, 0x865438, 0x8c6d58, 0x9e7b4f],
          rainA: 0x8c6d58, rainB: 0x2b2522, streamDim: 0.78,
          laser: 0x865438,
          heat: [0xcbb9a6, 0x9e7b4f, 0x865438], heatEm: 0xefe9df,
          grid: 0xd8cbb9, ringA: 0x865438, ringB: 0x9e7b4f, ao: 0x5c4a3d,
          sun: { c: 0xfff8ee, i: 0.95 }, hemi: { sky: 0xfbf7ef, ground: 0xd8cab8, i: 0.8 },
          fill: { c: 0xd4996e, i: 0.35 }, rim: { c: 0x865438, i: 0.45 },
          glyphs: ['#9e7b4f', '#865438']
        };

        if (/^#[0-9a-fA-F]{6}$/.test(canvasBgHex)) {
          PAL.bg = parseInt(canvasBgHex.slice(1), 16);
        }

        var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
        var lerp  = function (a, b, t) { return a + (b - a) * t; };
        var map01 = function (x, a, b) { return clamp((x - a) / (b - a), 0, 1); };
        var sstep = function (a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
        var band  = function (p, a, b, f) { return sstep(a, a + f, p) * (1 - sstep(b - f, b, p)); };
        function mulberry(seed) {
          return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
          };
        }
        var rnd = mulberry(20260427);
        var damp = function (cur, target, lambda, dt) { return lerp(cur, target, 1 - Math.exp(-lambda * dt)); };
        var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var WAVE_Z = -22, RAIN_Z = -31, DATA_Z = -46;

        var renderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        } catch (e) {
          var failEl = container.querySelector('.csi-fail');
          if (failEl) failEl.style.display = 'flex';
          return;
        }
        renderer.setClearColor(PAL.bg, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.className = 'gl';
        stage.insertBefore(renderer.domElement, stage.firstChild);

        var scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(PAL.bg, PAL.fogD);
        var camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, 0.1, 220);
        camera.position.set(7.4, 2.3, 8.9);

        var hemi = new THREE.HemisphereLight(PAL.hemi.sky, PAL.hemi.ground, PAL.hemi.i); scene.add(hemi);
        scene.add(new THREE.AmbientLight(0xffffff, 0.22));
        var sun = new THREE.DirectionalLight(PAL.sun.c, PAL.sun.i);
        sun.position.set(6, 18, -12);
        sun.target.position.set(0, 0, -26);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;   sun.shadow.camera.bottom = -20;
        sun.shadow.camera.near = 2;   sun.shadow.camera.far = 70;
        sun.shadow.bias = -0.0004;
        scene.add(sun); scene.add(sun.target);
        var fillDir = new THREE.DirectionalLight(PAL.fill.c, PAL.fill.i);
        fillDir.position.set(-9, 6, -7); scene.add(fillDir);
        var rimLight = new THREE.PointLight(PAL.rim.c, PAL.rim.i, 60);
        rimLight.position.set(2, 5, 6); scene.add(rimLight);

        var composer = null;
        if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.RenderPass !== 'undefined' && typeof THREE.ShaderPass !== 'undefined') {
          composer = new THREE.EffectComposer(renderer);
          composer.addPass(new THREE.RenderPass(scene, camera));
          var VignetteShader = {
            uniforms: { tDiffuse: { value: null }, uIntensity: { value: 0.3 } },
            vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
            fragmentShader:
              'uniform sampler2D tDiffuse; uniform float uIntensity; varying vec2 vUv;' +
              'void main(){' +
              '  vec4 c = texture2D(tDiffuse, vUv);' +
              '  vec2 q = vUv - 0.5;' +
              '  float d = dot(q,q);' +
              '  c.rgb *= 1.0 - smoothstep(0.12, 0.55, d) * 0.42 * uIntensity;' +
              '  gl_FragColor = c;' +
              '}'
          };
          composer.addPass(new THREE.ShaderPass(VignetteShader));
        }

        function makeGlyphAtlas() {
          var glyphs = ['A', 'T', 'C', 'G', '0', '1', '0', '1', 'G', 'C', 'T', 'A', '1', '0', '7', 'F'];
          var cell = 64, c = document.createElement('canvas'); c.width = 256; c.height = 256;
          var x = c.getContext('2d');
          x.clearRect(0, 0, 256, 256);
          x.font = "700 40px 'JetBrains Mono',monospace";
          x.textAlign = 'center'; x.textBaseline = 'middle';
          x.shadowColor = 'rgba(255,255,255,0.4)'; x.shadowBlur = 8;
          x.fillStyle = '#f6f9ff';
          for (var i = 0; i < 16; i++) {
            x.fillText(glyphs[i], (i % 4) * cell + cell / 2, Math.floor(i / 4) * cell + cell / 2);
          }
          var t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
          return t;
        }
        function makeDotTexture() {
          var c = document.createElement('canvas'); c.width = 64; c.height = 64;
          var x = c.getContext('2d');
          var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
          g.addColorStop(0, 'rgba(255,255,255,1)');
          g.addColorStop(0.3, 'rgba(255,255,255,0.55)');
          g.addColorStop(0.65, 'rgba(255,255,255,0.14)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          x.fillStyle = g; x.fillRect(0, 0, 64, 64);
          return new THREE.CanvasTexture(c);
        }
        function makeGradientTexture() {
          var c = document.createElement('canvas'); c.width = 128; c.height = 8;
          var x = c.getContext('2d');
          var g = x.createLinearGradient(0, 0, 128, 0);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(0.5, 'rgba(255,255,255,0.85)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          x.fillStyle = g; x.fillRect(0, 0, 128, 8);
          return new THREE.CanvasTexture(c);
        }
        var texAtlas = makeGlyphAtlas();
        var texDot = makeDotTexture();
        var texGrad = makeGradientTexture();

        /* Frame 1: DNA Model */
        var MODEL_TARGET_H = 9.4;
        var modelGroup = new THREE.Group(); scene.add(modelGroup);
        var modelState = { reveal: 0 };
        var modelReady = false, modelIsFallback = false;
        var modelSpin = 0;
        var modelTintMats = [];
        var tintTmp = new THREE.Color();

        function collectModelMats(root) {
          root.traverse(function (o) {
            if (o.isMesh) {
              o.castShadow = true;
              var mats = Array.isArray(o.material) ? o.material : [o.material];
              for (var k = 0; k < mats.length; k++) {
                var m = mats[k];
                if (!m || m.userData._tintTracked) continue;
                m.userData._tintTracked = true;
                m.userData.origColor = m.color ? m.color.clone() : new THREE.Color(0xffffff);
                modelTintMats.push(m);
              }
            }
          });
        }
        function tintModel() {
          if (!modelTintMats.length) return;
          var tint = tintTmp.set(PAL.dnaTint);
          for (var i = 0; i < modelTintMats.length; i++) {
            var m = modelTintMats[i];
            if (m.color) m.color.copy(m.userData.origColor).lerp(tint, 0.5);
            if (m.emissive) m.emissive.copy(tint).multiplyScalar(0.10);
          }
        }

        var FB_RUNGS = 22;
        function fitPivot(pivot) {
          var box = new THREE.Box3().setFromObject(pivot);
          var size = box.getSize(new THREE.Vector3());
          var maxAx = Math.max(size.x, size.y, size.z);
          var inner = pivot.children[0];
          if (inner) {
            if (maxAx === size.x) inner.rotation.z = Math.PI / 2;
            else if (maxAx === size.z) inner.rotation.x = Math.PI / 2;
          }
          pivot.updateMatrixWorld(true);
          box.setFromObject(pivot);
          size = box.getSize(new THREE.Vector3());
          pivot.scale.multiplyScalar(MODEL_TARGET_H / Math.max(size.y, 0.001));
          pivot.updateMatrixWorld(true);
          box.setFromObject(pivot);
          var center = box.getCenter(new THREE.Vector3());
          pivot.position.sub(center);
        }

        function onModelReady(pivot) {
          modelGroup.add(pivot);
          fitPivot(pivot);
          if (modelIsFallback) {
            pivot.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
          } else {
            collectModelMats(pivot);
            tintModel();
          }
          modelReady = true;
          silentRelease();
        }

        function buildFallbackDNA() {
          if (modelReady) return;
          modelIsFallback = true;
          var pivot = new THREE.Group();
          var R = 1.25, TW = 0.62, H = 10.4, N = FB_RUNGS, PITCH = H / N;
          function strandCurve(strand) {
            var pts = [];
            for (var k = -1; k <= N + 1; k += 0.5) {
              var a = k * TW + (strand ? Math.PI : 0);
              pts.push(new THREE.Vector3(Math.cos(a) * R, k * PITCH - H / 2, Math.sin(a) * R));
            }
            return new THREE.CatmullRomCurve3(pts);
          }
          var fbStrandMatA = new THREE.MeshStandardMaterial({ color: PAL.strandDarkA, emissive: PAL.strandA, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.2 });
          var fbStrandMatB = new THREE.MeshStandardMaterial({ color: PAL.strandDarkB, emissive: PAL.strandB, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.2 });
          pivot.add(new THREE.Mesh(new THREE.TubeGeometry(strandCurve(0), 200, 0.09, 10, false), fbStrandMatA));
          pivot.add(new THREE.Mesh(new THREE.TubeGeometry(strandCurve(1), 200, 0.09, 10, false), fbStrandMatB));
          var rungGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
          var fbRungMesh = new THREE.InstancedMesh(rungGeo, new THREE.MeshBasicMaterial({}), FB_RUNGS * 2);
          fbRungMesh.frustumCulled = false;
          var m4f = new THREE.Matrix4(), qf = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0),
              pa = new THREE.Vector3(), pb = new THREE.Vector3(), mid = new THREE.Vector3(),
              dir = new THREE.Vector3(), scl = new THREE.Vector3(), ctr = new THREE.Vector3(), col = new THREE.Color();
          for (var i = 0; i < FB_RUNGS; i++) {
            var a = i * TW, isAT = (i % 2 === 0);
            pa.set(Math.cos(a) * R, i * PITCH - H / 2, Math.sin(a) * R);
            pb.set(-Math.cos(a) * R, i * PITCH - H / 2, -Math.sin(a) * R);
            mid.copy(pa).add(pb).multiplyScalar(0.5);
            var half = pa.distanceTo(pb) / 2;
            dir.copy(pa).sub(mid).normalize();
            qf.setFromUnitVectors(up, dir);
            scl.set(1, half, 1);
            ctr.copy(mid).addScaledVector(dir, half * 0.5);
            m4f.compose(ctr, qf, scl);
            fbRungMesh.setMatrixAt(i * 2, m4f);
            col.set(isAT ? PAL.base[0] : PAL.base[2]); fbRungMesh.setColorAt(i * 2, col);
            dir.copy(pb).sub(mid).normalize();
            qf.setFromUnitVectors(up, dir);
            ctr.copy(mid).addScaledVector(dir, half * 0.5);
            m4f.compose(ctr, qf, scl);
            fbRungMesh.setMatrixAt(i * 2 + 1, m4f);
            col.set(isAT ? PAL.base[1] : PAL.base[3]); fbRungMesh.setColorAt(i * 2 + 1, col);
          }
          fbRungMesh.instanceColor.needsUpdate = true;
          pivot.add(fbRungMesh);
          onModelReady(pivot);
        }

        var fallbackTimer = window.setTimeout(function () { if (!modelReady) buildFallbackDNA(); }, 5000);
        if (THREE.GLTFLoader && modelUrl) {
          var gltfLoader = new THREE.GLTFLoader();
          gltfLoader.load(modelUrl, function (gltf) {
            if (modelReady) return;
            window.clearTimeout(fallbackTimer);
            var pivot = new THREE.Group();
            pivot.add(gltf.scene);
            onModelReady(pivot);
          }, undefined, function () {
            if (!modelReady) { window.clearTimeout(fallbackTimer); buildFallbackDNA(); }
          });
        } else {
          window.clearTimeout(fallbackTimer);
          buildFallbackDNA();
        }

        /* Frame 2: Ribbon Chromatogram Array */
        var waveGroup = new THREE.Group(); waveGroup.position.set(0, 0, WAVE_Z); waveGroup.visible = false; scene.add(waveGroup);
        var WAVE_PTS = 200, WAVE_W = 16, RIBBON_D = 0.30;
        var WAVE_BASE_Y = [0.30, 1.35, 2.40, 3.45];
        var waveRows = [];
        function buildRibbonGeometry() {
          var geo = new THREE.BufferGeometry();
          var pos = new Float32Array(WAVE_PTS * 2 * 3);
          var nrm = new Float32Array(WAVE_PTS * 2 * 3);
          var idx = [];
          for (var i = 0; i < WAVE_PTS; i++) {
            var x = (i / (WAVE_PTS - 1) - 0.5) * WAVE_W;
            pos[i * 6 + 0] = x; pos[i * 6 + 1] = 0; pos[i * 6 + 2] = -RIBBON_D / 2;
            pos[i * 6 + 3] = x; pos[i * 6 + 4] = 0; pos[i * 6 + 5] = RIBBON_D / 2;
            nrm[i * 6 + 1] = 1; nrm[i * 6 + 4] = 1;
            if (i < WAVE_PTS - 1) {
              var a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d2 = i * 2 + 3;
              idx.push(a, c, b, b, c, d2);
            }
          }
          geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
          geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
          geo.setIndex(idx);
          return geo;
        }
        for (var wi = 0; wi < 4; wi++) {
          var wmat = new THREE.MeshStandardMaterial({
            color: PAL.wave[wi], roughness: 0.5, metalness: 0.18,
            emissive: PAL.wave[wi], emissiveIntensity: 0.14, side: THREE.DoubleSide
          });
          var wmesh = new THREE.Mesh(buildRibbonGeometry(), wmat);
          wmesh.position.y = WAVE_BASE_Y[wi];
          waveGroup.add(wmesh);
          var wpeaks = [];
          for (var pk = 0; pk < 9; pk++) {
            wpeaks.push({ pos: rnd() * WAVE_W * 1.6, amp: 0.22 + rnd() * 0.46, wid: 0.20 + rnd() * 0.34 });
          }
          waveRows.push({ mesh: wmesh, mat: wmat, peaks: wpeaks, speed: 0.9 + rnd() * 0.7 });
        }
        function updateRibbons(t) {
          for (var w = 0; w < waveRows.length; w++) {
            var wr = waveRows[w], arr = wr.mesh.geometry.attributes.position.array;
            for (var k = 0; k < WAVE_PTS; k++) {
              var x = (k / (WAVE_PTS - 1) - 0.5) * WAVE_W;
              var y = 0;
              for (var q = 0; q < wr.peaks.length; q++) {
                var pp = wr.peaks[q];
                var d = ((x + t * wr.speed * 1.3 - pp.pos) % (WAVE_W * 1.6) + WAVE_W * 1.6) % (WAVE_W * 1.6) - WAVE_W * 0.3;
                y += pp.amp * Math.exp(-(d * d) / (pp.wid * pp.wid));
              }
              arr[k * 6 + 1] = y;
              arr[k * 6 + 4] = y;
            }
            wr.mesh.geometry.attributes.position.needsUpdate = true;
          }
        }

        /* Frame 3: Genomic Sequence Stream */
        var rainGroup = new THREE.Group(); rainGroup.position.set(0, 0, RAIN_Z); rainGroup.visible = false; scene.add(rainGroup);
        var RAIN_N = reduced ? 600 : 1200, RAIN_H = 9.5;
        var rainGeo = new THREE.BufferGeometry();
        var rainPos = new Float32Array(RAIN_N * 3);
        var rainSpeed = new Float32Array(RAIN_N), rainOffset = new Float32Array(RAIN_N),
            rainSeedA = new Float32Array(RAIN_N), rainHue = new Float32Array(RAIN_N), rainSize = new Float32Array(RAIN_N);
        for (var ri = 0; ri < RAIN_N; ri++) {
          rainPos[ri * 3] = (rnd() - 0.5) * 17; rainPos[ri * 3 + 1] = 0; rainPos[ri * 3 + 2] = (rnd() - 0.5) * 7;
          rainSpeed[ri] = 1.0 + rnd() * 2.2; rainOffset[ri] = rnd() * RAIN_H;
          rainSeedA[ri] = rnd(); rainHue[ri] = rnd(); rainSize[ri] = 0.5 + rnd() * 1.05;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        rainGeo.setAttribute('aSpeed', new THREE.BufferAttribute(rainSpeed, 1));
        rainGeo.setAttribute('aOffset', new THREE.BufferAttribute(rainOffset, 1));
        rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(rainSeedA, 1));
        rainGeo.setAttribute('aHue', new THREE.BufferAttribute(rainHue, 1));
        rainGeo.setAttribute('aSize', new THREE.BufferAttribute(rainSize, 1));
        var rainMat = new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, blending: THREE.NormalBlending,
          uniforms: { uTime: { value: 0 }, uWeight: { value: PAL.streamDim }, uAtlas: { value: texAtlas },
                     uColA: { value: new THREE.Color(PAL.rainA) }, uColB: { value: new THREE.Color(PAL.rainB) } },
          vertexShader:
            'attribute float aSpeed; attribute float aOffset; attribute float aSeed; attribute float aHue; attribute float aSize;' +
            'uniform float uTime;' +
            'varying float vHue; varying float vFade; varying float vGlyph;' +
            'void main(){' +
            '  vec3 p = position;' +
            '  float y = mod(aOffset - uTime*aSpeed, ' + RAIN_H.toFixed(1) + ') - ' + (RAIN_H * 0.42).toFixed(2) + ';' +
            '  p.y = y + 1.2;' +
            '  vGlyph = floor(mod(aSeed*16.0 + uTime*(1.6 + aSeed*5.0), 16.0));' +
            '  vHue = aHue;' +
            '  vFade = smoothstep(-3.9, -2.9, p.y) * (1.0 - smoothstep(4.6, 5.6, p.y));' +
            '  vec4 mv = modelViewMatrix * vec4(p,1.0);' +
            '  gl_PointSize = aSize * (170.0 / -mv.z);' +
            '  gl_Position = projectionMatrix * mv;' +
            '}',
          fragmentShader:
            'uniform sampler2D uAtlas; uniform float uWeight; uniform vec3 uColA; uniform vec3 uColB;' +
            'varying float vHue; varying float vFade; varying float vGlyph;' +
            'void main(){' +
            '  float cx = mod(vGlyph, 4.0); float cy = floor(vGlyph/4.0);' +
            '  vec2 uv = (vec2(cx, 3.0-cy) + vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y)) / 4.0;' +
            '  vec4 g = texture2D(uAtlas, uv);' +
            '  vec3 col = mix(uColA, uColB, vHue);' +
            '  float a = g.a * vFade * uWeight;' +
            '  if(a < 0.012) discard;' +
            '  gl_FragColor = vec4(col, a);' +
            '}'
        });
        var rain = new THREE.Points(rainGeo, rainMat); rain.frustumCulled = false; rainGroup.add(rain);

        var laserGroup = new THREE.Group(); rainGroup.add(laserGroup);
        var laserCoreMat = new THREE.MeshBasicMaterial({ color: PAL.laser, transparent: true, opacity: 0.16, blending: THREE.NormalBlending, depthWrite: false });
        laserGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 7.4, 6.4), laserCoreMat));
        var laserGlowMat = new THREE.MeshBasicMaterial({ map: texGrad, color: PAL.laser, transparent: true, opacity: 0.10, blending: THREE.NormalBlending, depthWrite: false, side: THREE.DoubleSide });
        laserGroup.add(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 7.4), laserGlowMat));
        laserGroup.add(new THREE.PointLight(PAL.laser, 0.9, 14));
        laserGroup.position.set(-8, 1.2, 0.4);

        /* Frame 4: Variant Matrix + Phylogenetic Tree */
        var dataGroup = new THREE.Group(); dataGroup.position.set(0, 0, DATA_Z); dataGroup.visible = false; scene.add(dataGroup);
        var HM_COLS = 26, HM_ROWS = 15, HM_CELL = 0.46;
        var hmGeo = new THREE.BoxGeometry(0.34, 1, 0.34); hmGeo.translate(0, 0.5, 0);
        var hmMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.22, emissive: PAL.heatEm, emissiveIntensity: 0.16 });
        var hmCount = HM_COLS * HM_ROWS;
        var hmMesh = new THREE.InstancedMesh(hmGeo, hmMat, hmCount);
        hmMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        hmMesh.frustumCulled = false;
        hmMesh.castShadow = true;
        hmMesh.receiveShadow = true;
        dataGroup.add(hmMesh);
        var hmData = [];
        var hIdx = 0;
        for (var rr = 0; rr < HM_ROWS; rr++) {
          for (var cc = 0; cc < HM_COLS; cc++) {
            var h = 0.18 + Math.pow(rnd(), 1.6) * 1.9;
            var cx = (cc - (HM_COLS - 1) / 2) * HM_CELL, cz = (rr - (HM_ROWS - 1) / 2) * HM_CELL;
            hmData.push({ x: cx, z: cz, h: h, delay: Math.sqrt(cx * cx + cz * cz) * 0.09 + rnd() * 0.08, seed: rnd() });
            hmMesh.setColorAt(hIdx, new THREE.Color(0xffffff));
            hIdx++;
          }
        }
        var heatRamp = [new THREE.Color(PAL.heat[0]), new THREE.Color(PAL.heat[1]), new THREE.Color(PAL.heat[2])];
        var heatTmp = new THREE.Color();
        function heatColor(h, out) {
          out.copy(heatRamp[0]).lerp(heatRamp[1], clamp(h / 1.4, 0, 1));
          if (h > 1.4) out.lerp(heatRamp[2], clamp((h - 1.4) / 0.7, 0, 1));
          return out;
        }
        for (var hh = 0; hh < hmCount; hh++) { hmMesh.setColorAt(hh, heatColor(hmData[hh].h, heatTmp)); }
        hmMesh.instanceColor.needsUpdate = true;

        var shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.ShadowMaterial({ opacity: 0.15 }));
        shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.position.y = -0.03;
        shadowFloor.receiveShadow = true;
        dataGroup.add(shadowFloor);
        var aoMat = new THREE.MeshBasicMaterial({ map: texDot, color: PAL.ao, transparent: true, opacity: 0.11, depthWrite: false });
        var aoPlane = new THREE.Mesh(new THREE.PlaneGeometry(17, 17), aoMat);
        aoPlane.rotation.x = -Math.PI / 2; aoPlane.position.y = 0.012;
        dataGroup.add(aoPlane);

        var gridMat = new THREE.LineBasicMaterial({ color: PAL.grid, transparent: true, opacity: 0 });
        (function buildGrid() {
          var size = 20, div = 40, hsz = size / 2, step = size / div, pts = [];
          for (var g = 0; g <= div; g++) {
            var gp = -hsz + g * step;
            pts.push(gp, 0, -hsz, gp, 0, hsz, -hsz, 0, gp, hsz, 0, gp);
          }
          var gg = new THREE.BufferGeometry();
          gg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
          var grid = new THREE.LineSegments(gg, gridMat);
          grid.position.y = -0.01;
          dataGroup.add(grid);
        })();

        var ringMat1 = new THREE.MeshBasicMaterial({ color: PAL.ringA, transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false });
        var ring1 = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.014, 8, 140), ringMat1);
        ring1.rotation.x = -Math.PI / 2; ring1.position.y = 0.06;
        dataGroup.add(ring1);
        var ringMat2 = new THREE.MeshBasicMaterial({ color: PAL.ringB, transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false });
        var ring2 = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.011, 8, 140), ringMat2);
        ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.04;
        dataGroup.add(ring2);

        var treeGroup = new THREE.Group();
        treeGroup.position.set(-6.4, 0.3, -2.4);
        dataGroup.add(treeGroup);
        var treeLevels = [], treeNodes = [];
        (function buildTree() {
          var segs = [[], [], [], []], nodes = [[], [], [], []];
          function branch(px, py, angle, len, depth) {
            if (depth > 3) return;
            var ex = px + Math.cos(angle) * len, ey = py + Math.sin(angle) * len;
            segs[depth].push(px, py, -0.01, ex, ey, -0.01);
            nodes[depth].push(ex, ey, 0);
            var n = depth === 0 ? 3 : 2;
            for (var b = 0; b < n; b++) {
              var spread = 0.62 - depth * 0.08;
              branch(ex, ey, angle + spread * (b - (n - 1) / 2) + (rnd() - 0.5) * 0.22, len * 0.74, depth + 1);
            }
          }
          branch(0, 0, 0.12, 2.3, 0);
          for (var L = 0; L < 4; L++) {
            var g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs[L]), 3));
            var m = new THREE.LineBasicMaterial({ color: PAL.base[L], transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false });
            treeLevels.push(new THREE.LineSegments(g, m));
            treeGroup.add(treeLevels[L]);
            var ng = new THREE.BufferGeometry();
            ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nodes[L]), 3));
            var nm = new THREE.PointsMaterial({ map: texDot, color: PAL.base[L], size: 0.32, transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false, sizeAttenuation: true });
            treeNodes.push(new THREE.Points(ng, nm));
            treeGroup.add(treeNodes[L]);
          }
        })();

        /* Observer Engine */
        var state = {
          p: 0, intro: 0, running: true,
          mouseX: 0, mouseY: 0, mouseDX: 0, mouseDY: 0,
          camX: 7.4, camY: 2.3, camZ: 8.9, lookX: 1.5, lookY: 0.3, lookZ: 0, fov: 47
        };
        var prog = { p: 0 };
        var engaged = true;
        var isAnimating = false;
        var booted = false;
        var frameIndex = 0;
        var currentSec = 0;

        var cards = [
          container.querySelector('[id$="-card-1"], #csi-card-1'),
          container.querySelector('[id$="-card-2"], #csi-card-2'),
          container.querySelector('[id$="-card-3"], #csi-card-3'),
          container.querySelector('[id$="-card-4"], #csi-card-4')
        ];
        var dots = container.querySelectorAll('.csi-dot');
        var railPct = container.querySelector('.csi-rail-pct');
        var railLabel = container.querySelector('.csi-rail-label');
        var phaseName = container.querySelector('.csi-status-phase');
        var scrollCue = container.querySelector('.csi-cue');
        var tickerEl = container.querySelector('.csi-ticker');
        var tickerText = container.querySelector('[id$="-ticker-text"], #csi-ticker-text');

        function syncDots() {
          for (var s = 0; s < dots.length; s++) {
            dots[s].classList.toggle('active', s === frameIndex);
            dots[s].setAttribute('aria-current', s === frameIndex ? 'true' : 'false');
          }
        }

        function goToSection(n) {
          n = clamp(n, 0, 3);
          if (!booted || !engaged || isAnimating || n === frameIndex) return;
          var dist = Math.abs(n - frameIndex);
          frameIndex = n;
          isAnimating = true;
          syncDots();
          if (typeof gsap !== 'undefined') {
            gsap.to(prog, {
              p: n / 3,
              duration: reduced ? 0.35 : clamp(0.55 + 0.4 * dist, 0.8, 1.6),
              ease: 'power3.inOut',
              onComplete: function () { isAnimating = false; }
            });
          } else {
            prog.p = n / 3;
            isAnimating = false;
          }
        }

        function handleIntent(dir) {
          if (!booted || !engaged || isAnimating) return;
          if (dir > 0) {
            if (frameIndex < 3) { goToSection(frameIndex + 1); }
            else { exitToContent(); }
          } else if (frameIndex > 0) {
            goToSection(frameIndex - 1);
          }
        }

        function exitToContent() {
          if (!engaged) return;
          engaged = false;
          isAnimating = true;
          if (sectionObserver) sectionObserver.disable();
          rootEl.classList.remove('csi-locked');
          stage.classList.add('is-exited');
          window.setTimeout(function () { state.running = false; isAnimating = false; }, 1000);
        }

        function reEngage() {
          if (engaged || isAnimating) return;
          engaged = true;
          isAnimating = true;
          window.scrollTo(0, 0);
          rootEl.classList.add('csi-locked');
          stage.classList.remove('is-exited');
          state.running = true;
          prog.p = 1; state.p = 1;
          frameIndex = 3;
          syncDots();
          if (sectionObserver) sectionObserver.enable();
          window.setTimeout(function () { isAnimating = false; }, 950);
        }

        var sectionObserver = null;
        if (typeof Observer !== 'undefined') {
          sectionObserver = Observer.create({
            target: window,
            type: 'wheel,touch',
            wheelSpeed: -1,
            tolerance: 8,
            preventDefault: true,
            onUp: function () { handleIntent(1); },
            onDown: function () { handleIntent(-1); }
          });
        }

        dots.forEach(function (d) {
          d.addEventListener('click', function () {
            var s = parseInt(d.getAttribute('data-sec') || '0', 10);
            goToSection(s);
          });
        });

        window.addEventListener('keydown', function (e) {
          if (engaged) {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); handleIntent(1); }
            else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); handleIntent(-1); }
            else if (e.key >= '1' && e.key <= '4') { goToSection(parseInt(e.key, 10) - 1); }
            else if (e.key === 'Home') { goToSection(0); }
            else if (e.key === 'End') { goToSection(3); }
          } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && window.scrollY <= 4) {
            e.preventDefault(); reEngage();
          }
        });

        window.addEventListener('wheel', function (e) {
          if (engaged) return;
          if (e.deltaY < 0 && window.scrollY <= 4) { e.preventDefault(); reEngage(); }
        }, { passive: false });

        var reTouchY = null;
        window.addEventListener('touchstart', function (e) { reTouchY = e.touches[0].clientY; }, { passive: true });
        window.addEventListener('touchmove', function (e) {
          if (engaged || reTouchY === null) return;
          if (window.scrollY <= 4 && e.touches[0].clientY - reTouchY > 44) {
            e.preventDefault(); reEngage(); reTouchY = null;
          }
        }, { passive: false });
        window.addEventListener('touchend', function () { reTouchY = null; }, { passive: true });

        window.addEventListener('scroll', function () {
          if (engaged && window.scrollY > 0) { window.scrollTo(0, 0); }
        }, { passive: true });

        container.addEventListener('click', function (e) {
          var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
          if (!a || !engaged) return;
          var id = a.getAttribute('href');
          e.preventDefault();
          exitToContent();
          window.setTimeout(function () {
            var el = document.querySelector(id);
            if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
          }, 750);
        });

        /* Camera Corridor */
        var camKeys = [
          { p: 0.000,  pos: [ 7.4, 2.3,   8.9], look: [ 1.5, 0.3,    0], fov: 47 },
          { p: 0.110,  pos: [ 4.1, 4.8,   5.3], look: [ 0.7, 2.7, -0.6], fov: 45 },
          { p: 0.205,  pos: [ 1.1, 6.4,   1.5], look: [ 0.0, 3.3,   -7], fov: 43 },
          { p: 0.270,  pos: [-0.7, 5.7,  -4.6], look: [ 0.0, 2.9,  -16], fov: 43 },
          { p: 0.3333, pos: [ 0.0, 3.4, -11.4], look: [ 0.0, 2.4,  -22], fov: 45 },
          { p: 0.520,  pos: [ 1.5, 3.8, -12.8], look: [-0.5, 2.5,-22.5], fov: 45 },
          { p: 0.600,  pos: [ 1.0, 6.2, -20.5], look: [ 0.2, 2.3,  -30], fov: 45 },
          { p: 0.6667, pos: [ 0.0, 3.0, -25.0], look: [ 0.0, 2.2,  -33], fov: 46 },
          { p: 0.800,  pos: [ 2.5, 5.7, -30.5], look: [ 0.0, 1.6,  -42], fov: 47 },
          { p: 0.940,  pos: [ 4.9, 7.5, -36.2], look: [ 0.0, 1.2,  -46], fov: 48 },
          { p: 1.000,  pos: [ 5.3, 7.9, -37.0], look: [ 0.0, 1.2,  -46], fov: 48 }
        ];
        var camSample = { pos: [7.4, 2.3, 8.9], look: [1.5, 0.3, 0], fov: 47 };
        function sampleCamera(p) {
          var k0 = camKeys[0], k1 = camKeys[camKeys.length - 1];
          for (var i = 0; i < camKeys.length - 1; i++) {
            if (p >= camKeys[i].p && p <= camKeys[i + 1].p) { k0 = camKeys[i]; k1 = camKeys[i + 1]; break; }
          }
          var t = sstep(k0.p, k1.p, p);
          camSample.pos[0] = lerp(k0.pos[0], k1.pos[0], t);
          camSample.pos[1] = lerp(k0.pos[1], k1.pos[1], t);
          camSample.pos[2] = lerp(k0.pos[2], k1.pos[2], t);
          camSample.look[0] = lerp(k0.look[0], k1.look[0], t);
          camSample.look[1] = lerp(k0.look[1], k1.look[1], t);
          camSample.look[2] = lerp(k0.look[2], k1.look[2], t);
          camSample.fov = lerp(k0.fov, k1.fov, t);
        }

        /* Readout Ticker */
        var tickerBuf = '';
        var BASES = 'ATCGATCGATCG';
        var PHASE_NAMES = [
          'Phase 01 — Double helix', 'Phase 02 — Signal acquisition',
          'Phase 03 — Basecall stream', 'Phase 04 — Variant resolution'
        ];
        function tick() {
          if (!tickerText) return;
          if (state.p < 0.045) { tickerBuf = ''; tickerText.textContent = ''; return; }
          var idx = currentSec;
          if (idx === 0) {
            tickerBuf = TICKER_STRINGS[0];
          } else if (idx === 1) {
            var cyc = Math.min(150, Math.floor(map01(state.p, 0.30, 0.62) * 150) + 1);
            tickerBuf = TICKER_STRINGS[1] + ' · CYCLE ' + String(cyc).padStart(3, '0') + '/150';
          } else if (idx === 2) {
            for (var k = 0; k < 2; k++) tickerBuf += (rnd() > 0.4 ? BASES[Math.floor(rnd() * 12)] : (rnd() > 0.5 ? '0' : '1'));
            if (tickerBuf.length > 60) tickerBuf = tickerBuf.slice(tickerBuf.length - 60);
          } else {
            var CHR = ['chr1', 'chr2', 'chr7', 'chr11', 'chr12', 'chr17', 'chrX'];
            tickerBuf = 'VARIANT CALL — ' + CHR[Math.floor(rnd() * CHR.length)] + ':' +
              (1000000 + Math.floor(rnd() * 88000000)).toLocaleString('en-US') + ' ' +
              'ATCG'[Math.floor(rnd() * 4)] + '>' + 'ATCG'[Math.floor(rnd() * 4)] +
              ' · Q' + (28 + Math.floor(rnd() * 12)) + (rnd() > 0.5 ? ' · HET' : ' · HOM');
          }
          tickerText.textContent = tickerBuf;
        }
        var tickerInterval = setInterval(tick, 130);

        function updateHUD(p) {
          var cw = [
            band(p, -0.2, 0.24, 0.06),
            band(p, 0.28, 0.55, 0.05),
            band(p, 0.615, 0.88, 0.05),
            sstep(0.93, 0.965, p)
          ];
          for (var c = 0; c < 4; c++) {
            var w = cw[c], el = cards[c];
            if (!el) continue;
            el.style.opacity = w.toFixed(3);
            el.style.visibility = w > 0.015 ? 'visible' : 'hidden';
            el.style.transform = 'translateY(' + (-46 + (1 - w) * 6).toFixed(2) + '%) translateX(' + ((1 - w) * -18).toFixed(1) + 'px)';
          }
          if (railPct) railPct.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
          if (railLabel) railLabel.textContent = RAIL_NAMES[frameIndex] || '';
          if (phaseName) phaseName.textContent = PHASE_NAMES[currentSec] || '';
          if (scrollCue) {
            scrollCue.style.opacity = (1 - sstep(0.012, 0.045, p)).toFixed(3);
            scrollCue.style.visibility = p > 0.05 ? 'hidden' : 'visible';
          }
          if (tickerEl) {
            tickerEl.style.opacity = (band(p, 0.05, 0.99, 0.035) * 0.95).toFixed(3);
          }
        }

        /* Per-frame loop */
        var clock = new THREE.Clock();
        var m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(),
            sc = new THREE.Vector3(), posV = new THREE.Vector3();

        function frame() {
          requestAnimationFrame(frame);
          if (!state.running) { clock.getDelta(); return; }
          var dt = Math.min(clock.getDelta(), 0.05);
          var t = clock.elapsedTime;

          state.p = damp(state.p, prog.p, 8, dt);
          var p = state.p;
          currentSec = clamp(Math.round(p * 3), 0, 3);

          updateHUD(p);
          state.mouseDX = damp(state.mouseDX, state.mouseX, 3.0, dt);
          state.mouseDY = damp(state.mouseDY, state.mouseY, 3.0, dt);

          sampleCamera(p);
          state.camX = damp(state.camX, camSample.pos[0], 3.4, dt);
          state.camY = damp(state.camY, camSample.pos[1], 3.4, dt);
          state.camZ = damp(state.camZ, camSample.pos[2], 3.4, dt);
          state.lookX = damp(state.lookX, camSample.look[0], 3.4, dt);
          state.lookY = damp(state.lookY, camSample.look[1], 3.4, dt);
          state.lookZ = damp(state.lookZ, camSample.look[2], 3.4, dt);
          state.fov = damp(state.fov, camSample.fov, 3.4, dt);

          var sway = reduced ? 0 : 1;
          camera.position.set(
            state.camX + Math.sin(t * 0.18) * 0.14 * sway + state.mouseDX * 0.5,
            state.camY + Math.cos(t * 0.22) * 0.10 * sway - state.mouseDY * 0.4,
            state.camZ
          );
          camera.lookAt(state.lookX + state.mouseDX * 0.5, state.lookY - state.mouseDY * 0.3, state.lookZ);
          if (Math.abs(camera.fov - state.fov) > 0.01) { camera.fov = state.fov; camera.updateProjectionMatrix(); }

          fillDir.position.set(-9 + Math.sin(t * 0.18) * 2, 6, state.camZ - 4 + Math.cos(t * 0.15) * 2);

          if (modelReady && modelGroup.visible) {
            modelSpin += dt * 0.26;
            modelGroup.rotation.y = modelSpin + p * 1.1;
            modelGroup.rotation.x = Math.sin(t * 0.30) * 0.045 * sway;
            modelGroup.rotation.z = Math.cos(t * 0.23) * 0.035 * sway;
            modelGroup.position.y = Math.sin(t * 0.45) * 0.10 * sway;
            modelGroup.scale.setScalar((0.82 + 0.18 * state.intro) * (0.6 + 0.4 * modelState.reveal));
          }

          var waveVis = p > 0.12 && p < 0.80;
          waveGroup.visible = waveVis;
          if (waveVis) updateRibbons(t);

          var rainVis = p > 0.40;
          rainGroup.visible = rainVis;
          if (rainVis) {
            rainMat.uniforms.uTime.value = t;
            var sweep = ((t * 0.11) % 1);
            laserGroup.position.x = lerp(-8.2, 8.2, sweep);
          }

          var dataVis = p > 0.72;
          dataGroup.visible = dataVis;
          if (dataVis) {
            var dataReveal = map01(p, 0.76, 0.96);
            gridMat.opacity = 0.4 * sstep(0.74, 0.82, p);
            ringMat1.opacity = 0.34 * sstep(0.80, 0.90, p);
            ringMat2.opacity = 0.22 * sstep(0.80, 0.90, p);
            ring1.rotation.z = t * 0.15; ring2.rotation.z = -t * 0.1;
            for (var h = 0; h < hmCount; h++) {
              var hd = hmData[h];
              var rise = sstep(hd.delay, hd.delay + 0.34, dataReveal);
              var hh2 = hd.h * rise * (1 + (reduced ? 0 : 0.045 * Math.sin(t * 1.8 + hd.seed * 9.0)));
              posV.set(hd.x, 0, hd.z);
              qt.identity();
              sc.set(1, Math.max(hh2, 0.015), 1);
              m4.compose(posV, qt, sc);
              hmMesh.setMatrixAt(h, m4);
            }
            hmMesh.instanceMatrix.needsUpdate = true;
            for (var L = 0; L < 4; L++) {
              var lo = sstep(0.08 + L * 0.16, 0.34 + L * 0.16, dataReveal);
              treeLevels[L].material.opacity = lo * 0.85;
              treeNodes[L].material.opacity = lo;
            }
            treeGroup.position.y = 0.3 + Math.sin(t * 0.45) * 0.07;
          }

          updateDrawGlyphs(dt);
          if (composer) {
            composer.render();
          } else {
            renderer.render(scene, camera);
          }
        }

        /* 2D Cursor Nucleotide Emitter */
        var fxCanvas = container.querySelector('.csi-glyph-fx');
        var fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
        var FX_MAX = 40;
        var fxPool = [];
        for (var fxi = 0; fxi < FX_MAX; fxi++) {
          fxPool.push({ alive: false, x: 0, y: 0, baseX: 0, char: 'A', color: PAL.glyphs[0],
                        size: 13, born: 0, life: 2, vy: 18, amp: 6, freq: 1.6, phase: 0 });
        }
        var fxW = 0, fxH = 0, fxDirty = false;
        function fxResize() {
          if (!fxCanvas || !fxCtx) return;
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          fxW = window.innerWidth; fxH = window.innerHeight;
          fxCanvas.width  = Math.round(fxW * dpr);
          fxCanvas.height = Math.round(fxH * dpr);
          fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          fxDirty = true;
        }
        fxResize();

        var GLYPH_CHARS = ['A', 'T', 'C', 'G'];
        var glyphColors = PAL.glyphs;
        var glyphIdx = -1;
        var ptrX = -999, ptrY = -999, lastEmit = 0, lastPX = -999, lastPY = -999;

        function spawnGlyph() {
          var p = null, oldest = null, oldestAge = -1;
          var nowS = performance.now() / 1000;
          for (var i = 0; i < FX_MAX; i++) {
            var q = fxPool[i];
            if (!q.alive) { p = q; break; }
            var age = nowS - q.born;
            if (age > oldestAge) { oldestAge = age; oldest = q; }
          }
          if (!p) p = oldest;
          if (!p) return;
          glyphIdx = (glyphIdx + 1) & 3;
          p.alive = true;
          p.baseX = ptrX + (rnd() - 0.5) * 10;
          p.x     = p.baseX;
          p.y     = ptrY + (rnd() - 0.5) * 8;
          p.char  = GLYPH_CHARS[glyphIdx];
          p.color = glyphColors[glyphIdx & 1];
          p.size  = 12 + rnd() * 4;
          p.born  = nowS;
          p.life  = 1.5 + rnd() * 0.5;
          p.vy    = 15 + rnd() * 10;
          p.amp   = 4 + rnd() * 5;
          p.freq  = 1.2 + rnd() * 1.0;
          p.phase = rnd() * 6.2831;
        }

        window.addEventListener('pointermove', function (e) {
          state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
          ptrX = e.clientX; ptrY = e.clientY;
          if (!fxEnabled || reduced || !booted || !engaged) return;
          var now = performance.now();
          var dx = ptrX - lastPX, dy = ptrY - lastPY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= 25 || (now - lastEmit >= 40 && dist >= 14)) {
            lastEmit = now; lastPX = ptrX; lastPY = ptrY;
            spawnGlyph();
            fxDirty = true;
          }
        });

        function updateDrawGlyphs(dt) {
          if (!fxCtx) return;
          var now = performance.now() / 1000;
          var anyAlive = false;
          for (var i = 0; i < FX_MAX; i++) {
            var p = fxPool[i];
            if (!p.alive) continue;
            var a = now - p.born;
            if (a >= p.life) { p.alive = false; fxDirty = true; continue; }
            anyAlive = true;
            p.y -= p.vy * dt;
            p.x = p.baseX + Math.sin(now * p.freq + p.phase) * p.amp;
          }
          if (!anyAlive && !fxDirty) return;
          fxCtx.clearRect(0, 0, fxW, fxH);
          fxDirty = anyAlive;
          if (!anyAlive) return;
          fxCtx.textAlign = 'center';
          fxCtx.textBaseline = 'middle';
          for (var j = 0; j < FX_MAX; j++) {
            var q = fxPool[j];
            if (!q.alive) continue;
            var age = now - q.born;
            var alpha = 0.85 * Math.min(age / 0.2, 1) * clamp((q.life - age) / 0.8, 0, 1);
            fxCtx.globalAlpha = alpha;
            fxCtx.fillStyle = q.color;
            fxCtx.font = '600 ' + q.size.toFixed(1) + 'px "JetBrains Mono", monospace';
            fxCtx.save();
            fxCtx.translate(q.x, q.y);
            fxCtx.rotate(Math.sin(now * 0.9 + q.phase) * 0.12);
            fxCtx.fillText(q.char, 0, 0);
            fxCtx.restore();
          }
          fxCtx.globalAlpha = 1;
        }

        window.addEventListener('resize', function () {
          var w = window.innerWidth, h = window.innerHeight;
          camera.aspect = w / h; camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          if (composer) composer.setSize(w, h);
          fxResize();
        });

        document.addEventListener('visibilitychange', function () {
          state.running = !document.hidden && engaged;
        });

        /* Silent Mount & Release (Section 2.2: No Secondary Loading Screen) */
        function silentRelease() {
          if (booted) return;
          booted = true;
          rootEl.classList.add('csi-locked');
          syncDots();
          if (typeof gsap !== 'undefined') {
            gsap.to(modelState, { reveal: 1, duration: 1.8, ease: 'power3.out' });
            gsap.to(state, { intro: 1, duration: 2.2, ease: 'power3.out' });
            gsap.from(container.querySelector('.csi-rail'), { x: 24, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.4 });
            gsap.from(container.querySelector('.csi-status'), { y: 16, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
            gsap.from(container.querySelector('.csi-cue'), { y: 16, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.75 });
          } else {
            modelState.reveal = 1;
            state.intro = 1;
          }
        }

        rainMat.uniforms.uAtlas.value = texAtlas;
        frame();
      });
    },

    /* ── Act 1: Waveform Telemetry Simulator ── */
    initWaveforms: function () {
      var waveformContainers = document.querySelectorAll('.hero-waveform, [data-cas-waveform]');
      waveformContainers.forEach(function (container) {
        if (container.getAttribute('data-waveform-init') === 'true') return;
        container.setAttribute('data-waveform-init', 'true');

        var barCount = parseInt(container.getAttribute('data-bar-count') || '52', 10);
        var bars = [];
        container.innerHTML = '';

        for (var i = 0; i < barCount; i++) {
          var bar = document.createElement('div');
          bar.className = 'hero-waveform-bar';
          bar.style.height = Math.floor(Math.random() * 70 + 10) + '%';
          container.appendChild(bar);
          bars.push(bar);
        }

        setInterval(function () {
          for (var j = 0; j < 5; j++) {
            var idx = Math.floor(Math.random() * bars.length);
            if (bars[idx]) {
              bars[idx].style.height = Math.floor(Math.random() * 80 + 8) + '%';
            }
          }
        }, 90);
      });
    },

    /* ── Act 1: Run Timer ── */
    initTimers: function () {
      var timerElements = document.querySelectorAll('[data-cas-timer], #runTimer, .hero-run-timer');
      timerElements.forEach(function (timerEl) {
        if (timerEl.getAttribute('data-timer-init') === 'true') return;
        timerEl.setAttribute('data-timer-init', 'true');

        var initialSec = parseInt(timerEl.getAttribute('data-initial-seconds') || '', 10);
        if (isNaN(initialSec)) {
          var parts = timerEl.textContent.trim().split(':');
          if (parts.length === 3) {
            initialSec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
          } else {
            initialSec = 2 * 3600 + 14 * 60 + 33;
          }
        }

        var seconds = initialSec;
        setInterval(function () {
          seconds++;
          var h = Math.floor(seconds / 3600);
          var m = Math.floor((seconds % 3600) / 60);
          var s = seconds % 60;
          timerEl.textContent =
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
        }, 1000);
      });
    },

    /* ── Act 2: Read-Length Distribution Histogram ── */
    initHistograms: function () {
      var histContainers = document.querySelectorAll('.read-dist-bars, [data-cas-readdist]');
      histContainers.forEach(function (container) {
        if (container.getAttribute('data-readdist-init') === 'true') return;
        container.setAttribute('data-readdist-init', 'true');

        var customHeights = container.getAttribute('data-heights');
        var heights;
        if (customHeights) {
          try {
            heights = JSON.parse(customHeights);
          } catch (e) {
            heights = customHeights.split(',').map(function (n) { return parseFloat(n.trim()); });
          }
        }
        if (!Array.isArray(heights) || heights.length === 0) {
          heights = [4, 7, 13, 21, 32, 45, 52, 60, 68, 74, 80, 85, 88, 90, 82, 75, 66, 55, 42, 32, 24, 16, 10, 6, 4];
        }

        container.innerHTML = '';
        heights.forEach(function (h) {
          var bar = document.createElement('div');
          bar.className = 'rdb';
          bar.style.height = h + '%';
          container.appendChild(bar);
        });
      });
    },

    /* ── Acts 1–4: GSAP Scroll Animations & Counters ── */
    initScrollAnimations: function () {
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Handle Numeric Telemetry Counters
      var counterEls = document.querySelectorAll('[data-counter]');
      counterEls.forEach(function (el) {
        if (el.getAttribute('data-counter-init') === 'true') return;
        el.setAttribute('data-counter-init', 'true');

        var target = parseFloat(el.getAttribute('data-target') || '0');
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var suffix = el.getAttribute('data-suffix') || '';

        if (typeof gsap !== 'undefined') {
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: prefersReduced ? 0 : 2.2,
            ease: 'power2.out',
            scrollTrigger: (typeof ScrollTrigger !== 'undefined') ? {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none'
            } : null,
            onUpdate: function () {
              el.textContent = obj.val.toFixed(decimals) + suffix;
            },
            onComplete: function () {
              el.textContent = target.toFixed(decimals) + suffix;
            }
          });
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      });

      if (typeof gsap === 'undefined') return;

      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Fade Up Elements
      gsap.utils.toArray('.cas-bio-block .gsap-fade-up, .cas-act-1 .gsap-fade-up, .cas-act-2 .gsap-fade-up, .cas-act-3 .gsap-fade-up, .cas-act-4 .gsap-fade-up').forEach(function (el, i) {
        if (el.getAttribute('data-gsap-init') === 'true') return;
        el.setAttribute('data-gsap-init', 'true');

        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: prefersReduced ? 0 : 0.75,
            ease: 'power3.out',
            delay: (i % 4) * 0.07,
            scrollTrigger: (typeof ScrollTrigger !== 'undefined') ? {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none'
            } : null
          }
        );
      });

      // Scale In Elements
      gsap.utils.toArray('.cas-bio-block .gsap-scale-in, .cas-act-1 .gsap-scale-in, .cas-act-2 .gsap-scale-in, .cas-act-3 .gsap-scale-in, .cas-act-4 .gsap-scale-in').forEach(function (el, i) {
        if (el.getAttribute('data-gsap-scale-init') === 'true') return;
        el.setAttribute('data-gsap-scale-init', 'true');

        gsap.fromTo(el,
          { opacity: 0, scale: 0.95, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: prefersReduced ? 0 : 0.7,
            ease: 'power3.out',
            delay: (i % 3) * 0.09,
            scrollTrigger: (typeof ScrollTrigger !== 'undefined') ? {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none'
            } : null
          }
        );
      });

      // Hero Media Frame Special Reveal
      var heroFrames = document.querySelectorAll('.hero-media-frame');
      heroFrames.forEach(function (heroFrame) {
        if (heroFrame.getAttribute('data-frame-init') === 'true') return;
        heroFrame.setAttribute('data-frame-init', 'true');

        gsap.fromTo(heroFrame,
          { opacity: 0, y: 35, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: prefersReduced ? 0 : 1.05,
            ease: 'power3.out',
            delay: 0.55
          }
        );
      });

      // Split words animation on hero titles
      var heroTitles = document.querySelectorAll('.hero-title');
      heroTitles.forEach(function (heroTitle) {
        if (prefersReduced || heroTitle.hasAttribute('data-words-split')) return;
        heroTitle.setAttribute('data-words-split', 'true');

        var words = heroTitle.textContent.trim().split(/\s+/);
        heroTitle.innerHTML = words.map(function (w) {
          return '<span class="hw" style="display:inline-block;opacity:0;transform:translateY(18px)">' + w + '&nbsp;</span>';
        }).join('');

        gsap.to(heroTitle.querySelectorAll('.hw'), {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.2
        });
      });
    },

    /* ── Background 3D DNA Simulation Engine ── */
    initDnaBackground: function () {
      var bgWrappers = document.querySelectorAll('.cas-dna-bg-wrapper, [data-cas-dna-bg]');
      if (!bgWrappers.length) return;

      bgWrappers.forEach(function (wrapper) {
        if (wrapper.getAttribute('data-dna-init') === 'true') return;
        wrapper.setAttribute('data-dna-init', 'true');

        var canvas = wrapper.querySelector('canvas');
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.className = 'cas-dna-webgl-canvas';
          wrapper.appendChild(canvas);
        }

        if (typeof THREE === 'undefined') {
          return;
        }

        var defaultModel = (window.casBioBlocksData && window.casBioBlocksData.defaultModelUrl) || '';
        var modelUrl = wrapper.getAttribute('data-model-url') || defaultModel;
        var scaleMultiplier = parseFloat(wrapper.getAttribute('data-scale') || '1.0');
        if (isNaN(scaleMultiplier) || scaleMultiplier <= 0) scaleMultiplier = 1.0;

        var offsetX = parseFloat(wrapper.getAttribute('data-offset-x') || '0.0');
        var offsetY = parseFloat(wrapper.getAttribute('data-offset-y') || '0.0');
        var strandColor = wrapper.getAttribute('data-strand-color') || '#8c6d58';
        var accentColor = wrapper.getAttribute('data-accent-color') || '#4ade80';
        var ambientIntensity = parseFloat(wrapper.getAttribute('data-ambient-intensity') || '1.8');
        var enableCycling = wrapper.getAttribute('data-cycling') !== 'false';

        var width = window.innerWidth;
        var height = window.innerHeight;

        // 1. Scene & Camera
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 6.0);

        // 2. WebGL Renderer with pixel ratio cap (max 2 for 60fps)
        var renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

        // 3. Lighting
        var ambientLight = new THREE.AmbientLight(0xfff8f0, ambientIntensity);
        scene.add(ambientLight);

        var dirLight1 = new THREE.DirectionalLight(0xffebd9, 1.5);
        dirLight1.position.set(6, 10, 8);
        scene.add(dirLight1);

        var dirLight2 = new THREE.DirectionalLight(0xd4bfae, 1.0);
        dirLight2.position.set(-6, -4, -6);
        scene.add(dirLight2);

        // 4. Model Pivot & Mesh Group
        var modelPivot = new THREE.Group();
        scene.add(modelPivot);

        var dnaMeshGroup = new THREE.Group();
        modelPivot.add(dnaMeshGroup);

        var isMobile = width < 768;
        var mobileScale = isMobile ? 0.65 : 1.0;
        var mobilePos = isMobile ? 0.5 : 1.0;

        var basePoses = [
          {
            // Pose 1 (Section 1: Top Hero)
            rot: { x: 0.35, y: 0.80, z: -0.45 },
            pos: { x: 0.40, y: 0.05, z: 0.80 },
            camZ: 6.0,
            scale: { x: 1.3, y: 3.2, z: 1.3 }
          },
          {
            // Pose 2 (Section 2: Bento Services)
            rot: { x: 0.95, y: 2.10, z: 0.50 },
            pos: { x: -0.55, y: 0.10, z: 1.25 },
            camZ: 5.4,
            scale: { x: 1.6, y: 3.6, z: 1.6 }
          },
          {
            // Pose 3 (Section 3: Process Timeline)
            rot: { x: 1.70, y: 3.50, z: 1.30 },
            pos: { x: 0.45, y: -0.20, z: 0.95 },
            camZ: 6.2,
            scale: { x: 1.2, y: 3.0, z: 1.2 }
          }
        ];

        // Anchor initial state to Pose 1
        var p1 = basePoses[0];
        modelPivot.rotation.set(p1.rot.x, p1.rot.y, p1.rot.z);
        modelPivot.position.set(
          (p1.pos.x * mobilePos) + offsetX,
          p1.pos.y + offsetY,
          p1.pos.z
        );
        modelPivot.scale.set(
          p1.scale.x * scaleMultiplier * mobileScale,
          p1.scale.y * scaleMultiplier * mobileScale,
          p1.scale.z * scaleMultiplier * mobileScale
        );
        camera.position.z = p1.camZ;

        var strandMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(strandColor),
          roughness: 0.45,
          metalness: 0.25,
          transparent: true,
          opacity: 0.85
        });

        var accentMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(accentColor),
          roughness: 0.40,
          metalness: 0.20,
          transparent: true,
          opacity: 0.90
        });

        // 5. Load GLTF
        var loadModel = function () {
          if (typeof THREE.GLTFLoader === 'undefined') return;

          var loader = new THREE.GLTFLoader();
          loader.load(
            modelUrl,
            function (gltf) {
              var dnaScene = gltf.scene;
              var box = new THREE.Box3().setFromObject(dnaScene);
              var center = box.getCenter(new THREE.Vector3());
              dnaScene.position.sub(center);

              var meshIdx = 0;
              dnaScene.traverse(function (child) {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  var name = (child.name || '').toLowerCase();
                  if (name.includes('base') || name.includes('pair') || (meshIdx % 3 === 2)) {
                    child.material = accentMat;
                  } else {
                    child.material = strandMat;
                  }
                  meshIdx++;
                }
              });

              dnaMeshGroup.add(dnaScene);

              // 6. Section-by-Section GSAP ScrollTrigger Pose Mapping
              if (enableCycling && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);

                var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (prefersReduced) return;

                var sectionSelectors = [
                  '.cas-act-1',
                  '.cas-act-2',
                  '.cas-act-3',
                  '.cas-act-4',
                  '.cas-act-section',
                  '.sylva-hero',
                  '.sylva-footer',
                  'main > section',
                  '#primary-content > section',
                  '.entry-content > section'
                ].join(',');

                var rawSections = document.querySelectorAll(sectionSelectors);
                var sections = [];
                rawSections.forEach(function (sec) {
                  if (sec.classList.contains('cas-dna-bg-wrapper') || sec.offsetHeight < 120) return;
                  var isNested = sections.some(function (p) { return p.contains(sec); });
                  if (!isNested) sections.push(sec);
                });

                if (sections.length >= 2) {
                  for (var i = 0; i < sections.length - 1; i++) {
                    var currentSec = sections[i];
                    var nextSec = sections[i + 1];

                    var targetStep = i + 1;
                    var poseIdx = targetStep % 3;
                    var cycle = Math.floor(targetStep / 3);
                    var targetPose = basePoses[poseIdx];
                    var yAccum = (cycle * 2 * Math.PI);
                    var isLastTransition = (i === sections.length - 2);

                    gsap.timeline({
                      scrollTrigger: {
                        trigger: currentSec,
                        start: 'top top',
                        endTrigger: nextSec,
                        end: isLastTransition ? 'bottom bottom' : 'top top',
                        scrub: 1.8,
                        invalidateOnRefresh: true
                      }
                    })
                    .to(modelPivot.rotation, {
                      x: targetPose.rot.x,
                      y: targetPose.rot.y + yAccum,
                      z: targetPose.rot.z,
                      ease: 'power1.inOut'
                    }, 0)
                    .to(modelPivot.position, {
                      x: (targetPose.pos.x * mobilePos) + offsetX,
                      y: targetPose.pos.y + offsetY,
                      z: targetPose.pos.z,
                      ease: 'power1.inOut'
                    }, 0)
                    .to(modelPivot.scale, {
                      x: targetPose.scale.x * scaleMultiplier * mobileScale,
                      y: targetPose.scale.y * scaleMultiplier * mobileScale,
                      z: targetPose.scale.z * scaleMultiplier * mobileScale,
                      ease: 'power1.inOut'
                    }, 0)
                    .to(camera.position, {
                      z: targetPose.camZ,
                      ease: 'power1.inOut'
                    }, 0);
                  }
                }
              }
            },
            undefined,
            function (err) {
              console.warn('CAS-NGS 3D Engine: Error loading DNA model', err);
            }
          );
        };

        if (typeof THREE.GLTFLoader !== 'undefined') {
          loadModel();
        } else {
          var retries = 0;
          var checkLoader = setInterval(function () {
            retries++;
            if (typeof THREE.GLTFLoader !== 'undefined') {
              clearInterval(checkLoader);
              loadModel();
            } else if (retries > 35) {
              clearInterval(checkLoader);
            }
          }, 100);
        }

        // 7. Render Loop with subtle idle rotation on inner group
        function renderLoop() {
          requestAnimationFrame(renderLoop);
          dnaMeshGroup.rotation.y += 0.0012;
          renderer.render(scene, camera);
        }
        renderLoop();

        // 8. Resize Handler
        window.addEventListener('resize', function () {
          var newW = window.innerWidth;
          var newH = window.innerHeight;
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }, { passive: true });
      });
    }
  };

  // Expose globally
  window.CAS_NGS_BiotechBlocks = BiotechBlocks;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      BiotechBlocks.init();
    });
  } else {
    BiotechBlocks.init();
  }
})();
