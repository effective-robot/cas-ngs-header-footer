/**
 * CAS-NGS 3D Corridor Hero — station engine (cas-ngs/3d-corridor-hero)
 *
 * Additive module for the cas-ngs-header-footer plugin. Runs ONLY when a
 * #corridor-canvas-container block is present on the page. Fully
 * namespaced (cor3d-* DOM hooks, CasNGSCorridor global) — zero shared
 * state with biotech-blocks-engine.js, which stays byte-for-byte intact.
 *
 * To produce a single consolidated bundle instead of two files:
 *   cat assets/js/biotech-blocks-engine.js assets/js/corridor-hero-engine.js \
 *       > assets/js/biotech-blocks-engine.consolidated.js
 * (see README.md — runtime behavior is identical either way).
 *
 * Architecture: in-block 400vh pin. The stage is sticky inside the block,
 * stations snap on single wheel ticks / swipes (GSAP Observer, enabled
 * only inside the pin window), the camera flies one continuous corridor
 * (z = 0 → -22 → -31 → -46), and page scroll continues natively below.
 * Palette is read from computed CSS custom properties on the container,
 * so WordPress theme presets re-skin the WebGL scene live.
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.0.0
 */
(function () {
  'use strict';

  if (typeof window.CasNGSCorridor !== 'undefined') return;
  window.CasNGSCorridor = { version: '1.0.0' };

  /* ── helpers ─────────────────────────────────────────────────── */
  function cssColor(el, name, fallbackHex) {
    var v = (window.getComputedStyle(el).getPropertyValue(name) || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return parseInt(v.slice(1), 16);
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      var h = v.slice(1);
      return parseInt(h[0] + h[0] + h[1] + h[1] + h[2] + h[2], 16);
    }
    return fallbackHex;
  }
  function cssStr(el, name, fallback) {
    var v = (window.getComputedStyle(el).getPropertyValue(name) || '').trim();
    return v || fallback;
  }
  function cssHexList(el, name, fallbackArr) {
    var raw = cssStr(el, name, '');
    var parts = raw.split(',').map(function (s) { return s.trim(); });
    var out = [];
    for (var i = 0; i < fallbackArr.length; i++) {
      out.push(/^#[0-9a-fA-F]{6}$/.test(parts[i] || '') ? parts[i] : fallbackArr[i]);
    }
    return out;
  }

  function initCorridor(container) {
    if (!window.THREE || !window.gsap || typeof window.Observer === 'undefined') {
      var failEl = container.querySelector('.cor3d-fail');
      if (failEl) failEl.style.display = 'flex';
      return;
    }

    var stage = container.querySelector('.cor3d-stage');
    if (!stage) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fxEnabled = container.getAttribute('data-fx-enabled') !== 'false';
    var modelUrl = container.getAttribute('data-model-url') ||
      (window.casBioBlocksData && window.casBioBlocksData.defaultModelUrl) ||
      '/wp-content/plugins/cas-ngs-header-footer/assets/models/dna.glb';

    /* palette from computed CSS custom properties (theme presets win) */
    var PAL = {
      bg: cssColor(container, '--cor3d-bg', 0xf8f6f0),
      fogD: 0.018,
      ink: cssColor(container, '--cor3d-ink', 0x2b2522),
      accent: cssColor(container, '--cor3d-accent', 0x865438),
      accent2: cssColor(container, '--cor3d-accent-2', 0x8c6d58),
      accent3: cssColor(container, '--cor3d-accent-3', 0x9e7b4f),
      accent4: cssColor(container, '--cor3d-accent-4', 0xd4996e),
      backbone: cssColor(container, '--cor3d-backbone', 0x503c2d),
      grid: cssColor(container, '--cor3d-grid', 0xd8cbb9)
    };
    PAL.base = [PAL.accent, PAL.accent2, PAL.accent3, PAL.accent4];
    PAL.wave = [PAL.ink, PAL.accent, PAL.accent2, PAL.accent3];
    var heatCss = cssHexList(container, '--cor3d-heat', ['#cbb9a6', '#9e7b4f', '#865438']);
    PAL.heat = [
      parseInt(heatCss[0].slice(1), 16),
      parseInt(heatCss[1].slice(1), 16),
      parseInt(heatCss[2].slice(1), 16)
    ];
    var glyphCss = cssHexList(container, '--cor3d-glyphs', ['#9e7b4f', '#865438']);

    /* Editor-tweakable: DNA backbone tint override (blank = palette default).
       Re-skins the Frame-1 helix backbone without touching the source GLB. */
    var dnaTintAttr = (container.getAttribute('data-dna-tint') || '').replace('#', '');
    if (/^[0-9a-fA-F]{6}$/.test(dnaTintAttr)) PAL.backbone = parseInt(dnaTintAttr, 16);

    /* ── utils ─────────────────────────────────────────────────── */
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var map01 = function (x, a, b) { return clamp((x - a) / (b - a), 0, 1); };
    var sstep = function (a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
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

    /* Editor-tweakable: uniformly darken the Frame-4 bars by this ratio
       (0 = as-is, 0.9 = very dark). Applied equally to every bar, so the
       relative contrast/combination between bars is preserved. */
    var barDarken = parseFloat(container.getAttribute('data-bar-darken'));
    if (isNaN(barDarken)) barDarken = 0.15;
    barDarken = clamp(barDarken, 0, 0.9);

    var WAVE_Z = -22, RAIN_Z = -31, DATA_Z = -46;

    /* ── renderer / scene / studio lighting ────────────────────── */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      var failEl2 = container.querySelector('.cor3d-fail');
      if (failEl2) failEl2.style.display = 'flex';
      return;
    }
    renderer.setClearColor(PAL.bg, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'gl';
    stage.insertBefore(renderer.domElement, stage.firstChild);

    function sizeRenderer() {
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (composer) composer.setSize(w, h);
    }

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(PAL.bg, PAL.fogD);
    var camera = new THREE.PerspectiveCamera(47, 1, 0.1, 220);
    camera.position.set(7.4, 2.3, 8.9);

    scene.add(new THREE.HemisphereLight(0xfbf7ef, 0xd8cab8, 0.8));
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    var sun = new THREE.DirectionalLight(0xfff8ee, 1.15);
    sun.position.set(6, 18, -12);
    sun.target.position.set(0, 0, -26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;   sun.shadow.camera.bottom = -20;
    sun.shadow.camera.near = 2;   sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0004;
    scene.add(sun); scene.add(sun.target);
    var fillDir = new THREE.DirectionalLight(PAL.accent4, 0.35);
    fillDir.position.set(-9, 6, -7); scene.add(fillDir);
    /* crisp white rim from behind / top-right so the helix pops off ivory */
    var rimLight = new THREE.PointLight(0xffffff, 1.5, 60);
    rimLight.position.set(8, 10, -6); scene.add(rimLight);

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
    sizeRenderer();

    /* ── canvas textures ───────────────────────────────────────── */
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

    /* soft-focus depth accents framing Frame 1 */
    var depthMatA = new THREE.SpriteMaterial({ map: texDot, color: PAL.accent3, transparent: true, opacity: 0.13, blending: THREE.NormalBlending, depthWrite: false });
    var depthNodeA = new THREE.Sprite(depthMatA);
    depthNodeA.scale.set(6.5, 6.5, 1);
    depthNodeA.position.set(5.2, 4.6, -3.5);
    scene.add(depthNodeA);
    var depthMatB = new THREE.SpriteMaterial({ map: texDot, color: PAL.accent4, transparent: true, opacity: 0.10, blending: THREE.NormalBlending, depthWrite: false });
    var depthNodeB = new THREE.Sprite(depthMatB);
    depthNodeB.scale.set(4.2, 4.2, 1);
    depthNodeB.position.set(7.6, 1.9, -7);
    scene.add(depthNodeB);

    /* ── Frame 1 · DNA model (GLB + matched procedural fallback) ─ */
    var MODEL_TARGET_H = 9.4;
    var modelGroup = new THREE.Group(); scene.add(modelGroup);
    var modelState = { reveal: 0 };
    var modelReady = false, modelIsFallback = false, modelRevealed = false;
    var modelSpin = 0;

    /* Brand-standard materials. The bundled dna.glb ships its own PBR
       maps (red/blue/orange) — those are never rendered: every mesh is
       re-skinned with the palette materials below (same override pattern
       the suite's initDnaBackground uses), so Frame 1 always reads as
       Obsidian Bronze + Signature Bronze regardless of source asset. */
    var modelMatBackbone = new THREE.MeshStandardMaterial({
      color: PAL.backbone, emissive: PAL.base[0], emissiveIntensity: 0.15,
      roughness: 0.35, metalness: 0.3
    });
    var modelMatRung = new THREE.MeshStandardMaterial({
      color: PAL.accent, emissive: PAL.accent, emissiveIntensity: 0.2,
      roughness: 0.35, metalness: 0.3
    });

    function revealModel() {
      if (modelRevealed) return;
      modelRevealed = true;
      gsap.to(modelState, { reveal: 1, duration: 1.6, ease: 'power3.out' });
    }
    function brandModelMaterials(root) {
      var idx = 0;
      root.traverse(function (o) {
        if (!o.isMesh) return;
        o.castShadow = true;
        var name = (o.name || '').toLowerCase();
        var isRung = name.indexOf('base') !== -1 || name.indexOf('pair') !== -1 ||
          name.indexOf('rung') !== -1 || name.indexOf('step') !== -1 || (idx % 3 === 2);
        o.material = isRung ? modelMatRung : modelMatBackbone;
        idx++;
      });
    }
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
        brandModelMaterials(pivot);
      }
      modelReady = true;
      revealModel();
    }

    var fbRungMesh = null, FB_RUNGS = 22;
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
      var fbA = new THREE.MeshStandardMaterial({ color: PAL.backbone, emissive: PAL.accent2, emissiveIntensity: 0.15, roughness: 0.35, metalness: 0.3 });
      var fbB = new THREE.MeshStandardMaterial({ color: PAL.backbone, emissive: PAL.accent, emissiveIntensity: 0.15, roughness: 0.35, metalness: 0.3 });
      pivot.add(new THREE.Mesh(new THREE.TubeGeometry(strandCurve(0), 200, 0.09, 10, false), fbA));
      pivot.add(new THREE.Mesh(new THREE.TubeGeometry(strandCurve(1), 200, 0.09, 10, false), fbB));
      var rungGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
      fbRungMesh = new THREE.InstancedMesh(rungGeo, new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: PAL.accent, emissiveIntensity: 0.2, roughness: 0.35, metalness: 0.3
      }), FB_RUNGS * 2);
      fbRungMesh.frustumCulled = false;
      var m4f = new THREE.Matrix4(), qf = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0),
        pa = new THREE.Vector3(), pb = new THREE.Vector3(), mid = new THREE.Vector3(),
        dir = new THREE.Vector3(), scl = new THREE.Vector3(), ctr = new THREE.Vector3(), col = new THREE.Color();
      for (var i = 0; i < FB_RUNGS; i++) {
        var a = i * TW;
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
        col.set(PAL.accent); fbRungMesh.setColorAt(i * 2, col);
        dir.copy(pb).sub(mid).normalize();
        qf.setFromUnitVectors(up, dir);
        ctr.copy(mid).addScaledVector(dir, half * 0.5);
        m4f.compose(ctr, qf, scl);
        fbRungMesh.setMatrixAt(i * 2 + 1, m4f);
        col.set(PAL.accent); fbRungMesh.setColorAt(i * 2 + 1, col);
      }
      fbRungMesh.instanceColor.needsUpdate = true;
      pivot.add(fbRungMesh);
      onModelReady(pivot);
    }

    var fallbackTimer = window.setTimeout(function () { if (!modelReady) buildFallbackDNA(); }, 5000);
    if (THREE.GLTFLoader) {
      new THREE.GLTFLoader().load(modelUrl, function (gltf) {
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

    /* ── Frame 2 · ribbon chromatogram array ───────────────────── */
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
      for (var pk = 0; pk < 9; pk++) { wpeaks.push({ pos: rnd() * WAVE_W * 1.6, amp: 0.22 + rnd() * 0.46, wid: 0.20 + rnd() * 0.34 }); }
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

    /* ── Frame 3 · genomic sequence stream ─────────────────────── */
    var rainGroup = new THREE.Group(); rainGroup.position.set(0, 0, RAIN_Z); rainGroup.visible = false; scene.add(rainGroup);
    var RAIN_N = reduced ? 700 : 1300, RAIN_H = 9.5;
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
      uniforms: {
        uTime: { value: 0 }, uWeight: { value: 0.78 }, uAtlas: { value: texAtlas },
        uColA: { value: new THREE.Color(PAL.accent2) }, uColB: { value: new THREE.Color(PAL.ink) }
      },
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
    var laserCoreMat = new THREE.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.16, blending: THREE.NormalBlending, depthWrite: false });
    laserGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 7.4, 6.4), laserCoreMat));
    var laserGlowMat = new THREE.MeshBasicMaterial({ map: texGrad, color: PAL.accent, transparent: true, opacity: 0.10, blending: THREE.NormalBlending, depthWrite: false, side: THREE.DoubleSide });
    laserGroup.add(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 7.4), laserGlowMat));
    laserGroup.add(new THREE.PointLight(PAL.accent, 0.9, 14));
    laserGroup.position.set(-8, 1.2, 0.4);

    /* ── Frame 4 · variant matrix + phylogenetic tree ──────────── */
    var dataGroup = new THREE.Group(); dataGroup.position.set(0, 0, DATA_Z); dataGroup.visible = false; scene.add(dataGroup);
    var HM_COLS = 26, HM_ROWS = 15, HM_CELL = 0.46;
    var hmGeo = new THREE.BoxGeometry(0.34, 1, 0.34); hmGeo.translate(0, 0.5, 0);
    var hmMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.22, emissive: PAL.bg, emissiveIntensity: 0.16 });
    var hmCount = HM_COLS * HM_ROWS;
    var hmMesh = new THREE.InstancedMesh(hmGeo, hmMat, hmCount);
    hmMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    hmMesh.frustumCulled = false;
    hmMesh.castShadow = true;
    hmMesh.receiveShadow = true;
    dataGroup.add(hmMesh);
    var hmData = [];
    var heatRamp = [new THREE.Color(PAL.heat[0]), new THREE.Color(PAL.heat[1]), new THREE.Color(PAL.heat[2])];
    var heatTmp = new THREE.Color();
    function heatColor(h, out) {
      out.copy(heatRamp[0]).lerp(heatRamp[1], clamp(h / 1.4, 0, 1));
      if (h > 1.4) out.lerp(heatRamp[2], clamp((h - 1.4) / 0.7, 0, 1));
      return out;
    }
    var hIdx = 0;
    for (var rr = 0; rr < HM_ROWS; rr++) {
      for (var cc = 0; cc < HM_COLS; cc++) {
        var h = 0.18 + Math.pow(rnd(), 1.6) * 1.9;
        var cx = (cc - (HM_COLS - 1) / 2) * HM_CELL, cz = (rr - (HM_ROWS - 1) / 2) * HM_CELL;
        hmData.push({ x: cx, z: cz, h: h, delay: Math.sqrt(cx * cx + cz * cz) * 0.09 + rnd() * 0.08, seed: rnd() });
        hmMesh.setColorAt(hIdx, heatColor(h, new THREE.Color()).multiplyScalar(1 - barDarken));
        hIdx++;
      }
    }
    hmMesh.instanceColor.needsUpdate = true;

    var shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.ShadowMaterial({ opacity: 0.15 }));
    shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.position.y = -0.03;
    shadowFloor.receiveShadow = true;
    dataGroup.add(shadowFloor);
    var aoMat = new THREE.MeshBasicMaterial({ map: texDot, color: PAL.ink, transparent: true, opacity: 0.11, depthWrite: false });
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

    var ringMat1 = new THREE.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false });
    var ring1 = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.014, 8, 140), ringMat1);
    ring1.rotation.x = -Math.PI / 2; ring1.position.y = 0.06;
    dataGroup.add(ring1);
    var ringMat2 = new THREE.MeshBasicMaterial({ color: PAL.accent3, transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false });
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

    /* ── HUD references ────────────────────────────────────────── */
    var anchors = Array.prototype.slice.call(container.querySelectorAll('.cor3d-anchor'));
    var dots = Array.prototype.slice.call(container.querySelectorAll('.cor3d-dot'));
    var railLabel = container.querySelector('[data-cor3d-rail-label]');
    var railPct = container.querySelector('[data-cor3d-pct]');
    var phaseEl = container.querySelector('[data-cor3d-phase]');
    var cueEl = container.querySelector('[data-cor3d-cue]');
    var tickerEl = container.querySelector('[data-cor3d-ticker]');
    var tickerText = container.querySelector('[data-cor3d-ticker-text]');
    var RAIL_NAMES = ['01 · Sample', '02 · Sequencing', '03 · Basecalling', '04 · Variants'];
    var PHASE_NAMES = [
      'Phase 01 · Double helix', 'Phase 02 · Signal acquisition',
      'Phase 03 · Basecall stream', 'Phase 04 · Variant resolution'
    ];
    var TICKERS = [
      container.getAttribute('data-ticker-1') || 'SAMPLE CS-0427 · QC PASS · LOADING FLOWCELL 04',
      container.getAttribute('data-ticker-2') || 'FOUR-CHANNEL OPTICS · SIGNAL ACQUIRED',
      container.getAttribute('data-ticker-3') || 'BASECALL STREAM · Q30 93.1% · LANE 2',
      container.getAttribute('data-ticker-4') || 'VARIANT MATRIX · GRCh38 · READY FOR REVIEW'
    ];

    /* ── station card choreography (morph + CSS float + tilt) ─── */
    var isAnimating = false;
    var currentSec = -1;
    var reducedUI = window.innerWidth <= 960;

    function restPose(i) {
      var pos = anchors[i] ? anchors[i].getAttribute('data-pos') : 'left';
      if (reducedUI) return { xPercent: 0, yPercent: 0, x: 0, y: 0, scale: 1 };
      if (pos === 'center') return { xPercent: -50, yPercent: 0, x: 0, y: 0, scale: 1 };
      return { xPercent: 0, yPercent: -50, x: 0, y: 0, scale: 1 };
    }
    function offPose(i) {
      var pos = anchors[i] ? anchors[i].getAttribute('data-pos') : 'left';
      if (reducedUI) return { xPercent: 0, yPercent: 0, x: 0, y: 26, scale: 0.97 };
      if (pos === 'center') return { xPercent: -50, yPercent: 0, x: 0, y: 30, scale: 0.97 };
      return { xPercent: 0, yPercent: -50, x: (pos === 'left' ? -36 : 36), y: 0, scale: 0.97 };
    }
    function setCardStation(active) {
      for (var c = 0; c < anchors.length; c++) {
        var el = anchors[c];
        var card = el.querySelector('.cor3d-card');
        if (c === active) {
          var rp = restPose(c);
          gsap.to(el, {
            xPercent: rp.xPercent, yPercent: rp.yPercent, x: rp.x, y: rp.y, scale: rp.scale,
            autoAlpha: 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto',
            onComplete: (function (cd) { return function () { if (cd) cd.classList.add('is-floating'); }; })(card)
          });
        } else {
          if (card) card.classList.remove('is-floating');
          var op = offPose(c);
          gsap.to(el, {
            xPercent: op.xPercent, yPercent: op.yPercent, x: op.x, y: op.y, scale: op.scale,
            autoAlpha: 0, duration: 0.5, ease: 'power2.inOut', overwrite: 'auto'
          });
        }
      }
    }

    /* zero-g cursor tilt on the inner plate */
    var tiltSetters = [];
    anchors.forEach(function (anchor, ci) {
      var inner = anchor.querySelector('.cor3d-card-inner');
      if (!inner) return;
      tiltSetters[ci] = {
        rx: gsap.quickTo(inner, 'rotationX', { duration: 0.4, ease: 'power2.out' }),
        ry: gsap.quickTo(inner, 'rotationY', { duration: 0.4, ease: 'power2.out' }),
        z: gsap.quickTo(inner, 'z', { duration: 0.4, ease: 'power2.out' })
      };
      anchor.addEventListener('pointermove', function (e) {
        var r = anchor.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        tiltSetters[ci].rx(-ny * 12);
        tiltSetters[ci].ry(nx * 16);
        tiltSetters[ci].z(15);
      });
      anchor.addEventListener('pointerleave', function () {
        tiltSetters[ci].rx(0); tiltSetters[ci].ry(0); tiltSetters[ci].z(0);
      });
    });

    /* ── A·T·C·G cursor trail (pooled 2D overlay) ──────────────── */
    var fxCanvas = container.querySelector('.cor3d-glyph-fx');
    var fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
    var FX_MAX = 40, fxPool = [], fxW = 0, fxH = 0, fxDirty = false;
    var glyphIdx = -1, ptrX = -999, ptrY = -999, lastEmit = 0, lastPX = -999, lastPY = -999;
    if (fxCtx) {
      for (var fxi = 0; fxi < FX_MAX; fxi++) {
        fxPool.push({ alive: false, x: 0, y: 0, baseX: 0, char: 'A', color: glyphCss[0], size: 13, born: 0, life: 2, vy: 18, amp: 6, freq: 1.6, phase: 0 });
      }
      (function fxResize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        fxW = stage.clientWidth || window.innerWidth;
        fxH = stage.clientHeight || window.innerHeight;
        fxCanvas.width = Math.round(fxW * dpr);
        fxCanvas.height = Math.round(fxH * dpr);
        fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fxDirty = true;
      })();
      window.addEventListener('resize', function () {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        fxW = stage.clientWidth || window.innerWidth;
        fxH = stage.clientHeight || window.innerHeight;
        fxCanvas.width = Math.round(fxW * dpr);
        fxCanvas.height = Math.round(fxH * dpr);
        fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fxDirty = true;
      });
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
        var stageRect = stage.getBoundingClientRect();
        p.alive = true;
        p.baseX = ptrX - stageRect.left + (rnd() - 0.5) * 10;
        p.x = p.baseX;
        p.y = ptrY - stageRect.top + (rnd() - 0.5) * 8;
        p.char = 'ATCG'[glyphIdx];
        p.color = glyphCss[glyphIdx & 1];
        p.size = 12 + rnd() * 4;
        p.born = nowS;
        p.life = 1.5 + rnd() * 0.5;
        p.vy = 15 + rnd() * 10;
        p.amp = 4 + rnd() * 5;
        p.freq = 1.2 + rnd() * 1.0;
        p.phase = rnd() * 6.2831;
      }
      window.addEventListener('pointermove', function (e) {
        ptrX = e.clientX; ptrY = e.clientY;
        if (!fxEnabled || reduced) return;
        var rect = stage.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
        var now = performance.now();
        var dx = ptrX - lastPX, dy = ptrY - lastPY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= 25 || (now - lastEmit >= 40 && dist >= 14)) {
          lastEmit = now; lastPX = ptrX; lastPY = ptrY;
          spawnGlyph();
          fxDirty = true;
        }
      });
    }
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

    /* ── camera corridor (one continuous physical flight) ──────── */
    var camKeys = [
      { p: 0.000, pos: [7.4, 2.3, 8.9], look: [1.5, 0.3, 0], fov: 47 },
      { p: 0.110, pos: [4.1, 4.8, 5.3], look: [0.7, 2.7, -0.6], fov: 45 },
      { p: 0.205, pos: [1.1, 6.4, 1.5], look: [0.0, 3.3, -7], fov: 43 },
      { p: 0.270, pos: [-0.7, 5.7, -4.6], look: [0.0, 2.9, -16], fov: 43 },
      { p: 0.3333, pos: [0.0, 3.4, -11.4], look: [0.0, 2.4, -22], fov: 45 },
      { p: 0.520, pos: [1.5, 3.8, -12.8], look: [-0.5, 2.5, -22.5], fov: 45 },
      { p: 0.600, pos: [1.0, 6.2, -20.5], look: [0.2, 2.3, -30], fov: 45 },
      { p: 0.6667, pos: [0.0, 3.0, -25.0], look: [0.0, 2.2, -33], fov: 46 },
      { p: 0.800, pos: [2.5, 5.7, -30.5], look: [0.0, 1.6, -42], fov: 47 },
      { p: 0.940, pos: [4.9, 7.5, -36.2], look: [0.0, 1.2, -46], fov: 48 },
      { p: 1.000, pos: [5.3, 7.9, -37.0], look: [0.0, 1.2, -46], fov: 48 }
    ];
    var camSample = { pos: [7.4, 2.3, 8.9], look: [1.5, 0.3, 0], fov: 47 };
    function sampleCamera(p) {
      var k0 = camKeys[0], k1 = camKeys[camKeys.length - 1];
      for (var i = 0; i < camKeys.length - 1; i++) {
        if (p >= camKeys[i].p && p <= camKeys[i + 1].p) { k0 = camKeys[i]; k1 = camKeys[i + 1]; break; }
      }
      var t = sstep(k0.p, k1.p, p);
      for (var j = 0; j < 3; j++) {
        camSample.pos[j] = lerp(k0.pos[j], k1.pos[j], t);
        camSample.look[j] = lerp(k0.look[j], k1.look[j], t);
      }
      camSample.fov = lerp(k0.fov, k1.fov, t);
    }

    /* ── in-block snap engine (Observer, pin-window scoped) ────── */
    var state = {
      p: 0, running: true,
      mouseX: 0, mouseY: 0, mouseDX: 0, mouseDY: 0,
      camX: 7.4, camY: 2.3, camZ: 8.9, lookX: 1.5, lookY: 0.3, lookZ: 0, fov: 47
    };
    var vh = window.innerHeight;
    var wrapTop = 0, travel = 0, passed = false, observerOn = false;

    function measure() {
      vh = window.innerHeight;
      var r = container.getBoundingClientRect();
      wrapTop = r.top + window.scrollY;
      travel = 3 * vh;
      reducedUI = window.innerWidth <= 960;
    }
    measure();

    function scrollP() {
      return clamp((window.scrollY - wrapTop) / travel, 0, 1);
    }
    function stationY(k) { return wrapTop + k * vh; }
    function inPinZone() {
      var y = window.scrollY;
      return y >= wrapTop - 2 && y <= wrapTop + travel + 2;
    }

    var scrollProxy = { y: 0 };
    function glideTo(targetY, dur, onDone) {
      isAnimating = true;
      scrollProxy.y = window.scrollY;
      gsap.to(scrollProxy, {
        y: targetY,
        duration: reduced ? 0.3 : (dur || 0.9),
        ease: 'power2.inOut',
        onUpdate: function () { window.scrollTo(0, scrollProxy.y); },
        onComplete: function () {
          isAnimating = false;
          if (onDone) onDone();
        },
        overwrite: 'auto'
      });
    }
    function glideToStation(k) {
      k = clamp(k, 0, 3);
      glideTo(stationY(k), clamp(0.8 + 0.15 * Math.abs(k - Math.round(state.p * 3)), 0.8, 1.2));
    }
    function handleIntent(dir) {
      if (isAnimating) return;
      if (dir > 0) {
        var f = clamp(Math.round(state.p * 3), 0, 3);
        if (f < 3) {
          glideToStation(f + 1);
        } else {
          /* station 4 -> release: glide a full viewport past the spacer so the
             next section rises in from the bottom (fly-in), then hand off to
             native page scroll */
          passed = true;
          setObserver(false);
          glideTo(wrapTop + travel + vh, 1.1);
        }
      } else {
        var f2 = clamp(Math.round(state.p * 3), 0, 3);
        if (f2 > 0) {
          glideToStation(f2 - 1);
        } else if (window.scrollY > wrapTop + 2) {
          glideToStation(0);
        } else {
          /* at the very top: hand one smooth viewport up to native scroll */
          glideTo(Math.max(window.scrollY - vh * 0.8, 0), 0.8);
        }
      }
    }

    var sectionObserver = null;
    function setObserver(on) {
      if (on === observerOn) return;
      observerOn = on;
      if (on) {
        if (!sectionObserver) {
          sectionObserver = Observer.create({
            target: window,
            type: 'wheel,touch',
            wheelSpeed: -1,
            tolerance: 8,
            preventDefault: true,
            onUp: function () { handleIntent(1); },
            onDown: function () { handleIntent(-1); }
          });
        } else {
          sectionObserver.enable();
        }
      } else if (sectionObserver) {
        sectionObserver.disable();
      }
    }

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < wrapTop + travel - vh * 0.4) passed = false;
      if (!isAnimating) {
        setObserver(!passed && inPinZone());
      }
    }, { passive: true });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var k = parseInt(dot.getAttribute('data-sec'), 10);
        if (!isNaN(k)) glideToStation(k);
      });
    });

    window.addEventListener('keydown', function (e) {
      if (!inPinZone()) return;
      var keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', '1', '2', '3', '4'];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') handleIntent(1);
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') handleIntent(-1);
      else if (e.key === 'Home') glideToStation(0);
      else if (e.key === 'End') glideToStation(3);
      else glideToStation(parseInt(e.key, 10) - 1);
    });

    window.addEventListener('pointermove', function (e) {
      state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    var resizeTO = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(function () {
        measure();
        sizeRenderer();
        if (inPinZone() && !isAnimating) {
          glideToStation(clamp(Math.round(scrollP() * 3), 0, 3));
        }
        setCardStation(clamp(Math.round(state.p * 3), 0, 3));
      }, 180);
    });

    document.addEventListener('visibilitychange', function () {
      state.running = !document.hidden;
    });

    /* ── HUD update ────────────────────────────────────────────── */
    function updateHUD(p) {
      var f = clamp(Math.round(p * 3), 0, 3);
      if (f !== currentSec) {
        currentSec = f;
        setCardStation(f);
      }
      if (railPct) railPct.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
      if (railLabel) railLabel.textContent = RAIL_NAMES[f];
      if (phaseEl) phaseEl.textContent = PHASE_NAMES[f];
      if (cueEl) {
        cueEl.style.opacity = (1 - sstep(0.012, 0.045, p)).toFixed(3);
        cueEl.style.visibility = p > 0.05 ? 'hidden' : 'visible';
      }
      if (tickerEl) {
        tickerEl.style.opacity = (0.95 - sstep(0.96, 0.995, p)).toFixed(3);
        if (tickerText) tickerText.textContent = TICKERS[f];
      }
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('active', d === f);
      }
    }

    /* ── render loop ───────────────────────────────────────────── */
    var clock = new THREE.Clock();
    var m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(),
      sc = new THREE.Vector3(), posV = new THREE.Vector3();

    function frame() {
      requestAnimationFrame(frame);
      if (!state.running) { clock.getDelta(); return; }

      /* skip work entirely when the block is far offscreen */
      var y = window.scrollY;
      if (y > wrapTop + travel + vh * 1.5 || y + vh < wrapTop - vh * 0.5) {
        clock.getDelta();
        return;
      }

      /* Full-viewport stage positioning. The stage is position:fixed, so it
         pins regardless of any theme ancestor overflow. We drive its vertical
         offset to create the takeover:
           - ENTRY  (y < wrapTop):            flies up from below as the
                                              corridor's spacer scrolls into view.
           - PINNED (wrapTop..wrapTop+travel): holds at 0 while the 4 frames
                                              advance (one scroll per frame).
           - EXIT   (last viewport-height):    flies out upward so the next
                                              section rises in from the bottom. */
      var entryT = map01(y, wrapTop - vh, wrapTop);
      var exitT  = map01(y, wrapTop + travel, wrapTop + travel + vh);
      var stageY, stageOp;
      if (y < wrapTop) {
        stageY = (1 - entryT) * 100;      /* below the viewport, sliding up   */
        stageOp = entryT;
      } else {
        stageY = -exitT * 100;            /* pinned, then flying out upward   */
        stageOp = 1 - exitT;
      }
      stage.style.transform = 'translate3d(0,' + stageY.toFixed(3) + '%,0)';
      stage.style.opacity = stageOp.toFixed(3);

      var dt = Math.min(clock.getDelta(), 0.05);
      var t = clock.elapsedTime;

      state.p = damp(state.p, scrollP(), 5.5, dt);
      var p = state.p;

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
      if (Math.abs(camera.fov - state.fov) > 0.01) {
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
      }

      /* ambient depth accents breathe */
      depthNodeA.position.y = 4.6 + Math.sin(t * 0.30) * 0.35;
      depthNodeB.position.y = 1.9 + Math.cos(t * 0.24) * 0.28;
      depthMatA.opacity = 0.13 + 0.03 * Math.sin(t * 0.5);
      depthMatB.opacity = 0.10 + 0.025 * Math.cos(t * 0.42);
      fillDir.position.set(-9 + Math.sin(t * 0.18) * 2, 6, state.camZ - 4 + Math.cos(t * 0.15) * 2);

      /* Frame 1 · DNA — diagonal matrix fit, never fades */
      if (modelReady && modelGroup.visible) {
        modelSpin += dt * 0.26;
        modelGroup.rotation.y = modelSpin + p * 1.1;
        modelGroup.rotation.x = 0.45 + Math.sin(t * 0.30) * 0.045 * sway;
        modelGroup.rotation.z = -0.75 + Math.cos(t * 0.23) * 0.035 * sway;
        modelGroup.position.x = 1.2;
        modelGroup.position.y = -0.2 + Math.sin(t * 0.45) * 0.10 * sway;
        modelGroup.scale.setScalar(1.25 * (0.6 + 0.4 * modelState.reveal));
      }

      /* Frame 2 · ribbons */
      var waveVis = p > 0.12 && p < 0.80;
      waveGroup.visible = waveVis;
      if (waveVis) updateRibbons(t);

      /* Frame 3 · stream */
      var rainVis = p > 0.40;
      rainGroup.visible = rainVis;
      if (rainVis) {
        rainMat.uniforms.uTime.value = t;
        var sweep = ((t * 0.11) % 1);
        laserGroup.position.x = lerp(-8.2, 8.2, sweep);
      }

      /* Frame 4 · variant matrix + tree */
      var dataVis = p > 0.72;
      dataGroup.visible = dataVis;
      if (dataVis) {
        var dataReveal = map01(p, 0.76, 0.96);
        gridMat.opacity = 0.4 * sstep(0.74, 0.82, p);
        ringMat1.opacity = 0.34 * sstep(0.80, 0.90, p);
        ringMat2.opacity = 0.22 * sstep(0.80, 0.90, p);
        ring1.rotation.z = t * 0.15;
        ring2.rotation.z = -t * 0.1;
        for (var h = 0; h < hmCount; h++) {
          var hd = hmData[h];
          var rise = sstep(hd.delay, hd.delay + 0.34, dataReveal);
          var hh = hd.h * rise * (1 + (reduced ? 0 : 0.045 * Math.sin(t * 1.8 + hd.seed * 9.0)));
          posV.set(hd.x, 0, hd.z);
          qt.identity();
          sc.set(1, Math.max(hh, 0.015), 1);
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
      if (composer) composer.render();
      else renderer.render(scene, camera);
    }

    /* ── ignition (no splash: Frame 1 renders immediately) ─────── */
    rainMat.uniforms.uAtlas.value = texAtlas;
    setCardStation(0);
    currentSec = 0;
    frame();
  }

  function bootAll() {
    /* Target only the corridor spacer itself (.cor3d-wrap == the element with
       id corridor-canvas-container). Selecting the WP block wrapper as well
       would double-initialize the engine, since the wrapper is the container's
       ancestor and both would match. */
    var roots = document.querySelectorAll('#corridor-canvas-container.cor3d-wrap');
    if (!roots.length) return;
    /* marks the document so the full-bleed overflow guard applies */
    document.documentElement.classList.add('cor3d-active');
    Array.prototype.forEach.call(roots, function (container) {
      if (container.getAttribute('data-cor3d-init') === 'true') return;
      container.setAttribute('data-cor3d-init', 'true');
      initCorridor(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
