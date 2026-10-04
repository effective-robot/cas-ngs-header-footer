/**
 * CAS-NGS Biotech Blocks — shared non-WebGL runtime
 *
 * Combines all 5 visual core sections:
 * 1. Act 0: Animated Top Dock Header (Spring-damping magnification & physics dropdowns)
 * 2. Act 1: Hero Sequencer Terminal (Real-time run timer & waveform simulator)
 * 3. Act 2: Bento Services Grid (Dorado GPU compute histogram & flowcell)
 * 4. Act 3: Process Timeline (Sample prep to research insight)
 * 5. Act 4: Conversion CTA Banner
 *
 * WebGL model loading and the DNA background live in dedicated modules.
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.8.2
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
        baseCenterX: 0,
        value: 0,
        velocity: 0,
        target: 0
      };
    });

    var enabled = false;
    var pointerActive = false;
    var dirty = false;
    var frame = 0;
    var rootBounds = null;

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
        state.baseCenterX = rect.left + rect.width * 0.5;
        state.value = 0;
        state.velocity = 0;
        state.target = 0;
      });
      pointerActive = false;
      dirty = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      if (opts.lockTrack) {
        root.style.width = root.getBoundingClientRect().width.toFixed(2) + "px";
      }
      rootBounds = root.getBoundingClientRect();
      root.dataset.dockState = enabled ? "idle" : "static";
      root.dataset.dockMax = "0.00";
    };

    var setTargets = function (clientX, clientY) {
      if (!enabled) return;
      var opts = getOptions();
      for (var i = 0; i < items.length; i++) {
        var prox = clamp(1 - Math.abs(clientX - items[i].baseCenterX) / Math.max(1, opts.proximity), 0, 1);
        var influence = prox * prox * (3 - 2 * prox);
        items[i].target = influence;
        items[i].element.dataset.dockNear = influence > 0.08 ? "true" : "false";
      }
      pointerActive = true;
      dirty = true;
      root.dataset.dockState = "active";
      scheduleDraw();
    };

    var reset = function () {
      pointerActive = false;
      dirty = true;
      items.forEach(function (s) {
        s.target = 0;
        s.element.dataset.dockNear = "false";
      });
      scheduleDraw();
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
      frame = 0;
      if (!enabled || !dirty) return;

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
        } else {
          scheduleDraw();
        }
      }
    };

    function scheduleDraw() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    var onPointerMove = function (e) { setTargets(e.clientX, e.clientY); };
    var onWindowPointerMove = function (e) {
      if (!pointerActive || !rootBounds) return;
      var outside = e.clientX < rootBounds.left || e.clientX > rootBounds.right ||
        e.clientY < rootBounds.top || e.clientY > rootBounds.bottom + 25;
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
      this.initWaveforms();
      this.initTimers();
      this.initHistograms();
      this.initScrollAnimations();
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
          bar.style.height = '55%';
          bar.style.transform = 'scaleY(' + (Math.random() * 1.4 + 0.2).toFixed(2) + ')';
          container.appendChild(bar);
          bars.push(bar);
        }

        var interval = null;
        var inView = !('IntersectionObserver' in window);
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function stopWaveform() {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }

        function updateWaveformState() {
          if (reducedMotion || document.hidden || !inView) {
            stopWaveform();
            return;
          }
          if (interval) return;

          interval = setInterval(function () {
          for (var j = 0; j < 5; j++) {
            var idx = Math.floor(Math.random() * bars.length);
            if (bars[idx]) {
              bars[idx].style.transform = 'scaleY(' + (Math.random() * 1.4 + 0.2).toFixed(2) + ')';
            }
          }
          }, 90);
        }

        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries) {
            inView = entries.some(function (entry) { return entry.isIntersecting; });
            updateWaveformState();
          }).observe(container);
        }
        document.addEventListener('visibilitychange', updateWaveformState);
        updateWaveformState();
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
