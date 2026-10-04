/**
 * DNA Background Runtime — cas-ngs/dna-background
 *
 * Owns the frontend runtime for cas-ngs/dna-background. Header dock,
 * waveforms, corridor, and other block behavior remain in their own engines.
 *
 *   1. OFF-CENTER / SQUISHED DNA WHEN ADDED AS A BLOCK
 *      The block renders its `position:fixed` wrapper inline inside the post
 *      content. If any ancestor (.entry-content, a group block, the block
 *      editor canvas) has a transform/filter/will-change, `position:fixed`
 *      becomes relative to that ancestor, so the canvas ends up off-center
 *      and squeezed. The sidebar-metabox method renders via wp_footer at the
 *      body level, which is why it looked perfect. Fix: relocate the wrapper
 *      to document.body before initializing so `fixed` is viewport-relative.
 *
 *   2. AVOID OVERLAPPING WORK WITH THE CORRIDOR
 *      Use one document scroll trigger for DNA poses, suspend that trigger
 *      while the corridor covers the background, and pause WebGL rendering
 *      until the corridor releases.
 *
 * Loaded after biotech-blocks-engine.js so the shared scene/model utilities
 * are available before this initializer runs.
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.8.2
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.THREE) return;

  function enhancedInitDnaBackground() {
    var bgWrappers = document.querySelectorAll('.cas-dna-bg-wrapper, [data-cas-dna-bg]');
    if (!bgWrappers.length) return;

    bgWrappers.forEach(function (wrapper) {
      if (wrapper.getAttribute('data-dna-init') === 'true') return;
      wrapper.setAttribute('data-dna-init', 'true');

      /* Fix #1: escape any transformed/constrained ancestor so position:fixed
         is relative to the viewport, not to .entry-content. */
      if (wrapper.parentElement && wrapper.parentElement !== document.body) {
        document.body.appendChild(wrapper);
      }

      var canvas = wrapper.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'cas-dna-webgl-canvas';
        canvas.style.cssText = 'width:100%;height:100%;display:block;';
        wrapper.appendChild(canvas);
      }

      if (typeof THREE === 'undefined') return;

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

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 6.0);

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      } catch (e) { return; }
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

      var ambientLight = new THREE.AmbientLight(0xfff8f0, ambientIntensity);
      scene.add(ambientLight);
      var dirLight1 = new THREE.DirectionalLight(0xffebd9, 1.5);
      dirLight1.position.set(6, 10, 8);
      scene.add(dirLight1);
      var dirLight2 = new THREE.DirectionalLight(0xd4bfae, 1.0);
      dirLight2.position.set(-6, -4, -6);
      scene.add(dirLight2);

      var modelPivot = new THREE.Group();
      scene.add(modelPivot);
      var dnaMeshGroup = new THREE.Group();
      modelPivot.add(dnaMeshGroup);

      var isMobile = width < 768;
      var mobileScale = isMobile ? 0.65 : 1.0;
      var mobilePos = isMobile ? 0.5 : 1.0;

      var basePoses = [
        { rot: { x: 0.35, y: 0.80, z: -0.45 }, pos: { x: 0.40, y: 0.05, z: 0.80 }, camZ: 6.0, scale: { x: 1.3, y: 3.2, z: 1.3 } },
        { rot: { x: 0.95, y: 2.10, z: 0.50 }, pos: { x: -0.55, y: 0.10, z: 1.25 }, camZ: 5.4, scale: { x: 1.6, y: 3.6, z: 1.6 } },
        { rot: { x: 1.70, y: 3.50, z: 1.30 }, pos: { x: 0.45, y: -0.20, z: 0.95 }, camZ: 6.2, scale: { x: 1.2, y: 3.0, z: 1.2 } }
      ];
      var wrapPose = {
        rot: { x: 0.90, y: 4.10, z: 0.75 },
        pos: { x: 0.18, y: -0.02, z: 1.05 },
        camZ: 5.9,
        scale: { x: 1.35, y: 3.35, z: 1.35 }
      };
      var forwardCyclePoses = [basePoses[0], basePoses[1], basePoses[2], wrapPose];

      var p1 = basePoses[0];
      modelPivot.rotation.set(p1.rot.x, p1.rot.y, p1.rot.z);
      modelPivot.position.set((p1.pos.x * mobilePos) + offsetX, p1.pos.y + offsetY, p1.pos.z);
      modelPivot.scale.set(
        p1.scale.x * scaleMultiplier * mobileScale,
        p1.scale.y * scaleMultiplier * mobileScale,
        p1.scale.z * scaleMultiplier * mobileScale
      );
      camera.position.z = p1.camZ;

      var strandMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(strandColor), roughness: 0.45, metalness: 0.25, transparent: true, opacity: 0.85 });
      var accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(accentColor), roughness: 0.40, metalness: 0.20, transparent: true, opacity: 0.90 });

      var cyclingWired = false;
      var dnaScrollTrigger = null;
      var corridorActive = false;

      var wireCycling = function () {
        if (cyclingWired) return;
        if (!enableCycling || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        cyclingWired = true;

        var poseCount = forwardCyclePoses.length;

        function buildDocumentScrollCycle() {
          dnaScrollTrigger = ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.8,
            invalidateOnRefresh: true,
            onUpdate: function (self) {
              var viewportH = Math.max(window.innerHeight, 1);
              var scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
              var phase = (scrollY / viewportH) % poseCount;
              phase = ((phase % poseCount) + poseCount) % poseCount;

              var idxA = Math.floor(phase);
              var idxB = (idxA + 1) % poseCount;
              var local = phase - idxA;
              var eased = local * local * (3 - 2 * local);

              var A = forwardCyclePoses[idxA];
              var B = forwardCyclePoses[idxB];
              var cycleYaw = Math.floor(scrollY / (viewportH * poseCount)) * 2 * Math.PI;

              modelPivot.rotation.x = A.rot.x + (B.rot.x - A.rot.x) * eased;
              modelPivot.rotation.y = A.rot.y + (B.rot.y - A.rot.y) * eased + cycleYaw;
              modelPivot.rotation.z = A.rot.z + (B.rot.z - A.rot.z) * eased;

              modelPivot.position.x = ((A.pos.x + (B.pos.x - A.pos.x) * eased) * mobilePos) + offsetX;
              modelPivot.position.y = A.pos.y + (B.pos.y - A.pos.y) * eased + offsetY;
              modelPivot.position.z = A.pos.z + (B.pos.z - A.pos.z) * eased;

              modelPivot.scale.x = (A.scale.x + (B.scale.x - A.scale.x) * eased) * scaleMultiplier * mobileScale;
              modelPivot.scale.y = (A.scale.y + (B.scale.y - A.scale.y) * eased) * scaleMultiplier * mobileScale;
              modelPivot.scale.z = (A.scale.z + (B.scale.z - A.scale.z) * eased) * scaleMultiplier * mobileScale;

              camera.position.z = A.camZ + (B.camZ - A.camZ) * eased;
            }
          });
          if (corridorActive) dnaScrollTrigger.disable(false);
        }

        buildDocumentScrollCycle();

        /* DOM changed (wrapper moved to body); recalc trigger positions. */
        ScrollTrigger.refresh();
      };

      var loadModel = function () {
        if (!window.CAS_NGS_AssetCache || typeof window.CAS_NGS_AssetCache.loadGLTF !== 'function') return;
        window.CAS_NGS_AssetCache.loadGLTF(modelUrl).then(function (gltf) {
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
              if (name.indexOf('base') !== -1 || name.indexOf('pair') !== -1 || (meshIdx % 3 === 2)) {
                child.material = accentMat;
              } else {
                child.material = strandMat;
              }
              meshIdx++;
            }
          });
          dnaMeshGroup.add(dnaScene);
          wireCycling();
        }).catch(function (err) {
          if (window.console && console.warn) console.warn('CAS-NGS DNA background: model load error', err);
        });
      };

      loadModel();

      var frameId = 0;
      function renderLoop() {
        frameId = 0;
        if (document.hidden || corridorActive) return;
        dnaMeshGroup.rotation.y += 0.0012;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(renderLoop);
      }
      function setCorridorActive(active) {
        if (corridorActive === active) return;
        corridorActive = active;
        if (corridorActive) {
          if (dnaScrollTrigger) dnaScrollTrigger.disable(false);
          if (frameId) cancelAnimationFrame(frameId);
          frameId = 0;
        } else {
          if (dnaScrollTrigger) dnaScrollTrigger.enable(false, false);
          if (!document.hidden && !frameId) frameId = requestAnimationFrame(renderLoop);
        }
      }
      window.addEventListener('cas-ngs:corridor-visibility', function (event) {
        setCorridorActive(!!(event.detail && event.detail.active));
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (frameId) cancelAnimationFrame(frameId);
          frameId = 0;
        } else if (!corridorActive && !frameId) {
          frameId = requestAnimationFrame(renderLoop);
        }
      });
      if (!document.hidden) frameId = requestAnimationFrame(renderLoop);

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhancedInitDnaBackground, { once: true });
  } else {
    enhancedInitDnaBackground();
  }
})();
