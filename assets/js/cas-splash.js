(function () {
  'use strict';

  var overlay = document.getElementById('cas-splash');
  if (!overlay) return;

  var shouldSkip = false;
  try {
    if (window.sessionStorage && sessionStorage.getItem('cas-ngs-splash-complete') === '1') {
      shouldSkip = true;
    }
  } catch (err) {}

  if (shouldSkip) {
    document.body.classList.remove('cas-splash-active');
    document.body.classList.add('cas-splash-complete');
    document.documentElement.classList.remove('cas-splash-active');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    return;
  }

  document.documentElement.classList.add('cas-splash-active');
  document.body.classList.add('cas-splash-active');

  const COLOR_PRIMARY = '#F4A950';
  const COLOR_TEXT = '#F4A950';

  const logoTargets = [
    { topY: 100, botY: 412 },
    { topY: 200, botY: 300 },
    { topY: 160, botY: 340 },
    { topY: 88, botY: 400 },
    { topY: 160, botY: 340 },
    { topY: 200, botY: 300 },
    { topY: 100, botY: 412 }
  ];

  const centerY = 250;
  const waveAmplitude = 130;

  let animState = {
    time: 0,
    waveMix: 0,
    logoMix: 0
  };

  function finishSplash() {
    try {
      if (window.sessionStorage) {
        sessionStorage.setItem('cas-ngs-splash-complete', '1');
      }
    } catch (err) {}

    document.body.classList.remove('cas-splash-active');
    document.body.classList.add('cas-splash-complete');
    document.documentElement.classList.remove('cas-splash-active');
    setTimeout(function () {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.display = 'none';
    }, 900);
  }

  function setup() {
    for (let i = 0; i < 7; i++) {
      gsap.set('#n' + i + '-top', { opacity: 0 });
      gsap.set('#n' + i + '-bot', { opacity: 0 });
      gsap.set('#b' + i, { opacity: 0 });
    }

    gsap.set('#dna-mark', {
      x: 270,
      scale: 0.50,
      transformOrigin: 'center center',
      opacity: 1
    });

    gsap.set('#brand-text', {
      fill: COLOR_TEXT
    });
  }

  function updateFrame() {
    for (let i = 0; i < 7; i++) {
      const topNode = document.getElementById('n' + i + '-top');
      const botNode = document.getElementById('n' + i + '-bot');
      const bond = document.getElementById('b' + i);
      const target = logoTargets[i];

      const phase = animState.time + (i * 0.7);
      const waveOffset = Math.sin(phase) * waveAmplitude * animState.waveMix;

      const waveTopY = centerY - waveOffset;
      const waveBotY = centerY + waveOffset;

      const finalTopY = gsap.utils.interpolate(waveTopY, target.topY, animState.logoMix);
      const finalBotY = gsap.utils.interpolate(waveBotY, target.botY, animState.logoMix);

      topNode.setAttribute('cy', finalTopY);
      botNode.setAttribute('cy', finalBotY);
      bond.setAttribute('y1', finalTopY);
      bond.setAttribute('y2', finalBotY);
    }
  }

  function startSplash() {
    if (!window.gsap) {
      finishSplash();
      return;
    }

    setup();

    const tl = gsap.timeline({ onUpdate: updateFrame, onComplete: finishSplash });
    const initialDots = ['#n0-top', '#n1-top', '#n2-bot', '#n3-bot', '#n4-bot', '#n5-top', '#n6-top'];

    initialDots.forEach(function (dotId, i) {
      tl.to(dotId, {
        opacity: 1,
        duration: 0.15,
        ease: 'power1.out'
      }, i * 0.12);
    });

    tl.to(['.bond', '.node'], {
      opacity: 1,
      duration: 0.3
    }, 0.8);

    tl.to(animState, {
      waveMix: 1,
      duration: 1.2,
      ease: 'power2.out'
    }, 0.8);

    tl.to(animState, {
      time: Math.PI * 1,
      duration: 1.0,
      ease: 'none'
    }, 0.8);

    tl.to(animState, {
      logoMix: 1,
      duration: 1.8,
      ease: 'power3.inOut'
    }, '-=1.5');

    tl.to('#dna-mark', {
      x: 55,
      scale: 0.20,
      duration: 1.5,
      ease: 'power3.inOut'
    }, '+=0.3');

    tl.to('#clip-rect', {
      width: 650,
      duration: 1.2,
      ease: 'power2.out'
    }, '+=0.1');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSplash, { once: true });
  } else {
    startSplash();
  }
})();
